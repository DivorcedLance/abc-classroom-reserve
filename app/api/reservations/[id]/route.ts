import { createSupabaseClientWithAuth } from "@/lib/supabase"
import { notifyReservationUser } from "@/lib/utils/notifyReservation"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params
    const body = await request.json()

    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    const supabase = createSupabaseClientWithAuth(token)

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 })
    }

    // Reservation
    const { data: existingReservation, error: fetchError } = await supabase
      .from("reservations")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !existingReservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Permiso
    const canModify = profile?.role === "coordinador" || existingReservation.user_id === user.id
    if (!canModify) {
      return NextResponse.json({ error: "No tienes permisos para modificar esta reserva" }, { status: 403 })
    }

    // Update
    const { data: reservation, error } = await supabase
      .from("reservations")
      .update(body)
      .eq("id", id)
      .select(`
        *,
        classroom:classrooms(*),
        user:profiles(*)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "Error al actualizar la reserva" }, { status: 500 })
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params

    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }
    
    const token = authHeader.replace("Bearer ", "")
    const supabase = createSupabaseClientWithAuth(token)

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 })
    }

    // Reservation
    const { data: existingReservation, error: fetchError } = await supabase
      .from("reservations")
      .select(`
        *,
        classroom:classrooms(*),
        user:profiles(*)
      `)
      .eq("id", id)
      .single()

    if (fetchError || !existingReservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    // Permiso
    const canCancel = profile?.role === "coordinador" || existingReservation.user_id === user.id
    if (!canCancel) {
      return NextResponse.json({ error: "No tienes permisos para cancelar esta reserva" }, { status: 403 })
    }

    // Soft delete
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: "Error al cancelar la reserva" }, { status: 500 })
    }

    // Notificar al usuario
    try {
      await notifyReservationUser(existingReservation, "cancelled")
    } catch (e) {
      console.error("Error enviando email de notificación:", e)
    }

    return NextResponse.json({ message: "Reserva cancelada exitosamente" })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

import { createSupabaseClientWithAuth } from "@/lib/supabase"
import { notifyReservationUser } from "@/lib/utils/notifyReservation"
import { reservationSchema } from "@/lib/validations"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const classroomId = searchParams.get("classroom_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const reservationType = searchParams.get("reservation_type")

    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const supabase = createSupabaseClientWithAuth(token)

    // Get user (confirma que el token sea válido)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json({ error: "Error al obtener el perfil del usuario" }, { status: 500 })
    }

    let query = supabase
      .from("reservations")
      .select(`
        *,
        classroom:classrooms(*),
        user:profiles(*)
      `)
      .order("start_datetime", { ascending: false })

    if (profile?.role !== "coordinador") {
      query = query.eq("user_id", user.id)
    }

    // Filtros
    if (userId && profile?.role === "coordinador") {
      query = query.eq("user_id", userId)
    }
    if (classroomId) {
      query = query.eq("classroom_id", classroomId)
    }
    if (startDate) {
      query = query.gte("start_datetime", startDate)
    }
    if (endDate) {
      query = query.lte("start_datetime", endDate)
    }
    if (reservationType) {
      query = query.eq("reservation_type", reservationType)
    }

    const { data: reservations, error } = await query

    if (error) {
      console.error("Reservations fetch error:", error)
      return NextResponse.json({ error: "Error al obtener las reservas" }, { status: 500 })
    }

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error("Reservations GET error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const reservationData = reservationSchema.parse(body)

    // Get token from header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const supabase = createSupabaseClientWithAuth(token)

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Check for conflicts
    const { data: conflictingReservations, error: conflictError } = await supabase
      .from("reservations")
      .select("id")
      .eq("classroom_id", reservationData.classroom_id)
      .eq("status", "active")
      .gte("end_datetime", reservationData.start_datetime)
      .lte("start_datetime", reservationData.end_datetime)

    if (conflictError) {
      console.error("Conflict check error:", conflictError)
      return NextResponse.json({ error: "Error al verificar disponibilidad" }, { status: 500 })
    }

    if (conflictingReservations.length > 0) {
      return NextResponse.json({ error: "El aula no está disponible en el horario seleccionado" }, { status: 400 })
    }

    // Create reservation
    const { data: reservation, error } = await supabase
      .from("reservations")
      .insert({
        ...reservationData,
        user_id: user.id,
      })
      .select(`
        *,
        classroom:classrooms(*),
        user:profiles(*)
      `)
      .single()

    if (error) {
      console.error("Reservation creation error:", error)
      return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 })
    }

    // Notificar al usuario
    try {
      await notifyReservationUser(reservation, "created")
    } catch (e) {
      console.error("Error enviando email de notificación:", e)
    }

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error("Reservations POST error:", error)

    if (error instanceof Error && error.message.includes("parse")) {
      return NextResponse.json({ error: "Datos de reserva inválidos" }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

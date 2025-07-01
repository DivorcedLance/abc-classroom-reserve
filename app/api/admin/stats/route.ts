// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClientWithAuth } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Auth: solo coordinador debe poder ver esto
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorización requerido" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")
    const supabase = createSupabaseClientWithAuth(token)

    // Validar rol de coordinador
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (!profile || profile.role !== "coordinador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Total reservas (todas)
    const { count: total_reservas } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })

    // Total docentes activos
    const { count: total_docentes } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "docente")

    return NextResponse.json({
      total_reservas: total_reservas ?? 0,
      total_docentes: total_docentes ?? 0
    })
  } catch (error) {
    console.error("AdminStats API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const start_time = searchParams.get("start_time")
    const end_time = searchParams.get("end_time")

    // Basic validation
    if (!date || !start_time || !end_time) {
      return NextResponse.json({ error: "Fecha, hora de inicio y hora de fin son requeridas" }, { status: 400 })
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" }, { status: 400 })
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time)) {
      return NextResponse.json({ error: "Formato de hora inválido. Use HH:MM" }, { status: 400 })
    }

    // Validate that end_time is after start_time
    const [startHour, startMin] = start_time.split(":").map(Number)
    const [endHour, endMin] = end_time.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    if (endMinutes <= startMinutes) {
      return NextResponse.json({ error: "La hora de fin debe ser posterior a la hora de inicio" }, { status: 400 })
    }

    // Combine date and time to create datetime strings
    const start_datetime = `${date}T${start_time}:00`
    const end_datetime = `${date}T${end_time}:00`

    const supabase = createServerSupabaseClient()

    // Get all active classrooms
    const { data: allClassrooms, error: classroomsError } = await supabase
      .from("classrooms")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (classroomsError) {
      console.error("Classrooms fetch error:", classroomsError)
      return NextResponse.json({ error: "Error al obtener las aulas" }, { status: 500 })
    }

    // Get reservations that overlap with the requested time
    const { data: conflictingReservations, error: reservationsError } = await supabase
      .from("reservations")
      .select("classroom_id")
      .eq("status", "active")
      .gte("end_datetime", start_datetime)
      .lte("start_datetime", end_datetime)

    if (reservationsError) {
      console.error("Reservations fetch error:", reservationsError)
      return NextResponse.json({ error: "Error al verificar disponibilidad" }, { status: 500 })
    }

    // Filter out classrooms that have conflicting reservations
    const reservedClassroomIds = new Set(conflictingReservations.map((r) => r.classroom_id))
    const availableClassrooms = allClassrooms.filter((classroom) => !reservedClassroomIds.has(classroom.id))

    return NextResponse.json({ classrooms: availableClassrooms })
  } catch (error) {
    console.error("Availability route error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

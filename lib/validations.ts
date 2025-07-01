import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
})

export const reservationSchema = z.object({
  classroom_id: z.string().uuid("ID de aula inválido"),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  reservation_type: z.enum(["academico", "no_academico"]),
  start_datetime: z.string().refine(
    val => !Number.isNaN(Date.parse(val)), 
    { message: "Fecha y hora de inicio inválida" }
  ),
  end_datetime: z.string().refine(
    val => !Number.isNaN(Date.parse(val)), 
    { message: "Fecha y hora de fin inválida" }
  ),
})
.refine(
  (data) => {
    const start = new Date(data.start_datetime)
    const end = new Date(data.end_datetime)
    return end > start
  },
  {
    message: "La hora de fin debe ser posterior a la hora de inicio",
    path: ["end_datetime"],
  }
)

export const availabilitySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido (HH:MM)"),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.start_time.split(":").map(Number)
      const [endHour, endMin] = data.end_time.split(":").map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return endMinutes > startMinutes
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["end_time"],
    },
  )

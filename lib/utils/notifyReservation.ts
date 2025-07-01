import { Resend } from "resend"
import { Reservation } from "@/lib/types" // ajusta la ruta si usas otro path

const resend = new Resend(process.env.RESEND_API_KEY)

type ReservationAction = "created" | "cancelled"

export async function notifyReservationUser(
  reservation: Reservation,
  action: ReservationAction
) {
  if (!reservation?.user?.email) {
    throw new Error("No se encontró el email del usuario para notificar")
  }

  // Contenido del mensaje según acción
  const isCreated = action === "created"
  const subject = isCreated
    ? "Reserva de aula confirmada"
    : "Reserva de aula cancelada"

  const greeting = reservation.user.full_name
    ? `Hola, ${reservation.user.full_name}:`
    : "Hola:"

  const statusText = isCreated
    ? "¡Tu reserva fue registrada exitosamente!"
    : "Tu reserva ha sido cancelada."

  // Puedes personalizar estos textos
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>${subject}</h2>
      <p>${greeting}</p>
      <p>${statusText}</p>
      <hr />
      <h3>Detalle de la reserva</h3>
      <ul>
        <li><strong>Evento:</strong> ${reservation.title}</li>
        <li><strong>Tipo:</strong> ${reservation.reservation_type === "academico" ? "Académico" : "No Académico"}</li>
        <li><strong>Fecha:</strong> ${formatDate(reservation.start_datetime)}</li>
        <li><strong>Hora:</strong> ${formatHour(reservation.start_datetime)} - ${formatHour(reservation.end_datetime)}</li>
        <li><strong>Aula:</strong> ${reservation.classroom?.name || "-"}${reservation.classroom?.location ? " (" + reservation.classroom.location + ")" : ""}</li>
        <li><strong>Estado:</strong> ${reservation.status === "active" ? "Activa" : "Cancelada"}</li>
      </ul>
      ${reservation.description ? `<p><strong>Descripción:</strong> ${reservation.description}</p>` : ""}
      <br />
      <p>Gracias por usar el sistema de reservas de aulas.</p>
    </div>
  `

  console.log(`Enviando email de notificación a ${reservation.user.email}...`)

  // Envía el email
  return await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: reservation.user.email,
    subject,
    html,
  })
}

// Utilidades de fecha
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  })
}

function formatHour(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
}

import { Document, Page, Text, View, StyleSheet, Font, Image } from "@react-pdf/renderer"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Reservation } from "@/lib/types"

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica"
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
    marginBottom: 16
  },
  logo: {
    width: 60,
    height: 60
  },
  reportInfo: {
    textAlign: "right"
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 4
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bbb"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderBottomColor: "#bbb",
    borderBottomWidth: 1
  },
  th: {
    flex: 1,
    fontWeight: "bold",
    padding: 6,
    fontSize: 11,
    textAlign: "center"
  },
  tableRow: {
    flexDirection: "row",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    alignItems: "center"
  },
  td: {
    flex: 1,
    padding: 6,
    fontSize: 10,
    textAlign: "center"
  },
  totalSection: {
    marginTop: 16,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "right"
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 9,
    textAlign: "center",
    color: "#888"
  }
})

export function ReservationsPDF({ reservations }: { reservations: Reservation[] }) {
  const fechaReporte = format(new Date(), "EEEE, d 'de' MMMM yyyy - HH:mm", { locale: es })
  const totalActivas = reservations.filter(r => r.status === "active").length
  const totalCanceladas = reservations.filter(r => r.status === "cancelled").length

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado institucional */}
        <View style={styles.headerRow}>
          {/* <Image src={logoURL} style={styles.logo} /> */}
          <View style={styles.reportInfo}>
            <Text>Reporte de Reservas</Text>
            <Text style={{ fontSize: 10, color: "#555" }}>Fecha de generación: {fechaReporte}</Text>
          </View>
        </View>

        <Text style={styles.title}>RESERVAS DE AULAS</Text>

        {/* Tabla */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>#</Text>
            <Text style={styles.th}>Título</Text>
            <Text style={styles.th}>Tipo</Text>
            <Text style={styles.th}>Fecha</Text>
            <Text style={styles.th}>Hora</Text>
            <Text style={styles.th}>Aula</Text>
            <Text style={styles.th}>Usuario</Text>
            <Text style={styles.th}>Estado</Text>
          </View>
          {reservations.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { flex: 8, color: "#999" }]}>No hay reservas</Text>
            </View>
          ) : (
            reservations.map((r, idx) => (
              <View style={styles.tableRow} key={r.id} wrap={false}>
                <Text style={styles.td}>{idx + 1}</Text>
                <Text style={styles.td}>{r.title}</Text>
                <Text style={styles.td}>{r.reservation_type === "academico" ? "Académico" : "No Académico"}</Text>
                <Text style={styles.td}>
                  {format(new Date(r.start_datetime), "dd/MM/yyyy", { locale: es })}
                </Text>
                <Text style={styles.td}>
                  {format(new Date(r.start_datetime), "HH:mm")} - {format(new Date(r.end_datetime), "HH:mm")}
                </Text>
                <Text style={styles.td}>
                  {r.classroom?.name || "-"}
                  {r.classroom?.location ? ` (${r.classroom.location})` : ""}
                </Text>
                <Text style={styles.td}>{r.user?.full_name || r.user?.email || "-"}</Text>
                <Text style={styles.td}>
                  {r.status === "active" ? "Activa" : "Cancelada"}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Totales */}
        <View style={styles.totalSection}>
          <Text>Total de reservas: {reservations.length}</Text>
          <Text>Activas: {totalActivas} | Canceladas: {totalCanceladas}</Text>
        </View>

        {/* Footer institucional */}
        <Text style={styles.footer}>
          Universidad de Medellín • Sistema de Reservas de Aulas — Generado automáticamente
        </Text>
      </Page>
    </Document>
  )
}

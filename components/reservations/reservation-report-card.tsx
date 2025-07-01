import { useState } from "react"
import { format } from "date-fns"
import { Download, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Reservation } from "@/lib/types"
import { ReservationsPDF } from "./reservation-pdf"

export function ReservationReportCard({ reservations }: { reservations: Reservation[] }) {
  // Estado del rango
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Filtra reservas por rango (si ambos están definidos)
  const filteredReservations = reservations.filter(r => {
    if (!startDate && !endDate) return true
    const d = r.start_datetime.slice(0, 10)
    if (startDate && endDate) return d >= startDate && d <= endDate
    if (startDate) return d >= startDate
    if (endDate) return d <= endDate
    return true
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Reportes</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 mb-4">
          <label className="text-xs font-medium flex flex-col">
            Desde:
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-xs mt-1"
              max={endDate || undefined}
            />
          </label>
          <label className="text-xs font-medium flex flex-col">
            Hasta:
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-xs mt-1"
              min={startDate || undefined}
            />
          </label>
        </div>
        <PDFDownloadLink
          document={<ReservationsPDF reservations={filteredReservations} />}
          fileName={`reporte_reservas_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`}
          className="w-full"
        >
          {({ loading: pdfLoading }) => (
            <Button size="sm" className="w-full" disabled={pdfLoading || filteredReservations.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              {pdfLoading
                ? "Generando..."
                : filteredReservations.length === 0
                ? "Sin reservas en el rango"
                : "Generar Reporte"}
            </Button>
          )}
        </PDFDownloadLink>
      </CardContent>
    </Card>
  )
}

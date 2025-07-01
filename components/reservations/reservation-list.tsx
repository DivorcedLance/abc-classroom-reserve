"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth-store"
import { useReservationStore } from "@/store/reservation-store"
import type { Reservation } from "@/lib/types"
import { Calendar, Clock, MapPin, User, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { supabase } from "@/lib/supabase"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import { Download, BarChart3 } from "lucide-react"
import { ReservationsPDF } from "./reservation-pdf"
import { ReservationReportCard } from "./reservation-report-card"

interface ReservationListProps {
  showAllReservations?: boolean
}

export function ReservationList({ showAllReservations = false }: ReservationListProps) {
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { reservations, setReservations, updateReservation } = useReservationStore()

  useEffect(() => {
    if (user) {
      fetchReservations()
    }
  }, [user, showAllReservations])

  const fetchReservations = async () => {
    try {
      setLoading(true)

      // Try to get session first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error("No hay sesión activa")
      }

      const response = await fetch("/api/reservations", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar las reservas")
      }

      setReservations(data.reservations)
    } catch (error) {
      console.error("Fetch reservations error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar las reservas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelReservation = async (reservationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cancelar la reserva")
      }

      updateReservation(reservationId, { status: "cancelled" })
      toast({
        title: "Reserva cancelada",
        description: "La reserva se ha cancelado exitosamente",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cancelar la reserva",
        variant: "destructive",
      })
    }
  }

  const canCancelReservation = (reservation: Reservation) => {
    const now = new Date()
    const startTime = new Date(reservation.start_datetime)
    const isOwner = reservation.user_id === user?.id
    const isCoordinator = user?.role === "coordinador"
    const isFuture = startTime > now
    const isActive = reservation.status === "active"

    return isActive && isFuture && (isOwner || isCoordinator)
  }

  const getReservationTypeLabel = (type: string) => {
    return type === "academico" ? "Académico" : "No Académico"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activa</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando reservas...</p>
        </div>
      </div>
    )
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
          <p className="text-muted-foreground">
            {showAllReservations
              ? "No se encontraron reservas en el sistema"
              : "Aún no tienes reservas. Crea tu primera reserva para comenzar."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showAllReservations && (
        <ReservationReportCard reservations={reservations} />
      )}
      {reservations.map((reservation) => (
        <Card key={reservation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{reservation.title}</CardTitle>
                <CardDescription>{getReservationTypeLabel(reservation.reservation_type)}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(reservation.status)}
                {canCancelReservation(reservation) && (
                  <Button variant="outline" size="sm" onClick={() => cancelReservation(reservation.id)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(new Date(reservation.start_datetime), "EEEE, d MMMM yyyy", { locale: es })}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {formatTimeLiteral(reservation.start_datetime)} - {formatTimeLiteral(reservation.end_datetime)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {reservation.classroom?.name}
                  {reservation.classroom?.location && ` - ${reservation.classroom.location}`}
                </div>
                {showAllReservations && reservation.user && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    {reservation.user.full_name || reservation.user.email}
                  </div>
                )}
              </div>
              {reservation.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{reservation.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatTimeLiteral(dateTimeStr: string) {
  return dateTimeStr.slice(11, 16)
}
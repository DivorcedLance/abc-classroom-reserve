"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/auth-store"
import { useReservationStore } from "@/store/reservation-store"
import type { Classroom, ReservationType } from "@/lib/types"
import { Loader2, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ReservationForm() {
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    classroom_id: "",
    title: "",
    description: "",
    reservation_type: "academico" as ReservationType,
  })
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(false)
  const [searchingAvailability, setSearchingAvailability] = useState(false)
  const { toast } = useToast()
  const { user } = useAuthStore()
  const { addReservation } = useReservationStore()

  const searchAvailability = async () => {
    if (!formData.date || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Por favor completa la fecha y horarios antes de buscar disponibilidad",
        variant: "destructive",
      })
      return
    }

    setSearchingAvailability(true)
    try {
      const params = new URLSearchParams({
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      })

      const response = await fetch(`/api/classrooms/availability?${params}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al buscar disponibilidad")
      }

      setAvailableClassrooms(data.classrooms)

      if (data.classrooms.length === 0) {
        toast({
          title: "Sin disponibilidad",
          description: "No hay aulas disponibles en el horario seleccionado",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Búsqueda completada",
          description: `Se encontraron ${data.classrooms.length} aulas disponibles`,
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Search availability error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al buscar disponibilidad",
        variant: "destructive",
      })
    } finally {
      setSearchingAvailability(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const start_datetime = `${formData.date}T${formData.start_time}:00`
      const end_datetime = `${formData.date}T${formData.end_time}:00`

      const reservationData = {
        classroom_id: formData.classroom_id,
        title: formData.title,
        description: formData.description,
        reservation_type: formData.reservation_type,
        start_datetime,
        end_datetime,
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(reservationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la reserva")
      }

      addReservation(data.reservation)
      toast({
        title: "Reserva creada",
        description: "La reserva se ha creado exitosamente",
        variant: "success",
      })

      // Reset form
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
        classroom_id: "",
        title: "",
        description: "",
        reservation_type: "academico",
      })
      setAvailableClassrooms([])
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la reserva",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Nueva Reserva</CardTitle>
        <CardDescription>Completa los datos para reservar un aula</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value, classroom_id: "" })
                  setAvailableClassrooms([])
                }}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora Inicio</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => {
                  setFormData({ ...formData, start_time: e.target.value, classroom_id: "" })
                  setAvailableClassrooms([])
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Hora Fin</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => {
                  setFormData({ ...formData, end_time: e.target.value, classroom_id: "" })
                  setAvailableClassrooms([])
                }}
                required
              />
            </div>
          </div>

          {/* Search Availability Button */}
          <Button type="button" onClick={searchAvailability} disabled={searchingAvailability} className="w-full">
            {searchingAvailability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Search className="mr-2 h-4 w-4" />
            Buscar Disponibilidad
          </Button>

          {/* Classroom Selection */}
          {availableClassrooms.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="classroom">Aula Disponible</Label>
              <Select
                value={formData.classroom_id}
                onValueChange={(value) => setFormData({ ...formData, classroom_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un aula" />
                </SelectTrigger>
                <SelectContent>
                  {availableClassrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} - Capacidad: {classroom.capacity}
                      {classroom.location && ` - ${classroom.location}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reservation Type */}
          <div className="space-y-2">
            <Label htmlFor="reservation_type">Tipo de Reserva</Label>
            <Select
              value={formData.reservation_type}
              onValueChange={(value: ReservationType) => setFormData({ ...formData, reservation_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academico">Académico (Curso)</SelectItem>
                <SelectItem value="no_academico">No Académico (Evento)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {formData.reservation_type === "academico" ? "Nombre del Curso" : "Nombre del Evento"}
            </Label>
            <Input
              id="title"
              type="text"
              placeholder={
                formData.reservation_type === "academico" ? "Ej: Matemáticas I" : "Ej: Seminario de Investigación"
              }
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Información adicional sobre la reserva"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading || !formData.classroom_id}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Reserva
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Navbar } from "@/components/layout/navbar"
import { ReservationForm } from "@/components/reservations/reservation-form"
import { ReservationList } from "@/components/reservations/reservation-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && (user && user.role == "coordinador")) {
      router.push("/admin")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {user.full_name || user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reservation Form */}
          <div>
            <ReservationForm />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>Gestiona tus reservas de manera eficiente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                    <p className="text-sm font-medium text-blue-900">Nueva Reserva</p>
                    <p className="text-xs text-blue-600">Completa el formulario</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Clock className="mx-auto h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-900">Mis Reservas</p>
                    <p className="text-xs text-green-600">Ver historial</p>
                  </div>
                </div>

                {user.role === "coordinador" && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-purple-900">Administración</p>
                    <p className="text-xs text-purple-600">Gestionar todas las reservas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Reservas Recientes</h2>
          <ReservationList />
        </div>
      </div>
    </div>
  )
}

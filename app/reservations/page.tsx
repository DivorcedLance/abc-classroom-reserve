"use client"

import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/layout/navbar"
import { ReservationList } from "@/components/reservations/reservation-list"
import { LoadingPage } from "@/components/ui/loading"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ReservationsPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return <LoadingPage message="Verificando autenticación..." />
  }

  if (!isAuthenticated || !user) {
    return null // Se redirige en el useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.role === "docente" ? "Mis Reservas" : "Reservas"}
          </h1>
          <p className="text-gray-600">Gestiona todas tus reservas de aulas</p>
        </div>

        <ReservationList />
      </div>
    </div>
  )
}

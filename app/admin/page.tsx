"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { Navbar } from "@/components/layout/navbar"
import { ReservationList } from "@/components/reservations/reservation-list"
import { AdminStats } from "@/components/admin/admin-stats"

export default function AdminPage() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "coordinador")) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "coordinador") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Coordinador</h1>
          <p className="text-gray-600">Gestiona todas las reservas del sistema</p>
        </div>

        {/* Admin Stats */}
        <AdminStats />

        {/* All Reservations */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las Reservas</h2>
          <ReservationList showAllReservations={true} />
        </div>
      </div>
    </div>
  )
}

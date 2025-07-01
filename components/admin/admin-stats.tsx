"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function AdminStats() {
  const [stats, setStats] = useState<{ total_reservas: number; total_docentes: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const {
          data: { session }
        } = await supabase.auth.getSession()
        const res = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Error cargando estadísticas")
        setStats(json)
      } catch (error) {
        setStats({ total_reservas: 0, total_docentes: 0 })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="w-full flex justify-center items-center mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : stats?.total_reservas ?? 0}</div>
            <p className="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : stats?.total_docentes ?? 0}</div>
            <p className="text-xs text-muted-foreground">Docentes registrados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

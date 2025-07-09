"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useAuthStore } from "@/store/auth-store"
import { supabase } from "@/lib/supabase"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, setUser, setLoading, initialized } = useAuthStore()
  const providerInitialized = useRef(false)

  useEffect(() => {
    // Solo inicializar una vez si el store no se ha inicializado
    if (!providerInitialized.current && !initialized) {
      providerInitialized.current = true
      console.log('AuthProvider: Initializing auth...')
      checkAuth()
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          setLoading(true)
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("Error fetching profile in AuthProvider:", error)
            // No establecer user como null, mantener la sesión
            console.log('🔍 AuthProvider: Error obteniendo perfil, pero manteniendo sesión')
          } else if (profile) {
            setUser(profile)
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [checkAuth, setUser, setLoading, initialized]) // Agregamos initialized a las dependencias

  return <>{children}</>
}

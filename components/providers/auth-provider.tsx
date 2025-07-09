"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { supabase } from "@/lib/supabase"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Check initial auth state
    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("Error fetching profile:", error)
            setUser(null)
          } else if (profile) {
            setUser(profile)
          }
        } catch (error) {
          console.error("Error in auth state change:", error)
          setUser(null)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Refresh user profile data when token is refreshed
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (!error && profile) {
            setUser(profile)
          }
        } catch (error) {
          console.error("Error refreshing profile:", error)
        }
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [checkAuth, setUser, setLoading])

  return <>{children}</>
}

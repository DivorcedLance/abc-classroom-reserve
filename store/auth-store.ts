import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/types"

interface AuthState {
  user: Profile | null
  loading: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  checkAuthSimple: () => Promise<any>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      signOut: async () => {
        try {
          await supabase.auth.signOut()
          set({ user: null })
        } catch (error) {
          console.error("Error signing out:", error)
          set({ user: null })
        }
      },

      checkAuth: async () => {
        try {
          console.log('🔍 checkAuth: Iniciando verificación...')
          set({ loading: true })
          
          console.log('🔍 checkAuth: Obteniendo sesión...')
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession()

          if (sessionError) {
            console.error("❌ Session error:", sessionError)
            set({ user: null, loading: false })
            return
          }

          console.log('🔍 checkAuth: Sesión obtenida:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            userEmail: session?.user?.email
          })

          if (session?.user) {
            console.log('🔍 checkAuth: Obteniendo perfil para usuario:', session.user.id)
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.error("❌ Profile fetch error:", profileError)
              console.log('🔍 checkAuth: Error obteniendo perfil, pero manteniendo sesión')
              // No cerrar la sesión automáticamente, solo logguear el error
              // El usuario puede seguir autenticado aunque no tengamos su perfil completo
              set({ user: null, loading: false })
              return
            }

            if (profile) {
              console.log('✅ checkAuth: Perfil obtenido:', profile.email)
              set({ user: profile, loading: false })
            } else {
              console.log('❌ checkAuth: No se encontró perfil')
              set({ user: null, loading: false })
            }
          } else {
            console.log('🔍 checkAuth: No hay sesión activa')
            set({ user: null, loading: false })
          }
          
        } catch (error) {
          console.error("❌ Error checking auth:", error)
          set({ user: null, loading: false })
        }
      },

      checkAuthSimple: async () => {
        try {
          console.log('🔍 checkAuthSimple: Iniciando verificación simple...')
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            console.error("❌ Session error:", error)
            return { session: null, error: "Error obteniendo sesión" }
          }

          console.log('🔍 checkAuthSimple: Sesión obtenida:', session)

          return { session, error: null }
        } catch (error) {
          console.error("❌ Error en checkAuthSimple:", error)
          return { session: null, error: "Error inesperado" }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user,
        // No persistir loading state
      }),
      onRehydrateStorage: () => (state) => {
        // Asegurar que loading se establezca en false después de hidratar
        if (state) {
          state.loading = false
        }
      },
    },
  ),
)

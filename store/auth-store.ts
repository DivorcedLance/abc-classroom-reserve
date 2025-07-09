import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { Profile, UserRole } from "@/lib/types"

interface AuthState {
  user: Profile | null
  loading: boolean
  initialized: boolean
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
      initialized: false,

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
        const state = get()
        
        // Evitar múltiples llamadas simultáneas
        if (state.loading) {
          console.log('🔍 checkAuth: Ya hay una verificación en progreso, saltando...')
          return
        }

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
            set({ user: null, loading: false, initialized: true })
            return
          }

          console.log('🔍 checkAuth: Sesión obtenida:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            userEmail: session?.user?.email
          })

          if (session?.user) {
            console.log('🔍 checkAuth: Obteniendo perfil para usuario:', session.user.id)
            
            try {
              // Agregar timeout más corto a la consulta de perfil
              console.log('🔍 checkAuth: Iniciando consulta a profiles...')
              
              const profilePromise = supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single()

              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile query timeout')), 3000)
              )

              console.log('🔍 checkAuth: Esperando respuesta de profiles...')
              const { data: profile, error: profileError } = await Promise.race([
                profilePromise,
                timeoutPromise
              ]) as any

              console.log('🔍 checkAuth: Respuesta recibida:', { profile: !!profile, error: !!profileError })

              if (profileError) {
                console.error("❌ Profile fetch error:", profileError)
                console.log('🔍 checkAuth: Error obteniendo perfil, pero manteniendo sesión')
                // Crear un perfil temporal basado en los datos de auth
                const tempProfile: Profile = {
                  id: session.user.id,
                  email: session.user.email!,
                  full_name: session.user.user_metadata?.full_name || session.user.email,
                  role: 'docente' as UserRole, // Usar un role válido
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
                console.log('🔍 checkAuth: Usando perfil temporal:', tempProfile)
                set({ user: tempProfile, loading: false, initialized: true })
                return
              }

              if (profile) {
                console.log('✅ checkAuth: Perfil obtenido:', profile.email)
                set({ user: profile, loading: false, initialized: true })
              } else {
                console.log('❌ checkAuth: No se encontró perfil')
                set({ user: null, loading: false, initialized: true })
              }
            } catch (error) {
              console.error("❌ Error en consulta de perfil:", error)
              // Si falla la consulta, usar datos del auth
              const tempProfile: Profile = {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.user_metadata?.full_name || session.user.email,
                role: 'docente' as UserRole,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              console.log('🔍 checkAuth: Usando perfil temporal por error:', tempProfile)
              set({ user: tempProfile, loading: false, initialized: true })
            }
          } else {
            console.log('🔍 checkAuth: No hay sesión activa')
            set({ user: null, loading: false, initialized: true })
          }
          
        } catch (error) {
          console.error("❌ Error checking auth:", error)
          set({ user: null, loading: false, initialized: true })
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
        initialized: state.initialized,
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

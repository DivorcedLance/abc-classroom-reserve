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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },

      checkAuth: async () => {
        try {
          set({ loading: true })
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session?.user) {
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

            if (profile) {
              set({ user: profile })
            }
          } else {
            set({ user: null })
          }
        } catch (error) {
          console.error("Error checking auth:", error)
          set({ user: null })
        } finally {
          set({ loading: false })
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)

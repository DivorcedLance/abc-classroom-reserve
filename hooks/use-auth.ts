"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAuthRedirect() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  return { user, loading }
}

export function useRequireAuth() {
  const { user, loading } = useAuthStore()
  
  useEffect(() => {
    // This will trigger auth check if not already done
    useAuthStore.getState().checkAuth()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user && !loading,
  }
}

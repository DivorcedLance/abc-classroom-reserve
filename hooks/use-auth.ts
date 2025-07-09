"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAuthRedirect() {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  return { user, loading }
}

export function useRequireAuth() {
  const { user, loading, checkAuth } = useAuthStore()
  
  useEffect(() => {
    // Solo verificar auth si no hay usuario y no está cargando
    if (!user && !loading) {
      checkAuth()
    }
  }, [user, loading, checkAuth])

  return {
    user,
    loading,
    isAuthenticated: !!user && !loading,
  }
}

export function useAuth() {
  const { user, loading, checkAuth } = useAuthStore()
  
  useEffect(() => {
    // Verificar auth si no hay usuario y no está cargando
    if (!user && !loading) {
      checkAuth()
    }
  }, [user, loading, checkAuth])
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
  }
}

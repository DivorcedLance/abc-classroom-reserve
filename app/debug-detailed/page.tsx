"use client"

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

export default function DebugAuthPage() {
  const { user, loading, checkAuth, setLoading } = useAuthStore()
  const [debugSteps, setDebugSteps] = useState<Array<{
    step: string
    status: 'pending' | 'success' | 'error' | 'running'
    message?: string
    timestamp?: string
  }>>([])

  const addDebugStep = (step: string, status: 'pending' | 'success' | 'error' | 'running', message?: string) => {
    setDebugSteps(prev => [...prev, {
      step,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runFullDebug = async () => {
    setDebugSteps([])
    
    addDebugStep('Iniciando diagnóstico', 'running')
    
    try {
      // 1. Verificar sesión
      addDebugStep('Obteniendo sesión actual', 'running')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addDebugStep('Obteniendo sesión actual', 'error', sessionError.message)
        return
      }
      
      if (sessionData.session) {
        addDebugStep('Obteniendo sesión actual', 'success', `Usuario: ${sessionData.session.user.email}`)
        
        // 2. Verificar perfil
        addDebugStep('Obteniendo perfil de usuario', 'running')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()

        if (profileError) {
          addDebugStep('Obteniendo perfil de usuario', 'error', profileError.message)
        } else {
          addDebugStep('Obteniendo perfil de usuario', 'success', `Perfil: ${profile.full_name}`)
        }
      } else {
        addDebugStep('Obteniendo sesión actual', 'error', 'No hay sesión activa')
      }

      // 3. Verificar store
      addDebugStep('Verificando estado del store', 'running')
      addDebugStep('Verificando estado del store', 'success', 
        `Usuario: ${user ? user.email : 'null'}, Loading: ${loading}`)

    } catch (error) {
      addDebugStep('Error en diagnóstico', 'error', 
        error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const resetAuth = async () => {
    addDebugStep('Reseteando autenticación', 'running')
    try {
      await supabase.auth.signOut()
      setLoading(false)
      localStorage.clear()
      addDebugStep('Reseteando autenticación', 'success', 'Auth reseteado')
    } catch (error) {
      addDebugStep('Reseteando autenticación', 'error', 
        error instanceof Error ? error.message : 'Error')
    }
  }

  const forceCheckAuth = async () => {
    addDebugStep('Forzando verificación de auth', 'running')
    try {
      await checkAuth()
      addDebugStep('Forzando verificación de auth', 'success', 'Verificación completada')
    } catch (error) {
      addDebugStep('Forzando verificación de auth', 'error', 
        error instanceof Error ? error.message : 'Error')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  useEffect(() => {
    runFullDebug()
  }, [])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug de Autenticación Avanzado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runFullDebug}>
              Ejecutar Diagnóstico
            </Button>
            <Button onClick={forceCheckAuth} variant="outline">
              Forzar Check Auth
            </Button>
            <Button onClick={resetAuth} variant="destructive">
              Reset Auth
            </Button>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estado Actual del Store</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
                  {JSON.stringify({ 
                    user: user ? {
                      id: user.id,
                      email: user.email,
                      full_name: user.full_name,
                      role: user.role
                    } : null,
                    loading,
                    isAuthenticated: !!user
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pasos de Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 rounded border">
                      {getStatusIcon(step.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.step}</div>
                        {step.message && (
                          <div className="text-xs text-gray-600">{step.message}</div>
                        )}
                        {step.timestamp && (
                          <div className="text-xs text-gray-400">{step.timestamp}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

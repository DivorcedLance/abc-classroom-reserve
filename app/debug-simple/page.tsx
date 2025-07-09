"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { user, loading, checkAuth } = useAuthStore()
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      const testResults: any = {
        session: {
          hasSession: !!sessionData.session,
          hasUser: !!sessionData.session?.user,
          userEmail: sessionData.session?.user?.email,
          error: sessionError?.message
        },
        store: {
          hasUser: !!user,
          userEmail: user?.email,
          loading
        }
      }

      if (sessionData.session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()

        testResults.profile = {
          hasProfile: !!profile,
          profileData: profile,
          error: profileError?.message
        }
      }

      setResults(testResults)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }

    setIsLoading(false)
  }

  const resetAuth = async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Debug Simple</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={isLoading}>
              {isLoading ? 'Probando...' : 'Ejecutar Pruebas'}
            </Button>
            <Button onClick={() => checkAuth()} variant="outline">
              Check Auth
            </Button>
            <Button onClick={resetAuth} variant="destructive">
              Reset
            </Button>
          </div>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

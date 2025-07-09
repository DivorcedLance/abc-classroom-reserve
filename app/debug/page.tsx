"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)

      setResults({
        connection: error ? 'Failed' : 'Success',
        error: error?.message,
        data
      })
    } catch (err) {
      setResults({
        connection: 'Failed',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testAuth = async () => {
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const { data: user } = await supabase.auth.getUser()
      
      setResults({
        session: session.session ? 'Active' : 'None',
        user: user.user ? user.user.email : 'None',
        sessionDetails: session.session
      })
    } catch (err) {
      setResults({
        auth: 'Failed',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testConnection} disabled={loading}>
              Test DB Connection
            </Button>
            <Button onClick={testAuth} disabled={loading}>
              Test Auth State
            </Button>
          </div>
          
          {loading && <div>Loading...</div>}
          
          {results && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

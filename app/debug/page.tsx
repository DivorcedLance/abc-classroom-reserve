"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const { user, loading } = useAuthStore()
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testSessionOnly = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Testing session only...')
      const { data, error } = await supabase.auth.getSession()
      
      setResults({
        step: 'Session Only',
        success: !error,
        hasSession: !!data.session,
        hasUser: !!data.session?.user,
        userEmail: data.session?.user?.email,
        error: error?.message
      })
    } catch (error) {
      setResults({
        step: 'Session Only',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setIsLoading(false)
  }

  const testProfilesTable = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Testing profiles table...')
      
      // First get session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.user) {
        setResults({ step: 'Profiles Table', success: false, error: 'No session' })
        setIsLoading(false)
        return
      }

      console.log('🔍 Querying profiles for user:', sessionData.session.user.id)
      
      // Test simple count first
      const { data: countData, error: countError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      if (countError) {
        setResults({
          step: 'Profiles Table - Count Test',
          success: false,
          error: countError.message,
          details: countError
        })
        setIsLoading(false)
        return
      }

      // Now test user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single()

      setResults({
        step: 'Profiles Table',
        success: !profileError,
        hasProfile: !!profile,
        profile: profile,
        error: profileError?.message,
        countTest: 'passed'
      })
    } catch (error) {
      setResults({
        step: 'Profiles Table',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setIsLoading(false)
  }

  const testRLS = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Testing RLS policies...')
      
      // Try to query profiles without user context
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1)

      setResults({
        step: 'RLS Test',
        success: !error,
        canQuery: !error,
        error: error?.message,
        hint: error ? 'RLS might be blocking access' : 'RLS allows access'
      })
    } catch (error) {
      setResults({
        step: 'RLS Test',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setIsLoading(false)
  }

  const testProfileWithTimeout = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Testing profile with timeout...')
      
      // First get session
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session?.user) {
        setResults({ step: 'Profile with Timeout', success: false, error: 'No session' })
        setIsLoading(false)
        return
      }

      console.log('🔍 Starting profile query with 3s timeout...')
      
      // Test profile query with timeout like in store
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile query timeout after 3s')), 3000)
      )

      const startTime = Date.now()
      try {
        const { data: profile, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise
        ]) as any

        const elapsed = Date.now() - startTime

        setResults({
          step: 'Profile with Timeout',
          success: !profileError,
          hasProfile: !!profile,
          profile: profile,
          error: profileError?.message,
          elapsedMs: elapsed,
          timedOut: false
        })
      } catch (timeoutError) {
        const elapsed = Date.now() - startTime
        setResults({
          step: 'Profile with Timeout',
          success: false,
          error: timeoutError instanceof Error ? timeoutError.message : 'Timeout error',
          elapsedMs: elapsed,
          timedOut: true
        })
      }
    } catch (error) {
      setResults({
        step: 'Profile with Timeout',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setIsLoading(false)
  }

  const testStoreCheckAuth = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 Testing store checkAuth directly...')
      const { checkAuth } = useAuthStore.getState()
      await checkAuth()
      
      const { user, loading } = useAuthStore.getState()
      setResults({
        step: 'Store checkAuth',
        success: !!user,
        hasUser: !!user,
        userEmail: user?.email,
        loading: loading,
        user: user
      })
    } catch (error) {
      setResults({
        step: 'Store checkAuth',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    setIsLoading(false)
  }

  const resetStoreState = () => {
    const { setUser, setLoading } = useAuthStore.getState()
    setUser(null)
    setLoading(false)
    setResults({
      step: 'Reset Store',
      success: true,
      message: 'Store state reset'
    })
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Debug Step by Step</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Button onClick={testSessionOnly} disabled={isLoading}>
              1. Test Session Only
            </Button>
            <Button onClick={testProfilesTable} disabled={isLoading}>
              2. Test Profiles Table
            </Button>
            <Button onClick={testRLS} disabled={isLoading}>
              3. Test RLS Policies
            </Button>
            <Button onClick={testProfileWithTimeout} disabled={isLoading}>
              4. Test Profile With Timeout
            </Button>
            <Button onClick={testStoreCheckAuth} disabled={isLoading}>
              5. Test Store checkAuth
            </Button>
            <Button onClick={resetStoreState} disabled={isLoading} variant="outline">
              🔄 Reset Store State
            </Button>
            <Button onClick={resetStoreState} disabled={isLoading}>
              6. Reset Store State
            </Button>
          </div>

          <div className="text-sm bg-gray-100 p-2 rounded">
            <strong>Current Store State:</strong><br/>
            User: {user ? user.email : 'null'}<br/>
            Loading: {loading.toString()}
          </div>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {results.step} - {results.success ? '✅ Success' : '❌ Failed'}
                </CardTitle>
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

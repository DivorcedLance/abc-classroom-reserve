"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'

export default function AuthTestPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { user, setUser } = useAuthStore()

  const handleSignUp = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage(`Success: User created with ID ${data.user?.id}`)
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage(`Success: Signed in as ${data.user?.email}`)
        
        // Get profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          setMessage(prev => prev + `\nProfile error: ${profileError.message}`)
        } else {
          setUser(profile)
          setMessage(prev => prev + `\nProfile loaded: ${profile.full_name}`)
        }
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('Signed out')
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Auth Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Email:</label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label>Password:</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSignUp} disabled={loading}>
              Sign Up
            </Button>
            <Button onClick={handleSignIn} disabled={loading}>
              Sign In
            </Button>
            <Button onClick={handleSignOut} disabled={loading}>
              Sign Out
            </Button>
          </div>
          
          {user && (
            <div className="p-4 bg-green-100 rounded">
              <p><strong>Current User:</strong></p>
              <p>Email: {user.email}</p>
              <p>Name: {user.full_name}</p>
              <p>Role: {user.role}</p>
            </div>
          )}
          
          {message && (
            <div className="p-4 bg-gray-100 rounded">
              <pre className="text-sm whitespace-pre-wrap">{message}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

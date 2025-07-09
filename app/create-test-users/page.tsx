"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateTestUsersPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testUsers = [
    {
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'student'
    },
    {
      email: 'admin@example.com',
      password: 'password123',
      full_name: 'Admin User',
      role: 'admin'
    },
    {
      email: 'teacher@example.com',
      password: 'password123',
      full_name: 'Teacher User',
      role: 'teacher'
    }
  ]

  const createTestUsers = async () => {
    setLoading(true)
    setStatus('Creating test users...\n')

    for (const user of testUsers) {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        })

        const result = await response.json()

        if (response.ok) {
          setStatus(prev => prev + `✅ Created user: ${user.email}\n`)
        } else {
          setStatus(prev => prev + `❌ Error creating ${user.email}: ${result.error}\n`)
        }
      } catch (error) {
        setStatus(prev => prev + `❌ Error creating ${user.email}: ${error}\n`)
      }
    }

    setStatus(prev => prev + '\nDone! You can now try logging in with any of these users.')
    setLoading(false)
  }

  const clearStatus = () => {
    setStatus('')
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Test Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p>This will create the following test users:</p>
            <ul className="list-disc pl-6 space-y-1">
              {testUsers.map(user => (
                <li key={user.email}>
                  <strong>{user.email}</strong> (password: {user.password}) - Role: {user.role}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={createTestUsers} disabled={loading}>
              {loading ? 'Creating...' : 'Create Test Users'}
            </Button>
            <Button onClick={clearStatus} variant="outline" disabled={loading}>
              Clear Status
            </Button>
          </div>

          {status && (
            <Card>
              <CardContent className="p-4">
                <pre className="text-sm whitespace-pre-wrap">{status}</pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

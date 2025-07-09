"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectionTest() {
  const [status, setStatus] = useState('Testing...')
  
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Simple connection test
        const { data, error } = await supabase.from('profiles').select('count(*)', { count: 'exact' }).limit(0)
        
        if (error) {
          setStatus(`Connection failed: ${error.message}`)
        } else {
          setStatus('Connection successful!')
        }
      } catch (err) {
        setStatus(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }
    
    testConnection()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <p className="text-lg">{status}</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Environment Variables:</h2>
        <ul className="space-y-1">
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</li>
        </ul>
      </div>
    </div>
  )
}

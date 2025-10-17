'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection
        const { error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        if (error) {
          setConnectionStatus('error')
          setError(error.message)
        } else {
          setConnectionStatus('connected')
        }
      } catch (err) {
        setConnectionStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Database Connection Status</h3>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
        <span className="text-sm">
          {connectionStatus === 'connected' && 'Connected to Supabase'}
          {connectionStatus === 'error' && `Error: ${error}`}
          {connectionStatus === 'testing' && 'Testing connection...'}
        </span>
      </div>
    </div>
  )
}

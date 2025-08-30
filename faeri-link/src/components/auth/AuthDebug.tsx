'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthError } from '@/components/ui/AuthError'
import { AuthSetupGuide } from '@/components/auth/AuthSetupGuide'
import { AlertCircle, CheckCircle, Bug, RefreshCw, BookOpen } from 'lucide-react'

interface AuthDebugProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthDebug: React.FC<AuthDebugProps> = ({ isOpen, onClose }) => {
  const { user, loading, error, signIn, signUp, signOut } = useAuth()
  const [debugResults, setDebugResults] = useState<Record<string, any>>({})
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const runAuthTests = async () => {
    setIsRunningTests(true)
    setDebugResults({})

    const results: Record<string, any> = {}

    try {
      // Test 1: Supabase Client
      results.supabaseClient = { status: 'unknown' }
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1)
        results.supabaseClient = {
          status: error ? 'error' : 'success',
          error: error?.message,
          data
        }
      } catch (err) {
        results.supabaseClient = {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }

      // Test 2: Authentication Session
      results.authSession = { status: 'unknown' }
      try {
        const { data, error } = await supabase.auth.getSession()
        results.authSession = {
          status: error ? 'error' : 'success',
          hasSession: !!data.session,
          user: data.session?.user?.email,
          error: error?.message
        }
      } catch (err) {
        results.authSession = {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }

      // Test 3: User Profile
      if (user) {
        results.userProfile = { status: 'unknown' }
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          results.userProfile = {
            status: error ? 'error' : 'success',
            data,
            error: error?.message
          }
        } catch (err) {
          results.userProfile = {
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error'
          }
        }
      }

      // Test 4: Environment Variables
      results.envVars = {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
        }
      }

    } catch (err) {
      results.overall = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }

    setDebugResults(results)
    setIsRunningTests(false)
  }

  const clearAuthError = () => {
    // This would clear the auth error if we had access to the setter
    // For now, just refresh the page
    window.location.reload()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bug className="w-5 h-5" />
              Authentication Debug Tools
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Debug Controls
              </CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runAuthTests} disabled={isRunningTests}>
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 mr-2" />
                  Run Authentication Tests
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => setShowSetupGuide(!showSetupGuide)}>
              <BookOpen className="w-4 h-4 mr-2" />
              {showSetupGuide ? 'Hide Setup Guide' : 'Setup Guide'}
            </Button>

            {user && (
              <Button variant="outline" onClick={signOut}>
                Test Sign Out
              </Button>
            )}
          </div>

          <AuthError error={error} onDismiss={clearAuthError} />
        </CardContent>
      </Card>

      {showSetupGuide && (
        <div className="mt-6">
          <AuthSetupGuide />
        </div>
      )}

      {Object.keys(debugResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(debugResults).map(([testName, result]) => (
                <div key={testName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium capitalize">
                      {testName.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.status}
                    </Badge>
                  </div>

                  {result.status === 'error' && (
                    <p className="text-red-600 text-sm">{result.error}</p>
                  )}

                  {result.status === 'success' && (
                    <div className="text-sm space-y-1">
                      {result.hasSession !== undefined && (
                        <p>Has Session: {result.hasSession ? 'Yes' : 'No'}</p>
                      )}
                      {result.user && (
                        <p>User: {result.user}</p>
                      )}
                      {result.exists !== undefined && (
                        <p>Exists: {result.exists ? 'Yes' : 'No'}</p>
                      )}
                      {result.value && (
                        <p>Value: {result.value}</p>
                      )}
                      {result.data && (
                        <p>Data: {JSON.stringify(result.data, null, 2)}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/auth/login'}>
              Go to Login
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}

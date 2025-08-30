'use client'

import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AuthError } from '@/components/ui/AuthError'
import { User, Shield, Clock, AlertCircle } from 'lucide-react'

export const AuthStatus: React.FC = () => {
  const { user, loading, error } = useAuth()

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner message="Checking authentication status..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AuthError error={error} />

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Authentication State:</span>
            <Badge variant={user ? 'default' : 'secondary'}>
              {user ? 'Authenticated' : 'Not Authenticated'}
            </Badge>
          </div>

          {user && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User ID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {user.id}
                </code>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user.email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Display Name:</span>
                <span className="text-sm">{user.display_name || 'Not set'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan:</span>
                <Badge variant="outline">{user.plan}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified:</span>
                <Badge variant={user.is_email_verified ? 'default' : 'destructive'}>
                  {user.is_email_verified ? 'Yes' : 'No'}
                </Badge>
              </div>
            </>
          )}
        </div>

        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Not Authenticated</p>
                <p className="text-yellow-600 text-sm mt-1">
                  You need to sign in to access this feature. Click the button below to go to the login page.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

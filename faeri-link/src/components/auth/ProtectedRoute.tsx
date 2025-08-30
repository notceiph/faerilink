'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
  fallback
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  // Show loading spinner while checking authentication
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Checking authentication..." />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Redirecting to login..." />
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}

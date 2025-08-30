'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/forms/AuthForm'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { AuthDebug } from '@/components/auth/AuthDebug'
import {
  Chrome,
  Apple,
  ArrowLeft,
  Zap,
  Users,
  BarChart3,
  Loader2,
  Bug
} from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showDebug, setShowDebug] = useState(false)
  const { user, loading, error } = useAuth()
  const router = useRouter()

  // Debug logging
  console.log('🔍 LoginPage Debug:', {
    user: !!user,
    loading,
    error,
    showDebug
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Debug handler
  const handleDebugClick = () => {
    console.log('🐛 Debug button clicked!')
    setShowDebug(true)
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground mb-4">Loading...</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-muted-foreground mb-2">Stuck on loading?</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDebugClick}
              className="text-xs"
            >
              <Bug className="w-3 h-3 mr-1" />
              Debug
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground mb-4">Redirecting to dashboard...</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const handleSuccess = () => {
    // The useEffect above will handle the redirect when user state updates
    console.log('Authentication successful, waiting for user state update...')
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Faeri Link
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Auth Form */}
          <div className="flex justify-center">
            <AuthForm
              mode={mode}
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
            />
          </div>

          {/* Right Column - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {mode === 'login' ? 'Welcome Back!' : 'Join the Creator Revolution'}
              </h1>
              <p className="text-lg text-muted-foreground">
                {mode === 'login'
                  ? 'Continue building your amazing link in bio page'
                  : 'Create stunning pages that convert visitors into fans'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4">
              <Card className="p-4 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lightning Fast</h3>
                    <p className="text-sm text-muted-foreground">Pages load in under 1.5 seconds</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Perfect for Creators</h3>
                    <p className="text-sm text-muted-foreground">Built for influencers and content creators</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Analytics Included</h3>
                    <p className="text-sm text-muted-foreground">Track clicks, views, and conversions</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Social Proof */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Join thousands of creators who trust Faeri Link
              </p>
              <div className="flex justify-center items-center gap-4 text-2xl">
                <span>🚀</span>
                <span>✨</span>
                <span>💫</span>
                <span>🌟</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 pt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <Apple className="w-4 h-4 mr-2" />
                  Apple
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Modal */}
      <AuthDebug isOpen={showDebug} onClose={() => setShowDebug(false)} />
    </div>
  )
}

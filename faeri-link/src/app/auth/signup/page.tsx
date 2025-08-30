'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/forms/AuthForm'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import {
  Chrome,
  Apple,
  ArrowLeft,
  Zap,
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react'

export default function SignupPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const { user } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (user) {
    router.push('/dashboard')
    return null
  }

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                Start Your Creator Journey
              </h1>
              <p className="text-lg text-muted-foreground">
                Join thousands of creators building amazing link in bio pages
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Free to Start</h3>
                  <p className="text-sm text-muted-foreground">No credit card required. Upgrade when you're ready.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Custom Domain Support</h3>
                  <p className="text-sm text-muted-foreground">Use your own domain with automatic SSL.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Mobile Optimized</h3>
                  <p className="text-sm text-muted-foreground">Perfect on all devices, fast loading.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Built-in Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track performance and optimize your links.</p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4">
              <Card className="p-4 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">10+ Templates</h3>
                    <p className="text-sm text-muted-foreground">Beautiful designs for every creator type</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Unlimited Links</h3>
                    <p className="text-sm text-muted-foreground">Add as many links as you need</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-0 shadow-sm bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Stats</h3>
                    <p className="text-sm text-muted-foreground">Monitor your page performance</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Social Proof */}
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Trusted by creators worldwide
              </p>
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10k+</div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">1M+</div>
                  <div className="text-xs text-muted-foreground">Links Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
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
                    Or sign up with
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
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const email = searchParams.get('email') || user?.email
  const token = searchParams.get('token')

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (user?.email_confirmed_at) {
      router.push('/dashboard')
      return
    }

    // Handle email verification if token is present
    if (token) {
      handleEmailVerification(token)
    }
  }, [user, token, router])

  const handleEmailVerification = async (token: string) => {
    try {
      setVerificationStatus('pending')
      setMessage('Verifying your email...')

      // For Supabase, email verification is typically handled automatically
      // by the auth state change listener in useAuth hook
      // Here we just wait for the user state to update

      // In a real implementation, you might want to manually verify the token
      // const { error } = await supabase.auth.verifyOtp({
      //   token_hash: token,
      //   type: 'signup'
      // })

      // For now, we'll rely on the auth state listener
      setTimeout(() => {
        if (user?.email_confirmed_at) {
          setVerificationStatus('success')
          setMessage('Email verified successfully! Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setVerificationStatus('error')
          setMessage('Email verification failed. Please try again.')
        }
      }, 2000)

    } catch (error) {
      setVerificationStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    }
  }

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    try {
      // Use the resendVerificationEmail function from useAuth hook
      const { error } = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).then(res => res.json())

      if (error) {
        throw new Error(error)
      }

      setMessage('Verification email sent! Please check your inbox.')
    } catch (error) {
      console.error('Error resending verification email:', error)
      setMessage('Failed to resend verification email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />
      default:
        return <Mail className="w-12 h-12 text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>
            {verificationStatus === 'success'
              ? 'Email Verified!'
              : verificationStatus === 'error'
              ? 'Verification Failed'
              : 'Verify Your Email'
            }
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <div className={`text-center text-sm ${
              verificationStatus === 'error' ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {message}
            </div>
          )}

          {verificationStatus === 'pending' && !token && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  We've sent a verification email to:
                </p>
                <p className="font-semibold text-lg">{email}</p>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Click the link in the email to verify your account.
                If you don't see the email, check your spam folder.
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Your email has been verified successfully!
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                There was a problem verifying your email. This could be because:
                <ul className="mt-2 space-y-1 text-left">
                  <li>• The verification link has expired</li>
                  <li>• The link has already been used</li>
                  <li>• There was a technical issue</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Send New Verification Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

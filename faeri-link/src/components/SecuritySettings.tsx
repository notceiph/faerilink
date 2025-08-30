'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import {
  Shield,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react'

interface SecuritySettingsProps {
  onClose?: () => void
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onClose }) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [setupStep, setSetupStep] = useState<'initial' | 'setup' | 'verify' | 'complete'>('initial')
  const [totpUri, setTotpUri] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [error, setError] = useState('')

  // Check 2FA status on component mount
  useEffect(() => {
    if (user) {
      // In a real implementation, you'd fetch this from the user profile
      // For now, we'll simulate the state
      setTwoFactorEnabled(false)
    }
  }, [user])

  const handleSetup2FA = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup 2FA')
      }

      setTotpUri(data.totpUri)
      setBackupCodes(data.backupCodes)
      setSetupStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationToken) {
      setError('Please enter the 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify 2FA')
      }

      setTwoFactorEnabled(true)
      setSetupStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      setTwoFactorEnabled(false)
      setSetupStep('initial')
      setBackupCodes([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setIsLoading(false)
    }
  }

  const copyBackupCodes = async () => {
    const codesText = backupCodes.join('\n')
    try {
      await navigator.clipboard.writeText(codesText)
      alert('Backup codes copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = codesText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Backup codes copied to clipboard!')
    }
  }

  const downloadBackupCodes = () => {
    const codesText = `Faeri Link Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${backupCodes.join('\n')}`
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'faeri-link-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (setupStep === 'setup' && totpUri) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Setup Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Scan this QR code with your authenticator app
            </p>
            <div className="inline-block p-4 bg-white rounded-lg border">
              {/* In a real implementation, you'd render the QR code here */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">QR Code Placeholder</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Can't scan? Enter this code manually: {totpUri.split('secret=')[1]?.split('&')[0]}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setSetupStep('verify')} className="flex-1">
              Continue
            </Button>
            <Button variant="outline" onClick={() => setSetupStep('initial')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (setupStep === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Verify Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>

          <Input
            type="text"
            placeholder="000000"
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleVerify2FA} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
            <Button variant="outline" onClick={() => setSetupStep('initial')}>
              Cancel
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Backup Codes</p>
            <p className="text-xs text-muted-foreground mb-3">
              Save these codes in a secure place. You can use them to access your account if you lose your device.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {backupCodes.map((code, index) => (
                <code key={index} className="bg-muted px-2 py-1 rounded text-xs font-mono">
                  {code}
                </code>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Codes
              </Button>
              <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (setupStep === 'complete') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            2FA Setup Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication has been successfully enabled for your account.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Your account is now more secure!
            </p>
          </div>

          <Button onClick={() => setSetupStep('initial')} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 2FA Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              {twoFactorEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          </div>

          {twoFactorEnabled ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600">
                ✅ Two-factor authentication is enabled
              </p>
              <Button variant="outline" size="sm" onClick={handleDisable2FA}>
                Disable 2FA
              </Button>
            </div>
          ) : (
            <Button onClick={handleSetup2FA} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable 2FA
                </>
              )}
            </Button>
          )}
        </div>

        {/* Session Management */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Manage devices where you're currently logged in
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">
                  {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Unknown Browser'} • {new Date().toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs text-green-600">Active</span>
            </div>
          </div>

          <Button variant="outline" size="sm">
            Revoke Other Sessions
          </Button>
        </div>

        {/* Password Security */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">
              Last changed: Never (Please change your password regularly)
            </p>
          </div>

          <Button variant="outline" size="sm">
            Change Password
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default SecuritySettings

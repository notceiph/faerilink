import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { TOTP } from '@/lib/security'
import { authRateLimiter } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    if (authRateLimiter.isRateLimited(`2fa-verify-${clientIP}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createRouteHandlerClient()
    const { token, backupCode } = await request.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user 2FA data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_backup_codes')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      )
    }

    let isValid = false
    let usedBackupCode = false

    // Check TOTP token if provided
    if (token && userData.two_factor_secret) {
      isValid = TOTP.verifyTOTP(userData.two_factor_secret, token)
    }

    // Check backup code if TOTP failed and backup code provided
    if (!isValid && backupCode && userData.two_factor_backup_codes) {
      const backupCodes = userData.two_factor_backup_codes as string[]
      const codeIndex = backupCodes.indexOf(backupCode.toUpperCase())

      if (codeIndex !== -1) {
        isValid = true
        usedBackupCode = true

        // Remove used backup code
        backupCodes.splice(codeIndex, 1)
        await supabase
          .from('users')
          .update({
            two_factor_backup_codes: backupCodes,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }
    }

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid 2FA token or backup code',
          attemptsRemaining: 3 // You might want to track attempts in the database
        },
        { status: 401 }
      )
    }

    // Enable 2FA if this was the first successful verification
    if (!usedBackupCode && userData.two_factor_secret) {
      await supabase
        .from('users')
        .update({
          two_factor_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    return NextResponse.json({
      success: true,
      message: usedBackupCode
        ? 'Successfully authenticated with backup code. Please generate new backup codes.'
        : '2FA verification successful',
      usedBackupCode
    })

  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

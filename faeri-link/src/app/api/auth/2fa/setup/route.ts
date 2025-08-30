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

    if (authRateLimiter.isRateLimited(`2fa-setup-${clientIP}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate TOTP secret
    const secret = TOTP.generateSecret()

    // Generate backup codes
    const backupCodes = TOTP.generateBackupCodes()

    // Store in database (you would encrypt the secret in production)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret,
        two_factor_backup_codes: backupCodes,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user with 2FA data:', updateError)
      return NextResponse.json(
        { error: 'Failed to setup 2FA' },
        { status: 500 }
      )
    }

    // Generate TOTP URI for QR code
    const totpUri = `otpauth://totp/FaeriLink:${user.email}?secret=${secret}&issuer=FaeriLink`

    return NextResponse.json({
      success: true,
      secret,
      backupCodes,
      totpUri,
      message: '2FA setup initiated. Use the QR code to configure your authenticator app.'
    })

  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'

    if (authRateLimiter.isRateLimited(`2fa-disable-${clientIP}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Disable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_secret: null,
        two_factor_backup_codes: null,
        two_factor_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error disabling 2FA:', updateError)
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled successfully.'
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/verify-email`
      }
    })

    if (error) {
      console.error('Error resending verification email:', error)
      return NextResponse.json(
        { error: 'Failed to resend verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Verification email sent successfully'
    })

  } catch (error) {
    console.error('Unexpected error in verify-email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const type = searchParams.get('type')

    if (!token || !type) {
      return NextResponse.redirect(new URL('/auth/verify-email?error=missing_token', request.url))
    }

    const supabase = createServerClient()

    // Verify the token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any
    })

    if (error) {
      console.error('Email verification error:', error)
      return NextResponse.redirect(new URL('/auth/verify-email?error=verification_failed', request.url))
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/auth/verify-email?success=true', request.url))

  } catch (error) {
    console.error('Unexpected error in email verification:', error)
    return NextResponse.redirect(new URL('/auth/verify-email?error=server_error', request.url))
  }
}

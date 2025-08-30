import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { InputSecurity } from '@/lib/security'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { display_name, bio, website, avatar_url } = body

    // Validate inputs
    const updates: any = {}

    if (display_name !== undefined) {
      if (display_name && !InputSecurity.validateUsername(display_name)) {
        return NextResponse.json(
          { error: 'Display name can only contain letters, numbers, underscores, and hyphens (3-30 characters)' },
          { status: 400 }
        )
      }
      updates.display_name = display_name || null
    }

    if (bio !== undefined) {
      if (bio && bio.length > 500) {
        return NextResponse.json(
          { error: 'Bio must be less than 500 characters' },
          { status: 400 }
        )
      }
      updates.bio = bio || null
    }

    if (website !== undefined) {
      if (website && !InputSecurity.validateUrl(website)) {
        return NextResponse.json(
          { error: 'Please enter a valid website URL' },
          { status: 400 }
        )
      }
      updates.website = website || null
    }

    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url || null
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

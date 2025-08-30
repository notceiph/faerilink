import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const supabaseClient = createClient()

    // First, try to remove existing avatar
    const { data: existingFiles } = await supabaseClient.storage
      .from('avatars')
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      const existingAvatars = existingFiles
        .filter(file => file.name.startsWith('avatar-'))
        .map(file => `${user.id}/${file.name}`)

      if (existingAvatars.length > 0) {
        await supabaseClient.storage
          .from('avatars')
          .remove(existingAvatars)
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user avatar:', updateError)
      // Clean up uploaded file if update fails
      await supabaseClient.storage
        .from('avatars')
        .remove([filePath])

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl,
      message: 'Avatar uploaded successfully'
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Remove avatar files from storage
    const supabaseClient = createClient()

    const { data: existingFiles } = await supabaseClient.storage
      .from('avatars')
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      const existingAvatars = existingFiles
        .filter(file => file.name.startsWith('avatar-'))
        .map(file => `${user.id}/${file.name}`)

      if (existingAvatars.length > 0) {
        await supabaseClient.storage
          .from('avatars')
          .remove(existingAvatars)
      }
    }

    // Update user profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error removing avatar:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    })

  } catch (error) {
    console.error('Avatar removal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

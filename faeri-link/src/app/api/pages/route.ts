import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { InputSecurity } from '@/lib/security'

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

    // Get the user's single page (or null if they don't have one yet)
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching page:', error)
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      page: page || null // Return null if no page exists yet
    })

  } catch (error) {
    console.error('Page fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Debug: POST /api/pages called')

    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔍 API Debug: Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('❌ API Debug: Authentication failed')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, slug, description } = body

    console.log('🔍 API Debug: Request body:', { title, slug, description })

    // Validate inputs
    if (!title || !slug) {
      console.log('❌ API Debug: Missing required fields')
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    if (!InputSecurity.validateUsername(slug)) {
      console.log('❌ API Debug: Invalid slug format')
      return NextResponse.json(
        { error: 'Slug can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    console.log('🔍 API Debug: Checking for existing page...')
    // Check if user already has a page (single page system)
    const { data: existingPage, error: existingPageError } = await supabase
      .from('pages')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingPageError && existingPageError.code !== 'PGRST116') {
      console.log('❌ API Debug: Error checking existing page:', existingPageError)
      return NextResponse.json(
        { error: 'Database error checking existing page' },
        { status: 500 }
      )
    }

    if (existingPage) {
      console.log('❌ API Debug: User already has a page')
      return NextResponse.json(
        { error: 'You already have a page. Use PUT to update it.' },
        { status: 409 }
      )
    }

    console.log('🔍 API Debug: Checking slug uniqueness...')
    // Generate unique slug
    const { data: existingSlug, error: slugError } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .single()

    if (slugError && slugError.code !== 'PGRST116') {
      console.log('❌ API Debug: Error checking slug:', slugError)
      return NextResponse.json(
        { error: 'Database error checking slug uniqueness' },
        { status: 500 }
      )
    }

    let finalSlug = slug
    if (existingSlug) {
      finalSlug = `${slug}-${Date.now()}`
      console.log('🔍 API Debug: Slug already exists, using:', finalSlug)
    }

    const newPage = {
      user_id: user.id,
      title: InputSecurity.sanitizeString(title),
      slug: finalSlug,
      description: description ? InputSecurity.sanitizeString(description) : null,
      status: 'draft' as const,
      is_public: false,
      custom_html: '<div class="container mx-auto p-4"><h1 class="text-2xl font-bold mb-4">' + InputSecurity.sanitizeString(title) + '</h1><div class="space-y-4"><!-- Your custom content here --></div></div>',
      custom_css: '/* Custom CSS */\nbody { font-family: system-ui, sans-serif; }\n.container { max-width: 800px; margin: 0 auto; }',
      custom_js: '// Custom JavaScript\nconsole.log("Page loaded successfully");'
    }

    console.log('🔍 API Debug: Creating page with data:', {
      ...newPage,
      custom_html: newPage.custom_html.substring(0, 50) + '...'
    })

    const { data: page, error } = await supabase
      .from('pages')
      .insert(newPage)
      .select()
      .single()

    if (error) {
      console.error('❌ API Debug: Database error creating page:', error)
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('✅ API Debug: Page created successfully:', page.id)
    return NextResponse.json({
      success: true,
      page,
      message: 'Page created successfully'
    })

  } catch (error) {
    console.error('❌ API Debug: Unexpected error:', error)
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { title, slug, description, status, is_public, custom_html, custom_css, custom_js } = body

    // Get the user's current page
    const { data: existingPage, error: fetchError } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'No page found. Create a page first.' },
        { status: 404 }
      )
    }

    if (fetchError) {
      console.error('Error fetching page:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      )
    }

    // Validate slug uniqueness if it's being changed
    if (slug && slug !== existingPage.slug) {
      if (!InputSecurity.validateUsername(slug)) {
        return NextResponse.json(
          { error: 'Slug can only contain letters, numbers, underscores, and hyphens' },
          { status: 400 }
        )
      }

      const { data: existingSlug } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .neq('id', existingPage.id)
        .single()

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = InputSecurity.sanitizeString(title)
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description ? InputSecurity.sanitizeString(description) : null
    if (status !== undefined) updateData.status = status
    if (is_public !== undefined) updateData.is_public = is_public
    if (custom_html !== undefined) updateData.custom_html = custom_html
    if (custom_css !== undefined) updateData.custom_css = custom_css
    if (custom_js !== undefined) updateData.custom_js = custom_js

    // Update the page
    const { data: page, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating page:', error)
      return NextResponse.json(
        { error: 'Failed to update page' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      page,
      message: 'Page updated successfully'
    })

  } catch (error) {
    console.error('Page update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

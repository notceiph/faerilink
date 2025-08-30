import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { InputSecurity } from '@/lib/security'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In single-page system, we ignore the id parameter and get user's page by user_id
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'No page found. Create a page first.' },
        { status: 404 }
      )
    }

    if (error) {
      console.error('Error fetching page:', error)
      return NextResponse.json(
        { error: 'Failed to fetch page' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      page
    })

  } catch (error) {
    console.error('Page fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In single-page system, we ignore the id parameter and work with user's page
    const body = await request.json()
    const { title, slug, description, status, is_public, seo_settings, social_links, custom_html, custom_css, custom_js } = body

    // Validate inputs
    const updates: any = {}

    if (title !== undefined) {
      updates.title = InputSecurity.sanitizeString(title)
    }

    if (slug !== undefined) {
      if (!InputSecurity.validateUsername(slug)) {
        return NextResponse.json(
          { error: 'Slug can only contain letters, numbers, underscores, and hyphens' },
          { status: 400 }
        )
      }

      // Check if slug is already taken by another page
      const { data: existingSlug } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .neq('user_id', user.id)
        .single()

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug is already taken' },
          { status: 400 }
        )
      }

      updates.slug = slug
    }

    if (description !== undefined) {
      updates.description = description ? InputSecurity.sanitizeString(description) : null
    }

    if (status !== undefined) {
      const validStatuses = ['draft', 'published', 'archived']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updates.status = status
      if (status === 'published') {
        updates.published_at = new Date().toISOString()
        updates.is_public = true
      }
    }

    if (is_public !== undefined) {
      updates.is_public = is_public
    }

    if (seo_settings !== undefined) {
      updates.seo_settings = seo_settings
    }

    if (social_links !== undefined) {
      updates.social_links = social_links
    }

    if (custom_html !== undefined) {
      // HTML validation - basic length check
      if (custom_html && custom_html.length > 50000) {
        return NextResponse.json(
          { error: 'Custom HTML is too long (max 50,000 characters)' },
          { status: 400 }
        )
      }
      updates.custom_html = custom_html
    }

    if (custom_css !== undefined) {
      // Basic CSS validation
      if (custom_css && custom_css.length > 20000) {
        return NextResponse.json(
          { error: 'Custom CSS is too long (max 20,000 characters)' },
          { status: 400 }
        )
      }
      updates.custom_css = custom_css
    }

    if (custom_js !== undefined) {
      // JavaScript validation - basic length check
      if (custom_js && custom_js.length > 10000) {
        return NextResponse.json(
          { error: 'Custom JavaScript is too long (max 10,000 characters)' },
          { status: 400 }
        )
      }
      updates.custom_js = custom_js
    }

    updates.updated_at = new Date().toISOString()

    const { data: page, error } = await supabase
      .from('pages')
      .update(updates)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In single-page system, we don't actually delete the page
    // Instead, we reset it to default state
    const resetData = {
      title: 'My Page',
      description: null,
      status: 'draft',
      is_public: false,
      custom_html: '<div class="container mx-auto p-4"><h1 class="text-2xl font-bold mb-4">My Page</h1><div class="space-y-4"><!-- Your custom content here --></div></div>',
      custom_css: '/* Custom CSS */\nbody { font-family: system-ui, sans-serif; }\n.container { max-width: 800px; margin: 0 auto; }',
      custom_js: '// Custom JavaScript\nconsole.log("Page loaded successfully");',
      updated_at: new Date().toISOString()
    }

    const { data: page, error } = await supabase
      .from('pages')
      .update(resetData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error resetting page:', error)
      return NextResponse.json(
        { error: 'Failed to reset page' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      page,
      message: 'Page reset successfully'
    })

  } catch (error) {
    console.error('Page reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

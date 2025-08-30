import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { InputSecurity } from '@/lib/security'

// HTML validation function
function validateHTML(html: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Basic HTML validation
  if (html.length > 50000) {
    errors.push('HTML content exceeds maximum length (50KB)')
  }

  // Check for dangerous tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form']
  for (const tag of dangerousTags) {
    if (html.toLowerCase().includes(`<${tag}`)) {
      errors.push(`Dangerous tag <${tag}> is not allowed. Use the JavaScript editor instead.`)
    }
  }

  // Check for event handlers
  const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover']
  for (const handler of eventHandlers) {
    if (html.toLowerCase().includes(handler)) {
      errors.push(`Event handler ${handler} is not allowed in HTML. Use the JavaScript editor instead.`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

// CSS validation function
function validateCSS(css: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (css.length > 20000) {
    errors.push('CSS content exceeds maximum length (20KB)')
  }

  return { isValid: errors.length === 0, errors }
}

// JavaScript validation function
function validateJavaScript(js: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (js.length > 10000) {
    errors.push('JavaScript content exceeds maximum length (10KB)')
  }

  // Check for dangerous operations
  const dangerousOps = [
    'eval(', 'Function(', 'setTimeout(', 'setInterval(',
    'XMLHttpRequest', 'fetch(', 'import(', 'require(',
    'document.write', 'document.writeln', 'innerHTML',
    'localStorage', 'sessionStorage', 'cookie'
  ]

  for (const op of dangerousOps) {
    if (js.includes(op)) {
      errors.push(`Dangerous operation '${op}' is not allowed`)
    }
  }

  return { isValid: errors.length === 0, errors }
}

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

    const body = await request.json()
    const { type, content } = body // type: 'html', 'css', 'js'

    if (!type || !['html', 'css', 'js'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be html, css, or js' },
        { status: 400 }
      )
    }

    if (content === undefined) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Validate content based on type
    let validation
    switch (type) {
      case 'html':
        validation = validateHTML(content)
        break
      case 'css':
        validation = validateCSS(content)
        break
      case 'js':
        validation = validateJavaScript(content)
        break
    }

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Content validation failed',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    // Get the user's page
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

    // Update the specific content field
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    switch (type) {
      case 'html':
        updateData.custom_html = content
        break
      case 'css':
        updateData.custom_css = content
        break
      case 'js':
        updateData.custom_js = content
        break
    }

    const { data: page, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating page content:', error)
      return NextResponse.json(
        { error: 'Failed to update page content' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      page,
      message: `${type.toUpperCase()} content updated successfully`
    })

  } catch (error) {
    console.error('Content update error:', error)
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'html', 'css', 'js', or 'all'

    // Get the user's page
    const { data: page, error } = await supabase
      .from('pages')
      .select('custom_html, custom_css, custom_js')
      .eq('user_id', user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'No page found' },
        { status: 404 }
      )
    }

    if (error) {
      console.error('Error fetching page content:', error)
      return NextResponse.json(
        { error: 'Failed to fetch page content' },
        { status: 500 }
      )
    }

    if (type === 'all') {
      return NextResponse.json({
        success: true,
        content: {
          html: page.custom_html || '',
          css: page.custom_css || '',
          js: page.custom_js || ''
        }
      })
    }

    if (!['html', 'css', 'js'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be html, css, js, or all' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      content: page[`custom_${type}`] || ''
    })

  } catch (error) {
    console.error('Content fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

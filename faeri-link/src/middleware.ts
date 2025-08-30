import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { generalRateLimiter, SECURITY_HEADERS } from '@/lib/security'

export async function middleware(request: NextRequest) {
  // Rate limiting for general requests
  const clientIP = request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown'

  if (generalRateLimiter.isRateLimited(clientIP)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  // Add rate limit headers
  const remainingRequests = generalRateLimiter.getRemainingRequests(clientIP)
  const resetTime = generalRateLimiter.getResetTime(clientIP)

  supabaseResponse.headers.set('X-RateLimit-Remaining', remainingRequests.toString())
  supabaseResponse.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
  supabaseResponse.headers.set('X-RateLimit-Limit', '100')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Re-add security headers after response creation
          Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value)
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

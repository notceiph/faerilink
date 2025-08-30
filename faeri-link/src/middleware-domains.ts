import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function handleCustomDomain(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Skip if it's the default domain or localhost
  if (hostname.includes('faeri.link') ||
      hostname.includes('localhost') ||
      hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  try {
    // Create Supabase client
    const supabase = createClient();

    // Find the page that has this custom domain
    const { data: page, error } = await supabase
      .from('pages')
      .select('id, slug, domain, is_public, status')
      .eq('domain', hostname)
      .eq('is_public', true)
      .eq('status', 'published')
      .single();

    if (error || !page) {
      // Domain not found or not configured, redirect to 404
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // Redirect to the page using the slug
    const pageUrl = new URL(`/${page.slug}`, request.url);
    return NextResponse.redirect(pageUrl);

  } catch (error) {
    console.error('Custom domain middleware error:', error);
    return NextResponse.next();
  }
}

// Helper function to validate domain format
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// Helper function to extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Helper function to check if domain is available
export async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('pages')
      .select('id')
      .eq('domain', domain)
      .single();

    return !data; // Available if no existing page has this domain
  } catch {
    return true; // Assume available if error occurs
  }
}

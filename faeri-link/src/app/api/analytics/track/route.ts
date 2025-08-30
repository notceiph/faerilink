import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Device detection utility
function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();

  let type = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    type = 'tablet';
  }

  let os = 'unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  let browser = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  return {
    type,
    os,
    browser,
    screen_size: 'unknown' // Will be set by client-side script
  };
}

// Basic geo detection (simplified - in production use a service like MaxMind)
async function detectGeo(ip: string) {
  try {
    // In a real implementation, you'd use a geo-IP service
    // For now, return basic info or integrate with a service
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      lat: null,
      lng: null
    };
  } catch (error) {
    console.error('Geo detection error:', error);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      lat: null,
      lng: null
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      pageId,
      linkId,
      eventType,
      referrer,
      screenSize
    } = await request.json();

    // Validate required fields
    if (!pageId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, eventType' },
        { status: 400 }
      );
    }

    // Validate event type
    if (!['page_view', 'link_click', 'form_submit'].includes(eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() ||
               realIp ||
               request.headers.get('cf-connecting-ip') ||
               '127.0.0.1';

    // Detect device and geo
    const device = {
      ...detectDevice(userAgent),
      screen_size: screenSize || 'unknown'
    };

    const geo = await detectGeo(ip);

    // Create Supabase client
    const supabase = createClient();

    // Check if page exists and is public
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('id, user_id, slug')
      .eq('id', pageId)
      .eq('is_public', true)
      .eq('status', 'published')
      .single();

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found or not public' },
        { status: 404 }
      );
    }

    // If link click, validate link belongs to page
    if (eventType === 'link_click' && linkId) {
      const { data: link, error: linkError } = await supabase
        .from('links')
        .select('id')
        .eq('id', linkId)
        .eq('page_id', pageId)
        .single();

      if (linkError || !link) {
        return NextResponse.json(
          { error: 'Link not found or does not belong to page' },
          { status: 400 }
        );
      }
    }

    // Create analytics event
    const { data, error } = await supabase
      .rpc('create_analytics_event', {
        page_uuid: pageId,
        event_type: eventType,
        link_uuid: linkId || null,
        user_agent: userAgent,
        ip_address: ip,
        referrer: referrer || null,
        device_data: device,
        geo_data: geo
      });

    if (error) {
      console.error('Analytics event creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create analytics event' },
        { status: 500 }
      );
    }

    // If link click, also increment click count
    if (eventType === 'link_click' && linkId) {
      await (supabase.rpc as any)('increment_link_click', { link_uuid: linkId });
    }

    return NextResponse.json({ success: true, eventId: data });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

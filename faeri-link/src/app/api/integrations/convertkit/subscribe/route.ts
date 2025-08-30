import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ConvertKitSubscribeRequest {
  config: {
    apiKey: string;
    tagId?: string;
  };
  subscriber: {
    email: string;
    firstName?: string;
    lastName?: string;
    tags?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const { config, subscriber }: ConvertKitSubscribeRequest = await request.json();

    // Validate required fields
    if (!config.apiKey || !subscriber.email) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscriber.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ConvertKit API endpoint
    const convertkitUrl = 'https://api.convertkit.com/v3/subscribers';

    const subscriberData = {
      email_address: subscriber.email,
      first_name: subscriber.firstName || '',
      fields: {
        ...(subscriber.lastName && { last_name: subscriber.lastName }),
      },
      tags: subscriber.tags || [],
    };

    // Make request to ConvertKit API
    const response = await fetch(convertkitUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(subscriberData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('ConvertKit API error:', responseData);

      // Handle specific ConvertKit errors
      if (response.status === 422 && responseData.errors) {
        const errorMessages = responseData.errors.map((err: any) => err.message).join(', ');
        return NextResponse.json(
          { error: errorMessages },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: responseData.message || responseData.error || 'ConvertKit API error',
          status: response.status
        },
        { status: 500 }
      );
    }

    // If a tag ID is specified, add the subscriber to that tag
    if (config.tagId && responseData.subscriber?.id) {
      await fetch(`https://api.convertkit.com/v3/tags/${config.tagId}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          subscriber: {
            id: responseData.subscriber.id,
          },
        }),
      });
    }

    // Log the subscription in our database
    const supabase = createClient();
    await supabase
      .from('form_submissions')
      .insert({
        page_id: request.nextUrl.searchParams.get('pageId'), // We'll pass this from the client
        form_type: 'newsletter',
        data: {
          email: subscriber.email,
          provider: 'convertkit',
          subscriber_id: responseData.subscriber?.id,
          tag_id: config.tagId,
          subscribed_at: new Date().toISOString(),
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip'),
        user_agent: request.headers.get('user-agent'),
      });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to ConvertKit',
      subscriberId: responseData.subscriber?.id
    });

  } catch (error) {
    console.error('ConvertKit subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

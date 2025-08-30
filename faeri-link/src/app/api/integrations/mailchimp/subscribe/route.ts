import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface MailchimpSubscribeRequest {
  config: {
    apiKey: string;
    listId: string;
    doubleOptIn?: boolean;
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
    const { config, subscriber }: MailchimpSubscribeRequest = await request.json();

    // Validate required fields
    if (!config.apiKey || !config.listId || !subscriber.email) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey, listId, email' },
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

    // Extract datacenter from API key (Mailchimp API key format: xxxxxxxx-us1)
    const apiKeyParts = config.apiKey.split('-');
    if (apiKeyParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid Mailchimp API key format' },
        { status: 400 }
      );
    }

    const datacenter = apiKeyParts[1];

    // Prepare Mailchimp API request
    const mailchimpUrl = `https://${datacenter}.api.mailchimp.com/3.0/lists/${config.listId}/members`;

    const memberData = {
      email_address: subscriber.email,
      status: config.doubleOptIn ? 'pending' : 'subscribed',
      merge_fields: {
        ...(subscriber.firstName && { FNAME: subscriber.firstName }),
        ...(subscriber.lastName && { LNAME: subscriber.lastName }),
      },
      tags: subscriber.tags || [],
    };

    // Make request to Mailchimp API
    const response = await fetch(mailchimpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString('base64')}`,
      },
      body: JSON.stringify(memberData),
    });

    const responseData = await response.json();

    if (response.status === 400 && responseData.title === 'Member Exists') {
      // Member already exists, try to update their status
      const updateResponse = await fetch(`${mailchimpUrl}/${Buffer.from(subscriber.email.toLowerCase()).toString('base64')}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`anystring:${config.apiKey}`).toString('base64')}`,
        },
        body: JSON.stringify({
          status: config.doubleOptIn ? 'pending' : 'subscribed',
        }),
      });

      if (updateResponse.ok) {
        return NextResponse.json({
          success: true,
          message: 'Email updated successfully'
        });
      }
    }

    if (!response.ok) {
      console.error('Mailchimp API error:', responseData);
      return NextResponse.json(
        {
          error: responseData.detail || responseData.title || 'Mailchimp API error',
          status: response.status
        },
        { status: 500 }
      );
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
          provider: 'mailchimp',
          list_id: config.listId,
          subscribed_at: new Date().toISOString(),
        },
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip'),
        user_agent: request.headers.get('user-agent'),
      });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to Mailchimp'
    });

  } catch (error) {
    console.error('Mailchimp subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

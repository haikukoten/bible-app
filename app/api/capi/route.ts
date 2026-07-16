import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventSourceUrl, actionSource } = body;

    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const accessToken = process.env.FB_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.error('Missing Facebook Pixel ID or Access Token');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Extract user agent and IP from headers
    const userAgent = req.headers.get('user-agent') || '';
    // X-Forwarded-For could be a comma separated list if there are multiple proxies
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.headers.get('x-real-ip') || '');

    // Determine event time (current Unix timestamp in seconds)
    const eventTime = Math.floor(Date.now() / 1000);

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          action_source: actionSource || 'website',
          event_source_url: eventSourceUrl,
          user_data: {
            client_user_agent: userAgent,
            // Include IP if available (CAPI typically expects it to be valid if provided, but we can omit if empty)
            ...(clientIp ? { client_ip_address: clientIp } : {})
          },
        },
      ],
    };

    const fbApiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(fbApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook CAPI Error:', data);
      return NextResponse.json({ error: 'Failed to send event to Facebook' }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('CAPI Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

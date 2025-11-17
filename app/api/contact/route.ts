import { NextRequest, NextResponse } from 'next/server';

// Rate limiting storage (in-memory, resets on cold starts - that's okay for basic protection)
const submissionTracker = new Map<string, number[]>();
const MAX_SUBMISSIONS = 3;
const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, orderNumber, message, website } = body;

    // Honeypot check - if 'website' field is filled, it's a bot
    if (website) {
      console.log('Honeypot triggered - potential spam blocked');
      return NextResponse.json({ success: true }); // Pretend success to not alert the bot
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();

    // Get submission history for this IP
    const submissions = submissionTracker.get(ip) || [];

    // Filter out submissions older than the time window
    const recentSubmissions = submissions.filter(timestamp => now - timestamp < TIME_WINDOW);

    // Check if rate limit exceeded
    if (recentSubmissions.length >= MAX_SUBMISSIONS) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    // Add current submission timestamp
    recentSubmissions.push(now);
    submissionTracker.set(ip, recentSubmissions);

    // Clean up old entries periodically (keep map from growing indefinitely)
    if (submissionTracker.size > 1000) {
      const cutoff = now - TIME_WINDOW;
      for (const [key, timestamps] of submissionTracker.entries()) {
        const valid = timestamps.filter(t => t > cutoff);
        if (valid.length === 0) {
          submissionTracker.delete(key);
        } else {
          submissionTracker.set(key, valid);
        }
      }
    }

    // Send to Pabbly webhook
    const pabblyWebhookUrl = process.env.PABBLY_NEW_MESSAGE_WEBHOOK_URL;

    if (pabblyWebhookUrl) {
      try {
        const response = await fetch(pabblyWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            orderNumber: orderNumber || 'N/A',
            message,
            submittedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          console.error('Pabbly webhook failed:', response.status, await response.text());
        } else {
          console.log('Pabbly webhook sent successfully');
        }
      } catch (webhookError) {
        console.error('Failed to send Pabbly webhook:', webhookError);
        // Don't fail the whole request if webhook fails
      }
    } else {
      console.warn('PABBLY_NEW_MESSAGE_WEBHOOK_URL not configured');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}

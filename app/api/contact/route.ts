import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, orderNumber, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateAndUploadReceipt } from '@/lib/generate-receipt-pdf';
import { formatDeliveryTimeSlot } from '@/lib/utils-time';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Update order payment status
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          stripe_customer_id: paymentIntent.customer as string || null,
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      if (updateError) {
        console.error('Failed to update order:', updateError);
      }

      // Send webhook to Pabbly (if configured)
      if (process.env.PABBLY_WEBHOOK_URL) {
        try {
          const { data: order } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntent.id)
            .single();

          if (order) {
            // Generate PDF receipt
            let receiptPdfUrl = '';
            try {
              receiptPdfUrl = await generateAndUploadReceipt(order);
            } catch (pdfError) {
              console.error('Failed to generate PDF receipt:', pdfError);
              // Continue anyway - don't fail the whole webhook if PDF fails
            }

            await fetch(process.env.PABBLY_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                // Event info
                event: 'order_placed',
                order_number: order.order_number,
                order_id: order.id,
                created_at: order.created_at,

                // Customer (Sender) Info
                sender_name: order.sender_name,
                sender_email: order.sender_email,
                sender_phone: order.sender_phone,

                // Package Details
                package_type: order.package_type,
                package_price: order.package_price,

                // Greeting Card
                card_occasion: order.card_occasion,
                card_message: order.card_message,
                card_signature: order.card_signature,

                // Recipient & Delivery
                recipient_name: order.recipient_name,
                delivery_address: order.delivery_address,
                delivery_city: order.delivery_city,
                delivery_state: order.delivery_state,
                delivery_zipcode: order.delivery_zipcode,
                delivery_date: order.delivery_date,
                delivery_time_slot: formatDeliveryTimeSlot(order.delivery_time_slot),
                gate_code: order.gate_code || '',
                delivery_instructions: order.delivery_instructions || '',

                // Add-ons
                has_chocolates: order.has_chocolates,
                chocolates_price: order.chocolates_price,

                // Pricing
                subtotal: order.subtotal,
                total: order.total,

                // Payment & Status
                payment_status: order.payment_status,
                order_status: order.status,
                stripe_payment_intent_id: order.stripe_payment_intent_id,

                // PDF Receipt
                receipt_pdf_url: receiptPdfUrl,
              }),
            });

            // Mark as notified
            await supabaseAdmin
              .from('orders')
              .update({ pabbly_notified: true })
              .eq('id', order.id);
          }
        } catch (pabblyError) {
          console.error('Pabbly webhook failed:', pabblyError);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;

      await supabaseAdmin
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('stripe_payment_intent_id', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

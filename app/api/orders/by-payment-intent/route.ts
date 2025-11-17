import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { stripe } from '@/lib/stripe';
import { generateAndUploadReceipt } from '@/lib/generate-receipt-pdf';
import { formatDeliveryTimeSlot } from '@/lib/utils-time';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentIntentId = searchParams.get('id');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment intent ID' }, { status: 400 });
  }

  try {
    // Fetch the order from database
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If payment is still pending, check with Stripe and update
    if (order.payment_status === 'pending') {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
          // Update order to paid
          await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'paid',
              stripe_customer_id: paymentIntent.customer as string || null
            })
            .eq('id', order.id);

          // Return updated order
          order.payment_status = 'paid';

          // Send to Pabbly if not already sent
          if (!order.pabbly_notified && process.env.PABBLY_NEW_ORDER_WEBHOOK_URL) {
            try {
              // Generate PDF receipt
              let receiptPdfUrl = '';
              try {
                receiptPdfUrl = await generateAndUploadReceipt(order);
              } catch (pdfError) {
                console.error('Failed to generate PDF receipt:', pdfError);
              }

              await fetch(process.env.PABBLY_NEW_ORDER_WEBHOOK_URL, {
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
                  payment_status: 'paid',
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
            } catch (pabblyError) {
              console.error('Pabbly webhook failed:', pabblyError);
            }
          }
        } else if (paymentIntent.status === 'canceled' || paymentIntent.status === 'requires_payment_method') {
          // Update order to failed
          await supabaseAdmin
            .from('orders')
            .update({ payment_status: 'failed' })
            .eq('id', order.id);

          order.payment_status = 'failed';
        }
      } catch (stripeError) {
        console.error('Failed to verify payment with Stripe:', stripeError);
        // Continue with current order status
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

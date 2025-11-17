import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { calculateOrderTotal } from '@/lib/utils-pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { packageType, hasChocolates, formData } = body;

    // Calculate total
    const pricing = calculateOrderTotal(packageType, hasChocolates);

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError || !orderNumberData) {
      throw new Error('Failed to generate order number');
    }

    const orderNumber = orderNumberData;

    // Create payment intent
    const paymentIntent = await createPaymentIntent(pricing.total, {
      order_number: orderNumber,
      package_type: packageType,
      recipient_name: formData.recipientName,
      sender_email: formData.senderEmail,
    });

    // Create order in database with pending payment status
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        package_type: packageType,
        package_price: pricing.packagePrice,
        card_occasion: formData.cardOccasion,
        card_message: formData.cardMessage,
        card_signature: formData.cardSignature,
        recipient_name: formData.recipientName,
        delivery_address: formData.deliveryAddress,
        delivery_city: formData.deliveryCity,
        delivery_state: formData.deliveryState || 'AZ',
        delivery_zipcode: formData.deliveryZipcode,
        gate_code: formData.gateCode || null,
        delivery_instructions: formData.deliveryInstructions || null,
        delivery_date: formData.deliveryTimeSlot.split(' ')[0],
        delivery_time_slot: formData.deliveryTimeSlot,
        sender_name: formData.senderName,
        sender_phone: formData.senderPhone,
        sender_email: formData.senderEmail,
        has_chocolates: hasChocolates,
        chocolates_price: pricing.chocolatesPrice,
        subtotal: pricing.subtotal,
        total: pricing.total,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
        status: 'received',
      });

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

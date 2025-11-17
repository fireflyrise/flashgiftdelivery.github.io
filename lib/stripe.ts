import Stripe from 'stripe';

// Lazy initialization - only create Stripe instance when actually used
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      console.error('Environment variables:', {
        hasKey: !!secretKey,
        nodeEnv: process.env.NODE_ENV,
      });
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const instance = getStripeInstance();
    return instance[prop as keyof Stripe];
  }
});

// Package prices
export const PACKAGE_PRICES = {
  '1_dozen': 299,
  '2_dozen': 429,
  '3_dozen': 649,
} as const;

export const CHOCOLATES_PRICE = 99;

// Create a payment intent for the order
export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

// Create a checkout session for upsell/downsell flow
export async function createCheckoutSession(
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  metadata: Record<string, string>,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
}

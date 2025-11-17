'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Testimonials } from '@/components/testimonials';
import { Order } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils-pricing';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');

    if (paymentIntentId) {
      // Fetch order details
      fetch(`/api/orders/by-payment-intent?id=${paymentIntentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order) {
            setOrder(data.order);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">We couldn't find your order. Please check your email for order confirmation.</p>
            <Link href="/"><Button className="w-full">Return Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl opacity-95">You're officially a hero. Your roses are on the way!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Order Number */}
        <Card className="mb-8 border-2 border-primary">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
            <p className="text-4xl font-bold text-primary mb-4">{order.order_number}</p>
            <p className="text-sm text-muted-foreground">Save this number to track your order</p>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold">Order Received (Right Now)</div>
                  <div className="text-sm text-muted-foreground">We've received your order and are preparing your premium roses.</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold">Handwriting Your Card (Within 30 minutes)</div>
                  <div className="text-sm text-muted-foreground">We'll beautifully handwrite your message on a Papyrus greeting card.</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold">Out for Delivery (Within 90 minutes)</div>
                  <div className="text-sm text-muted-foreground">Your roses hit the road heading to the recipient.</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground font-bold">
                  4
                </div>
                <div>
                  <div className="font-semibold">Delivered! (Within 2 hours)</div>
                  <div className="text-sm text-muted-foreground">We'll take a photo as proof and send it to you. You're a hero!</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package */}
            <div>
              <h3 className="font-semibold mb-2">Package</h3>
              <div className="flex gap-3">
                <Image src="/roses.jpg" alt="Roses" width={80} height={80} className="rounded" />
                <div>
                  <div className="font-medium">{order.package_type.replace('_', ' ')} Premium Red Roses</div>
                  <div className="text-sm text-muted-foreground">Includes premium vase and handwritten card</div>
                  <div className="text-sm font-semibold mt-1">{formatPrice(order.package_price)}</div>
                </div>
              </div>
            </div>

            {/* Greeting Card */}
            <div>
              <h3 className="font-semibold mb-2">Greeting Card</h3>
              <div className="bg-muted p-4 rounded">
                <div className="text-sm mb-2"><span className="font-semibold">Occasion:</span> {order.card_occasion}</div>
                <div className="text-sm mb-2"><span className="font-semibold">Message:</span></div>
                <div className="italic text-sm mb-2">"{order.card_message}"</div>
                <div className="text-sm"><span className="font-semibold">Signed:</span> {order.card_signature}</div>
              </div>
            </div>

            {/* Delivery Details */}
            <div>
              <h3 className="font-semibold mb-2">Delivery Details</h3>
              <div className="text-sm space-y-1">
                <div><span className="font-semibold">Recipient:</span> {order.recipient_name}</div>
                <div><span className="font-semibold">Address:</span> {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_zipcode}</div>
                {order.gate_code && <div><span className="font-semibold">Gate Code:</span> {order.gate_code}</div>}
                {order.delivery_instructions && <div><span className="font-semibold">Instructions:</span> {order.delivery_instructions}</div>}
                <div><span className="font-semibold">Delivery Time:</span> {order.delivery_time_slot}</div>
              </div>
            </div>

            {/* Order Bump */}
            {order.has_chocolates && (
              <div>
                <h3 className="font-semibold mb-2">Extras</h3>
                <div className="flex gap-3">
                  <Image src="/godiva.jpg" alt="Godiva Chocolates" width={60} height={60} className="rounded" />
                  <div>
                    <div className="font-medium">Godiva Chocolates</div>
                    <div className="text-sm text-muted-foreground">Premium chocolate assortment</div>
                    <div className="text-sm font-semibold mt-1">{formatPrice(order.chocolates_price)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              A confirmation email has been sent to <span className="font-semibold">{order.sender_email}</span> with your order details and tracking information.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't see it within a few minutes, check your spam folder.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href={`/tracking?order=${order.order_number}`}>
            <Button variant="outline" className="w-full">
              Track Your Order
            </Button>
          </Link>
          <Button variant="outline" onClick={handlePrint} className="w-full">
            Print Order Details
          </Button>
          <Link href="/">
            <Button variant="default" className="w-full">
              Send Another Gift
            </Button>
          </Link>
        </div>

        {/* Upsell CTA */}
        <Card className="mb-8 border-2 border-secondary">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Need to Make Someone Else Smile?</h3>
            <p className="text-muted-foreground mb-6">You're on a roll. Send roses to another special person in your life.</p>
            <Link href="/">
              <Button size="lg" className="gold-gradient">
                Send Another Arrangement
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Questions about your order? <Link href="/contact" className="text-primary hover:underline">Contact us</Link></p>
        </div>
      </div>

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils-pricing';

const STATUS_STEPS = [
  { key: 'received', label: 'Received', icon: '📝' },
  { key: 'approved', label: 'Approved', icon: '✅' },
  { key: 'in_progress', label: 'In Progress', icon: '🌹' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚗' },
  { key: 'delivered', label: 'Delivered', icon: '🎉' },
];

function TrackingPageContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/by-number?number=${orderNumber}`);
      const data = await response.json();

      if (data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found. Please check your order number and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  const currentStatusIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/logo.jpg" alt="Flash Gift Delivery" width={150} height={60} className="mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order number to see real-time status updates</p>
        </div>

        {/* Order Number Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Order Number</CardTitle>
            <CardDescription>You can find this in your confirmation email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="orderNumber" className="sr-only">Order Number</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="FGD20251112XXXX"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  required
                  className="text-lg"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Searching...' : 'Track Order'}
              </Button>
            </form>

            {error && (
              <div className="mt-4 bg-destructive/10 text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <>
            {/* Status Timeline */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>Order #{order.order_number}</CardDescription>
                  </div>
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-sm">
                    {STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isCancelled = order.status === 'cancelled';

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                              ${isCompleted && !isCancelled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                              ${isCurrent ? 'ring-4 ring-primary/30' : ''}
                            `}
                          >
                            {step.icon}
                          </div>
                          {index < STATUS_STEPS.length - 1 && (
                            <div
                              className={`w-1 h-12 ${isCompleted && !isCancelled ? 'bg-primary' : 'bg-muted'}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </div>
                          {isCurrent && (
                            <div className="text-sm text-primary font-medium mt-1">
                              Current Status
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {order.status === 'cancelled' && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
                      This order has been cancelled. Please contact support if you have questions.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Photo */}
            {order.status === 'delivered' && order.delivery_photo_url && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Delivery Confirmation</CardTitle>
                  <CardDescription>
                    Delivered on {new Date(order.delivered_at!).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Image
                    src={order.delivery_photo_url}
                    alt="Delivery proof"
                    width={600}
                    height={400}
                    className="rounded-lg w-full"
                  />
                </CardContent>
              </Card>
            )}

            {/* Order Details */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Package</h3>
                  <div className="flex gap-3">
                    <Image src={`/${order.package_type.replace('_', '-')}-roses.jpg`} alt="Roses" width={80} height={80} className="rounded" />
                    <div>
                      <div className="font-medium">{order.package_type.replace('_', ' ')} Premium Red Roses</div>
                      <div className="text-sm text-muted-foreground">Includes vase and handwritten card</div>
                      <div className="text-sm font-semibold mt-1">{formatPrice(order.package_price)}</div>
                    </div>
                  </div>
                </div>

                {order.has_chocolates && (
                  <div>
                    <h3 className="font-semibold mb-2">Extras</h3>
                    <div className="flex gap-3">
                      <Image src="/godiva.jpg" alt="Chocolates" width={60} height={60} className="rounded" />
                      <div>
                        <div className="font-medium">Godiva Chocolates</div>
                        <div className="text-sm font-semibold mt-1">{formatPrice(order.chocolates_price)}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Delivery Information</h3>
                  <div className="text-sm space-y-1">
                    <div><span className="font-semibold">Recipient:</span> {order.recipient_name}</div>
                    <div><span className="font-semibold">Address:</span> {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_zipcode}</div>
                    <div><span className="font-semibold">Scheduled Time:</span> {order.delivery_time_slot}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Questions about your order?
                </p>
                <Link href="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {/* Help Text */}
        {!order && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Where do I find my order number?</h3>
                <p className="text-sm text-muted-foreground">
                  Your order number was sent to your email immediately after placing your order. It starts with "FGD" followed by the date and a unique code.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Still can't find it?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Contact us and we'll help you track your order using your email address or phone number.
                </p>
                <Link href="/contact">
                  <Button variant="outline">Contact Support</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <TrackingPageContent />
    </Suspense>
  );
}

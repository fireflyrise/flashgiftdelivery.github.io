'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Order } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils-pricing';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      const data = await response.json();
      if (data.order) {
        setOrder(data.order);
        setStatus(data.order.status);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      alert('Status updated successfully');
      fetchOrder();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', id);

    try {
      const response = await fetch('/api/admin/upload-delivery-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      alert('Photo uploaded successfully');
      fetchOrder();
    } catch (error) {
      console.error('Photo upload error:', error);
      alert(`Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !order) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm">← Back</Button>
            </Link>
            <Image src="/logo.png" alt="Flash Gift Delivery" width={100} height={40} />
            <h1 className="text-xl font-bold">Order #{order.order_number}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate}>Update</Button>
                </div>
              </div>

              <div>
                <Label>Delivery Photo</Label>
                {order.delivery_photo_url && (
                  <div className="mt-2 mb-3">
                    <Image src={order.delivery_photo_url} alt="Delivery" width={300} height={200} className="rounded" />
                  </div>
                )}
                <div className="mt-2">
                  <Input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  {order.delivery_photo_url && (
                    <p className="text-xs text-muted-foreground mt-1">Upload a new photo to replace the current one</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Package</h3>
                <p>{order.package_type.replace('_', ' ')} - {formatPrice(order.package_price)}</p>
              </div>

              {order.has_chocolates && (
                <div>
                  <h3 className="font-semibold mb-2">Extras</h3>
                  <p>Godiva Chocolates - {formatPrice(order.chocolates_price)}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Greeting Card</h3>
                <p><strong>Occasion:</strong> {order.card_occasion}</p>
                <p><strong>Message:</strong> "{order.card_message}"</p>
                <p><strong>Signature:</strong> {order.card_signature}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery</h3>
                <p><strong>Recipient:</strong> {order.recipient_name}</p>
                <p><strong>Address:</strong> {order.delivery_address}</p>
                <p><strong>City:</strong> {order.delivery_city}, {order.delivery_state} {order.delivery_zipcode}</p>
                {order.gate_code && <p><strong>Gate Code:</strong> {order.gate_code}</p>}
                {order.delivery_instructions && <p><strong>Instructions:</strong> {order.delivery_instructions}</p>}
                <p><strong>Time Slot:</strong> {order.delivery_time_slot}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sender</h3>
                <p><strong>Name:</strong> {order.sender_name}</p>
                <p><strong>Phone:</strong> {order.sender_phone}</p>
                <p><strong>Email:</strong> {order.sender_email}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Payment: {order.payment_status}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

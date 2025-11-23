'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Order } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils-pricing';
import { format, addDays, startOfDay } from 'date-fns';
import { DELIVERY_HOURS } from '@/lib/constants';

type BlockedTimeSlot = {
  id: string;
  block_date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
};

type HourlySlot = {
  hour: number;
  time: string;
  orders: Order[];
  blockedSlots: BlockedTimeSlot[];
};

export default function AdminSchedule() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [orders, setOrders] = useState<Order[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    startTime: '08:00',
    endTime: '',
    reason: '',
  });

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const [ordersRes, blockedRes] = await Promise.all([
        fetch(`/api/admin/orders-by-date?date=${dateStr}`),
        fetch(`/api/admin/blocked-slots?date=${dateStr}`),
      ]);

      const ordersData = await ordersRes.json();
      const blockedData = await blockedRes.json();

      if (ordersData.orders) setOrders(ordersData.orders);
      if (blockedData.blockedSlots) setBlockedSlots(blockedData.blockedSlots);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTimeSlot = async () => {
    if (!blockForm.startTime || !blockForm.endTime) {
      alert('Please enter start and end times');
      return;
    }

    if (blockForm.startTime >= blockForm.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      const response = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_date: format(currentDate, 'yyyy-MM-dd'),
          start_time: blockForm.startTime,
          end_time: blockForm.endTime,
          reason: blockForm.reason || null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setBlockForm({ startTime: '08:00', endTime: '', reason: '' });
        fetchSchedule();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to block time slot');
      }
    } catch (error) {
      console.error('Failed to block time slot:', error);
      alert('Failed to block time slot');
    }
  };

  const handleUnblock = async (id: string) => {
    if (!confirm('Are you sure you want to unblock this time slot?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blocked-slots/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSchedule();
      } else {
        alert('Failed to unblock time slot');
      }
    } catch (error) {
      console.error('Failed to unblock time slot:', error);
      alert('Failed to unblock time slot');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  // Generate hourly slots from 8 AM to 8 PM
  const generateHourlySlots = (): HourlySlot[] => {
    const slots: HourlySlot[] = [];
    for (let hour = DELIVERY_HOURS.open; hour <= DELIVERY_HOURS.close; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;

      // Find orders for this time slot
      const ordersForSlot = orders.filter((order) => {
        if (!order.delivery_time_slot) return false;
        const orderTime = order.delivery_time_slot.split(' ')[1]; // Extract time part
        const orderHour = parseInt(orderTime.split(':')[0]);
        return orderHour === hour;
      });

      // Find blocked slots that overlap with this hour
      const blockedForSlot = blockedSlots.filter((block) => {
        const startHour = parseInt(block.start_time.split(':')[0]);
        const endHour = parseInt(block.end_time.split(':')[0]);
        const endMinute = parseInt(block.end_time.split(':')[1]);

        // Check if this hour falls within the blocked range
        return hour >= startHour && (hour < endHour || (hour === endHour && endMinute > 0));
      });

      slots.push({
        hour,
        time,
        orders: ordersForSlot,
        blockedSlots: blockedForSlot,
      });
    }
    return slots;
  };

  const hourlySlots = generateHourlySlots();

  const goToPreviousDay = () => {
    setCurrentDate(addDays(currentDate, -1));
  };

  const goToNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(startOfDay(new Date()));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image src="/logo.png" alt="Flash Gift Delivery" width={120} height={48} />
              </Link>
              <h1 className="text-2xl font-bold">Delivery Schedule</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 py-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
              Orders
            </Link>
            <Link href="/admin/schedule" className="font-semibold text-primary">
              Schedule
            </Link>
            <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Date Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={goToPreviousDay} variant="outline" size="sm">
              ← Previous
            </Button>
            <Button onClick={goToToday} variant="outline" size="sm">
              Today
            </Button>
            <Button onClick={goToNextDay} variant="outline" size="sm">
              Next →
            </Button>
          </div>

          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
            <div className="flex items-center justify-center gap-3 mt-2">
              <Badge variant="secondary">{orders.length} orders</Badge>
              <Badge variant="destructive">{blockedSlots.length} blocked slots</Badge>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Block Time Slot</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block Time Slot</DialogTitle>
                <DialogDescription>
                  Block a time period on {format(currentDate, 'MMMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={blockForm.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      // Auto-set end time to 1 hour later
                      if (startTime) {
                        const [hours, minutes] = startTime.split(':');
                        const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
                        const endTime = `${endHour}:${minutes}`;
                        setBlockForm({ ...blockForm, startTime, endTime });
                      } else {
                        setBlockForm({ ...blockForm, startTime });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={blockForm.endTime}
                    onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason (optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Doctor's appointment"
                    value={blockForm.reason}
                    onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBlockTimeSlot}>Block Time Slot</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Schedule</CardTitle>
            <CardDescription>
              All deliveries and blocked time slots for {format(currentDate, 'MMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hourlySlots.map((slot) => (
                <div
                  key={slot.hour}
                  className={`border rounded-lg p-4 ${
                    slot.blockedSlots.length > 0 ? 'bg-red-50 border-red-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-lg">
                      {format(new Date().setHours(slot.hour, 0), 'h:mm a')}
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.orders.length > 0 && (
                        <Badge variant="secondary">{slot.orders.length} orders</Badge>
                      )}
                      {slot.blockedSlots.length > 0 && (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>
                  </div>

                  {/* Blocked Slots */}
                  {slot.blockedSlots.map((block) => (
                    <div key={block.id} className="mb-3 p-3 bg-red-100 border border-red-300 rounded flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-red-900">
                          🚫 Blocked: {block.start_time.slice(0, 5)} - {block.end_time.slice(0, 5)}
                        </div>
                        {block.reason && (
                          <div className="text-sm text-red-700">{block.reason}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblock(block.id)}
                      >
                        🗑️ Unblock
                      </Button>
                    </div>
                  ))}

                  {/* Orders */}
                  {slot.orders.length > 0 ? (
                    <div className="space-y-2">
                      {slot.orders.map((order) => (
                        <div
                          key={order.id}
                          className="p-3 bg-muted/50 rounded border hover:bg-muted cursor-pointer"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold">#{order.order_number}</div>
                              <div className="text-sm text-muted-foreground">
                                {order.recipient_name} • {order.delivery_city}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  order.status === 'delivered' ? 'default' :
                                  order.status === 'cancelled' ? 'destructive' :
                                  'secondary'
                                }
                              >
                                {order.status}
                              </Badge>
                              <div className="text-sm font-semibold mt-1">
                                {formatPrice(order.total)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : slot.blockedSlots.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      No orders scheduled
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

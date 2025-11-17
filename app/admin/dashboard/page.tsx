'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils-pricing';

type OrderStats = {
  total_orders: number;
  delivered_orders: number;
  pending_orders: number;
  total_revenue: number;
  today_revenue: number;
  today_orders: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=10'),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.stats) setStats(statsData.stats);
      if (ordersData.orders) setRecentOrders(ordersData.orders);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
                <Image src="/logo.jpg" alt="Flash Gift Delivery" width={120} height={48} />
              </Link>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
            <Link href="/admin/dashboard" className="font-semibold text-primary">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
              Orders
            </Link>
            <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Today's Orders</CardDescription>
              <CardTitle className="text-3xl">{stats?.today_orders || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Revenue: {formatPrice(stats?.today_revenue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Pending Deliveries</CardDescription>
              <CardTitle className="text-3xl text-primary">{stats?.pending_orders || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/orders?status=pending">
                <Button variant="outline" size="sm">View Pending</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl">{formatPrice(stats?.total_revenue || 0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats?.total_orders || 0} total orders
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders in the system</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline">View All Orders</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{order.order_number}</span>
                        <Badge
                          variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.recipient_name} • {order.delivery_city}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(order.total)}</div>
                      <div className="text-sm text-muted-foreground">{order.package_type.replace('_', ' ')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

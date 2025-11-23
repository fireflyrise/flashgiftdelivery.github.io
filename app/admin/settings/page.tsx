'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StoreSettings, DeliveryZipcode } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [zipcodes, setZipcodes] = useState<DeliveryZipcode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newZipcode, setNewZipcode] = useState({ zipcode: '', city: '', state: 'AZ' });

  useEffect(() => {
    fetchSettings();
    fetchZipcodes();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) setSettings(data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchZipcodes = async () => {
    try {
      const response = await fetch('/api/admin/zipcodes');
      const data = await response.json();
      if (data.zipcodes) setZipcodes(data.zipcodes);
    } catch (error) {
      console.error('Failed to fetch zipcodes:', error);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings updated successfully');
    } catch (error) {
      alert('Failed to update settings');
    }
  };

  const handleAddZipcode = async () => {
    try {
      await fetch('/api/admin/zipcodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZipcode),
      });
      alert('Zipcode added successfully');
      setNewZipcode({ zipcode: '', city: '', state: 'AZ' });
      fetchZipcodes();
    } catch (error) {
      alert('Failed to add zipcode');
    }
  };

  const handleRemoveZipcode = async (id: string) => {
    if (!confirm('Remove this zipcode?')) return;
    try {
      await fetch(`/api/admin/zipcodes/${id}`, { method: 'DELETE' });
      fetchZipcodes();
    } catch (error) {
      alert('Failed to remove zipcode');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Image src="/logo.png" alt="Flash Gift Delivery" width={120} height={48} />
              </Link>
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 py-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
            <Link href="/admin/schedule" className="text-muted-foreground hover:text-foreground">Schedule</Link>
            <Link href="/admin/settings" className="font-semibold text-primary">Settings</Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
            <CardDescription>Configure store phone number and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Store Phone Number</Label>
              <Input
                id="phone"
                value={settings?.phone_number || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="closed"
                checked={settings?.is_closed || false}
                onChange={(e) => setSettings(prev => prev ? { ...prev, is_closed: e.target.checked } : null)}
              />
              <Label htmlFor="closed">Store is closed (vacation mode)</Label>
            </div>

            {settings?.is_closed && (
              <>
                <div>
                  <Label htmlFor="closedUntil">Closed Until (optional)</Label>
                  <Input
                    id="closedUntil"
                    type="date"
                    value={settings?.closed_until || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, closed_until: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="closedMessage">Closed Message (optional)</Label>
                  <Textarea
                    id="closedMessage"
                    value={settings?.closed_message || ''}
                    onChange={(e) => setSettings(prev => prev ? { ...prev, closed_message: e.target.value } : null)}
                    rows={2}
                  />
                </div>
              </>
            )}

            <Button onClick={handleSettingsUpdate}>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Zipcodes</CardTitle>
            <CardDescription>Manage areas where you deliver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Zipcode"
                  value={newZipcode.zipcode}
                  onChange={(e) => setNewZipcode(prev => ({ ...prev, zipcode: e.target.value }))}
                />
                <Input
                  placeholder="City"
                  value={newZipcode.city}
                  onChange={(e) => setNewZipcode(prev => ({ ...prev, city: e.target.value }))}
                />
                <Input
                  placeholder="State"
                  value={newZipcode.state}
                  onChange={(e) => setNewZipcode(prev => ({ ...prev, state: e.target.value }))}
                />
                <Button onClick={handleAddZipcode}>Add</Button>
              </div>

              <div className="space-y-2">
                {zipcodes.map(zip => (
                  <div key={zip.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{zip.zipcode} - {zip.city}, {zip.state}</span>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveZipcode(zip.id)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

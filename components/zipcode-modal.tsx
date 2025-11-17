'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkZipcodeDelivery } from '@/lib/supabase';

type ZipcodeModalProps = {
  onValidZipcode: (zipcode: string, city: string, state: string) => void;
  deliveryCities: string[];
};

export function ZipcodeModal({ onValidZipcode, deliveryCities }: ZipcodeModalProps) {
  const [zipcode, setZipcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call API endpoint instead of direct Supabase call
      const response = await fetch(`/api/validate-zipcode?zipcode=${zipcode}`);
      const result = await response.json();

      if (result.valid) {
        onValidZipcode(zipcode, result.city, result.state);
      } else {
        setError("Sorry, we don't deliver to this area yet.");
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Delivery ZIP Code</CardTitle>
          <CardDescription>
            We deliver to select areas in: {deliveryCities.join(', ')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zipcode">ZIP Code</Label>
              <Input
                id="zipcode"
                type="text"
                placeholder="85001"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                required
                className="text-lg"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || zipcode.length !== 5}>
              {loading ? 'Checking...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

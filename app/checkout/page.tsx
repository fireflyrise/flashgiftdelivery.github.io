'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GuaranteeBadge } from '@/components/guarantee-badge';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { PACKAGES, CARD_OCCASIONS, CHOCOLATES_PRICE } from '@/lib/constants';
import { getAvailableTimeSlots, formatDeliveryTimeSlot, BlockedTimeSlot } from '@/lib/utils-time';
import { calculateOrderTotal, formatPrice } from '@/lib/utils-pricing';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CheckoutFormData = {
  // Step 1 - Greeting Card & Delivery
  cardOccasion: string;
  cardMessage: string;
  cardSignature: string;
  recipientName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZipcode: string;
  gateCode: string;
  deliveryInstructions: string;
  deliveryTimeSlot: string;

  // Step 2 - Sender & Payment
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  hasChocolates: boolean;
};

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <GuaranteeBadge />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : 'Complete Order'}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        🔒 Secure checkout powered by Stripe. Your payment information is encrypted and secure.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutFormData>({
    cardOccasion: '',
    cardMessage: '',
    cardSignature: '',
    recipientName: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZipcode: '',
    gateCode: '',
    deliveryInstructions: '',
    deliveryTimeSlot: '',
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    hasChocolates: false,
  });
  const [packageType, setPackageType] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<{ todaySlots: any[]; tomorrowSlots: any[] }>({ todaySlots: [], tomorrowSlots: [] });
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load session data
    const pkg = sessionStorage.getItem('selectedPackage');
    const zipcode = sessionStorage.getItem('deliveryZipcode');
    const city = sessionStorage.getItem('deliveryCity');
    const state = sessionStorage.getItem('deliveryState');

    if (!pkg || !zipcode) {
      router.push('/');
      return;
    }

    setPackageType(pkg);
    setFormData(prev => ({
      ...prev,
      deliveryZipcode: zipcode,
      deliveryCity: city || '',
      deliveryState: state || '',
    }));

    // Load time slots with blocked slots
    fetchTimeSlotsWithBlocks();
  }, [router]);

  const fetchTimeSlotsWithBlocks = async () => {
    try {
      // Fetch blocked time slots from the API
      const response = await fetch('/api/blocked-slots');
      const data = await response.json();
      const blockedSlots: BlockedTimeSlot[] = data.blockedSlots || [];

      // Generate available time slots, excluding blocked ones
      const slots = getAvailableTimeSlots(blockedSlots);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to fetch blocked slots:', error);
      // Fallback to generating slots without blocking
      const slots = getAvailableTimeSlots([]);
      setTimeSlots(slots);
    }
  };

  const selectedPackage = PACKAGES.find(p => p.id === packageType);
  const pricing = selectedPackage ? calculateOrderTotal(selectedPackage.id as any, formData.hasChocolates) : null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType,
          hasChocolates: formData.hasChocolates,
          formData,
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep(3);
      } else {
        alert('Error creating payment. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const updateField = (field: keyof CheckoutFormData, value: any) => {
    // Auto-format phone number
    if (field === 'senderPhone') {
      value = formatPhoneNumber(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!selectedPackage || !pricing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Flash Gift Delivery" width={150} height={60} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? 'text-primary font-semibold' : ''}>1. Delivery Details</span>
            <span>→</span>
            <span className={step >= 2 ? 'text-primary font-semibold' : ''}>2. Your Information</span>
            <span>→</span>
            <span className={step >= 3 ? 'text-primary font-semibold' : ''}>3. Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Details */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                  <CardDescription>Tell us about the greeting card and delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStep1Submit} className="space-y-6">
                    {/* Greeting Card */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Personalized Greeting Card</h3>

                      <div>
                        <Label htmlFor="occasion">Occasion *</Label>
                        <Select value={formData.cardOccasion} onValueChange={(v) => updateField('cardOccasion', v)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occasion" />
                          </SelectTrigger>
                          <SelectContent>
                            {CARD_OCCASIONS.map(occ => (
                              <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">We'll select the perfect card based on your occasion</p>
                      </div>

                      <div>
                        <Label htmlFor="message">Your Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.cardMessage}
                          onChange={(e) => updateField('cardMessage', e.target.value)}
                          placeholder="Write your heartfelt message..."
                          rows={4}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">We'll handwrite this beautifully on a Papyrus card</p>
                      </div>

                      <div>
                        <Label htmlFor="signature">How to Sign It *</Label>
                        <Input
                          id="signature"
                          value={formData.cardSignature}
                          onChange={(e) => updateField('cardSignature', e.target.value)}
                          placeholder="Love, John"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-lg">Recipient Information</h3>

                      <div>
                        <Label htmlFor="recipientName">Recipient's Name *</Label>
                        <Input
                          id="recipientName"
                          value={formData.recipientName}
                          onChange={(e) => updateField('recipientName', e.target.value)}
                          placeholder="Jane Smith"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="address">Delivery Address *</Label>
                        <AddressAutocomplete
                          value={formData.deliveryAddress}
                          onChange={(value) => updateField('deliveryAddress', value)}
                          onPlaceSelect={(addressComponents) => {
                            setFormData(prev => ({
                              ...prev,
                              deliveryAddress: addressComponents.street,
                              deliveryCity: addressComponents.city || prev.deliveryCity,
                              deliveryState: addressComponents.state || prev.deliveryState,
                              deliveryZipcode: addressComponents.zipcode || prev.deliveryZipcode,
                            }));
                          }}
                          placeholder={`123 Main Street, ${formData.deliveryCity || 'Your City'}`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Start typing and select your address. Add apartment/suite number after selecting.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.deliveryCity}
                            onChange={(e) => updateField('deliveryCity', e.target.value)}
                            placeholder={formData.deliveryCity || "City"}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.deliveryState}
                            onChange={(e) => updateField('deliveryState', e.target.value)}
                            placeholder={formData.deliveryState || "State"}
                            maxLength={2}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipcode">ZIP Code *</Label>
                          <Input
                            id="zipcode"
                            value={formData.deliveryZipcode}
                            onChange={(e) => updateField('deliveryZipcode', e.target.value)}
                            placeholder={formData.deliveryZipcode || "ZIP"}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="gateCode">Gate Code (if applicable)</Label>
                        <Input
                          id="gateCode"
                          value={formData.gateCode}
                          onChange={(e) => updateField('gateCode', e.target.value)}
                          placeholder="#1234"
                        />
                      </div>

                      <div>
                        <Label htmlFor="instructions">Special Delivery Instructions</Label>
                        <Textarea
                          id="instructions"
                          value={formData.deliveryInstructions}
                          onChange={(e) => updateField('deliveryInstructions', e.target.value)}
                          placeholder="Leave with concierge, ring doorbell twice, etc."
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="timeSlot">Delivery Time Slot *</Label>
                        <Select value={formData.deliveryTimeSlot} onValueChange={(v) => updateField('deliveryTimeSlot', v)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.todaySlots.length > 0 && (
                              <>
                                <SelectItem value="today-header" disabled>Today</SelectItem>
                                {timeSlots.todaySlots.map(slot => (
                                  <SelectItem
                                    key={slot.value}
                                    value={slot.value}
                                    disabled={slot.blocked}
                                    className={slot.blocked ? 'opacity-50 cursor-not-allowed' : ''}
                                  >
                                    {slot.label} {slot.blocked && '(Unavailable)'}
                                  </SelectItem>
                                ))}
                              </>
                            )}
                            <SelectItem value="tomorrow-header" disabled>Tomorrow</SelectItem>
                            {timeSlots.tomorrowSlots.map(slot => (
                              <SelectItem
                                key={slot.value}
                                value={slot.value}
                                disabled={slot.blocked}
                                className={slot.blocked ? 'opacity-50 cursor-not-allowed' : ''}
                              >
                                {slot.label} {slot.blocked && '(Unavailable)'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Continue to Your Information
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Sender Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>We need your details for order confirmation</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStep2Submit} className="space-y-6">
                    <div>
                      <Label htmlFor="senderName">Your Name (as it appears on your credit card) *</Label>
                      <Input
                        id="senderName"
                        value={formData.senderName}
                        onChange={(e) => updateField('senderName', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="senderPhone">Your Phone Number *</Label>
                      <Input
                        id="senderPhone"
                        type="tel"
                        value={formData.senderPhone}
                        onChange={(e) => updateField('senderPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">We'll call if there are any delivery issues</p>
                    </div>

                    <div>
                      <Label htmlFor="senderEmail">Your Email *</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        value={formData.senderEmail}
                        onChange={(e) => updateField('senderEmail', e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Order confirmation and tracking info will be sent here</p>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="chocolates"
                          checked={formData.hasChocolates}
                          onChange={(e) => updateField('hasChocolates', e.target.checked)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor="chocolates" className="flex items-center gap-2 cursor-pointer">
                            <Image src="/godiva.jpg" alt="Godiva Chocolates" width={60} height={60} className="rounded" />
                            <div>
                              <div className="font-semibold">Add Premium Godiva Chocolates</div>
                              <div className="text-sm text-muted-foreground">Large box of luxury chocolates - the perfect addition</div>
                              <div className="text-lg font-bold text-primary mt-1">+{formatPrice(CHOCOLATES_PRICE)}</div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                        {loading ? 'Processing...' : 'Continue to Payment'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Complete your order securely with Stripe</CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} />
                  </Elements>

                  <div className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full">
                      Back to Your Information
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Image src={selectedPackage.image} alt={selectedPackage.name} width={80} height={80} className="rounded" />
                  <div>
                    <div className="font-semibold">{selectedPackage.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedPackage.roses} premium roses</div>
                    <div className="text-sm text-muted-foreground">+ Vase + Handwritten card</div>
                  </div>
                </div>

                {formData.cardOccasion && (
                  <div className="text-sm">
                    <div className="font-semibold">Occasion:</div>
                    <div className="text-muted-foreground">{formData.cardOccasion}</div>
                  </div>
                )}

                {formData.deliveryTimeSlot && (
                  <div className="text-sm">
                    <div className="font-semibold">Delivery:</div>
                    <div className="text-muted-foreground">{formatDeliveryTimeSlot(formData.deliveryTimeSlot)}</div>
                  </div>
                )}

                {formData.hasChocolates && (
                  <div className="flex justify-between text-sm">
                    <span>Godiva Chocolates</span>
                    <span>{formatPrice(pricing.chocolatesPrice)}</span>
                  </div>
                )}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Package</span>
                    <span>{formatPrice(pricing.packagePrice)}</span>
                  </div>
                  {formData.hasChocolates && (
                    <div className="flex justify-between text-sm">
                      <span>Chocolates</span>
                      <span>{formatPrice(pricing.chocolatesPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(pricing.total)}</span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>2-hour delivery guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Photo proof of delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

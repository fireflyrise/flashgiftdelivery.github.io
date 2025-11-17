'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/countdown-timer';
import { Testimonials } from '@/components/testimonials';
import { FAQSection } from '@/components/faq-section';
import { GuaranteeBadge } from '@/components/guarantee-badge';
import { AsSeenOn } from '@/components/as-seen-on';
import { ZipcodeModal } from '@/components/zipcode-modal';
import { getDeliveryZipcodes } from '@/lib/supabase';
import { PACKAGES } from '@/lib/constants';
import { formatPriceShort } from '@/lib/utils-pricing';
import { getEarliestDeliveryDisplay } from '@/lib/utils-time';

export default function LandingPage() {
  const router = useRouter();
  const [showZipcodeModal, setShowZipcodeModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [deliveryCities, setDeliveryCities] = useState<string[]>([]);
  const [storePhone, setStorePhone] = useState('(602) 829-0009');
  const [storeClosed, setStoreClosed] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('soon');

  useEffect(() => {
    // Set delivery time on client side to avoid hydration mismatch
    setDeliveryTime(getEarliestDeliveryDisplay());

    // Load delivery cities via API
    fetch('/api/delivery-cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities) {
          setDeliveryCities(data.cities);
        }
      })
      .catch(err => console.error('Failed to load delivery cities:', err));

    // Load store settings via API
    fetch('/api/store-settings')
      .then(res => res.json())
      .then(data => {
        if (data.phone_number) {
          setStorePhone(data.phone_number);
        }
        if (data.is_closed !== undefined) {
          setStoreClosed(data.is_closed);
        }
      })
      .catch(err => console.error('Failed to load store settings:', err));
  }, []);

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowZipcodeModal(true);
  };

  const handleValidZipcode = (zipcode: string, city: string, state: string) => {
    // Store in sessionStorage and navigate to checkout
    sessionStorage.setItem('selectedPackage', selectedPackage || '');
    sessionStorage.setItem('deliveryZipcode', zipcode);
    sessionStorage.setItem('deliveryCity', city);
    sessionStorage.setItem('deliveryState', state);
    router.push('/checkout');
  };

  if (storeClosed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Store Temporarily Closed</CardTitle>
            <CardDescription>
              We're taking a short break. Please check back soon!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showZipcodeModal && (
        <ZipcodeModal
          onValidZipcode={handleValidZipcode}
          deliveryCities={deliveryCities}
        />
      )}

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="luxury-gradient text-primary-foreground py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Image
                  src="/logo.jpg"
                  alt="Flash Gift Delivery"
                  width={200}
                  height={80}
                  className="mb-6"
                />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Forgot? We've Got You.
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-95">
                  Premium roses delivered in <span className="font-bold underline">2 hours or less</span>.
                  Turn disaster into hero in one order.
                </p>

                <div className="mb-8">
                  <GuaranteeBadge />
                </div>

                <div className="mb-8">
                  <CountdownTimer />
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>2-Hour Guaranteed Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Premium Long-Stem Roses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Handwritten Card Included</span>
                  </div>
                </div>

                <p className="text-sm opacity-90">
                  Delivering to: <span className="font-semibold">{deliveryCities.join(' • ')}</span>
                </p>
              </div>

              <div className="relative">
                <Image
                  src="/roses.jpg"
                  alt="Premium Red Roses"
                  width={600}
                  height={800}
                  className="rounded-lg shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <AsSeenOn />

        {/* Packages Section */}
        <section className="py-16 bg-background" id="packages">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Choose Your Package
            </h2>
            <p className="text-center text-muted-foreground mb-4">
              All packages include a premium vase and personally handwritten Papyrus greeting card
            </p>
            <div className="text-center mb-12">
              <GuaranteeBadge />
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative ${pkg.featured ? 'border-primary border-4 shadow-xl scale-105' : 'border-2'}`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-secondary text-secondary-foreground px-4 py-1 text-sm font-bold">
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="mb-4">
                      <Image
                        src="/roses.jpg"
                        alt={pkg.name}
                        width={300}
                        height={200}
                        className="rounded-lg mx-auto"
                      />
                    </div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="text-4xl font-bold text-primary mt-4">
                      {formatPriceShort(pkg.price)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{pkg.roses} premium long-stem red roses</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Delivered in 2 hours or less</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Premium glass vase included</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Handwritten Papyrus greeting card</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Photo proof of delivery</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>100% satisfaction guarantee</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      variant={pkg.featured ? 'default' : 'outline'}
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      Order Now - Arrives by {deliveryTime}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                🔒 Secure checkout • 💳 All major cards accepted • 📞 Call us: {storePhone}
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Men Trust Flash Gift Delivery
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Save Your Anniversary</h3>
                <p className="text-muted-foreground">
                  Forgot until 3 PM? No problem. We guarantee delivery in 2 hours or your money back. Turn panic into relief.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Quality, Not Grocery Store Flowers</h3>
                <p className="text-muted-foreground">
                  Long-stem premium roses that look expensive because they are. She'll know you care when she sees these.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Handwritten Card (Because You Don't Have Time)</h3>
                <p className="text-muted-foreground">
                  You tell us what to write, we handwrite it beautifully on a Papyrus card. Personal touch without the hassle.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />

        <FAQSection />

        {/* Final CTA */}
        <section className="py-16 luxury-gradient text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Wait Until It's Too Late
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Every minute counts when you need to make things right. Order now and turn disaster into hero in just 2 hours.
            </p>

            <div className="mb-8 inline-block">
              <CountdownTimer />
            </div>

            <div className="mb-8">
              <GuaranteeBadge />
            </div>

            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}>
              Choose Your Package Now
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card py-12 border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <Image
                  src="/logo.jpg"
                  alt="Flash Gift Delivery"
                  width={150}
                  height={60}
                  className="mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  Premium 2-hour flower delivery service for when it matters most.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <div><Link href="/tracking" className="text-muted-foreground hover:text-foreground">Track Order</Link></div>
                  <div><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></div>
                  <div><a href={`tel:${storePhone.replace(/\D/g, '')}`} className="text-muted-foreground hover:text-foreground">{storePhone}</a></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <div className="space-y-2 text-sm">
                  <div><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms & Conditions</Link></div>
                  <div><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></div>
                  <div><Link href="/refund" className="text-muted-foreground hover:text-foreground">Refund Policy</Link></div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Flash Gift Delivery. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

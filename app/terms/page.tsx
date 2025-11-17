import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Image src="/logo.jpg" alt="Flash Gift Delivery" width={150} height={60} className="mb-8" />
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using Flash Gift Delivery ("Service"), you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h2>2. Our Service</h2>
            <p>
              Flash Gift Delivery provides premium flower delivery services with guaranteed 2-hour delivery within specified service areas. We reserve the right to modify, suspend, or discontinue the Service at any time.
            </p>

            <h2>3. Orders and Delivery</h2>
            <h3>3.1 Order Acceptance</h3>
            <p>
              All orders are subject to acceptance. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or fraud.
            </p>

            <h3>3.2 Delivery Guarantee</h3>
            <p>
              We guarantee delivery within 2 hours of order placement during our operating hours (8 AM - 8 PM). If we fail to deliver within this timeframe, you may be eligible for a full refund under our Money-Back Guarantee.
            </p>

            <h3>3.3 Delivery Restrictions</h3>
            <p>
              Delivery is only available to ZIP codes listed on our website. Orders placed for addresses outside our service area will be automatically rejected or cancelled with a full refund.
            </p>

            <h3>3.4 Recipient Availability</h3>
            <p>
              We will make reasonable efforts to deliver to the specified address. If the recipient is unavailable, we will follow the delivery instructions provided. We are not responsible for failed deliveries due to incorrect addresses or recipient unavailability.
            </p>

            <h2>4. Pricing and Payment</h2>
            <h3>4.1 Prices</h3>
            <p>
              All prices are in USD and include the flower arrangement, vase, and handwritten greeting card. Additional items (such as chocolates) are priced separately.
            </p>

            <h3>4.2 Payment</h3>
            <p>
              Payment is processed securely through Stripe. By placing an order, you authorize us to charge your payment method for the total amount.
            </p>

            <h3>4.3 Payment Failure</h3>
            <p>
              If payment fails or is declined, your order will be cancelled immediately.
            </p>

            <h2>5. Refund and Cancellation Policy</h2>
            <p>
              Please refer to our <Link href="/refund" className="text-primary hover:underline">Refund Policy</Link> for complete details on refunds and cancellations.
            </p>

            <h2>6. Product Quality</h2>
            <p>
              We guarantee premium quality roses and products. All flowers are fresh and professionally arranged. If you are not satisfied with the quality, please contact us within 24 hours of delivery for a resolution.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, and images, is the property of Flash Gift Delivery and is protected by copyright laws.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              Flash Gift Delivery shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your use of the Service is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              For questions about these Terms & Conditions, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the Service constitutes acceptance of modified terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These terms shall be governed by the laws of the State of Arizona, USA, without regard to its conflict of law provisions.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

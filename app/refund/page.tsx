import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Image src="/logo.jpg" alt="Flash Gift Delivery" width={150} height={60} className="mb-8" />
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>Our 100% Money-Back Guarantee</h2>
            <p>
              At Flash Gift Delivery, we stand behind our premium products and services with a 100% satisfaction guarantee. If you're not completely satisfied, we'll make it right.
            </p>

            <h2>1. Delivery Guarantee</h2>
            <h3>1.1 2-Hour Delivery Promise</h3>
            <p>
              We guarantee delivery within 2 hours of order placement during our operating hours (8 AM - 7 PM). If we fail to deliver within this timeframe, you are eligible for a full refund - no questions asked.
            </p>

            <h3>1.2 How to Claim Your Refund</h3>
            <p>
              If your order is not delivered within 2 hours, please contact us immediately at the phone number provided in your order confirmation or through our <Link href="/contact" className="text-primary hover:underline">contact page</Link>. We will process your refund within 24 hours.
            </p>

            <h2>2. Quality Guarantee</h2>
            <h3>2.1 Premium Quality Standards</h3>
            <p>
              We guarantee that all our flowers are fresh, premium-quality, long-stem roses. If you or your recipient are not satisfied with the quality of the flowers, we will provide a full refund or replacement.
            </p>

            <h3>2.2 Reporting Quality Issues</h3>
            <p>
              Quality concerns must be reported within 24 hours of delivery. Please contact us with:
            </p>
            <ul>
              <li>Your order number</li>
              <li>Photos of the flowers (if possible)</li>
              <li>Description of the quality issue</li>
            </ul>

            <h2>3. Cancellation Policy</h2>
            <h3>3.1 Before Delivery Begins</h3>
            <p>
              You may cancel your order for a full refund if:
            </p>
            <ul>
              <li>The order has not yet been approved by our team</li>
              <li>The flowers have not been prepared for delivery</li>
              <li>The delivery has not been dispatched</li>
            </ul>

            <h3>3.2 After Delivery Begins</h3>
            <p>
              Once your order is out for delivery, cancellation is not available. However, our quality and delivery guarantees still apply.
            </p>

            <h3>3.3 How to Cancel</h3>
            <p>
              To cancel your order, contact us immediately at the phone number provided in your confirmation email. Cancellation requests must be made as soon as possible.
            </p>

            <h2>4. Refund Processing</h2>
            <h3>4.1 Refund Method</h3>
            <p>
              All refunds will be issued to the original payment method used for the purchase.
            </p>

            <h3>4.2 Processing Time</h3>
            <p>
              Refunds are typically processed within 24-48 hours of approval. Please allow 5-10 business days for the refund to appear on your statement, depending on your bank or credit card provider.
            </p>

            <h3>4.3 Refund Confirmation</h3>
            <p>
              You will receive an email confirmation once your refund has been processed.
            </p>

            <h2>5. Non-Refundable Situations</h2>
            <p>Refunds are not available in the following situations:</p>
            <ul>
              <li>Incorrect delivery address provided by the customer</li>
              <li>Recipient refuses to accept the delivery</li>
              <li>Recipient is unavailable and alternate delivery instructions were not followed (when provided)</li>
              <li>Delivery to a secure building where access was denied and customer could not be reached</li>
              <li>Quality complaints made more than 24 hours after delivery</li>
            </ul>

            <h2>6. Replacement Option</h2>
            <p>
              In some cases, we may offer a replacement order instead of a refund. This option is at our discretion and will be discussed with you when you contact us about an issue.
            </p>

            <h2>7. Failed Deliveries</h2>
            <h3>7.1 Access Issues</h3>
            <p>
              If we cannot complete delivery due to access issues (e.g., gated community, locked building), we will:
            </p>
            <ul>
              <li>Contact you using the phone number provided</li>
              <li>Attempt to arrange an alternative delivery time</li>
              <li>Provide photo proof of the delivery attempt</li>
            </ul>
            <p>
              If delivery cannot be completed due to access issues beyond our control, refunds are handled on a case-by-case basis.
            </p>

            <h2>8. Weather and Emergencies</h2>
            <p>
              In the event of severe weather or emergencies that prevent safe delivery, we will:
            </p>
            <ul>
              <li>Contact you immediately</li>
              <li>Offer to reschedule delivery or provide a full refund</li>
            </ul>

            <h2>9. Contact Us</h2>
            <p>
              For refund requests or questions about this policy:
            </p>
            <ul>
              <li>Phone: Available in your order confirmation</li>
              <li><Link href="/contact" className="text-primary hover:underline">Contact Form</Link></li>
              <li>Email: Available in your order confirmation</li>
            </ul>

            <h2>10. Our Commitment</h2>
            <p>
              We take pride in our service and products. Our goal is your complete satisfaction. If something isn't right, we'll fix it - that's our promise.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately upon posting to our website.
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

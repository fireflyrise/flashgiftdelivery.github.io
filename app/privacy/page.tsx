import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Image src="/logo.jpg" alt="Flash Gift Delivery" width={150} height={60} className="mb-8" />
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Flash Gift Delivery ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect the following personal information when you place an order:</p>
            <ul>
              <li>Your name, phone number, and email address</li>
              <li>Recipient's name and delivery address</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Greeting card message and signature</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>We automatically collect certain information when you visit our website:</p>
            <ul>
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your order status</li>
              <li>Provide customer support</li>
              <li>Send order confirmations and delivery updates</li>
              <li>Improve our services and website</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <h3>4.1 Third-Party Service Providers</h3>
            <p>We share your information with trusted third-party service providers who assist us in operating our business:</p>
            <ul>
              <li><strong>Stripe:</strong> Payment processing (subject to Stripe's privacy policy)</li>
              <li><strong>Supabase:</strong> Database and data storage</li>
              <li><strong>Vercel:</strong> Website hosting</li>
              <li><strong>Google:</strong> Address autocomplete services</li>
              <li><strong>Pabbly:</strong> Order notification webhooks (if applicable)</li>
            </ul>

            <h3>4.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in response to valid legal requests from authorities.
            </p>

            <h3>4.3 Business Transfers</h3>
            <p>
              If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>6. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li>Access to your personal information</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your personal information</li>
              <li>Objection to processing</li>
              <li>Data portability</li>
            </ul>
            <p>To exercise these rights, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.</p>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to improve your experience on our website. You can control cookies through your browser settings.
            </p>

            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>

            <h2>10. California Privacy Rights</h2>
            <p>
              California residents have specific rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected and the right to request deletion of personal information.
            </p>

            <h2>11. International Users</h2>
            <p>
              If you are accessing our services from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States.
            </p>

            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated "Last updated" date.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please <Link href="/contact" className="text-primary hover:underline">contact us</Link>.
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

# Flash Gift Delivery - Setup Instructions

Complete setup guide for deploying the Flash Gift Delivery application.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Stripe Configuration](#stripe-configuration)
5. [Google Places API Setup](#google-places-api-setup)
6. [Pabbly Connect Webhook](#pabbly-connect-webhook)
7. [Environment Variables](#environment-variables)
8. [Running Locally](#running-locally)
9. [Deploying to Vercel](#deploying-to-vercel)
10. [Initial Admin Setup](#initial-admin-setup)
11. [Testing the Application](#testing-the-application)

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git
- A Supabase account (free tier works)
- A Stripe account
- A Google Cloud account (for Places API)
- A Vercel account (for deployment)
- Pabbly Connect account (optional, for webhooks)

---

## Local Development Setup

### 1. Clone and Install

```bash
cd flashgiftdelivery.github.io
npm install
```

### 2. Project Structure

```
flashgiftdelivery.github.io/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── checkout/          # Checkout flow pages
│   ├── admin/             # Admin dashboard
│   ├── tracking/          # Order tracking page
│   └── ...
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe configuration
│   └── constants.ts      # App constants
├── public/               # Static assets (images)
├── supabase-schema.sql  # Database schema
└── .env.local           # Environment variables (you'll create this)
```

---

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "flash-gift-delivery"
4. Choose a region closest to your target audience
5. Set a strong database password (save this!)
6. Wait for project to be created (~2 minutes)

### 2. Run the Database Schema

1. In your Supabase project dashboard, click "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste into the SQL editor
5. Click "Run"
6. Verify all tables were created: `orders`, `store_settings`, `delivery_zipcodes`, `admin_users`

### 3. Get Your API Keys

1. In Supabase dashboard, go to Settings → API
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`, keep this secret!)

### 4. Configure Row Level Security (RLS)

The schema file already includes RLS policies. To verify:

1. Go to Authentication → Policies
2. You should see policies for each table
3. Public can:
   - Read store settings
   - Read active delivery zipcodes
   - Insert orders
   - View orders (for tracking)

### 5. Add Sample Delivery Zipcodes (Optional)

The schema already includes sample Phoenix/Scottsdale zipcodes. To add more:

```sql
INSERT INTO delivery_zipcodes (zipcode, city, state, is_active)
VALUES
  ('90210', 'Beverly Hills', 'CA', true),
  ('10001', 'New York', 'NY', true);
```

---

## Stripe Configuration

### 1. Create/Login to Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up or login
3. Activate your account (you'll need business details)

### 2. Get API Keys

1. In Stripe dashboard, go to Developers → API keys
2. You'll see:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...` for test mode, keep secret!)

**Important**: Use test keys for development, live keys only for production.

### 3. Configure Webhook for Payment Confirmation

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   - Local: `http://localhost:3000/api/webhooks/stripe` (use Stripe CLI for testing)
   - Production: `https://yourwebsite.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_...`)

### 4. Test Mode

Keep your account in **Test Mode** for development. Use test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any CVC

---

## Google Places API Setup

### 1. Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project: "Flash Gift Delivery"
3. Wait for project creation

### 2. Enable Places API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Places API"
3. Click "Enable"

### 3. Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Restrict Key" (important for security)
5. Under "API restrictions", select "Restrict key"
6. Choose "Places API"
7. Under "Website restrictions", add your domains:
   - `localhost:3000`
   - `flashgiftdelivery.com`
   - `*.vercel.app`
8. Save

### 4. Enable Billing

Places API requires billing to be enabled, but has a generous free tier:
- $200 free credit per month
- Typically enough for small to medium businesses

---

## Pabbly Connect Webhook

This is optional but recommended for order notifications.

### 1. Create Pabbly Account

1. Go to [pabblyconnect.com](https://www.pabblyconnect.com)
2. Sign up for free or paid plan

### 2. Create Workflow

1. Create a new workflow
2. Trigger: Webhook
3. Copy the webhook URL (you'll use this in .env)
4. Action: Choose your notification method:
   - Send email
   - Send SMS
   - Post to Slack
   - etc.

### 3. Configure Webhook Data

The application will send order data including:
- Order number
- Customer name
- Delivery address
- Package type
- Total amount
- Delivery time slot

---

## Environment Variables

### 1. Create `.env.local` File

In the project root, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Fill in All Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx...
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Google Places API
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...

# Pabbly Connect Webhook URL (optional)
PABBLY_WEBHOOK_URL=https://connect.pabbly.com/workflow/sendwebhookdata/xxx

# Admin Password (for initial setup)
ADMIN_PASSWORD=YourSecurePassword123!

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Security Note**: Never commit `.env.local` to git. It's already in `.gitignore`.

---

## Running Locally

### 1. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Verify Everything Works

1. **Landing Page**: Should load with packages
2. **Zipcode Modal**: Click a package, enter a valid zipcode
3. **Store Settings**: Check that phone number loads from Supabase
4. **Images**: All images should display correctly

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js
5. **Before deploying**, add environment variables:
   - Click "Environment Variables"
   - Add ALL variables from your `.env.local` (except ADMIN_PASSWORD initially)
   - Use production values for Stripe, Supabase, etc.
6. Click "Deploy"
7. Wait for deployment (~2 minutes)

### 3. Configure Custom Domain

1. In Vercel project settings, go to "Domains"
2. Add `flashgiftdelivery.com`
3. Follow DNS configuration instructions
4. Add both:
   - `flashgiftdelivery.com`
   - `www.flashgiftdelivery.com`

### 4. Update Environment Variables for Production

1. In Vercel, go to Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to `https://flashgiftdelivery.com`
3. Update Stripe keys to live keys (when ready)
4. Redeploy the application

---

## Initial Admin Setup

### 1. Create Admin User

The admin dashboard requires a user account. You'll need to create this manually in Supabase.

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project
2. Click "Table Editor" → "admin_users"
3. Click "Insert" → "Insert row"
4. Fill in:
   - **username**: `mgarcia4`
   - **password_hash**: (see below for how to generate)
   - **email**: your email
   - **is_active**: `true`

#### Option B: Generate Password Hash

You'll need to hash your password. Use this Node.js script:

```javascript
// hash-password.js
const bcrypt = require('bcryptjs');

const password = 'MyPassword';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Run:
```bash
npm install bcryptjs
node hash-password.js
```

Copy the output hash and paste it as `password_hash` in the database.

#### Option C: SQL Query

```sql
-- Install pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user with hashed password
INSERT INTO admin_users (username, password_hash, email, is_active)
VALUES (
  'mgarcia4',
  crypt('MyPassword', gen_salt('bf')),
  'mgarcia4@gmail.com',
  true
);
```

### 2. Access Admin Dashboard

1. Go to `https://yoursite.com/admin`
2. Login with:
   - Username: `mgarcia4`
   - Password: (whatever you set)

**Save Your Password**: You'll need this to access the dashboard.

**Admin Password**: `YourSecurePassword123!` (replace with your chosen password)

---

## Testing the Application

### 1. Test Complete Flow

#### Landing Page
- [ ] Page loads correctly
- [ ] Images display (logo, roses)
- [ ] Delivery cities load from database
- [ ] Countdown timer works
- [ ] Package cards display correctly
- [ ] Click package → zipcode modal appears

#### Zipcode Validation
- [ ] Enter valid zipcode (e.g., 85001) → proceeds to checkout
- [ ] Enter invalid zipcode → shows error

#### Checkout (when implemented)
- [ ] Step 1: Delivery details form
- [ ] Google Places autocomplete works
- [ ] Time slot selector shows correct slots
- [ ] Step 2: Sender details and payment
- [ ] Order bump (chocolates) displays
- [ ] Stripe checkout works

#### Payment
- [ ] Test card `4242 4242 4242 4242` succeeds
- [ ] Test card `4000 0000 0000 0002` declines
- [ ] Order is created in database

#### Thank You Page
- [ ] Displays order number
- [ ] Shows order summary
- [ ] Download/print option

#### Order Tracking
- [ ] Enter order number → shows order details
- [ ] Status displays correctly
- [ ] Delivery photo shows (when delivered)

#### Admin Dashboard
- [ ] Login works
- [ ] Orders list displays
- [ ] Can update order status
- [ ] Can upload delivery photo
- [ ] Can manage zip codes
- [ ] Can set store as closed

### 2. Test Webhooks

#### Stripe Webhook
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test payment
stripe trigger payment_intent.succeeded
```

#### Pabbly Webhook
- Place a test order
- Check if Pabbly workflow receives data
- Verify notification is sent

---

## Common Issues & Troubleshooting

### Images Not Loading

**Problem**: Images show broken icon
**Solution**:
1. Verify images are in `public/` folder
2. Check file names match exactly (case-sensitive)
3. Restart dev server

### Supabase Connection Error

**Problem**: "Missing Supabase environment variables"
**Solution**:
1. Check `.env.local` file exists
2. Verify keys are correct
3. Restart dev server after adding env vars

### Stripe Not Working

**Problem**: Checkout fails or doesn't load
**Solution**:
1. Verify you're using test keys in development
2. Check Stripe dashboard for errors
3. Make sure webhook secret matches

### Google Places Autocomplete Not Working

**Problem**: Address autocomplete doesn't show
**Solution**:
1. Verify Places API is enabled
2. Check API key restrictions
3. Ensure billing is enabled on Google Cloud

### Deployment Fails on Vercel

**Problem**: Build fails
**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Make sure there are no TypeScript errors locally

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] Stripe account activated with live keys
- [ ] Custom domain configured and working
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Admin user created with strong password
- [ ] Delivery zipcodes configured for your service area
- [ ] Store phone number set in database
- [ ] Test complete order flow end-to-end
- [ ] Webhook endpoints verified
- [ ] Error tracking set up (optional: Sentry)
- [ ] Analytics configured (optional: Google Analytics)

---

## Maintenance

### Adding New Delivery Areas

```sql
INSERT INTO delivery_zipcodes (zipcode, city, state, is_active)
VALUES ('12345', 'New City', 'ST', true);
```

### Temporarily Closing Store

1. Go to Admin Dashboard
2. Click "Store Settings"
3. Toggle "Close Store"
4. Set "Closed Until" date
5. Add custom message for customers

### Updating Prices

Edit `lib/stripe.ts`:

```typescript
export const PACKAGE_PRICES = {
  '1_dozen': 299,  // Update these values
  '2_dozen': 429,
  '3_dozen': 649,
} as const;
```

Also update in `lib/constants.ts` for display.

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Vercel Docs**: https://vercel.com/docs

---

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use environment variables** for all secrets
3. **Enable RLS** on all Supabase tables
4. **Restrict API keys** (Google, Stripe)
5. **Use strong admin passwords** (12+ characters, mixed case, numbers, symbols)
6. **Enable 2FA** on all service accounts (Stripe, Supabase, Vercel)
7. **Regular backups** of Supabase database
8. **Monitor** Stripe dashboard for suspicious activity

---

## Next Steps

After setup is complete:

1. Test the entire flow multiple times
2. Get feedback from beta users
3. Monitor error logs
4. Optimize page load times
5. Set up monitoring/analytics
6. Plan for scaling if needed

---

**Questions?** Check the codebase comments or create an issue in the repository.

**Ready to launch!** 🚀

-- Flash Gift Delivery Database Schema
-- To be run in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Store Settings Table
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) DEFAULT '(602)829-0009',
  is_closed BOOLEAN DEFAULT false,
  closed_until DATE,
  closed_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (phone_number, is_closed) VALUES ('(602)829-0009', false);

-- Delivery Zip Codes Table
CREATE TABLE delivery_zipcodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zipcode VARCHAR(10) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on zipcode for fast lookups
CREATE INDEX idx_delivery_zipcodes_zipcode ON delivery_zipcodes(zipcode);
CREATE INDEX idx_delivery_zipcodes_active ON delivery_zipcodes(is_active);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,

  -- Package details
  package_type VARCHAR(20) NOT NULL CHECK (package_type IN ('1_dozen', '2_dozen', '3_dozen')),
  package_price DECIMAL(10, 2) NOT NULL,

  -- Greeting card
  card_occasion VARCHAR(50) NOT NULL,
  card_message TEXT NOT NULL,
  card_signature VARCHAR(100) NOT NULL,

  -- Recipient details
  recipient_name VARCHAR(100) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_state VARCHAR(2) NOT NULL,
  delivery_zipcode VARCHAR(10) NOT NULL,
  gate_code VARCHAR(50),
  delivery_instructions TEXT,
  delivery_date DATE NOT NULL,
  delivery_time_slot VARCHAR(20) NOT NULL,

  -- Sender details
  sender_name VARCHAR(100) NOT NULL,
  sender_phone VARCHAR(20) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,

  -- Order bump
  has_chocolates BOOLEAN DEFAULT false,
  chocolates_price DECIMAL(10, 2) DEFAULT 0,

  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,

  -- Payment
  stripe_payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),

  -- Order status
  status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'approved', 'in_progress', 'out_for_delivery', 'delivered', 'cancelled')),

  -- Delivery proof
  delivery_photo_url TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Pabbly webhook
  pabbly_notified BOOLEAN DEFAULT false
);

-- Create indexes for orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_email ON orders(sender_email);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate order number: FGD + YYYYMMDD + Random 4 digits
    new_order_number := 'FGD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

    -- Check if it exists
    IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_order_number) THEN
      RETURN new_order_number;
    END IF;

    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique order number after 100 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zipcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public can read store settings
CREATE POLICY "Store settings are viewable by everyone"
  ON store_settings FOR SELECT
  USING (true);

-- Public can read active delivery zipcodes
CREATE POLICY "Active zipcodes are viewable by everyone"
  ON delivery_zipcodes FOR SELECT
  USING (is_active = true);

-- Public can insert orders (for checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Public can read their own order by order number (for tracking)
CREATE POLICY "Anyone can view orders with order number"
  ON orders FOR SELECT
  USING (true);

-- Only authenticated users (admins) can update orders
-- Note: You'll need to implement proper authentication
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can manage store settings
CREATE POLICY "Admins can update store settings"
  ON store_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage zipcodes"
  ON delivery_zipcodes FOR ALL
  USING (auth.role() = 'authenticated');

-- Sample data for testing
INSERT INTO delivery_zipcodes (zipcode, city, state) VALUES
  ('85001', 'Phoenix', 'AZ'),
  ('85004', 'Phoenix', 'AZ'),
  ('85016', 'Phoenix', 'AZ'),
  ('85018', 'Phoenix', 'AZ'),
  ('85020', 'Phoenix', 'AZ'),
  ('85251', 'Scottsdale', 'AZ'),
  ('85254', 'Scottsdale', 'AZ'),
  ('85255', 'Scottsdale', 'AZ'),
  ('85258', 'Scottsdale', 'AZ'),
  ('85260', 'Scottsdale', 'AZ');

-- Create a view for order statistics (useful for admin dashboard)
CREATE VIEW order_stats AS
SELECT
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
  COUNT(*) FILTER (WHERE status IN ('received', 'approved', 'in_progress', 'out_for_delivery')) as pending_orders,
  SUM(total) as total_revenue,
  SUM(total) FILTER (WHERE created_at >= CURRENT_DATE) as today_revenue,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_orders
FROM orders
WHERE payment_status = 'paid';

-- Grant select on view to authenticated users
GRANT SELECT ON order_stats TO authenticated;

-- Comments for documentation
COMMENT ON TABLE orders IS 'Stores all customer orders with delivery and payment information';
COMMENT ON TABLE store_settings IS 'Global store configuration including phone number and vacation mode';
COMMENT ON TABLE delivery_zipcodes IS 'Zip codes where delivery service is available';
COMMENT ON TABLE admin_users IS 'Administrative users who can access the dashboard';
COMMENT ON FUNCTION generate_order_number() IS 'Generates unique order numbers in format FGD + YYYYMMDD + 4 random digits';

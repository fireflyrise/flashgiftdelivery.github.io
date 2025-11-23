-- Add Scheduling System to Flash Gift Delivery
-- Run this in Supabase SQL Editor

-- Create blocked_time_slots table for admin to block specific delivery time slots
CREATE TABLE blocked_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure start_time is before end_time
  CONSTRAINT check_time_order CHECK (start_time < end_time)
);

-- Create indexes for fast lookups
CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(block_date);
CREATE INDEX idx_blocked_time_slots_date_time ON blocked_time_slots(block_date, start_time, end_time);

-- Enable RLS
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Public can read blocked time slots (to hide them from checkout)
CREATE POLICY "Blocked time slots are viewable by everyone"
  ON blocked_time_slots FOR SELECT
  USING (true);

-- Only authenticated users (admins) can manage blocked time slots
CREATE POLICY "Admins can insert blocked time slots"
  ON blocked_time_slots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update blocked time slots"
  ON blocked_time_slots FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete blocked time slots"
  ON blocked_time_slots FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_blocked_time_slots_updated_at BEFORE UPDATE ON blocked_time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to all roles
GRANT SELECT ON blocked_time_slots TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON blocked_time_slots TO authenticated, service_role;

-- Add delivery_date and delivery_time_slot index to orders for calendar queries
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date_time ON orders(delivery_date, delivery_time_slot);

COMMENT ON TABLE blocked_time_slots IS 'Time slots blocked by admin (e.g., for doctor appointments, personal time)';
COMMENT ON COLUMN blocked_time_slots.block_date IS 'Date when the time slot is blocked';
COMMENT ON COLUMN blocked_time_slots.start_time IS 'Start time of the blocked period';
COMMENT ON COLUMN blocked_time_slots.end_time IS 'End time of the blocked period';
COMMENT ON COLUMN blocked_time_slots.reason IS 'Optional reason for the block (e.g., "Doctor appointment")';

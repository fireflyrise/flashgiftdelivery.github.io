-- Fix RLS policies for delivery_zipcodes table
-- Run this in Supabase SQL Editor

-- Drop existing policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Active zipcodes are viewable by everyone" ON delivery_zipcodes;
DROP POLICY IF EXISTS "Public can view active delivery zipcodes" ON delivery_zipcodes;

-- Ensure RLS is enabled
ALTER TABLE delivery_zipcodes ENABLE ROW LEVEL SECURITY;

-- Create the policy to allow public read access
CREATE POLICY "Public can view active delivery zipcodes"
ON delivery_zipcodes
FOR SELECT
TO public
USING (is_active = true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'delivery_zipcodes';

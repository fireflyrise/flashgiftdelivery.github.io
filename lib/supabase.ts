import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Order = {
  id: string;
  order_number: string;
  package_type: '1_dozen' | '2_dozen' | '3_dozen';
  package_price: number;
  card_occasion: string;
  card_message: string;
  card_signature: string;
  recipient_name: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zipcode: string;
  gate_code?: string;
  delivery_instructions?: string;
  delivery_date: string;
  delivery_time_slot: string;
  sender_name: string;
  sender_phone: string;
  sender_email: string;
  has_chocolates: boolean;
  chocolates_price: number;
  subtotal: number;
  total: number;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'received' | 'approved' | 'in_progress' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_photo_url?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  pabbly_notified: boolean;
};

export type DeliveryZipcode = {
  id: string;
  zipcode: string;
  city: string;
  state: string;
  is_active: boolean;
  created_at: string;
};

export type StoreSettings = {
  id: string;
  phone_number: string;
  is_closed: boolean;
  closed_until?: string;
  closed_message?: string;
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
};

// Database functions
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching store settings:', error);
    return null;
  }

  return data;
}

export async function checkZipcodeDelivery(zipcode: string): Promise<DeliveryZipcode | null> {
  const { data, error } = await supabase
    .from('delivery_zipcodes')
    .select('*')
    .eq('zipcode', zipcode)
    .eq('is_active', true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getDeliveryZipcodes(): Promise<DeliveryZipcode[]> {
  const { data, error } = await supabase
    .from('delivery_zipcodes')
    .select('*')
    .eq('is_active', true)
    .order('city', { ascending: true });

  if (error) {
    console.error('Error fetching delivery zipcodes:', error);
    return [];
  }

  return data || [];
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderNumber)
    .single();

  if (error) {
    return null;
  }

  return data;
}

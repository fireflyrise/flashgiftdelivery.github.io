import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching store settings:', error);
      return NextResponse.json({
        phone_number: '(555) 123-4567',
        is_closed: false,
        closed_message: '',
        closed_until: '',
      });
    }

    return NextResponse.json({
      phone_number: data?.phone_number || '(555) 123-4567',
      is_closed: data?.is_closed || false,
      closed_message: data?.closed_message || '',
      closed_until: data?.closed_until || '',
    });
  } catch (error) {
    console.error('Failed to fetch store settings:', error);
    return NextResponse.json({
      phone_number: '(555) 123-4567',
      is_closed: false,
      closed_message: '',
      closed_until: '',
    });
  }
}

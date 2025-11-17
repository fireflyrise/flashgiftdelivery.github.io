import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: zipcodes, error } = await supabase
      .from('delivery_zipcodes')
      .select('city, state')
      .eq('is_active', true)
      .order('city');

    if (error) {
      console.error('Error fetching delivery cities:', error);
      return NextResponse.json({ cities: [] });
    }

    // Get unique cities with state
    const uniqueCities = Array.from(
      new Set(zipcodes?.map(z => `${z.city}, ${z.state}`) || [])
    );

    return NextResponse.json({ cities: uniqueCities });
  } catch (error) {
    console.error('Failed to fetch delivery cities:', error);
    return NextResponse.json({ cities: [] });
  }
}

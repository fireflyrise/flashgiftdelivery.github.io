import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zipcode = searchParams.get('zipcode');

  if (!zipcode) {
    return NextResponse.json({ error: 'Missing zipcode' }, { status: 400 });
  }

  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('delivery_zipcodes')
      .select('*')
      .eq('zipcode', zipcode)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        valid: false,
        error: 'Not in service area',
        debug: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      });
    }

    if (!data) {
      return NextResponse.json({ valid: false, error: 'Not in service area' });
    }

    return NextResponse.json({
      valid: true,
      zipcode: data.zipcode,
      city: data.city,
      state: data.state,
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Validation failed' });
  }
}

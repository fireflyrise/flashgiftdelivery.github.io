import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const zipcode = searchParams.get('zipcode');

  if (!zipcode) {
    return NextResponse.json({ error: 'Missing zipcode' }, { status: 400 });
  }

  try {
    console.log('[Zipcode Validation] Checking zipcode:', zipcode);

    // First, let's check all zipcodes to see what's in the database
    const { data: allZips, error: allZipsError } = await supabaseAdmin
      .from('delivery_zipcodes')
      .select('zipcode, is_active');

    console.log('[Zipcode Validation] All zipcodes in DB:', allZips);

    const { data, error } = await supabaseAdmin
      .from('delivery_zipcodes')
      .select('*')
      .eq('zipcode', zipcode)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[Zipcode Validation] Supabase error:', error);
      return NextResponse.json({
        valid: false,
        error: 'Not in service area',
        debug: {
          message: error.message,
          code: error.code,
          details: error.details,
          searchedZipcode: zipcode
        }
      });
    }

    if (!data) {
      console.error('[Zipcode Validation] No data returned for zipcode:', zipcode);
      return NextResponse.json({ valid: false, error: 'Not in service area' });
    }

    console.log('[Zipcode Validation] Valid zipcode found:', data);
    return NextResponse.json({
      valid: true,
      zipcode: data.zipcode,
      city: data.city,
      state: data.state,
    });
  } catch (error) {
    console.error('[Zipcode Validation] Unexpected error:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' });
  }
}

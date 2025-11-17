import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        hasUrl: !!url,
        hasAnonKey: !!anonKey,
      }, { status: 500 });
    }

    // Try with service role key (bypasses RLS)
    const supabaseAdmin = createClient(url, serviceKey || anonKey);

    const { data: zipcodes, error } = await supabaseAdmin
      .from('delivery_zipcodes')
      .select('*');

    if (error) {
      return NextResponse.json({
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        usingServiceRole: !!serviceKey,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: zipcodes?.length || 0,
      zipcodes,
      usingServiceRole: !!serviceKey,
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}

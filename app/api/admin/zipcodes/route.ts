import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: zipcodes, error } = await supabaseAdmin
      .from('delivery_zipcodes')
      .select('*')
      .order('city');

    if (error) throw error;

    return NextResponse.json({ zipcodes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch zipcodes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { error } = await supabaseAdmin
      .from('delivery_zipcodes')
      .insert(body);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add zipcode' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { error } = await supabaseAdmin
      .from('store_settings')
      .update(body)
      .eq('id', body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

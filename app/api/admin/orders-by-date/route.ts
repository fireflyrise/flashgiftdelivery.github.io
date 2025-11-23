import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/orders-by-date - Fetch orders for a specific delivery date
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('delivery_date', date)
      .order('delivery_time_slot', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error('Failed to fetch orders by date:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

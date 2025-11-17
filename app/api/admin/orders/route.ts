import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status');

  try {
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.in('status', ['received', 'approved', 'in_progress', 'out_for_delivery']);
      } else {
        query = query.eq('status', status);
      }
    }

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

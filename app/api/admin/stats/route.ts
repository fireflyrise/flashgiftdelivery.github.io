import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('order_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Stats error:', error);
      return NextResponse.json({
        stats: {
          total_orders: 0,
          delivered_orders: 0,
          pending_orders: 0,
          total_revenue: 0,
          today_revenue: 0,
          today_orders: 0,
        },
      });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

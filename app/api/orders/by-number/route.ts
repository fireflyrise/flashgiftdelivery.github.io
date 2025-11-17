import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderNumber = searchParams.get('number');

  if (!orderNumber) {
    return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber.toUpperCase())
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      console.error('Order fetch error:', error);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const updateData: any = { status };

    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

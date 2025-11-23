import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/blocked-slots - Fetch blocked time slots
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');

  try {
    let query = supabaseAdmin
      .from('blocked_time_slots')
      .select('*')
      .order('start_time', { ascending: true });

    if (date) {
      query = query.eq('block_date', date);
    }

    const { data: blockedSlots, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ blockedSlots });
  } catch (error) {
    console.error('Failed to fetch blocked slots:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked slots' }, { status: 500 });
  }
}

// POST /api/admin/blocked-slots - Create a new blocked time slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { block_date, start_time, end_time, reason } = body;

    if (!block_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: block_date, start_time, end_time' },
        { status: 400 }
      );
    }

    // Validate that start_time < end_time
    if (start_time >= end_time) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    const { data: blockedSlot, error } = await supabaseAdmin
      .from('blocked_time_slots')
      .insert([
        {
          block_date,
          start_time,
          end_time,
          reason: reason || null,
          created_by: 'admin', // You could get this from session if needed
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ blockedSlot }, { status: 201 });
  } catch (error) {
    console.error('Failed to create blocked slot:', error);
    return NextResponse.json({ error: 'Failed to create blocked slot' }, { status: 500 });
  }
}

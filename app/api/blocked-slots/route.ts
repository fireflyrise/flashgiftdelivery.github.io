import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { format, addDays, startOfDay } from 'date-fns';

// GET /api/blocked-slots - Public endpoint to fetch blocked time slots for today and tomorrow
// Used by checkout page to filter out unavailable time slots
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const today = format(startOfDay(now), 'yyyy-MM-dd');
    const tomorrow = format(addDays(startOfDay(now), 1), 'yyyy-MM-dd');

    // Fetch blocked slots for today and tomorrow
    const { data: blockedSlots, error } = await supabaseAdmin
      .from('blocked_time_slots')
      .select('*')
      .in('block_date', [today, tomorrow])
      .order('block_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ blockedSlots: blockedSlots || [] });
  } catch (error) {
    console.error('Failed to fetch blocked slots:', error);
    // Return empty array on error to avoid blocking checkout
    return NextResponse.json({ blockedSlots: [] });
  }
}

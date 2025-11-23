import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// DELETE /api/admin/blocked-slots/[id] - Delete a blocked time slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('blocked_time_slots')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete blocked slot:', error);
    return NextResponse.json({ error: 'Failed to delete blocked slot' }, { status: 500 });
  }
}

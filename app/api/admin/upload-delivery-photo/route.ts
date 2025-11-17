import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file || !orderId) {
      return NextResponse.json({ error: 'Missing file or order ID' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileName = `${orderId}-${Date.now()}.${file.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('delivery-photos')
      .upload(fileName, file);

    if (uploadError) {
      // If bucket doesn't exist, create it first (admin needs to do this in Supabase dashboard)
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file. Make sure storage bucket exists.' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('delivery-photos')
      .getPublicUrl(fileName);

    // Update order with photo URL
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ delivery_photo_url: publicUrl })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}

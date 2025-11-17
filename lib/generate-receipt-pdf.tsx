import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPDF } from './pdf-receipt';
import { Order } from './supabase';
import { supabaseAdmin } from './supabase-admin';

/**
 * Generates a PDF receipt for an order and uploads it to Supabase Storage
 * @param order - The order to generate a receipt for
 * @returns The public URL of the uploaded PDF
 */
export async function generateAndUploadReceipt(order: Order): Promise<string> {
  try {
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(<ReceiptPDF order={order} />);

    // Create filename
    const fileName = `receipt-${order.order_number}-${Date.now()}.pdf`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('receipts')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading receipt PDF:', uploadError);
      throw new Error(`Failed to upload receipt: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('receipts')
      .getPublicUrl(fileName);

    console.log('Receipt PDF generated successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw error;
  }
}

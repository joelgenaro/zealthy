import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uniquePaymentSuccess } from '@/utils/freshpaint/events';
import { PatientProps } from '@/components/hooks/data';

async function processMenopauseMedication(
  invoice: Stripe.Invoice,
  zealthy_patient_id: string | undefined
) {
  console.log('Processing menopause medication:', {
    orderID: invoice?.lines?.data?.[0]?.metadata,
    zealthy_patient_id,
  });
  const orderID =
    invoice?.lines?.data?.[0]?.metadata?.zealthy_gg_order_id ||
    invoice?.lines?.data?.[0]?.metadata?.zealthy_order_id;
  if (!orderID) return;

  const patient = await supabaseAdmin
    .from('patient')
    .select('*, profiles(*)')
    .eq('id', Number(zealthy_patient_id))
    .maybeSingle()
    .then(({ data }) => data as PatientProps | null);

  const existingOrder = await supabaseAdmin
    .from('order')
    .select(`*`)
    .eq('id', orderID)
    .single();

  if (!existingOrder.data?.patient_id || !existingOrder.data?.prescription_id) {
    throw new Error(
      `Existing order missing data: ${JSON.stringify(existingOrder)}`
    );
  }

  console.log('Found patient and order:', {
    patientId: patient?.id,
    orderData: existingOrder.data,
  });

  const prescription = await supabaseAdmin
    .from('prescription')
    .select()
    .eq('id', existingOrder.data?.prescription_id)
    .single();

  if (!prescription.data) {
    throw new Error(
      `Prescription not found for order: ${JSON.stringify(existingOrder)}`
    );
  }
  console.log('Processing payment:', {
    prescriptionId: prescription.data?.id,
    medication: prescription.data?.medication,
    billingReason: invoice.billing_reason,
  });

  //handle fresh paint tracking
  uniquePaymentSuccess(
    patient?.profiles?.id || '',
    patient?.profiles?.email || '',
    'payment-success-menopause',
    prescription?.data?.medication
  );

  //return if this is subscription creation
  if (invoice.billing_reason === 'subscription_create') return;
  return;
}

export { processMenopauseMedication };

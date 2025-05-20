import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Database } from '@/lib/database.types';
import { Prescription, PatientProps } from '@/components/hooks/data';
import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import { SupabaseClient } from '@supabase/supabase-js';
import { processEmpowerPharmacyOrder } from '../stripe/utils/payment/helpers/processEmpowerPharmacyOrder';

async function handleRefillNonGlp1(
  patientId: number,
  supabase: SupabaseClient<Database>
) {
  const prescription = await supabase
    .from('prescription')
    .select()
    .in('medication_quantity_id', [125, 317, 319, 320, 318])
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .gt('count_of_refills_allowed', 0)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data as Prescription | null);

  if (!prescription) {
    return;
  }
  const existingOrder = await supabase
    .from('order')
    .select('*')
    .eq('prescription_id', prescription.id)
    .eq('patient_id', patientId)
    .limit(1)
    .order('created_at', { ascending: false })
    .then(({ data }) => (data?.[0] as OrderProps) ?? null);

  if (!existingOrder) return;
  const numberOfRefillsLeft =
    (prescription?.count_of_refills_allowed ?? 0) -
    (existingOrder?.refill_count ?? 0);

  console.log('numberOfRefillsLeft:', numberOfRefillsLeft);

  if (numberOfRefillsLeft < 1) {
    console.log(`out of refills for patient ${patientId}`);
    return;
  }
  const orderParams = {
    patient_id: existingOrder.patient_id,
    clinician_id: existingOrder.clinician_id,
    national_drug_code: existingOrder.national_drug_code,
    prescription_id: existingOrder.prescription_id,
    refill_count: (existingOrder.refill_count ?? 0) + 1,
    order_status: 'PAYMENT_SUCCESS',
    amount_paid: existingOrder.amount_paid,
    out_of_refill:
      (existingOrder.refill_count ?? 0) + 1 ===
      prescription.count_of_refills_allowed,
    shipment_method_id: existingOrder.shipment_method_id,
  };

  const newOrder = await supabase
    .from('order')
    .insert(orderParams)
    .select()
    .single()
    .throwOnError()
    .then(({ data }) => data);

  console.log('newOrder', {
    ...newOrder,
    prescription,
  });

  if (
    prescription.pharmacy?.toLowerCase().includes('empower') &&
    newOrder &&
    existingOrder.patient_id
  ) {
    const [patient, patientAddress] = await Promise.all([
      supabase
        .from('patient')
        .select('*, profiles(*)')
        .eq('id', existingOrder.patient_id)
        .single()
        .throwOnError()
        .then(({ data }) => data as PatientProps),

      supabase
        .from('address')
        .select()
        .eq('patient_id', existingOrder.patient_id)
        .single()
        .throwOnError()
        .then(({ data }) => data),
    ]);

    if (patient && patientAddress) {
      console.log(`Processing NonGlp1 refill for patient ${patientId}`);
      await processEmpowerPharmacyOrder(
        patient,
        [{ ...newOrder, prescription }],
        patientAddress
      );
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { patientId } = req.body;

    await handleRefillNonGlp1(Number(patientId), supabaseAdmin);

    return res.status(200).json({
      success: true,
      message: 'Refill process initiated',
      patientId,
    });
  } catch (error) {
    console.error('Error processing refill:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing refill',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { weightLossCancelationEvent } from '@/utils/freshpaint/events';
import getStripeInstance from '../../../createClient';
import { getPatientEmail } from './getPatientEmail';

export const cancelWeightLossPrescriptions = async (patientId: number) => {
  const stripe = getStripeInstance();

  const prescriptions = await supabaseAdmin
    .from('patient_prescription')
    .select(
      '*, order!inner(*, prescription!inner(*, medication_quantity!inner(*, medication_dosage!inner(*, medication!inner(*)))))'
    )
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .eq(
      'order.prescription.medication_quantity.medication_dosage.medication.display_name',
      'Weight Loss Medication'
    )
    .throwOnError()
    .then(({ data }) => data || []);

  const patientEmail = await getPatientEmail(patientId);

  weightLossCancelationEvent(
    patientEmail?.profiles?.id,
    patientEmail?.profiles?.email
  );

  console.log({
    message: `Canceling prescriptions: ${prescriptions.map(p => p.id)}`,
  });

  await Promise.allSettled(
    prescriptions.map(p =>
      stripe.subscriptions.cancel(p.reference_id, {
        cancellation_details: {
          comment: 'Parent weight loss subscription got canceled',
        },
      })
    )
  );
};

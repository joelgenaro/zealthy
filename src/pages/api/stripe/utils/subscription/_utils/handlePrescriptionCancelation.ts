import {
  PatientPrescriptionProps,
  PatientProps,
} from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { medicationCancelationEvent } from '@/utils/freshpaint/events';
import { cancelActionItems } from './cancelActionItems';
import { cancelUpcomingOrders } from './cancelUpcomingOrders';

export const handlePrescriptionCancelation = async (reference_id: string) => {
  const oldPrescription = await supabaseAdmin
    .from('patient_prescription')
    .select(
      '*, subscription(*), order!inner(*, prescription!inner(*, medication_quantity!inner(*, medication_dosage!inner(*, medication!inner(*)))))'
    )
    .eq('reference_id', reference_id)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data as PatientPrescriptionProps);

  if (oldPrescription?.product === 'Recurring Weight Loss Medication') {
    await Promise.allSettled([
      cancelActionItems(oldPrescription.patient_id),
      cancelUpcomingOrders(oldPrescription.patient_id),
    ]);
  }

  if (oldPrescription) {
    const { email, id } = await supabaseAdmin
      .from('patient')
      .select('profiles(id, email)')
      .eq('id', oldPrescription.patient_id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => ({
        email: (data as PatientProps)?.profiles?.email,
        id: (data as PatientProps)?.profiles?.id,
      }));

    await medicationCancelationEvent(
      id,
      email,
      oldPrescription?.order?.prescription?.medication_quantity
        ?.medication_dosage?.medication?.display_name
    );
  }

  return;
};

import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { prescriptionSubmittedLocalPharmacy } from '@/utils/freshpaint/events';
import { findProfileId } from '@/pages/api/supabase/order/_utils/helpers';

type Order = Database['public']['Tables']['order']['Row'];

type Patient = {
  profiles: {
    email: string;
  };
} | null;

const findEmail = async (patientId: number) => {
  return supabaseAdmin
    .from('patient')
    .select('profiles(email)')
    .eq('id', patientId)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => (data as Patient)?.profiles?.email);
};

export const handleSendToLocalPharmacy = async (order: Order) => {
  if (!order.prescription_id) {
    throw new Error(`Order ${order.id} does not have prescription`);
  }

  if (!order.patient_id) {
    throw new Error(`Order ${order.id} does not have patient id`);
  }

  const email = await findEmail(order.patient_id);
  const profileId = await findProfileId(order.patient_id);

  if (!email) {
    throw new Error(`Patient ${order.patient_id} does not have email`);
  }

  const prescription = await supabaseAdmin
    .from('prescription')
    .select('pharmacy, medication')
    .eq('id', order.prescription_id)
    .maybeSingle()
    .then(({ data }) => data);

  //handle local pharmacy communication
  await prescriptionSubmittedLocalPharmacy(
    profileId,
    email,
    prescription?.medication,
    prescription?.pharmacy
  );
};

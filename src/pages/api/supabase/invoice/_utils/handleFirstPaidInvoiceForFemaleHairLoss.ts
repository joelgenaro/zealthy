import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uniquePaymentSuccess } from '@/utils/freshpaint/events';

type Invoice = Database['public']['Tables']['invoice']['Row'];

type Patient = {
  id: number;
  profile_id: string;
  region: string;
  profiles: {
    id: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    gender: string;
  };
};

export const handleFirstPaidInvoiceForFemaleHairLoss = async (
  invoice: Invoice
) => {
  if (invoice.care?.toLowerCase()?.includes('hair loss')) {
    const patient = await supabaseAdmin
      .from('patient')
      .select('*, profiles!inner(gender, email, first_name, last_name, id)')
      .eq('id', invoice.patient_id)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as Patient | null);

    if (!patient) {
      throw new Error(`Could not find patient for id: ${invoice.patient_id}`);
    }

    if (patient?.profiles?.gender === 'female' && patient?.profiles?.email) {
      uniquePaymentSuccess(
        patient?.profiles?.id || '',
        patient?.profiles?.email || '',
        'female-hair-loss-payment-success',
        invoice.description || ''
      );
    } else if (!patient?.profiles?.email) {
      throw new Error(
        `Could not find patient email for id: ${invoice.patient_id}`
      );
    }
  }

  return;
};

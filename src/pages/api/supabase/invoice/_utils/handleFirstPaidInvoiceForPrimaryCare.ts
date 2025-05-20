import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { primaryCarePaymentEvent } from '@/utils/freshpaint/events';

type Invoice = Database['public']['Tables']['invoice']['Row'];

type Patient = {
  id: number;
  profile_id: string;
  region: string;
  profiles: {
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    gender: string;
  };
};

export const handleFirstPaidInvoiceForPrimaryCare = async (
  invoice: Invoice
) => {
  if (invoice.care?.toLowerCase().includes('primary care')) {
    const patient = await supabaseAdmin
      .from('patient')
      .select('id, profile_id')
      .eq('id', invoice.patient_id)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data as Patient | null);
    if (!patient) {
      throw new Error(`Could not find patient for id: ${invoice.patient_id}`);
    }

    primaryCarePaymentEvent(
      patient?.profile_id,
      patient?.profiles?.email!,
      patient?.profiles?.phone_number!,
      patient?.profiles?.first_name!,
      patient?.profiles?.last_name!,
      patient?.region!,
      patient?.profiles?.birth_date!,
      patient?.profiles?.gender!,
      invoice.amount_paid
    );
  }

  return;
};

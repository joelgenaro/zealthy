import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import VWOClient from '@/lib/vwo/client';

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

export const handleFirstPaidInvoiceForInsomnia = async (invoice: Invoice) => {
  const vwoInstance = await VWOClient.getInstance(supabaseAdmin);

  if (invoice.care?.toLowerCase().includes('sleep')) {
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
    await Promise.all([
      vwoInstance.track('7766', patient, 'paymentSuccessInsomnia'),
    ]);
  }

  return;
};

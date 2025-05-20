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

export const handleFirstPaidInvoiceForED = async (invoice: Invoice) => {
  const vwoInstance = await VWOClient.getInstance(supabaseAdmin);

  if (invoice.care?.toLowerCase().includes('erectile dysfunction')) {
    const patient = await supabaseAdmin
      .from('patient')
      .select('id, profile_id')
      .eq('id', invoice.patient_id)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data);
    if (!patient) {
      throw new Error(`Could not find patient for id: ${invoice.patient_id}`);
    }

    window.VWO?.event('paymentSuccessEd');
    // Fire payment success metrics
    await Promise.allSettled([
      vwoInstance.track('ED5618', patient, 'paymentSuccessEd'),
      vwoInstance.track('15618', patient, 'paymentSuccessEd'),
      vwoInstance.track('6399', patient, 'paymentSuccessEd'),
      vwoInstance.track('5483-2', patient, 'paymentSuccessEd'),
      vwoInstance.track('5618', patient, 'paymentSuccessEd'),
      vwoInstance.track('5618', patient, 'paymentSuccessEd'),
      vwoInstance?.track('8552', patient, 'paymentSuccessEd'),
      vwoInstance?.track('8552_2', patient, 'paymentSuccessEd'),
      vwoInstance?.track('8279_6', patient, 'paymentSuccessEd'),
    ]);
  }

  return;
};

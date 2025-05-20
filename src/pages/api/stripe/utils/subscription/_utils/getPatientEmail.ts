import { PatientProps } from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const getPatientEmail = async (patientId: number) => {
  return supabaseAdmin
    .from('patient')
    .select(`profiles(email)`)
    .eq('id', patientId)
    .single()
    .then(({ data }) => data as PatientProps);
};

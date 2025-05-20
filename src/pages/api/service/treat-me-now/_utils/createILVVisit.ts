import { Database } from '@/lib/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export const createILVVisit = async (
  patient: Pick<
    Database['public']['Tables']['patient']['Row'],
    'id' | 'region'
  >,
  supabase: SupabaseClient<Database>
) => {
  return supabase
    .from('appointment')
    .insert({
      patient_id: patient.id,
      encounter_type: 'Walked-in',
      appointment_type: 'Provider',
      status: 'Unassigned',
      duration: 15,
      visit_type: 'Video',
      location: patient.region || '',
    })
    .select('*')
    .throwOnError()
    .maybeSingle()
    .then(({ data }) => data);
};

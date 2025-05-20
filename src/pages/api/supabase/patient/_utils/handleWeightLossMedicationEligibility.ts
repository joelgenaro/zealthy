import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { weightLossCoachingOnlyOffer } from '@/utils/freshpaint/events';

type Patient = Database['public']['Tables']['patient']['Row'];

type PatientProfile = {
  profiles: {
    id: string;
    email: string;
  };
} | null;

export const handleWeightLossMedicationEligibility = async (
  patient: Patient
) => {
  try {
    if (patient.weight_loss_medication_eligible === false) {
      //find email
      const { email, id } = await supabaseAdmin
        .from('patient')
        .select('profiles(id, email)')
        .eq('id', patient.id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => ({
          email: (data as PatientProfile)?.profiles?.email,
          id: (data as PatientProfile)?.profiles?.id,
        }));

      if (!email) {
        throw new Error(`Could not find email for ${patient.id}`);
      }

      weightLossCoachingOnlyOffer(id, email);
      return;
    }
  } catch (err) {
    throw err;
  }
};

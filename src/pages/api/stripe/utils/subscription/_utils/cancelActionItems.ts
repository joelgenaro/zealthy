import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const cancelActionItems = (patientId: number) => {
  return supabaseAdmin
    .from('patient_action_item')
    .update({
      canceled: true,
      canceled_at: new Date().toISOString(),
    })
    .eq('patient_id', patientId)
    .in('type', [
      'PRESCRIPTION_RENEWAL_REQUEST',
      'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST',
      'RATE_COACH',
      'FULL_BODY_PHOTO',
    ]);
};

export const cancelFullBodyActionItems = (patientId: number) => {
  return supabaseAdmin
    .from('patient_action_item')
    .update({
      canceled: true,
      canceled_at: new Date().toISOString(),
    })
    .eq('patient_id', patientId)
    .eq('type', 'FULL_BODY_PHOTO');
};

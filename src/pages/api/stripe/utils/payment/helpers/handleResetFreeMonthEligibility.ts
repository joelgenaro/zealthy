import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Resets the weight loss free month eligibility for a given profile
export const handleResetFreeMonthEligibility = async (
  patientId: number,
  supabase: SupabaseClient<Database>
) => {
  const { error } = await supabase
    .from('patient')
    .update({
      weight_loss_free_month_redeemed: null,
    })
    .eq('id', patientId);

  if (error) {
    console.error('Error resetting free month eligibility:', {
      error,
      patientId,
    });
    throw new Error('Failed to reset free month eligibility');
  }

  console.log(
    `Successfully reset free month eligibility for profile ${patientId}`
  );
};

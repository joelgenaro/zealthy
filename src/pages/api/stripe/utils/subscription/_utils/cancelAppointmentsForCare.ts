import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const cancelAppointmentsForCare = (care: string, patientId: number) => {
  return supabaseAdmin
    .from('appointment')
    .update({
      status: 'Cancelled',
      cancelation_reason: `${care} subscription was canceled.`,
      canceled_at: new Date().toISOString(),
    })
    .eq('care', care)
    .eq('patient_id', patientId)
    .eq('status', 'Confirmed');
};

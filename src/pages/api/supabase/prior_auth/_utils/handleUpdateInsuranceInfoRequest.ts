import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { insuranceInformationUpdatedAsync } from '@/utils/freshpaint/events';
import { PriorAuth } from '@/components/hooks/data';

export const handleUpdateInsuranceInfoRequest = async (
  priorAuth: PriorAuth
) => {
  if (!priorAuth.patient_id) {
    throw new Error('Prior auth missing patient id');
  }
  const { data: patient } = await supabaseAdmin
    .from('patient')
    .select('insurance_info_requested, profiles (*)')
    .eq('id', priorAuth.patient_id)
    .single()
    .throwOnError();

  const patientInsuranceInfoRequested = patient?.insurance_info_requested;
  // set insurance_info_requested to false if it not false already
  if (patientInsuranceInfoRequested) {
    try {
      await supabaseAdmin
        .from('patient')
        .update({ insurance_info_requested: false })
        .eq('id', priorAuth.patient_id)
        .throwOnError();
      await supabaseAdmin
        .from('patient_action_item')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('patient_id', priorAuth.patient_id)
        .eq('type', 'INSURANCE_INFO_REQUESTED')
        .throwOnError();

      if (!Array.isArray(patient.profiles)) {
        insuranceInformationUpdatedAsync(
          patient?.profiles?.id,
          patient?.profiles?.email
        );
      }
    } catch (err) {
      throw new Error(
        `Could not update patient insurance_info_requested for ${priorAuth.patient_id}: ${err}`
      );
    }
  }
};

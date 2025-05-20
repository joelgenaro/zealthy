import { useCreateProviderTask, usePatient } from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import axios from 'axios';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState } from 'react';
import { useVisitSelect } from '@/components/hooks/useVisit';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';

interface Props {
  nextPage: (nextPage?: string) => void;
}

const NonGlpFinal = ({ nextPage }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const visit = useVisitSelect(visit => visit);
  const [loading, setLoading] = useState(false);

  const handleGenerateTask = useCreateProviderTask();
  const taskType = 'PRESCRIPTION_REFILL';

  async function handleOnClick() {
    if (!visit?.id || !patient?.id) {
      return;
    }

    setLoading(true);
    await axios.post('/api/submit-responses', {
      user_id: patient?.profile_id,
    });

    await supabase
      .from('online_visit')
      .update({ status: 'Completed' })
      .eq('id', visit?.id);
    const patientCareTeam = await supabase
      .from('patient_care_team')
      .select()
      .eq('patient_id', patient?.id)
      .then(({ data }) => data);

    const prescriptionRequest = await supabase
      .from('prescription_request')
      .insert({
        patient_id: patient?.id,
        status: 'REQUESTED',
        region: patient?.region,
        note: 'Naltrexone/Bupropion',
        specific_medication: 'Naltrexone/Bupropion',
        medication_quantity_id: 318,
        care_team:
          (patientCareTeam?.map(c => c?.clinician_id) as number[]) || [],
      })
      .select()
      .maybeSingle()
      .then(({ data }) => data);
    const addToQueue = await handleGenerateTask(taskType);
    if (prescriptionRequest?.id) {
      await supabase
        .from('prescription_request')
        .update({ queue_id: addToQueue?.id })
        .eq('id', prescriptionRequest?.id);
    }

    Router.replace(Pathnames.MESSAGES + '?complete=weight-loss');
    setLoading(false);
  }

  return (
    <LoadingButton
      fullWidth
      loading={loading}
      disabled={loading}
      onClick={handleOnClick}
    >
      Message
    </LoadingButton>
  );
};

export default NonGlpFinal;

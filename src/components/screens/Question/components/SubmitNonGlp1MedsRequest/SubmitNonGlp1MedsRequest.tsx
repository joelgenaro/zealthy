import {
  useCreateProviderTask,
  usePatient,
  usePatientCareTeam,
} from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useVisitSelect } from '@/components/hooks/useVisit';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import Loading from '@/components/shared/Loading/Loading';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const SubmitNonGlp1MedsRequest = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { data: patientCareTeam } = usePatientCareTeam();
  const visit = useVisitSelect(visit => visit);
  const medications = useVisitSelect(visit => visit.medications);

  const nonGlp1Medication = medications.find(med => med.type === 'WEIGHT_LOSS');
  const handleCreateTask = useCreateProviderTask();

  async function handleSubmit() {
    if (!visit?.id || !patient?.id) {
      return;
    }
    await supabase
      .from('online_visit')
      .update({ status: 'Completed' })
      .eq('id', visit?.id);

    const isBundled = await supabase
      .from('patient_subscription')
      .select('*')
      .eq('patient_id', patient?.id)
      .in('price', [297, 217, 446, 349, 449, 718])
      .then(({ data }) => !!(data || []).length);

    const prescriptionRequest = await supabase
      .from('prescription_request')
      .insert({
        medication_quantity_id: nonGlp1Medication?.medication_quantity_id,
        status: 'REQUESTED',
        note: nonGlp1Medication?.name,
        specific_medication: nonGlp1Medication?.name,
        patient_id: patient?.id,
        region: patient?.region,
        care_team: patientCareTeam?.map((e: any) => e.clinician_id),
      })
      .select()
      .maybeSingle()
      .then(({ data }) => data);
    const addToQueue = await handleCreateTask('PRESCRIPTION_REFILL');
    if (prescriptionRequest?.id) {
      await supabase
        .from('prescription_request')
        .update({ queue_id: addToQueue?.id })
        .eq('id', prescriptionRequest?.id);
    }
    toast.success('You have successfully submitted your Rx request!');

    Router.replace(Pathnames.PATIENT_PORTAL);
  }

  useEffect(() => {
    if ((visit?.id, patient?.id, nonGlp1Medication?.name)) {
      handleSubmit();
    }
  }, [visit?.id, patient?.id, nonGlp1Medication?.name]);

  return <Loading />;
};

export default SubmitNonGlp1MedsRequest;

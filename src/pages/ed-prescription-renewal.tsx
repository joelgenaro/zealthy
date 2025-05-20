import {
  useMedications,
  usePatientPrescriptions,
} from '@/components/hooks/data';
import { useFlowActions } from '@/components/hooks/useFlow';
import { useIntakeState, useIntakeActions } from '@/components/hooks/useIntake';
import { useVisitAsync, useVisitActions } from '@/components/hooks/useVisit';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Spinner from '@/components/shared/Loading/Spinner';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { supabaseClient } from '@/lib/supabaseClient';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';

const ED_DISPLAY_NAME = 'ED Medication';

const EDRenewal = () => {
  const router = useRouter();
  const { createOnlineVisit } = useVisitAsync();
  const { addQuestionnaires, resetQuestionnaires, addMedication } =
    useVisitActions();
  const { addSpecificCare } = useIntakeActions();
  const { specificCare } = useIntakeState();
  const { setFlow } = useFlowActions();
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: meds } = useMedications();

  useEffect(() => {
    const startFlow = async () => {
      const previousPrescription = await supabaseClient
        .from('prescription')
        .select(
          '*, medication_quantity!inner(*, medication_dosage!inner(*, dosage(*), medication!inner(*)))'
        )
        .eq(
          'medication_quantity.medication_dosage.medication.display_name',
          ED_DISPLAY_NAME
        )
        .limit(1)
        .order('created_at', { ascending: false })
        .maybeSingle()
        .then(data => data.data);
      addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
      setFlow('ed-prescription-renewal');
      const isHardies =
        previousPrescription?.medication_quantity?.medication_dosage?.medication?.name
          .toLowerCase()
          .includes('hardies');
      addMedication({
        display_name: isHardies
          ? 'ED Medication Renewal (Hardies)'
          : 'ED Medication Renewal',
        dosage:
          previousPrescription?.medication_quantity?.medication_dosage?.dosage
            ?.dosage,
        medication_quantity_id:
          previousPrescription?.medication_quantity_id || 0,
        name: previousPrescription?.medication || 'ED Renewal',
        quantity: previousPrescription?.dispense_quantity || 0,
        recurring: {
          interval: 'month',
          interval_count: Math.round(
            (previousPrescription?.duration_in_days || 0) / 30
          ),
        },
        type: MedicationType.ED,
      });
    };
    startFlow();
  }, [supabaseClient, meds, patientPrescriptions]);

  useEffect(() => {
    if (!router || specificCare !== SpecificCareOption.ERECTILE_DYSFUNCTION)
      return;
    async function createVisit() {
      resetQuestionnaires();
      await createOnlineVisit(false);
      addQuestionnaires(mapCareToQuestionnaires(['ED Prescription Renewal']));
    }
    createVisit().then(() => {
      router.push('/patient-portal/questionnaires-v2/ed-prescription-renewal');
    });
  }, [router, specificCare]);

  return <Spinner />;
};

EDRenewal.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default EDRenewal;

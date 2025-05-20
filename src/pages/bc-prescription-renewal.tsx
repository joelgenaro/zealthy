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

const BC_DISPLAY_NAME = 'Birth Control Medication';

const BirthControlRenewal = () => {
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
          BC_DISPLAY_NAME
        )
        .eq('status', 'expired')
        .limit(1)
        .order('created_at', { ascending: false })
        .maybeSingle()
        .then(data => data.data);
      addSpecificCare(SpecificCareOption.BIRTH_CONTROL);
      setFlow('bc-prescription-renewal');
      addMedication({
        display_name: 'Birth Control Renewal',
        dosage:
          previousPrescription?.medication_quantity?.medication_dosage?.dosage
            ?.dosage,
        medication_quantity_id:
          previousPrescription?.medication_quantity_id || 0,
        name: 'Birth Control Refill',
        quantity: previousPrescription?.dispense_quantity || 0,
        recurring: {
          interval: 'month',
          interval_count: Math.round(
            (previousPrescription?.duration_in_days || 0) / 30
          ),
        },
        type: MedicationType.BIRTH_CONTROL,
        renewing_prescription: previousPrescription?.id,
      });
    };
    startFlow();
  }, [supabaseClient, meds, patientPrescriptions]);

  useEffect(() => {
    if (
      !router ||
      specificCare !== SpecificCareOption.BIRTH_CONTROL ||
      meds?.length === 0
    )
      return;
    async function createVisit() {
      resetQuestionnaires();
      await createOnlineVisit(false);
      addQuestionnaires(
        mapCareToQuestionnaires(['Birth Control Prescription Renewal'])
      );
    }
    createVisit().then(() => {
      router.push(
        '/patient-portal/questionnaires-v2/birth-control-prescription-renewal'
      );
    });
  }, [router, specificCare, meds]);

  return <Spinner />;
};

BirthControlRenewal.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default BirthControlRenewal;

import { useFlowActions } from '@/components/hooks/useFlow';
import { useIntakeState, useIntakeActions } from '@/components/hooks/useIntake';
import { useVisitAsync, useVisitActions } from '@/components/hooks/useVisit';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Spinner from '@/components/shared/Loading/Spinner';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';

const MenopauseRefill = () => {
  const router = useRouter();
  const { createOnlineVisit } = useVisitAsync();
  const { addQuestionnaires, resetQuestionnaires } = useVisitActions();
  const { addSpecificCare } = useIntakeActions();
  const { specificCare } = useIntakeState();
  const { setFlow } = useFlowActions();

  useEffect(() => {
    setFlow('menopause-refill');
    addSpecificCare(SpecificCareOption.MENOPAUSE);
  }, []);

  useEffect(() => {
    if (!router || specificCare !== SpecificCareOption.MENOPAUSE) return;
    async function createVisit() {
      resetQuestionnaires();
      await createOnlineVisit(false);
      addQuestionnaires(mapCareToQuestionnaires(['Menopause Refill']));
    }
    createVisit().then(() => {
      router.push('/patient-portal/questionnaires-v2/menopause-refill');
    });
  }, [router, specificCare]);

  return <Spinner />;
};

MenopauseRefill.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default MenopauseRefill;

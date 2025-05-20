import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import {
  useVisitActions,
  useVisitAsync,
  useVisitState,
} from '@/components/hooks/useVisit';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { getAuthProps } from '@/lib/auth';

const WeightLossRefillRecurringPage = () => {
  const { additional } = Router.query;
  const { id: visitID, questionnaires } = useVisitState();
  const { createOnlineVisit } = useVisitAsync();
  const { specificCare } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();

  useEffect(() => {
    resetQuestionnaires();
    addCare({
      care: {
        careSelections: [],
        other: '',
      },
    });
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
  }, []);

  async function createVisit() {
    await createOnlineVisit(false);
    //redirect patients with this link to non-recurring compound refill flow
    addQuestionnaires(mapCareToQuestionnaires([`Weight Loss Compound Refill`]));
  }

  useEffect(() => {
    if (
      !questionnaires.length &&
      specificCare === SpecificCareOption.WEIGHT_LOSS
    ) {
      createVisit();
    }
  }, [questionnaires, specificCare]);

  useEffect(() => {
    if (
      visitID &&
      questionnaires.length > 0 &&
      specificCare === SpecificCareOption.WEIGHT_LOSS
    ) {
      Router.push(Pathnames.PATIENT_PORTAL_QUESTIONNAIRES);
    }
  }, [visitID, specificCare, questionnaires]);

  return (
    <>
      <Head>
        <title>Zealthy Weight Loss Refill Recurring</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLossRefillRecurringPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossRefillRecurringPage;

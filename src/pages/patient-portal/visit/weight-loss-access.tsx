import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
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
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useSelector } from '@/components/hooks/useSelector';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const WeightLossAccessPage = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { id: visitID, questionnaires } = useVisitState();
  const { createOnlineVisit } = useVisitAsync();
  const { specificCare } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { addCoaching } = useCoachingActions();
  const coaching = useSelector(store => store.coaching);
  const supabase = useSupabaseClient<Database>();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();

  useEffect(() => {
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS_ACCESS);
    resetQuestionnaires();
    addCare({
      care: {
        careSelections: [],
        other: '',
      },
    });
  }, [addCare, addSpecificCare, resetQuestionnaires]);

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', 'Zealthy Weight Loss Access')
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [supabase]);

  async function createVisit() {
    await createOnlineVisit(false);
    addCoaching({
      type: CoachingType.WEIGHT_LOSS,
      name: 'Z-Plan by Zealthy Weight Loss Access Program',
      id: subscription!.id,
      planId: subscription!.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      price: subscription!.price,
      discounted_price: 39,
    });
    addQuestionnaires(mapCareToQuestionnaires(['Weight Loss Access Portal']));
  }

  useEffect(() => {
    if (
      subscription &&
      !questionnaires.length &&
      specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS
    ) {
      createVisit();
    }
  }, [subscription, questionnaires, specificCare]);

  useEffect(() => {
    if (
      visitID &&
      coaching.length > 0 &&
      questionnaires.length > 0 &&
      specificCare === SpecificCareOption.WEIGHT_LOSS_ACCESS
    ) {
      console.log(coaching);
      Router.push(
        Pathnames.QUESTIONNAIRES + '/weight-loss-access-portal/WLA_P_INTRO'
      );
    }
  }, [questionnaires, coaching, visitID, specificCare]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLossAccessPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossAccessPage;

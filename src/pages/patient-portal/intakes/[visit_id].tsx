import { useVisitActions } from '@/components/hooks/useVisit';
import Loading from '@/components/shared/Loading/Loading';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';

const VisitIntakes = () => {
  const { query } = useRouter();
  const { updateVisit } = useVisitActions();
  const supabase = useSupabaseClient<Database>();

  useEffect(() => {
    supabase
      .from('online_visit')
      .select('*')
      .eq('id', Number(query.visit_id))
      .single()
      .then(({ data }) => data)
      .then(visit =>
        updateVisit({
          id: visit?.id,
          intakes: visit?.intakes as IntakeType[],
          medications: [],
          isSync: visit?.synchronous,
          questionnaires: [],
        })
      )
      .then(() => Router.push(Pathnames.POST_CHECKOUT_INTAKES));
  }, [query.visit_id, supabase, updateVisit]);

  return (
    <>
      <Head>
        <title>Zealthy Visit Intakes</title>
      </Head>
      <Loading />
    </>
  );
};

VisitIntakes.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};
export default VisitIntakes;

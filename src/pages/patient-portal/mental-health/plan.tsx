import Head from 'next/head';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Router from 'next/router';
import { Box, Button, Typography } from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';

type Subscription = Pick<
  Database['public']['Tables']['subscription']['Row'],
  'id' | 'price' | 'reference_id'
>;

const MentalCoachPlanPage = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { addCoaching, resetCoaching } = useCoachingActions();
  const supabase = useSupabaseClient<Database>();
  const name = 'Mental Health Coaching';

  useEffect(() => {
    supabase
      .from('subscription')
      .select('price, id, reference_id')
      .eq('name', name)
      .eq('active', true)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data);
      });
  }, [supabase]);

  const handleContinue = useCallback(() => {
    resetCoaching();
    addCoaching({
      type: CoachingType.MENTAL_HEALTH,
      name,
      id: subscription!.id,
      planId: subscription!.reference_id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      price: subscription!.price,
      discounted_price: 49,
    });

    Router.push(`${Pathnames.PATIENT_PORTAL_SCHEDULE_COACH}/mental-health`);
  }, [addCoaching, resetCoaching, subscription]);

  return (
    <CenteredContainer maxWidth="xs">
      <Head>
        <title>Mental Health Coaching Sign Up | Zealthy</title>
      </Head>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Typography
          textAlign={'left'}
          variant="h2"
          sx={{
            fontSize: '32px',
            fontWeight: '700',
            lineHeight: '38px',
          }}
        >
          {'Achieve long-term results.'}
        </Typography>

        <Typography fontWeight={300}>
          {
            'Research consistently shows that behavioral interventions, such as 1:1 coaching, produce better long-term outcomes than medication alone.'
          }
        </Typography>

        <Typography fontWeight={300} fontStyle="italic" mb="3rem">
          {
            'For a limited time, we are offering your first month of coaching for just $49. After your first month, coaching is just $99/month, with no additional fees or co-pays. You can request another coach if it’s not the right fit or opt out anytime.'
          }
        </Typography>

        <Button onClick={handleContinue}>{'Add 1:1 Coaching'}</Button>
      </Box>
    </CenteredContainer>
  );
};

export const getServerSideProps = getAuthProps;

MentalCoachPlanPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default MentalCoachPlanPage;

import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { useVisitAsync } from '@/components/hooks/useVisit';
import {
  OnlineVisit,
  useVisitAnswers,
  useVisitHandler,
} from '@/components/hooks/useVisitHandler';
import InformationModal from '@/components/shared/InformationModal';
import Loading from '@/components/shared/Loading/Loading';
import { JumpAheadModal } from '@/components/shared/modals';

import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getAuthV2Props } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import differenceInDays from 'date-fns/differenceInDays';
import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import getConfig from '../../config';

interface AuthTransitionProps {
  patient: any;
  visits: any[];
  prescriptions: any[];
  subscriptions: any[];
  profile: any;
}

const AuthTransition = ({ patient, visits, profile }: AuthTransitionProps) => {
  const [openCompletedAsyncModal, setOpenCompletedAsyncModal] = useState(false);
  const specificCare = useIntakeSelect(intake => intake.specificCare);
  const createOnlineVisit = useCreateOnlineVisitAndNavigate(patient.id);
  const [openPaidWeightLossModal, setOpenPaidWeightLossModal] = useState(false);
  const [visit, setVisit] = useState<OnlineVisit | null>(null);
  const handleVisit = useVisitHandler();
  const handleAnswers = useVisitAnswers();
  const { updateOnlineVisit } = useVisitAsync();
  const { updatePatient } = usePatientAsync();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const handleOldPaidVisit = useCallback(
    async (visit: OnlineVisit) => {
      if (visit.careSelected[0].reason === 'Weight loss') {
        const answers = await handleAnswers(visit.id);

        if (answers.WEIGHT_L_POST_Q11) {
          setOpenPaidWeightLossModal(true);
          setVisit(visit);
          return;
        }
      }

      handleVisit(visit);
      return;
    },
    [handleAnswers, handleVisit]
  );

  const handleClose = useCallback(() => {
    if (!visit) return;
    handleVisit(visit);
    return;
  }, [handleVisit, visit]);

  const handleWeightLossComplete = useCallback(async () => {
    if (!visit) return;
    await Promise.all([
      updateOnlineVisit({
        status: 'Completed',
        completed_at: new Date().toISOString(),
      }),

      updatePatient({
        status: 'ACTIVE',
        has_completed_onboarding: true,
      }),
    ]);
    Router.push(Pathnames.PATIENT_PORTAL);
    return;
  }, [updateOnlineVisit, visit]);

  useEffect(() => {
    //no patient
    if (!patient) {
      Router.push(
        siteName === 'Zealthy' || siteName === 'FitRx'
          ? Pathnames.REGION_SCREEN
          : Pathnames.REGION_SCREEN_ZP
      );
      return;
    }

    //no complete account
    if (!profile.birth_date) {
      Router.push(Pathnames.AGE_SCREEN);
      return;
    }

    if (!profile.first_name) {
      Router.push(Pathnames.COMPLETE_PROFILE);
      return;
    }

    //specific care selected
    if (specificCare) {
      const visit = visits.find(v => v.specific_care === specificCare);

      if (visit) {
        if (visit.status === 'Completed') {
          setOpenCompletedAsyncModal(true);
          return;
        }

        if (
          visit.status === 'Paid' &&
          differenceInDays(new Date(), new Date(visit.paid_at)) >= 4
        ) {
          console.log({ OLD: visit });

          handleOldPaidVisit(visit);
          return;
        }

        handleVisit(visit);
        return;
      } else {
        createOnlineVisit([specificCare]);
        return;
      }
    }

    Router.push(Pathnames.PATIENT_PORTAL);
  }, [
    createOnlineVisit,
    handleOldPaidVisit,
    handleVisit,
    patient,
    profile.birth_date,
    profile.first_name,
    specificCare,
    visits,
  ]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Container>
        <Stack>
          <Loading />
        </Stack>
      </Container>
      <InformationModal
        open={openCompletedAsyncModal}
        title={`You've already signed up for Zealthy ${specificCare?.toLowerCase()} treatment(s).`}
        description="Select below to manage your treatment plan, where you can request a refill sooner, suggest an adjustment to your dosage, or message with your care team."
        buttonText="Manage treatment plan"
        onClose={() => Router.push(Pathnames.PATIENT_PORTAL)}
        onConfirm={() => Router.push(Pathnames.VIEW_SUBSCRIPTIONS)}
      />
      <JumpAheadModal
        open={openPaidWeightLossModal}
        title="You can skip this section and go right to your Zealthy portal."
        description="If you don’t select your preferred treatment, your Zealthy provider will find a clinically appropriate treatment plan for you."
        buttonText="Skip to Zealthy portal"
        buttonTextTwo="Go back and add my preferred treatment"
        onJump={handleWeightLossComplete}
        onClose={handleClose}
      />
    </>
  );
};

export const getServerSideProps = getAuthV2Props;

AuthTransition.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AuthTransition;

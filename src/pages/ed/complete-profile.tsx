import Head from 'next/head';
import { ReactElement, useState, useCallback, useEffect } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ProfileInfo, useProfileAsync } from '@/components/hooks/useProfile';
import { PatientInfo, usePatientAsync } from '@/components/hooks/usePatient';
import { usePayment } from '@/components/hooks/usePayment';
import PatientProfileFormED from '@/components/screens/PatientProfile/components/PatientProfileFormED';

import { useIdentityEvent } from '@/components/hooks/useIdentityEvent';
import { useVWO } from '@/context/VWOContext';
import { usePatient } from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';

const CompleteProfile = () => {
  const [error, setError] = useState('');
  const updateProfile = useProfileAsync();
  const { updatePatient } = usePatientAsync();
  const { createStripeCustomer } = usePayment();
  const sendIdentity = useIdentityEvent();
  const vwo = useVWO();
  const { data: patient } = usePatient();
  const { region } = usePatientState();
  const selectedRegion = sessionStorage.getItem('region-ed');

  const updateUser = useCallback(
    async (profileInfo: ProfileInfo, patientInfo: PatientInfo) => {
      const promises: Promise<any>[] = [
        updateProfile(profileInfo),
        sendIdentity(profileInfo, patientInfo.text_me_update),
        updatePatient(patientInfo),
      ];

      if (patient) {
        promises.push(
          createStripeCustomer({
            id: patient.id,
            region: patient.region!,
            email: profileInfo.email!,
            fullName: `${profileInfo.first_name} ${profileInfo.last_name}`,
          })
        );
      }

      if (
        ['OK', 'OR', 'SC', 'TN', 'TX', 'UT', 'VA', 'WA', 'WI'].includes(
          selectedRegion || patient?.region || region || ''
        )
      ) {
        promises.push(
          vwo.activateBefore('5483-2', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        [
          'NJ',
          'OH',
          'WI',
          'LA',
          'MO',
          'PA',
          'AL',
          'OR',
          'NC',
          'CO',
          'WA',
        ]?.includes(patient?.region!)
      ) {
        promises.push(
          vwo.activateBefore('5386', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        ['VA', 'VT', 'WA', 'WI', 'ID', 'NY'].includes(
          selectedRegion || patient?.region || region || ''
        )
      ) {
        promises.push(
          vwo.activateBefore('8279_6', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      await Promise.all(promises).catch(() => {
        setError('Something went wrong, please try again.');
      });
    },
    [
      createStripeCustomer,
      patient,
      sendIdentity,
      updatePatient,
      updateProfile,
      vwo,
    ]
  );

  useEffect(() => {
    window.freshpaint?.track('complete-profile-page');
  }, []);

  return (
    <>
      <Head>
        <title>Complete Profile | ED Onboarding | Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Grid container direction="column" gap={{ sm: '48px', xs: '32px' }}>
          <Grid container direction="column" gap="16px">
            <Typography variant="h2">
              {'You are eligible for Zealthy'}
            </Typography>
            <Typography>{'Create an account to get treatment'}</Typography>
          </Grid>
          <PatientProfileFormED
            updateUser={updateUser}
            error={error}
            setError={setError}
            isActive={false}
          />
        </Grid>
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

CompleteProfile.getLayout = (page: ReactElement) => {
  return <OnboardingLayout>{page}</OnboardingLayout>;
};

export default CompleteProfile;

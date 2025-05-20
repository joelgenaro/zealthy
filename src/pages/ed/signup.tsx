import Head from 'next/head';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import SignUpForm from '@/components/shared/SignUpForm';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import NextLink from 'next/link';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import getConfig from '../../../config';

export default function SignUpPage() {
  const { specificCare } = useIntakeState();
  const router = useRouter();
  const { query, pathname } = router;
  const { addSpecificCare } = useIntakeActions();
  const isMobile = useIsMobile();
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (pathname.includes('/ed')) {
      addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
      window.localStorage.setItem('specificCare', 'Erectile dysfunction');
    } else {
      if (
        !specificCare &&
        Object.values(SpecificCareOption).includes(
          query.care as SpecificCareOption
        )
      ) {
        addSpecificCare(query.care as SpecificCareOption);
      }

      if (specificCare && typeof window !== 'undefined') {
        window.localStorage.setItem('specificCare', specificCare);
      } else if (!specificCare && typeof window !== 'undefined') {
        const storedCare = window.localStorage.getItem('specificCare');
        if (storedCare) {
          addSpecificCare(storedCare as SpecificCareOption);
        }
      }
    }
  }, [specificCare, query, pathname]);
  return (
    <>
      <Head>
        <title>Zealthy | ED Sign Up</title>
      </Head>
      <Container maxWidth="xs">
        <Grid container direction="column" gap="1rem">
          <Typography variant="h2">
            {
              "You're eligible for ED treatment at Zealthy. Get hard in as little as 15 minutes."
            }
          </Typography>
          <Typography>
            {
              'Create a free account to view your personalized ED treatment options.'
            }
          </Typography>
          <Typography paragraph>
            Already have an account?{' '}
            <Link component={NextLink} href={Pathnames.LOG_IN}>
              Log in
            </Link>
          </Typography>

          <SignUpForm
            isSignUp
            siteName={siteName}
            nextRoute={Pathnames.ED_CREATE_PATIENT}
          />
          <Typography
            maxWidth="400px"
            margin="auto 0"
            marginTop={isMobile ? 0 : '2rem'}
            textAlign="center"
          >
            {`By proceeding, I confirm that I am over 18 years old and agree to Zealthy's`}
            <Link
              component={NextLink}
              href="https://www.getzealthy.com/terms-of-use/"
              target="_blank"
              underline="none"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              component={NextLink}
              href="https://www.getzealthy.com/privacy-policy/"
              target="_blank"
              underline="none"
            >
              Privacy Policy
            </Link>
          </Typography>
        </Grid>
      </Container>
    </>
  );
}

export const getServerSideProps = getUnauthProps;

SignUpPage.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

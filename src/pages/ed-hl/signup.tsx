import Head from 'next/head';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement, useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import SignUpForm from '@/components/shared/SignUpForm';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Provider } from '@supabase/supabase-js';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions } from '@/components/hooks/useIntake';
import getConfig from '../../../config';

export default function EdHlSignupPage() {
  const isMobile = useIsMobile();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const { addSpecificCare } = useIntakeActions();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  async function signInWithOAuth(provider: Provider) {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
    });
    if (error) {
      console.error('Error during sign-in:', error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    addSpecificCare(SpecificCareOption.SEX_PLUS_HAIR);
  }, [addSpecificCare]);

  return (
    <>
      <Head>
        <title>Sex + Hair Sign Up | Zealthy</title>
      </Head>
      <Container maxWidth="xs">
        <Grid container direction="column" gap="1.5rem">
          <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
            Create an account
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
            You may be eligible for treatment
          </Typography>
          <Typography variant="body1" color="textSecondary">
            See your personalized treatment options. Private and 100% online.
          </Typography>

          <SignUpForm
            isSignUp
            nextRoute={
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? Pathnames.REGION_SCREEN
                : Pathnames.REGION_SCREEN_ZP
            }
            siteName={siteName}
          />
          <Typography
            maxWidth="400px"
            margin="auto 0"
            marginTop={isMobile ? '1.5rem' : '2rem'}
            textAlign="center"
            sx={{ fontSize: '14px', color: 'gray' }}
          >
            {`By proceeding, I confirm that I am over 18 years old and agree to Zealthy's `}
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
          <Typography
            maxWidth="400px"
            margin="auto 0"
            marginTop={isMobile ? '1.5rem' : '2rem'}
            textAlign="center"
            sx={{ fontSize: '14px', color: 'gray' }}
          >
            {`This site is protected by reCAPTCHA and the Google `}{' '}
            <Link
              href="https://policies.google.com/terms"
              target="_blank"
              underline="none"
            >
              Terms of Service
            </Link>
            and{' '}
            <Link
              href="https://policies.google.com/privacy"
              target="_blank"
              underline="none"
            >
              Privacy Policy
            </Link>
            apply.
          </Typography>
        </Grid>
      </Container>
    </>
  );
}

export const getServerSideProps = getUnauthProps;

EdHlSignupPage.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

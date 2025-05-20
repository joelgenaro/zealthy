import { useLanguage } from '@/components/hooks/data';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import SignUpForm from '@/components/shared/SignUpForm';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Pathnames } from '@/types/pathnames';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSession } from '@supabase/auth-helpers-react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import getConfig from '../../../../config';

const LogIn = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const { push, query } = router;
  const { specificCare } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const redirectQueryParam = router.query.redirect as string;
  const language = useLanguage();
  const session = useSession();

  useEffect(() => {
    if (query?.type !== 'recovery') {
      if (session && redirectQueryParam) {
        const decodedUrl = decodeURIComponent(redirectQueryParam);
        router.push(decodedUrl);
      } else if (session) {
        router.push(Pathnames.AUTH_TRANSITION);
      }
    }
  }, [session, redirectQueryParam, router]);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (typeof window !== 'undefined' && router.pathname === Pathnames.LOG_IN) {
      localStorage.removeItem('specificCare');
      addSpecificCare(null);
    }
  }, [router.pathname, addSpecificCare]);

  useEffect(() => {
    const newQuery = { ...query };

    const utmKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ];

    utmKeys.forEach(utmKey => {
      const value = sessionStorage.getItem(utmKey);
      if (value) {
        newQuery[utmKey] = value;
      }
    });

    if (specificCare && !query.care) {
      newQuery.care = specificCare;
    } else if (
      !specificCare &&
      Object.values(SpecificCareOption).includes(
        query.care as SpecificCareOption
      )
    ) {
      addSpecificCare(query.care as SpecificCareOption);
    }

    if (JSON.stringify(newQuery) !== JSON.stringify(query)) {
      push({ query: newQuery }, undefined, { shallow: true });
    }
  }, [specificCare, query, push, addSpecificCare]);

  let forgotPass = ' Forgot your password? ';
  let reset = ' Reset password ';
  let logIn = ' Log in ';
  let signUpText = ' Sign Up ';
  let noAccount = " Don't have an account? ";
  if (language === 'esp') {
    forgotPass = ' ¿Olvido su contraseña? ';
    reset = ' Resetear contraseña ';
    logIn = ' Iniciar sesión ';
    signUpText = ' Crea una cuenta ';
    noAccount = ' ¿No tienes cuenta? ';
  }

  return (
    <Container maxWidth="xs">
      <Grid container direction="column" gap="2rem">
        <Typography variant="h2">
          {logIn}
          <Typography marginTop="0.5rem">
            {noAccount}
            <Link component={NextLink} href={Pathnames.SIGN_UP}>
              {signUpText}
            </Link>
          </Typography>
        </Typography>
        <SignUpForm
          isSignUp={false}
          nextRoute={`${Pathnames.AUTH_TRANSITION}${
            redirectQueryParam ? `?redirect=${redirectQueryParam}` : ''
          }`}
          siteName={siteName}
        />
        <Typography marginTop={isMobile ? 0 : '1rem'} textAlign="center">
          {forgotPass}
          <Link
            component={NextLink}
            href={Pathnames.RESET_PASSWORD}
            underline="none"
          >
            {reset}
          </Link>{' '}
        </Typography>
      </Grid>
    </Container>
  );
};

export default LogIn;

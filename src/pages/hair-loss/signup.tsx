import Head from 'next/head';
import Image from 'next/image';
import { getUnauthProps } from '@/lib/auth';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { SignUpFormHairLoss } from '@/components/shared/SignUpForm';
import NextLink from 'next/link';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import ManHair from 'public/images/man-hair.png';
import Footer from '@/components/shared/layout/Footer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function SignUpPage() {
  const isMobile = useIsMobile();

  return (
    <>
      <Head>
        <title>Zealthy | Hair loss Sign Up</title>
      </Head>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        width="100%"
        gap={isMobile ? 0 : '24px'}
      >
        <Stack flexBasis="50%">
          {isMobile ? null : (
            <Box position="relative">
              <Typography
                position="absolute"
                top={0}
                left="50%"
                sx={{
                  width: '100%',
                  transform: 'translate(-50%, 15%)',
                  fontSize: '65px !important',
                  fontWeight: '700',
                  lineHeight: '100px !important',
                  textAlign: 'center',
                }}
              >
                Get healthier and thicker hair with Zealthy
              </Typography>
              <Image
                src={ManHair}
                alt="man hair"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          )}
        </Stack>
        <Stack flexBasis="50%" justifyContent="center">
          <Container maxWidth="xs">
            <Grid container direction="column" gap="1rem">
              <Typography variant="h2">
                {'90% regrow hair in 3 to 6 months.'}
              </Typography>
              <Typography>
                {
                  'Prescription treatments can help you fight the root causes of your hair loss, which is why you can grow visibly thicker, fuller hair with your Zealthy personalized prescription treatment plan.'
                }
              </Typography>
              <Typography paragraph>
                Already have an account?{' '}
                <Link component={NextLink} href={Pathnames.LOG_IN}>
                  Log in
                </Link>
              </Typography>
              <SignUpFormHairLoss isSignUp />
              <Typography
                maxWidth="400px"
                margin="auto 0"
                marginTop={isMobile ? 0 : '2rem'}
                textAlign="center"
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
              {isMobile ? <Footer /> : null}
            </Grid>
          </Container>
        </Stack>
      </Stack>
    </>
  );
}

export const getServerSideProps = getUnauthProps;

SignUpPage.getLayout = (page: ReactElement) => {
  return (
    <DefaultNavLayout showGap={false} showFooter={false}>
      {page}
    </DefaultNavLayout>
  );
};

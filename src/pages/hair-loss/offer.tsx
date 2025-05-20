import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { QuestionWithName } from '@/types/questionnaire';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import QuestionHeader from '@/components/screens/Question/components/QuestionHeader';
import Face from '@/components/shared/icons/Face';
import { useUser } from '@supabase/auth-helpers-react';
import NavBarLayout from '@/layouts/NavBarLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

const question: QuestionWithName = {
  name: 'HAIR_L_Q4',
  questionnaire: 'hair-loss',
  header: 'For a limited time get your first month free.',
  description: 'Just a few steps away from getting healthier and thicker hair',
  type: 'message',
  styles: {
    header: {
      textAlign: 'center',
    },
    description: {
      textAlign: 'center',
    },
  },
};

const HairLossOffer = () => {
  const user = useUser();
  const isMobile = useIsMobile();

  const onClick = useCallback(() => {
    if (user) {
      Router.push(Pathnames.HAIR_LOSS_SELECT_TREATMENT);
    } else {
      Router.push(Pathnames.HAIR_LOSS_SIGN_UP);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Hair Loss with Zealthy | Offer</title>
      </Head>

      <Container maxWidth="sm">
        <Stack gap={isMobile ? 4 : 6} alignItems="center">
          <QuestionHeader question={question} />
          <Face />
          <Button fullWidth onClick={onClick}>
            Continue
          </Button>
        </Stack>
      </Container>
    </>
  );
};

HairLossOffer.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default HairLossOffer;

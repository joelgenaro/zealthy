import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';
import { Pathnames } from '@/types/pathnames';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import WLGraph from 'public/images/wl-graph.svg';
import Image from 'next/image';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const WeightLossHomeV2 = () => {
  const { addSpecificCare, addVariant } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare } = useIntakeState();
  const { query, isReady } = useRouter();

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    addVariant((query.variant as string) || '0');
  }, [
    addSpecificCare,
    addVariant,
    specificCare,
    resetQuestionnaires,
    query,
    isReady,
  ]);

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy</title>
      </Head>
      {query.variant === '2410' && (
        <Container maxWidth="sm">
          <Stack gap={3}>
            <Typography variant="h2">
              Zealthy weight loss members love GLP-1 medications because they
              work!
            </Typography>
            <Image
              src={WLGraph}
              alt="Weight Loss Graph"
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
              }}
            />
            <Typography>
              Wegovy users in clinical trials{' '}
              <b>lost an average 15% of their body weight</b> and Mounjaro users{' '}
              <b>lost an average of 20% of their body weight.</b>
            </Typography>
            <Typography mb={3}>
              Semaglutide is the main active ingredient in Wegovy and
              tirzepatide is the main active ingredient in Mounjaro.
            </Typography>
            <Button
              onClick={() =>
                Router.push({
                  pathname: Pathnames.SIGN_UP,
                  query: {
                    care: SpecificCareOption.WEIGHT_LOSS,
                    variant: query.variant || 0,
                  },
                })
              }
            >
              Continue
            </Button>
          </Stack>
        </Container>
      )}
    </>
  );
};

WeightLossHomeV2.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossHomeV2;

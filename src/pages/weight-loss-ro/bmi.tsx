import Head from 'next/head';
import { ReactElement, useMemo } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import Router from 'next/router';
import HeightWeight from '@/components/screens/Question/components/HeightWeight';
import { QuestionWithName } from '@/types/questionnaire';
import { useSearchParams } from 'next/navigation';
import {
  usePatientActions,
  usePatientState,
} from '@/components/hooks/usePatient';
import Container from '@mui/material/Container';

const WeightLossROBMI = () => {
  const searchParams = useSearchParams();
  const { updatePatient: updateLocalPatient } = usePatientActions();
  const { height_ft, height_in, weight } = usePatientState();

  const idx = useMemo(() => {
    if (searchParams?.has('idx')) {
      return Number(searchParams?.get('idx'));
    }
    return 0;
  }, [searchParams]);

  const question: QuestionWithName = {
    header: 'What’s your current height and weight?',
    type: 'height-weight',
    hideHeader: true,
    canvas_linkId: 'a120d47c-6ac0-4431-847e-cf97b3892882',
    next: '/weight-loss-ro/chart',
    index: 1,
    name: 'weight-loss',
    questionnaire: 'weight-loss',
  };

  const handleClick = (nextPath: any) => {
    if (nextPath === 'DISQUALIFY_BMI') {
      Router.push(`/weight-loss-ro/disqualify`);
    } else {
      updateLocalPatient({ height_ft, height_in, weight });
      Router.push({
        pathname: nextPath,
        query: {
          variant: Router.query.variant || 0,
          care: Router.query.care || 0,
        },
      });
    }
    return;
  };

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <HeightWeight question={question} onClick={handleClick} />
      </Container>
    </>
  );
};

WeightLossROBMI.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossROBMI;

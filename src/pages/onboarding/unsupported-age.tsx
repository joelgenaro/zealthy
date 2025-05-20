import Head from 'next/head';
import VisitMessage from '@/components/screens/VisitStart/VisitMessage';
import { Container } from '@mui/material';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useLanguage } from '@/components/hooks/data';

const AgeUnsupported = () => {
  const language = useLanguage();
  let title =
    "Unfortunately, Zealthy can't provide you with care at this time.";
  let body =
    "We're only available to patients 18 years of age or older. Please check back with us once you meet the threshold.";
  let captionText = "You're not eligible";

  if (language === 'esp') {
    title =
      'Desafortunadamente, Zealthy no puede brindarle atención en este momento.';
    body =
      'Solo estamos disponibles para pacientes de 18 años o más. Por favor, vuelva a consultarnos cuando cumpla con este requisito.';
    captionText = 'No es elegible';
  }
  return (
    <>
      <Head>
        <title>Zealthy | Onboarding | Age Unsupported</title>
      </Head>
      <Container maxWidth="sm">
        <VisitMessage title={title} body={body} captionText={captionText} />
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

AgeUnsupported.getLayout = (page: ReactElement) => (
  <OnboardingLayout back={Pathnames.AGE_SCREEN}>{page}</OnboardingLayout>
);

export default AgeUnsupported;

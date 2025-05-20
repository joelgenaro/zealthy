import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Container } from '@mui/material';
import { ReactElement, Suspense } from 'react';
import { getAuthProps } from '@/lib/auth';
import { Pathnames } from '@/types/pathnames';
import { useRouter } from 'next/router';
import { useLanguage } from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';
import getConfig from '../../../config';
import { GetServerSidePropsContext } from 'next';

// Lazy load components with SSR enabled
const VisitMessage = dynamic(
  () => import('@/components/screens/VisitStart/VisitMessage'),
  {
    ssr: true,
    loading: () => (
      <Container maxWidth="sm">
        <div
          style={{
            minHeight: '200px',
            background: '#f5f5f5',
            borderRadius: '4px',
          }}
        />
      </Container>
    ),
  }
);

const OnboardingLayout = dynamic(() => import('@/layouts/OnboardingLayout'), {
  ssr: true,
});

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

type Language = 'en' | 'esp';

type Translation = {
  title: string;
  body: string;
  captionText: string;
};

type Translations = {
  [key in Language]: Translation;
};

// Pre-define translations for better SSR
const translations: Translations = {
  en: {
    title: `Unfortunately, ${siteName} isn't available in your state yet.`,
    body: `We can't provide you with medical care at this time. ${siteName} will email you once we become available in your state.`,
    captionText: "You're not eligible",
  },
  esp: {
    title: 'Desafortunadamente, Zealthy aún no está disponible en su estado.',
    body: 'No podemos brindarle atención médica en este momento. Zealthy le enviará un correo electrónico una vez que estemos disponibles en su estado.',
    captionText: 'No es elegible',
  },
};

interface RegionUnsupportedProps {
  initialLanguage: Language;
  care: string | null;
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Get auth props
  const authProps = await getAuthProps(context);

  if ('redirect' in authProps) {
    return authProps;
  }

  // Get the language from the request headers or query params
  const acceptLanguage = context.req.headers['accept-language'] || '';
  const initialLanguage: Language = acceptLanguage.includes('es')
    ? 'esp'
    : 'en';

  // Get care type from query
  const { care } = context.query;

  // Add cache headers for better performance
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );

  return {
    props: {
      ...authProps.props,
      initialLanguage,
      care: care || null,
    },
  };
};

const RegionUnsupported = ({
  initialLanguage,
  care,
}: RegionUnsupportedProps) => {
  const router = useRouter();
  const lan = (useLanguage() || initialLanguage) as Language;
  const { region } = usePatientState();

  // Get translations based on language
  const currentTranslations = translations[lan];

  // Handle region specific message
  let messageBody = currentTranslations.body;
  if (typeof window !== 'undefined') {
    const prevValidRegion = sessionStorage.getItem('valid-region');
    if (prevValidRegion && region) {
      messageBody = `${siteName} is not able to serve patients in ${region}. However, you had previously indicated that you are in ${prevValidRegion} where we can serve patients, so please correct your address if you misentered it.`;
    }
  }

  return (
    <>
      <Head>
        <title>{siteName} | Onboarding | Region Unsupported</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={currentTranslations.title} />
        <meta name="robots" content="noindex" />
        <link rel="preload" href="/fonts" as="font" crossOrigin="" />{' '}
        {/* Preload fonts if any */}
      </Head>
      <Suspense
        fallback={
          <Container maxWidth="sm">
            <div
              style={{
                minHeight: '200px',
                background: '#f5f5f5',
                borderRadius: '4px',
              }}
            />
          </Container>
        }
      >
        <Container maxWidth="sm">
          {care === 'mental health' ? (
            <VisitMessage
              title="We're sorry"
              body="This mental health program is not yet available in your state."
            />
          ) : (
            <VisitMessage
              title={currentTranslations.title}
              body={messageBody}
              captionText={currentTranslations.captionText}
            />
          )}
        </Container>
      </Suspense>
    </>
  );
};

RegionUnsupported.getLayout = (page: ReactElement) => (
  <OnboardingLayout
    back={
      ['Zealthy', 'FitRx'].includes(siteName ?? '')
        ? Pathnames.REGION_SCREEN
        : Pathnames.REGION_SCREEN_ZP
    }
  >
    {page}
  </OnboardingLayout>
);

export default RegionUnsupported;

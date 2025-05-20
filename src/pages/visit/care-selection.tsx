import Head from 'next/head';
import { ReactElement } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import { getAuthProps } from '@/lib/auth';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import MentalHealthVisitSelection from '@/components/screens/VisitSelection/MentalHealthVisitSelection';
import PrimaryCareVisitSelection from '@/components/screens/VisitSelection/PrimaryCareVisitSelection';
import SkincareVisitSelection from '@/components/screens/VisitSelection/SkinCareVisitSelection';
import VisitSelection from '@/components/screens/VisitSelection';
import getConfig from '../../../config';

const CareSelection = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { specificCare } = useIntakeState();

  return (
    <>
      <Head>
        <title>How can we help you today? | {siteName}</title>
      </Head>
      {specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION && (
        <MentalHealthVisitSelection />
      )}
      {specificCare === SpecificCareOption.PRIMARY_CARE && (
        <PrimaryCareVisitSelection />
      )}
      {(specificCare === SpecificCareOption.SKINCARE ||
        specificCare === SpecificCareOption.ACNE ||
        specificCare === SpecificCareOption.ANTI_AGING ||
        specificCare === SpecificCareOption.MELASMA ||
        specificCare === SpecificCareOption.ROSACEA) && (
        <SkincareVisitSelection />
      )}
      {specificCare !== SpecificCareOption.ANXIETY_OR_DEPRESSION &&
        specificCare !== SpecificCareOption.PRIMARY_CARE &&
        specificCare !== SpecificCareOption.ACNE &&
        specificCare !== SpecificCareOption.ANTI_AGING &&
        specificCare !== SpecificCareOption.MELASMA &&
        specificCare !== SpecificCareOption.ROSACEA &&
        specificCare !== SpecificCareOption.SKINCARE && <VisitSelection />}
    </>
  );
};

export const getServerSideProps = getAuthProps;

CareSelection.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default CareSelection;

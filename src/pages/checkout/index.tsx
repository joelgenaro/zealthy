import Head from 'next/head';
import { ReactElement, useEffect, useState } from 'react';
import CheckoutLayout from '@/layouts/CheckoutLayout';
import { getAuthProps } from '@/lib/auth';
import { useSelector } from '@/components/hooks/useSelector';
import EDCheckout from '@/components/screens/Checkout/components/EDCheckout';
import MultimonthCheckout from '@/components/screens/Checkout/components/MultimonthCheckout';
import { IAppState } from '@/context/AppContext/reducers/types/appState';
import { useVWO } from '@/context/VWOContext';
import { usePatientState } from '@/components/hooks/usePatient';
import CheckoutV2 from '@/components/screens/Checkout/CheckoutV2';
import Checkout from '@/components/screens/Checkout';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import BundledCheckoutV2 from '@/components/screens/Checkout/BundledCheckoutV2';
import PrepCheckout from '@/components/screens/Checkout/components/PrepCheckout';
import PsychCheckout from '@/components/screens/Checkout/components/PsychCheckout/PsychCheckout';
import BundledCheckoutV3 from '@/components/screens/Checkout/BundledCheckoutV3';
import { useProfileState } from '@/components/hooks/useProfile';
import EDHLCheckout from '@/components/screens/Checkout/components/EDHLCheckout/EDHLCheckout';
import SleepCheckout from '@/components/screens/Checkout/components/SleepCheckout/SleepCheckout';
import FreeConsultCheckout from '@/components/screens/Checkout/components/FreeConsultCheckout/FreeConsultCheckout';
import getConfig from '../../../config';
import CheckoutPopUpModalGLP1 from '@/components/screens/GLP1Treatment/GLP1ChcekoutPopUp';

import Spinner from '@/components/shared/Loading/Spinner';
import { Container } from '@mui/material';
import { useIsBundled, useVWOVariationName } from '@/components/hooks/data';
import WeightLossCheckout7551Var1 from '@/components/screens/Checkout/components/WeightLossCheckout7551Var1';
import EncloCheckout from '@/components/screens/Checkout/components/EncloCheckout/EncloCheckout';

const onlyED = (store: IAppState) => {
  if (store.visit.selectedCare.careSelections.length > 1) {
    return false;
  }
  return (
    !!store.visit.selectedCare.careSelections.find(
      s => s.reason === 'Erectile dysfunction'
    ) || store.intake.specificCare === 'Erectile dysfunction'
  );
};

export const onlyWeightLoss = (store: IAppState) => {
  if (store.visit.selectedCare.careSelections.length > 1) {
    return false;
  }

  return !!store.visit.selectedCare.careSelections.find(
    s => s.reason === 'Weight loss'
  );
};

const CheckoutPage = ({ videoUrl }: { videoUrl?: string }) => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const isED = useSelector(onlyED);
  const isWeightLoss = useSelector(onlyWeightLoss);
  const { potentialInsurance, variant, specificCare } = useIntakeState();
  const patientState = usePatientState();
  const profileState = useProfileState();
  const { data: isBundled } = useIsBundled();
  const { data: variation7865_2 } = useVWOVariationName('7865_2');
  const { data: variation7865_3 } = useVWOVariationName('7865_3');

  const vwoContext = useVWO();
  let variationName4601;
  let variationName5481;
  // let variationName7865_2;
  // let variationName7865_3;
  let variationName5685;
  let variationName7960;
  let variationName7766 = vwoContext?.getVariationName(
    '7766',
    String(patientState?.id)
  );

  const isVar1_7766 = variationName7766 === 'Variation-1';
  if (['NC', 'WA', 'VA'].includes(patientState?.region!)) {
    variationName4601 = vwoContext?.getVariationName(
      '4601',
      String(patientState?.id)
    );
  }
  if (
    ['CO', 'IN', 'LA', 'NJ', 'SC', 'WI', 'TN', 'CT'].includes(
      patientState?.region!
    ) &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED]?.includes(
      potentialInsurance || PotentialInsuranceOption.DEFAULT
    )
  ) {
    variationName5685 = vwoContext?.getVariationName(
      '15685',
      String(patientState?.id)
    );
  }

  // if (
  //   ['FL', 'CT', 'NV', 'KY', 'WA', 'CO', 'AZ'].includes(
  //     patientState?.region!,
  //   ) &&
  //   specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION
  // ) {
  //   variation7865_2.variation_name ===(
  //     '7865_2',
  //     String(patientState?.id),
  //   );
  // }

  // if (
  //   ['TX', 'IL', 'PA', 'GA', 'SC', 'OK'].includes(patientState?.region!) &&
  //   specificCare === SpecificCareOption.ENCLOMIPHENE
  // ) {
  //   variationName7865_3 = vwoContext?.getVariationName(
  //     '7865_3',
  //     String(patientState?.id),
  //   );
  // }

  // Non-bundled and Not Personalized Psychiatry
  if (
    specificCare !== SpecificCareOption.ANXIETY_OR_DEPRESSION &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
  ) {
    variationName7960 = vwoContext?.getVariationName(
      '7960',
      String(patientState?.id)
    );
  }
  // console.log('variationName7865_2', variationName7865_2);

  const isBundled4758 =
    ['CA', 'FL', 'TX'].includes(patientState?.region!) &&
    [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED]?.includes(
      potentialInsurance || PotentialInsuranceOption.DEFAULT
    ) &&
    variant === '4758b';

  return (
    <>
      <Head>
        <title>Visit & Payment Summary | {siteName}</title>
      </Head>

      {isED ? (
        <EDCheckout />
      ) : specificCare === 'Prep' ? (
        <PrepCheckout />
      ) : specificCare === 'Sex + Hair' ? (
        <EDHLCheckout />
      ) : specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT ? (
        <FreeConsultCheckout />
      ) : specificCare === SpecificCareOption.SLEEP && isVar1_7766 ? (
        <SleepCheckout />
      ) : isWeightLoss && variationName4601 === 'Variant-Multimonth' ? (
        <MultimonthCheckout />
      ) : isWeightLoss &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        !isBundled4758 ? (
        <NonBundledWeightLossCheckout />
      ) : isBundled4758 ? (
        <CheckoutV2 />
      ) : variationName5481 === 'Variation-1' ? (
        <BundledCheckoutV2 videoUrl={videoUrl} />
      ) : variationName5685 === 'Variation-1' || variant === '5865' ? (
        <BundledCheckoutV3 patient={profileState} />
      ) : variation7865_2?.variation_name === 'Variation-1' ||
        variation7865_2?.variation_name === 'Variation-2' ? (
        <PsychCheckout />
      ) : variation7865_3?.variation_name === 'Variation-1' ||
        variation7865_3?.variation_name === 'Variation-2' ? (
        <EncloCheckout />
      ) : (
        <Checkout />
      )}
      {variationName7960 === 'Variation-1' &&
        (isED ||
          specificCare === 'Prep' ||
          specificCare === 'Sex + Hair' ||
          specificCare === SpecificCareOption.HAIR_LOSS ||
          specificCare === SpecificCareOption.SKINCARE ||
          specificCare === SpecificCareOption.ACNE ||
          specificCare === SpecificCareOption.ANTI_AGING ||
          specificCare === SpecificCareOption.MELASMA ||
          specificCare === SpecificCareOption.ROSACEA ||
          specificCare === SpecificCareOption.SLEEP ||
          specificCare === SpecificCareOption.PRIMARY_CARE ||
          specificCare === SpecificCareOption.ENCLOMIPHENE ||
          specificCare === SpecificCareOption.BIRTH_CONTROL) && (
          <CheckoutPopUpModalGLP1
            open={isModalOpen}
            onClose={handleModalClose}
          />
        )}
    </>
  );
};

const NonBundledWeightLossCheckout = () => {
  return <WeightLossCheckout7551Var1 />;
};

export const getServerSideProps = getAuthProps;

CheckoutPage.getLayout = (page: ReactElement) => (
  <CheckoutLayout>{page}</CheckoutLayout>
);

export default CheckoutPage;

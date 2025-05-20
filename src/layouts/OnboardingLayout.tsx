import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import OnboardingNav from '@/components/shared/layout/OnboardingNav';
import Footer from '@/components/shared/layout/Footer';
import Gap from '@/components/shared/layout/Gap';
import { usePromoBanner } from '@/components/hooks/usePromoBanner';
import PromoBanner from '@/components/shared/PromoBanner';
import StickyHeader from '@/components/shared/StickyHeader';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Router, { useRouter } from 'next/router';
import { useILV } from '@/context/ILVContextProvider';
import ILVBanner from '@/components/shared/ILVBanner';
import { Pathnames } from '@/types/pathnames';
import ILVConfirmedModal from '@/components/shared/ILVConfirmedModal';
import {
  usePatient,
  useVWOVariationName,
  useIsBundled,
} from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { Box } from '@mui/material';

interface OnboardingLayoutProps {
  back?: string;
  children: ReactNode;
}
// in order to center text vertically and horizontally within a flexbox you must
// set the height of the parent element to 100% and the height of the child
// element to 100% as well
const OnboardingLayout = ({ back, children }: OnboardingLayoutProps) => {
  const { data: variant6303 } = useVWOVariationName('6303');
  const isMobile = useIsMobile();
  const { pathname } = useRouter();
  const { data: isBundled } = useIsBundled();
  let { text, showBanner, key } = usePromoBanner();
  const { request, cancelRequest } = useILV();
  const [ilvModal, setILVModal] = useState(false);
  const { specificCare } = useIntakeState();
  const { data: variant6399 } = useVWOVariationName('6399');
  const { data: variant7458 } = useVWOVariationName('7458');
  const router = useRouter();
  const { name } = router.query;
  const isVerificationIDPath = useMemo(() => {
    return name === 'identity-verification';
  }, [router, name]);
  const [pastVerifiedId, setPastVerifiedID] = useState(false);

  useEffect(() => {
    if (isVerificationIDPath) {
      setPastVerifiedID(true);
    }
  }, [isVerificationIDPath]);

  const vwoContext = useVWO();
  const { data: patient } = usePatient();

  const showConditionSpecificBanner = useMemo(() => {
    if (variant6303?.variation_name === 'Variation-2') {
      return !showBanner && !pathname.includes('checkout');
    }
    return showBanner && !pathname.includes('checkout');
  }, [showBanner, pathname, variant6303]);

  const activateVariant = async () => {};

  useEffect(() => {
    if (router.pathname.includes('post-checkout')) {
      activateVariant();
    }
  }, [vwoContext, patient, router.pathname]);

  const cancelRequestAndNext = useCallback(async () => {
    if (!request) return;

    return cancelRequest(request).then(() => {
      Router.push(Pathnames.PATIENT_PORTAL);
    });
  }, [cancelRequest, request]);

  if (
    variant6399?.variation_name === 'Variation-1' ||
    variant6399?.variation_name === 'Variation-2'
  ) {
    text =
      'Limited Time: Enter the code ZEALTHY20 to get $20 off your first purchase';
  } else if (variant6303?.variation_name === 'Variation-1') {
    text = 'Summer Sale: GLP-1 Access Only $39 to Start';
  } else if (variant6303?.variation_name === 'Variation-3') {
    text = 'Last Chance: Summer Savings End Labor Day';
  }

  useEffect(() => {
    if (request && request.clinician_id && request.status === 'Confirmed') {
      setILVModal(true);
    }

    return;
  }, [request?.id, Router.query, request?.status, request?.clinician_id]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <StickyHeader>
        <OnboardingNav back={back} />
        {showConditionSpecificBanner &&
        !pathname.includes('/ed/complete-profile') &&
        !pathname.includes('/ed/create-patient') ? (
          <PromoBanner text={text} promoKey={key} />
        ) : null}
        {variant7458?.variation_name !== 'Variation-1' &&
        showBanner &&
        !['4758', '4758b'].includes(key) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        pathname.includes('checkout') ? (
          <PromoBanner text={text} promoKey={key} />
        ) : (
          pathname.includes('post-checkout') &&
          specificCare === SpecificCareOption.WEIGHT_LOSS &&
          !isBundled &&
          !['4758', '4758b'].includes(key) &&
          variant7458?.variation_name === 'Variation-1' &&
          !pastVerifiedId && <PromoBanner text={text} promoKey={key} />
        )}
        {request &&
          ![
            'Cancelled',
            'Completed',
            'Noshowed',
            'Patient-Noshowed',
            'Provider-Noshowed',
          ].includes(request.status) &&
          specificCare !== SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT && (
            <ILVBanner
              onLeave={cancelRequestAndNext}
              buttonText="Click here to cancel request"
            />
          )}
        <Gap height={`${isMobile ? '2rem' : '3rem'}`} />
        {children}
        <Footer />
        {request && request.status === 'Confirmed' && request.clinician_id ? (
          <ILVConfirmedModal
            open={ilvModal}
            setOpen={setILVModal}
            request={request}
          />
        ) : null}
      </StickyHeader>
    </Box>
  );
};

export default OnboardingLayout;

import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useMemo } from 'react';
import {
  useCouponCodeRedeem,
  useIsEligibleForZealthy10,
  usePatient,
  usePatientPrescriptionRequest,
  usePromoTextValues,
} from './data';
import { useIntakeSelect } from './useIntake';
import { usePatientState } from './usePatient';
import { useVWO } from '@/context/VWOContext';

const allowToShowBanner: SpecificCareOption[] = [
  SpecificCareOption.WEIGHT_LOSS,
  SpecificCareOption.WEIGHT_LOSS_AD,
  SpecificCareOption.HAIR_LOSS,
  SpecificCareOption.ERECTILE_DYSFUNCTION,
  SpecificCareOption.PRE_WORKOUT,
  SpecificCareOption.ANXIETY_OR_DEPRESSION,
  SpecificCareOption.ACNE,
  SpecificCareOption.ANTI_AGING,
  SpecificCareOption.MELASMA,
  SpecificCareOption.ROSACEA,
  SpecificCareOption.BIRTH_CONTROL,
  SpecificCareOption.SKINCARE,
  SpecificCareOption.ASYNC_MENTAL_HEALTH,
  SpecificCareOption.PREP,
  SpecificCareOption.SLEEP,
  SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT,
  SpecificCareOption.SEX_PLUS_HAIR,
];

const allowToShowBannerInsurance: PotentialInsuranceOption[] = [
  PotentialInsuranceOption.OH,
  PotentialInsuranceOption.TX,
  PotentialInsuranceOption.AETNA,
  PotentialInsuranceOption.MEDICARE,
  PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA,
  PotentialInsuranceOption.WEIGHT_LOSS_SYNC,
  PotentialInsuranceOption.FIRST_MONTH_FREE,
  PotentialInsuranceOption.ED_HARDIES,
];

export const usePromoBanner = () => {
  const { potentialInsurance, specificCare, variant } = useIntakeSelect(
    intake => intake
  );
  const { data: couponCodeRedeem } = useCouponCodeRedeem();
  const { data: eligibleForZealthy10 } = useIsEligibleForZealthy10();
  const { data: prescriptionRequests } = usePatientPrescriptionRequest();
  const { data: patient } = usePatient();

  const patientState = usePatientState();
  const vwoContext = useVWO();
  let variationName5685: string | null | undefined;

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

  const showCompoundBundleBanner = useMemo(() => {
    return [
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT);
  }, [potentialInsurance]);

  const showZealthy10Banner = useMemo(() => {
    return (
      eligibleForZealthy10 &&
      !(
        prescriptionRequests?.some(pr => pr.medication_quantity_id === 98) &&
        patient?.has_verified_identity
      )
    );
  }, [eligibleForZealthy10, prescriptionRequests, patient]);

  const getPromoKey = () => {
    if (showZealthy10Banner) return 'ZEALTHY10';
    if (
      variant &&
      ['2746', '2749', '4758', '4758b', '6471', '5865'].includes(variant)
    )
      return variant;
    if (variationName5685 === 'Variation-1') return '5685';
    if (showCompoundBundleBanner) {
      return potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
        ? 'Semaglutide Bundled'
        : 'Tirzepatide Bundled';
    }
    return (
      potentialInsurance ??
      (allowToShowBanner.includes(specificCare ?? SpecificCareOption.DEFAULT)
        ? specificCare
        : '') ??
      ''
    );
  };

  const promoKey = getPromoKey();
  const { data: promoTextValue } = usePromoTextValues(promoKey);

  return {
    showBanner: couponCodeRedeem
      ? true
      : showCompoundBundleBanner
      ? true
      : potentialInsurance
      ? allowToShowBannerInsurance.includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      : allowToShowBanner.includes(specificCare || SpecificCareOption.DEFAULT),

    text: promoTextValue || '',
    key: promoKey,
  };
};

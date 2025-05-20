import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { mapVariantToCareType } from '@/utils/mapVariantToCareType';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

function careToValue(
  care: SpecificCareOption,
  ins: PotentialInsuranceOption,
  eventName?: string,
  medication?: Medication
) {
  switch (care) {
    case SpecificCareOption.WEIGHT_LOSS:
      switch (ins) {
        case PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA:
          return 350;
        case PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED:
          return 800;
        case PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED:
          return 300;
        case PotentialInsuranceOption.TIRZEPATIDE_BUNDLED:
          return 850;
        default:
          return 150;
      }
    case SpecificCareOption.BIRTH_CONTROL:
      return 50;
    case SpecificCareOption.ANXIETY_OR_DEPRESSION:
      return 130;
    case SpecificCareOption.HAIR_LOSS:
    case SpecificCareOption.FEMALE_HAIR_LOSS:
      return 80;
    case SpecificCareOption.ERECTILE_DYSFUNCTION:
      return 250;
    case SpecificCareOption.PRIMARY_CARE:
      return 140;
    case SpecificCareOption.ASYNC_MENTAL_HEALTH:
      return 347;
    case SpecificCareOption.PRE_WORKOUT:
      return 100;
    case SpecificCareOption.SEX_PLUS_HAIR:
      return 75;
    case SpecificCareOption.PREP:
      return 160;
    case SpecificCareOption.ENCLOMIPHENE:
      return 400;
    case SpecificCareOption.SLEEP:
      return 80;
    case SpecificCareOption.SKINCARE:
    case SpecificCareOption.ACNE:
    case SpecificCareOption.ROSACEA:
    case SpecificCareOption.MELASMA:
    case SpecificCareOption.ANTI_AGING:
      return 20;
    default:
      return 74;
  }
}

interface IAppointment {
  appointment_type: string;
  starts_at: number;
  ends_at: number;
  status: string;
}

interface AppointmentProps {
  patient_id: number;
  clinician_id: number;
  appointment_type: string;
  starts_at: number;
  ends_at: number;
  zoom_link: string | null | undefined;
  daily_room: string | null | undefined;
}

export const purchaseEvent = (
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  careSelections: string,
  calculatedSpecificCare: SpecificCareOption,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  transactionId: string,
  variant?: string
) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    if (
      potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
    ) {
      window.rudderanalytics?.track('purchase-oral-semaglutide-bundled', {
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selection: 'Weight loss',
        care_type:
          specificCare === 'Hair Loss'
            ? 'female hair loss'
            : variant && variant.includes('5674')
            ? mapVariantToCareType[variant!]
            : potentialInsurance || specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance
        ),
        currency: 'USD',
      });
    } else if (specificCare === 'Preworkout') {
      window.rudderanalytics?.track('purchase-success-pw', {
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selections: careSelections,
        care_selection: 'Preworkout',
        care_type: 'Preworkout',
        content_name: calculatedSpecificCare,
        value: 300,
        currency: 'USD',
      });
    } else if (
      !['Enclomiphene', 'Skincare', 'Mental health']?.includes(specificCare)
    ) {
      window.rudderanalytics?.track('purchase-success', {
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selections: careSelections,
        care_selection: specificCare || calculatedSpecificCare,
        care_type:
          variant === '4758'
            ? 'Weight Loss Flexible'
            : variant === '5328'
            ? 'Weight Loss Ad'
            : variant && variant?.includes('5674')
            ? mapVariantToCareType[variant!]
            : potentialInsurance || specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance
        ),
        currency: 'USD',
      });
    }

    // Purchase event for Facebook
    potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
      ? null
      : window.rudderanalytics?.track('Purchase', {
          email,
          phone,
          first_name,
          last_name,
          state,
          care_selections: careSelections,
          care_selection: [
            'Hyperpigmentation Dark Spots',
            'Acne',
            'Rosacea',
            'Fine Lines & Wrinkles',
          ].includes(careSelections)
            ? 'Skincare'
            : specificCare || calculatedSpecificCare,
          care_type: [
            'Hyperpigmentation Dark Spots',
            'Acne',
            'Rosacea',
            'Fine Lines & Wrinkles',
          ].includes(careSelections)
            ? 'Skincare'
            : variant === '4758'
            ? 'Weight Loss Flexible'
            : variant === '5328'
            ? 'Weight Loss Ad'
            : variant && variant.includes('5674')
            ? mapVariantToCareType[variant!]
            : potentialInsurance || specificCare,
          content_name: calculatedSpecificCare,
          value: careToValue(
            specificCare || calculatedSpecificCare,
            potentialInsurance,
            'Purchase'
          ),
          currency: 'USD',
        });
    window.VWO?.event('Purchase');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer?.push({
      event: 'purchase',
      value: careToValue(
        specificCare || calculatedSpecificCare,
        potentialInsurance,
        'Purchase'
      ),
    });
    window.rudderanalytics?.identify(email, {
      converted: true,
      converted_at: new Date().toISOString(),
      converted_care_selection: specificCare || calculatedSpecificCare,
      converted_care_type: potentialInsurance
        ? potentialInsurance
        : specificCare,
    });
    window.jumbleberry?.('track', 'Purchase', {
      transaction_id: transactionId,
      order_value: '75.00',
    });
  }
  window.STZ?.trackEvent('Purchase');
};

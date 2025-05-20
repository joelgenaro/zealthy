import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import axios from 'axios';
import { Json } from '@/lib/database.types';

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

type KeyValue = { key: string; value: string };

function getUtmSource(data: KeyValue[] | null): string | undefined {
  if (!data) {
    return 'none';
  }

  const firstUtmSource = data.find(
    item => item.key === 'first_utm_source'
  )?.value;
  const lastUtmSource = data.find(
    item => item.key === 'last_utm_source'
  )?.value;

  // Return first_utm_source if it exists, otherwise return last_utm_source
  return firstUtmSource ?? lastUtmSource ?? 'none';
}

export const bmgPurchaseEvent = async (
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  careSelections: string,
  calculatedSpecificCare: SpecificCareOption,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  zip: string,
  utmSource: Json[] | null,
  variant?: string
) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    await axios.post(
      'https://impact.2nd.co/api/record',
      {
        event: 'purchase-success',
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
            : potentialInsurance || specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance
        ),
        currency: 'USD',
        zip,
        utm_source: getUtmSource(utmSource as KeyValue[]),
        sent_at: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BMG_API_KEY}`,
        },
      }
    );
  }
};

export const bmgUniquePurchaseEvent = async (
  eventName: string,
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  careSelections: string,
  calculatedSpecificCare: SpecificCareOption,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  utmSource: Json[] | null,
  zip: string
) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    await axios.post(
      'https://impact.2nd.co/api/record',
      {
        event: eventName,
        email,
        phone,
        first_name,
        last_name,
        state,
        care_selections: careSelections,
        care_selection: specificCare || calculatedSpecificCare,
        care_type: potentialInsurance || specificCare,
        content_name: calculatedSpecificCare,
        value: careToValue(
          specificCare || calculatedSpecificCare,
          potentialInsurance
        ),
        currency: 'USD',
        zip,
        utm_source: getUtmSource(utmSource as KeyValue[]),
        sent_at: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BMG_API_KEY}`,
        },
      }
    );
  }
};

export const bmgAccountCreatedEvent = async (
  eventName: string,
  email: string,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  utmSource: Json[] | null,
  variant?: string
) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    await axios.post(
      'https://impact.2nd.co/api/record',
      {
        event: eventName,
        email,
        care_selection: specificCare,
        care_type:
          variant === '4758'
            ? 'Weight Loss Flexible'
            : variant === '5328'
            ? 'Weight Loss Ad'
            : potentialInsurance || specificCare,
        utm_source: getUtmSource(utmSource as KeyValue[]),
        sent_at: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BMG_API_KEY}`,
        },
      }
    );
  }
};

export const bmgSignUpEvent = async (
  eventName: string,
  email: string,
  specificCare: SpecificCareOption,
  potentialInsurance: PotentialInsuranceOption,
  utmSource: Json[] | null,
  variant?: string
) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    await axios.post(
      'https://impact.2nd.co/api/record',
      {
        event: eventName,
        email,
        care_selection: specificCare,
        care_type:
          variant === '4758'
            ? 'Weight Loss Flexible'
            : variant === '5328'
            ? 'Weight Loss Ad'
            : potentialInsurance || specificCare,
        sent_at: new Date().toISOString(),
        utm_source: getUtmSource(utmSource as KeyValue[]),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BMG_API_KEY}`,
        },
      }
    );
  }
};

export const bmgBundledEvent = async (
  email: string,
  phone: string,
  first_name: string,
  last_name: string,
  state: string,
  zip: string,
  utmSource: Json[] | null,
  eventName: string
) => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    await axios.post(
      'https://impact.2nd.co/api/record',
      {
        event: eventName,
        email,
        phone,
        first_name,
        last_name,
        state,
        zip,
        utm_source: getUtmSource(utmSource as KeyValue[]),
        sent_at: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BMG_API_KEY}`,
        },
      }
    );
  }
};

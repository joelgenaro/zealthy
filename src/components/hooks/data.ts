import { useInfiniteQuery, useQuery } from 'react-query';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useUser } from '@supabase/auth-helpers-react';
import {
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  differenceInDays,
  subDays,
  isAfter,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { usePayment } from './usePayment';
import axios from 'axios';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import uniqBy from 'lodash/uniqBy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OrderProps } from '../screens/Prescriptions/OrderHistoryContent';
import { useTreatMeNow } from './useTreatMeNow';
import { useSearchParams } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { useIntakeState } from './useIntake';
// import { useRatableCoachItems } from './useRatableCoachItems';

type ReasonForVisit = Database['public']['Tables']['reason_for_visit']['Row'];
export type OnlineVisit =
  Database['public']['Tables']['online_visit']['Row'] & {
    reason_for_visit: ReasonForVisit[];
  };

export type PatientAddress = Database['public']['Tables']['address']['Row'];

export type Appointment = Database['public']['Tables']['appointment']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = Database['public']['Tables']['patient']['Row'];
type Clinician = Database['public']['Tables']['clinician']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];
type Insurance = Database['public']['Tables']['insurance_policy']['Row'];
type Payer = Database['public']['Tables']['payer']['Row'];
type PatientReferral = Database['public']['Tables']['patient_referral']['Row'];
type Medication = Database['public']['Tables']['medication']['Row'];
type OralGlpDosageMatrix =
  Database['public']['Tables']['oral_dosage_matrix']['Row'];
type Order = Database['public']['Tables']['order']['Row'];
export type Prescription = Database['public']['Tables']['prescription']['Row'];
type PatientReferralRedeem =
  Database['public']['Tables']['patient_referral_redeem']['Row'];
type PatientActionItem =
  Database['public']['Tables']['patient_action_item']['Row'];

export type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'];
export type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'];
type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Row'];

type CompoundMatrix = Database['public']['Tables']['compound_matrix']['Row'];
export type CompoundMedication =
  Database['public']['Tables']['compound_medication']['Row'];
type CompoundOption = Database['public']['Tables']['compound_option']['Row'];
export type ProviderType = Database['public']['Enums']['provider_type'];
export type LabOrder = Database['public']['Tables']['lab_order']['Row'];

type MedObjectProps = {
  name: string;
  type: MedicationType;
  price: number;
  discounted_price?: number;
  dosage: string;
  quantity: number;
  dose?: string | null;
  recurring: {
    interval: string;
    interval_count: number;
  };
  medication_quantity_id: number;
  matrixId: number;
};
export type CompoundDetailProps = {
  [key: string]: {
    saving: number;
    price: number;
    discountedPrice: number;
    title: string;
    singleTitle: string;
    dosage: string;
    singleDosage: string;
    singleDescription: string;
    name: string;
    body1: string;
    body2: string;
    medData: MedObjectProps;
    medBulkData: MedObjectProps;
  };
};
export type MatrixProps = {
  plan: string;
  currMonth: string;
  dose: string;
  durationInWeeks: string;
  pharmacy: string;
  price: string;
  sig: string;
  size: string;
  states: string[];
  shipments: string;
  vials: string;
  doctorInstructions: string;
  laymanInstructions: string;
};

export type CompoundMatrixProps = CompoundMatrix & {
  compound_option: CompoundOption &
    {
      compound_medication: CompoundMedication;
    }[];
};

export type CouponCode = Database['public']['Tables']['coupon_code']['Row'];
export type CouponCodeRedeem =
  Database['public']['Tables']['coupon_code_redeem']['Row'];
export type PrescriptionRequestProps = PrescriptionRequest & {
  medication_quantity: {
    id: number;
    medication_dosage: {
      medication: Medication;
    };
  };
};
export type PatientProps = Patient & {
  profiles: Profile;
};
export type ClinicianProps = Clinician & { profiles: Profile };
export type PatientSubscriptionProps = PatientSubscription & {
  subscription: Subscription;
  care?: string;
  order?: OrderProps & {
    prescription: Prescription & {
      medication_quantity: {
        medication_dosage: {
          medication: {
            display_name: string;
            name?: string;
          };
        };
      };
    };
  };
};
export type CanceledSubscription = PatientSubscriptionProps & {
  subscription: {
    active: boolean;
    created_at: string | null;
    currency: string;
    id: number;
    name: string;
    price: number;
    processor: string;
    reference_id: string;
    updated_at: string | null;
  };
  care: string;
  order: {
    prescription: {
      medication: any;
      medication_quantity: any;
    };
    prescription_id: string | number;
  };
};
export type OrderPrescriptionProps = Order & {
  prescription: Prescription | null;
  prescription_request?: PrescriptionRequest | null;
  clinician?: ClinicianProps | null;
};

export type PatientPrescriptionProps = PatientPrescription & {
  subscription: Subscription;
  order?: {
    prescription: {
      medication_quantity: {
        medication_dosage: {
          medication: {
            display_name: string;
          };
        };
      };
    };
  };
};
export type PatientReferralRedeemProps = PatientReferralRedeem & {
  patient_referral: PatientReferral;
};
export type PatientReferralProps = {
  referral: PatientReferral;
  redeemed: PatientReferralRedeem[];
};
type PatientCareTeam = Database['public']['Tables']['patient_care_team']['Row'];
export type PatientCareTeamProps = PatientCareTeam & {
  clinician: ClinicianProps;
};
export type PatientInsuranceProps = Insurance & { payer: Payer };
export type UploadedDocuments = {
  created_at: string;
  id: string;
  last_accessed_at: string;
  metadata: object;
  name: string;
  updated_at: string;
};
export type CouponCodeRedeemProps = CouponCodeRedeem & {
  coupon_code: CouponCode;
  profiles: Profile;
};

interface QuantityProps {
  id: number;
  quantity: number;
}

interface DosageProps {
  id: number;
  dosage: string;
}

interface MedicationDosageProps {
  id: number;
  dosage: DosageProps;
  designator_id: string;
  aps_drug_id: number;
  medication_quantity: {
    id: number;
    price: number;
    quantity: QuantityProps;
  }[];
  national_drug_code?: string;
}

export interface MedicationProps {
  id: number;
  name: string;
  display_name: string;
  medication_dosage: MedicationDosageProps[];
}

export function useMedications() {
  const supabase = useSupabaseClient<Database>();

  return useQuery('medications', async () => {
    const result = await supabase
      .from('medication')
      .select(
        `id, name, display_name,
          medication_dosage!inner(id,
            dosage(id, dosage), designator_id, national_drug_code, aps_drug_id,
            medication_quantity(id, price,
              quantity(id, quantity)))`
      )
      .order('created_at', { ascending: false })
      .then(res => res.data as MedicationProps[]);

    return result;
  });
}

export function usePatient() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const isAuthed = !!user?.id;

  return useQuery(
    'patient',
    async () => {
      const { data: result } = await supabase
        .from('patient')
        .select(`*, profiles (*)`)
        .eq('profile_id', user?.id!)
        .maybeSingle();

      return result as PatientProps;
    },
    { enabled: isAuthed }
  );
}

export function usePatientProfile() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const isAuthed = !!user?.id;

  return useQuery(
    ['patient', 'profile'],
    async () => {
      const { data: result } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user?.id!)
        .maybeSingle();

      return result as Profile;
    },
    { enabled: isAuthed }
  );
}

export function useIsPatientSpanishSpeaker() {
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    ['patient', 'isSpanishSpeaker'],
    async () => {
      return !!patient.data?.spanish_speaker;
    },
    { enabled: isAuthed }
  );
}

export function usePatientAddress() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'patientAddress',
    async () => {
      const { data: result } = await supabase
        .from('address')
        .select()
        .eq('patient_id', patient.data?.id!)
        .maybeSingle();

      return result;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export function usePatientPayment() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'patientPayment',
    async () => {
      const { data: result } = await supabase
        .from('payment_profile')
        .select()
        .eq('patient_id', patient.data?.id!)
        .single();

      return result;
    },
    { enabled: isAuthed }
  );
}

export const usePaymentMethodUpdatedRecently = () => {
  const { data: paymentProfile } = usePatientPayment();
  const { data: patient } = usePatient();

  return useMemo(() => {
    if (!paymentProfile || !patient?.timezone) return false;
    if (!paymentProfile.created_at || !paymentProfile.updated_at) {
      return false;
    }
    const createdAtUTC = parseISO(paymentProfile.created_at);
    const updatedAtUTC = parseISO(paymentProfile.updated_at);

    const createdAt = utcToZonedTime(createdAtUTC, patient.timezone);
    const updatedAt = utcToZonedTime(updatedAtUTC, patient.timezone);

    const nowUTC = new Date();
    const now = utcToZonedTime(nowUTC, patient.timezone);

    if (updatedAt.getTime() === createdAt.getTime()) {
      return false;
    }

    const daysSinceUpdate = differenceInDays(now, updatedAt);

    return daysSinceUpdate <= 7;
  }, [paymentProfile, patient?.timezone]);
};

/// whenever the useLanguage hook is called, it will default to english 'en' if theres no language object available
/// whenever there is a language object available, it will grab the code for that language, in my case, Im adding 'esp' for spanish all over the place. hello
export function useLanguage() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<string>(() => {
    return (
      searchParams?.get('lan') || sessionStorage.getItem('language') || 'en'
    );
  });

  useEffect(() => {
    const lanParam = searchParams?.get('lan');
    if (lanParam) {
      sessionStorage.setItem('language', lanParam);
      setLanguage(lanParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Listening for an Event in storage when user changes languages
    const handleStorageChange = () => {
      const updatedLanguage = sessionStorage.getItem('language');
      setLanguage(updatedLanguage || 'en');
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return language;
}

export function usePatientDefaultPayment() {
  const { data: patient } = usePatient();
  const { defaultPaymentMethod } = usePayment();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientDefaultPaymentMethod',
    async () => {
      const { data } = await defaultPaymentMethod({
        id: patient!.id,
      });

      return data?.paymentMethod;
    },
    {
      enabled: isAuthed,
    }
  );
}

export function usePatientInsurance() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'patientInsurance',
    async () => {
      const { data: result } = await supabase
        .from('insurance_policy')
        .select('*, payer (*)')
        .eq('patient_id', patient.data?.id!);

      return result as PatientInsuranceProps[];
    },
    { enabled: isAuthed }
  );
}

export type Invoice = Database['public']['Tables']['invoice']['Row'];

export function usePatientUnpaidInvoices() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'patientUnpaidInvoices',
    async () => {
      const result = await supabase
        .from('invoice')
        .select('*')
        .eq('patient_id', patient.data?.id!)
        .eq('status', 'open')
        .eq('amount_paid', 0)
        .then(({ data }) => (data || []) as Invoice[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useWeightLossSubscription() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'weightLossSubscription',
    async () => {
      const { data: result } = await supabase
        .from('patient_subscription')
        .select(`*, subscription!inner(*)`)
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .ilike('subscription.name', '%Weight Loss%')
        .limit(1)
        .maybeSingle();

      return result as PatientSubscriptionProps;
    },
    { enabled: isAuthed }
  );
}

export function usePersonalizedPsychiatrySubscription() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'personalizedPsychiatrySubscription',
    async () => {
      const { data: result } = await supabase
        .from('patient_subscription')
        .select(`*, subscription!inner(*)`)
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .ilike('subscription.name', '%Personalized Psychiatry%')
        .limit(1)
        .maybeSingle();

      return result as PatientSubscriptionProps;
    },
    { enabled: isAuthed }
  );
}

export function useActiveWeightLossSubscription() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'activeWeightLossSubscription',
    async () => {
      const { data: result } = await supabase
        .from('patient_subscription')
        .select(`*, subscription!inner(*)`)
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .ilike('subscription.name', '%Weight Loss%')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      return result as PatientSubscriptionProps;
    },
    { enabled: isAuthed }
  );
}

export function usePatientSubscriptionByName(name: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['patientSubscription', name],
    async () => {
      const { data: result } = await supabase
        .from('patient_subscription')
        .select(`*, subscription!inner(*)`)
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .ilike('subscription.name', `%${name}%`)
        .limit(1)
        .maybeSingle();

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useAllVisiblePatientSubscription() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  const result = useQuery(
    'allPatientSubscription',
    async () => {
      const result = await supabase
        .from('patient_subscription')
        .select(`*, subscription (*)`)
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .neq('subscription_id', 5)
        .then(({ data }) => data || []);
      const medResult = await supabase
        .from('patient_prescription')
        .select(
          `*, subscription (*), order(*,prescription(*,medication_quantity(medication_dosage(medication(*)))))`
        )
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .then(({ data }) => data || []);

      return [...result, ...medResult] as PatientSubscriptionProps[];
    },
    { enabled: isAuthed }
  );

  return useMemo(() => result, [result]);
}

export function useActivePatientSubscription() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'activePatientSubscription',
    async () => {
      const result = await supabase
        .from('patient_subscription')
        .select(`*, subscription (*)`)
        .eq('patient_id', patient?.id!)
        .or('status.eq.active,status.eq.past_due')
        .then(({ data }) => (data ?? []) as PatientSubscriptionProps[]);

      const medResult = await supabase
        .from('patient_prescription')
        .select(
          `*, subscription(*), order(*,prescription(*,medication_quantity(medication_dosage(medication(*)))))`
        )
        .eq('patient_id', patient?.id!)
        .or('status.eq.active,status.eq.past_due')
        .then(
          ({ data }) => (data ?? []) as unknown as PatientSubscriptionProps[]
        );

      return [...result, ...medResult];
    },
    { enabled: isAuthed }
  );
}

export function usePatientPrescriptions() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['patientPrescriptions'],
    async () => {
      const result = await supabase
        .from('prescription')
        .select(`*, matrix_id(*)`)
        .eq('patient_id', patient?.id!)
        .order('created_at', { ascending: true })
        .then(
          ({ data }) =>
            data as unknown as (Prescription & {
              matrix_id: CompoundMatrixProps;
            })[]
        );

      return result;
    },
    { enabled: isAuthed }
  );
}

export type PatientPrescriptionWithMatrix = NonNullable<
  ReturnType<typeof usePatientPrescriptionRequest>['data']
>[0];

export function usePatientPrescriptionRequest() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['patientPrescriptionRequest'],
    async () => {
      const result = await supabase
        .from('prescription_request')
        .select(`*, medication_quantity(id, medication_dosage(medication(*)))`)
        .eq('patient_id', patient?.id!)
        .eq('is_visible', true)
        .in('status', [
          'REQUESTED',
          'PRE_INTAKES',
          'REQUESTED-FORWARDED',
          'REQUESTED - ID must be uploaded',
          'VERIFY_ID_PRESCRIPTION_REQUEST',
        ])
        .order('created_at', { ascending: true })
        .then(({ data }) => data as PrescriptionRequestProps[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useAllNestedPatientPrescriptionRequest() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['allNestedPatientPrescriptionRequest'],
    async () => {
      const result = await supabase
        .from('prescription_request')
        .select(`*, medication_quantity(id, medication_dosage(medication(*)))`)
        .eq('patient_id', patient?.id!)
        .eq('is_visible', true)
        .order('created_at', { ascending: true })
        .then(({ data }) => data as PrescriptionRequestProps[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function usePreIntakePrescriptionRequest() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['patientPrescriptionRequestPreIntakes'],
    async () => {
      const { data: result } = await supabase
        .from('prescription_request')
        .select(`*, medication_quantity(medication_dosage(medication(*)))`)
        .eq('patient_id', patient?.id!)
        .eq('status', 'PRE_INTAKES');

      return result as PrescriptionRequestProps[];
    },
    { enabled: isAuthed }
  );
}

export function useAllPatientPrescriptionRequest() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['allPatientPrescriptionRequest'],
    async () => {
      const { data: result } = await supabase
        .from('prescription_request')
        .select(`*`)
        .eq('patient_id', patient?.id!)
        .order('created_at', { ascending: false });

      return result as PrescriptionRequest[];
    },
    { enabled: isAuthed }
  );
}

export function useSinglePatientPrescriptionRequest(
  id: string | string[] | undefined | null
) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!id;

  return useQuery(
    ['singlePatientPrescriptionRequest'],
    async () => {
      const result = await supabase
        .from('prescription_request')
        .select(`*`)
        .eq('patient_id', patient?.id!)
        .eq('id', id!)
        .then(({ data }) => data as PrescriptionRequest[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function usePatientSubscription(
  id: string | string[] | undefined | null
) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!id;

  return useQuery(
    ['patientSubscription', id],
    async () => {
      const result = await supabase
        .from('patient_subscription')
        .select(`*, subscription (*)`)
        .eq('reference_id', id!)
        .eq('status', 'active')
        .single()
        .then(({ data }) => data as PatientSubscriptionProps);

      const medResult = await supabase
        .from('patient_prescription')
        .select(
          `*, subscription (*), order(*,prescription(*,medication_quantity(medication_dosage(medication(*)))))`
        )
        .eq('reference_id', id!)
        .eq('status', 'active')
        .single()
        .then(({ data }) => data as PatientPrescriptionProps);

      return result || medResult;
    },
    { enabled: isAuthed }
  );
}

export function usePatientMedicalSubscriptions() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  const result = useQuery(
    'allPatientMedicalSubscription',
    async () => {
      const result = await supabase
        .from('patient_subscription')
        .select(`*, subscription (*)`)
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .eq('subscription_id', 5)
        .then(({ data }) => data || []);
      const medResult = await supabase
        .from('patient_prescription')
        .select(
          `*, subscription (*), order(*,prescription(*,medication_quantity(medication_dosage(medication(*)))))`
        )
        .eq('patient_id', patient?.id!)
        .eq('visible', true)
        .eq('subscription_id', 5)
        .then(({ data }) => data || []);

      return [...result, ...medResult] as PatientSubscriptionProps[];
    },
    { enabled: isAuthed }
  );

  return useMemo(() => result, [result]);
}

export function usePatientPharmacy() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientPharmacy',
    async () => {
      const { data: result } = await supabase
        .from('patient_pharmacy')
        .select('pharmacy, name')
        .eq('patient_id', patient?.id!)
        .single();

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useOralGlpTitration(
  durationInDays: number,
  keepDosage: boolean = true
) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['oralGlpTitration', durationInDays],
    async () => {
      if (!patient?.id || ![30, 90].includes(durationInDays)) {
        return;
      }
      const oralGlpRequests = await supabase
        .from('prescription_request')
        .select('*')
        .eq('type', MedicationType.WEIGHT_LOSS_GLP1_ORAL)
        .eq('patient_id', patient?.id)
        .in('status', ['Approved', 'APPROVED'])
        .then(({ data }) => data as PrescriptionRequestProps[]);

      const oralMatrix = await supabase
        .from('oral_dosage_matrix')
        .select('*')
        .then(({ data }) => data as OralGlpDosageMatrix[]);

      if (!oralGlpRequests) {
        return;
      }

      // For each oral glp request, get current_month from the oral_matrix_id and find the highest one
      const currentMonth = oralGlpRequests.reduce((acc, request) => {
        const data = oralMatrix.find(
          matrix => matrix.id === request.oral_matrix_id
        );
        const month = data?.current_month ? data.current_month + 1 : 1;
        return Math.max(acc, month);
      }, 1);

      let correctRow: OralGlpDosageMatrix;

      if (oralGlpRequests.length > 0) {
        const { data } = await supabase
          .from('oral_dosage_matrix')
          .select('*')
          .eq('current_month', Math.min(currentMonth, 4))
          .eq('duration_in_days', durationInDays)
          .single();
        correctRow = data as OralGlpDosageMatrix;
      } else {
        const { data } = await supabase
          .from('oral_dosage_matrix')
          .select('*')
          .eq('current_month', 1)
          .eq('duration_in_days', durationInDays)
          .single();
        correctRow = data as OralGlpDosageMatrix;
      }

      if (!correctRow) {
        return null;
      }

      return {
        dosage: correctRow.dosage_instructions,
        dose: correctRow.dose,
        price: correctRow.price,
        currentMonth: correctRow.current_month,
        rowId: correctRow.id,
        capsuleCount: correctRow.capsule_count,
      };
    },
    { enabled: isAuthed }
  );
}

export function usePatientCareTeam() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientCareTeam',
    async () => {
      const { data: result } = await supabase
        .from('patient_care_team')
        .select(`*, clinician(*, profiles(*))`)
        .eq('patient_id', patient?.id!);

      return result as PatientCareTeamProps[];
    },
    { enabled: isAuthed }
  );
}

export function usePatientMessagesGroups() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!patient?.profile_id;

  return useQuery(
    'patientMessagesGroups',
    async () => {
      const { data: result } = await supabase
        .from('messages_group')
        .select()
        .eq('profile_id', patient?.profile_id!);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function usePatientMessagesList() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!patient?.profile_id;

  return useQuery(
    'patientMessagesList',
    async () => {
      const { data: groups } = await supabase
        .from('messages_group')
        .select()
        .eq('profile_id', patient?.profile_id!);

      const messageList = await Promise.all(
        groups?.map(async (g: any) => {
          const { data: messages } = await axios.get(
            `/api/message/decrypt/${g.id}`,
            {
              params: { page: 1, pageSize: 10 },
            }
          );

          function customSort(a: any, b: any) {
            if (a.display_at && b.display_at) {
              // If both have display_at, compare them
              return b.display_at.localeCompare(a.display_at);
            } else if (a.display_at) {
              // If only 'a' has display_at, 'a' comes first
              return b.created_at.localeCompare(a.display_at);
            } else if (b.display_at) {
              // If only 'b' has display_at, 'b' comes first
              return b.display_at.localeCompare(a.created_at);
            } else {
              // If neither has display_at, compare by created_at
              return b.created_at.localeCompare(a.created_at);
            }
          }

          const sortedData = messages?.sort(customSort);

          const { data: groupMembers } = await supabase
            .from('messages_group_member')
            .select('*, clinician(*, profiles(*))')
            .eq('messages_group_id', g.id);

          return {
            ...(sortedData?.[0] || { messages_group_id: g }),
            members: groupMembers,
          };
        }) || []
      );

      return messageList;
    },
    { enabled: isAuthed }
  );
}

export function useGroupMembers(id: number | null | undefined) {
  const supabase = useSupabaseClient<Database>();
  const isAuthed = !!id;

  return useQuery(
    'messagesGroupMembers',
    async () => {
      const { data: result } = await supabase
        .from('messages_group_member')
        .select('*, clinician(*, profiles(*))')
        .eq('messages_group_id', id!);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function usePatientWeightLogs() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientWeightLogs',
    async () => {
      const { data: result } = await supabase
        .from('patient_weight')
        .select('*')
        .eq('patient_id', patient?.id!)
        .order('date_logged', { ascending: true });

      return result;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export type PriorAuth = Database['public']['Tables']['prior_auth']['Row'];
export function usePatientPriorAuths() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientPriorAuths',
    async () => {
      const { data: result } = await supabase
        .from('prior_auth')
        .select('*')
        .eq('patient_id', patient?.id!)
        .order('created_at', { ascending: false });

      return result as PriorAuth[];
    },
    { enabled: isAuthed, staleTime: 240_000 }
  );
}

export type TaskQueue = Database['public']['Tables']['task_queue']['Row'];
export function usePatientTasks() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientTasks',
    async () => {
      const { data: result } = await supabase
        .from('task_queue')
        .select('*')
        .eq('patient_id', patient?.id!);

      return result as TaskQueue[];
    },
    { enabled: isAuthed, staleTime: 240_000 }
  );
}

export function usePatientWeightLossReferrals() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientWeightLossReferrals',
    async () => {
      const { data: result } = await supabase
        .from('patient_referral')
        .select()
        .eq('patient_id', patient?.id!)
        .eq('specific_care', 'Weight loss')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: redemptions } = await supabase
        .from('patient_referral_redeem')
        .select()
        .eq('patient_referral_code', result?.code!);

      const { data: redeemedThisMonth } = await supabase
        .from('patient_referral_redeem')
        .select()
        .eq('patient_referral_code', result?.code!)
        .eq('redeemed', true)
        .gte('created_at', `${format(startOfMonth(new Date()), 'yyyy-MM-dd')}`)
        .lte('created_at', ` ${format(endOfMonth(new Date()), 'yyyy-MM-dd')}`);

      return { referral: { ...result }, redemptions, redeemedThisMonth };
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export function usePatientReferral(code: string | string[] | undefined | null) {
  const supabase = useSupabaseClient<Database>();
  const isAuthed = !!code;

  return useQuery(
    'patientReferral',
    async () => {
      const { data: result } = await supabase
        .from('patient_referral')
        .select()
        .eq('code', code!)
        .single();

      const { data: redeemed } = await supabase
        .from('patient_referral_redeem')
        .select()
        .eq('patient_referral_code', code!)
        .eq('redeemed', true)
        .gte(
          'created_at',
          `${format(startOfMonth(new Date()), 'yyyy-MM-dd HH:mm')}`
        )
        .lte(
          'created_at',
          ` ${format(endOfMonth(new Date()), 'yyyy-MM-dd HH:mm')}`
        );

      return { referral: { ...result }, redeemed };
    },
    { enabled: isAuthed }
  );
}

export function useActivePatientReferralRedeem() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!patient?.profile_id;

  return useQuery(
    'patientReferralRedeem',
    async () => {
      const { data: result } = await supabase
        .from('patient_referral_redeem')
        .select('*, patient_referral(*)')
        .eq('profile_id', patient?.profile_id!)
        .eq('redeemed', false)
        .single();

      return result;
    },
    { enabled: isAuthed }
  );
}

const priorities: { [key: string]: number } = {
  'Weight loss': 8,
  Enclomiphene: 7,
  'Mental health': 6,
  'Erectile dysfunction': 5,
  'Anxiety or depression': 4,
  'Hair loss': 3,
  'Primary care': 2,
  'Birth control': 1,
  Skincare: 1,
  Other: 0,
};

const sortingByPriorities = (v1: OnlineVisit, v2: OnlineVisit) => {
  const priority1 = priorities[v1.reason_for_visit[0].reason || 'Other'];
  const priority2 = priorities[v2.reason_for_visit[0].reason || 'Other'];

  return priority2 - priority1;
};

export function usePatientIncompleteVisits() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'incompletePatientVisits',
    async () => {
      const visits = await supabase
        .from('online_visit')
        .select('*, reason_for_visit(*)')
        .in('status', ['Paid', 'Created'])
        .eq('patient_id', patient?.id!)
        .order('updated_at', { ascending: false })
        .then(({ data }) => (data || []) as OnlineVisit[]);

      return visits
        .filter(v => {
          if (v.potential_insurance === 'Weight Loss Continue') {
            return false;
          }

          const reasons = v.reason_for_visit.map(r => r.reason);

          if (!reasons.length) return false;

          return (
            !reasons.includes('Other') && !reasons.includes('I’m not sure')
          );
        })
        .sort(sortingByPriorities);
    },
    { enabled: isAuthed }
  );
}

export function usePatientCompletedVisits() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'CompletedPatientVisits',
    async () => {
      const visits = await supabase
        .from('online_visit')
        .select('*, reason_for_visit(*)')
        .eq('status', 'Completed')
        .eq('patient_id', patient?.id!)
        .then(({ data }) => (data || []) as OnlineVisit[]);

      return visits;
    },
    { enabled: isAuthed }
  );
}

export function usePatientDocuments() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientDocuments',
    async () => {
      const { data: result } = await supabase.storage
        .from('patients')
        .list(`patient-${patient?.id}/Insurance-card`);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function usePatientLabWorks() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'patientLabWorks',
    async () => {
      // Check both folders
      const [labWorkResult, prepLabsResult] = await Promise.all([
        supabase.storage
          .from('patients')
          .list(`patient-${patient?.id}/lab-work`),
        supabase.storage
          .from('patients')
          .list(`patient-${patient?.id}/prep-labs`),
      ]);

      // Combine the results, filtering out any nullish values
      const combinedResults = [
        ...(labWorkResult.data || []),
        ...(prepLabsResult.data || []),
      ];

      return combinedResults;
    },
    { enabled: isAuthed }
  );
}

export function useFetchStorageVideos() {
  const supabase = useSupabaseClient<Database>();

  return useQuery('storageVideos', async () => {
    const { data: result } = await supabase.storage.from('videos').list();
    return result;
  });
}

export function useAllPayers() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'allPayers',
    async () => {
      const { data: visits } = await supabase.from('payer').select('*');

      return visits;
    },
    { enabled: isAuthed }
  );
}

export function useNextCoordinator() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'nextCoordinator',
    async () => {
      let leastPatients: { clinician: any | null; total: number } = {
        clinician: null,
        total: Infinity,
      };
      const allCoordinators = await supabase
        .from('clinician')
        .select('*, profiles (*)')
        .eq('status', 'ON')
        .overlaps('type', [
          'Coordinator (All)',
          'Coordinator (PAs)',
          'Lead Coordinator',
          'Coordinator (Messages)',
        ]);

      for (const c of allCoordinators.data || []) {
        const totalPatients = await supabase
          .from('patient_care_team')
          .select('*', { count: 'exact' })
          .eq('clinician_id', c.id);

        if (leastPatients.total > (totalPatients.count ?? 0)) {
          leastPatients = {
            clinician: c,
            total: totalPatients.count ?? 0,
          };
        }
      }
      return leastPatients;
    },
    { enabled: isAuthed }
  );
}

export function useSubscription(name: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['subscription', name],
    async () => {
      return supabase
        .from('subscription')
        .select('*')
        .eq('name', name)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data);
    },
    {
      enabled: isAuthed,
    }
  );
}

export function useSearchBuckets(folder: string, file: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['bucket', folder, file],
    async () => {
      const { data } = await supabase.storage.from('patients').list(folder, {
        search: file,
      });

      return data;
    },
    {
      enabled: isAuthed,
    }
  );
}

export function useCouponCode(code: string | string[] | undefined | null) {
  const supabase = useSupabaseClient<Database>();
  const isAuthed = !!code;

  return useQuery(
    'couponCode',
    async () => {
      const { data: result } = await supabase
        .from('coupon_code')
        .select()
        .eq('code', code!)
        .single();

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useCouponCodeRedeem() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const isAuthed = !!user?.id;

  return useQuery(
    'couponCodeRedeem',
    async () => {
      const { data: result } = await supabase
        .from('coupon_code_redeem')
        .select('*, profiles(*), coupon_code(*)')
        .eq('profile_id', user?.id!)
        .eq('redeemed', false)
        .limit(1)
        .maybeSingle();

      return result as CouponCodeRedeemProps;
    },
    { enabled: isAuthed }
  );
}

export function useRedeemedCouponCode() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const isAuthed = !!user?.id;

  return useQuery(
    'redeemedCouponCode',
    async () => {
      const result = await supabase
        .from('coupon_code_redeem')
        .select('*, profiles(*), coupon_code(*)')
        .eq('profile_id', user?.id!)
        .then(({ data }) => data as CouponCodeRedeemProps[]);

      return result;
    },
    { enabled: isAuthed, cacheTime: 0 }
  );
}

export function usePatientCouponCodes() {
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const isAuthed = !!user?.id;

  return useQuery(
    'allCouponCodes',
    async () => {
      const result = await supabase
        .from('coupon_code_redeem')
        .select('*, profiles(*), coupon_code(*)')
        .eq('profile_id', user?.id!)
        .then(({ data }) => data as CouponCodeRedeemProps[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useActiveRegions() {
  const supabase = useSupabaseClient<Database>();

  return useQuery(
    'activeRegions',
    async () => {
      const { data: result } = await supabase
        .from('state')
        .select('abbreviation, name')
        .eq('active', true);

      return result;
    },
    { enabled: true }
  );
}

export function usePatientActionItems() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'actionItems',
    async () => {
      const { data: result } = await supabase
        .from('patient_action_item')
        .select('*')
        .eq('canceled', false)
        .eq('completed', false)
        .eq('patient_id', patient.data?.id!)
        .lte('created_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      const uniqItems = uniqBy(result, 'type');

      if (
        uniqItems.some(item => item.type === 'PRESCRIPTION_RENEWAL_REQUEST')
      ) {
        return uniqItems.filter(
          item => item.type !== 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST'
        );
      }

      return uniqItems;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export function useSpecificPatientActionItem(type: string) {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    ['specificActionItem', type],
    async () => {
      const { data: result } = await supabase
        .from('patient_action_item')
        .select('*')
        .eq('completed', true)
        .in('type', [type])
        .eq('patient_id', patient.data?.id!)
        .order('created_at', { ascending: false });

      const uniqItems = uniqBy(result, 'type');

      if (
        uniqItems.some(item => item.type === 'PRESCRIPTION_RENEWAL_REQUEST')
      ) {
        return uniqItems.filter(
          item => item.type !== 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST'
        );
      }

      return uniqItems;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export function usePatientCompoundOrders() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    ['compoundOrders'],
    async () => {
      const orders = await supabase
        .from('order')
        .select('*, prescription!inner(*)')
        .eq('patient_id', patient.data?.id!)
        .or('medication.ilike.%semaglutide%,medication.ilike.%tirzepatide%', {
          foreignTable: 'prescription',
        })
        .order('created_at', { ascending: false })
        .then(({ data }) => (data || []) as OrderPrescriptionProps[]);

      return orders;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export function usePatientOrders() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    ['orders'],
    async () => {
      const orders = await supabase
        .from('order')
        .select('*, prescription (*), prescription_request(*)')
        .eq('patient_id', patient.data?.id!)
        .order('created_at', { ascending: false })
        .then(({ data }) => data as OrderPrescriptionProps[]);

      return orders;
    },
    { enabled: isAuthed, staleTime: 0, cacheTime: 0 }
  );
}

export function useMatrixSheet() {
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'matrixData',
    async () => {
      const result = await axios.post('/api/google/get-spreadsheet-data', {
        sheetId: '1Qwrm0-MOVs9CakQWt7S_DubGgExYfWc-pUq25P5Q3SU',
        range: 'NEW MASTER WORKING OFF JAN 10!B2:N76',
      });
      return result;
    },
    { enabled: isAuthed, staleTime: Infinity }
  );
}

export function useCompoundMatrix() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'compoundMatrix',
    async () => {
      const result = await supabase
        .from('compound_matrix')
        .select(`*, compound_option(*, compound_medication(*))`, {
          count: 'exact',
        })
        .order('subscription_plan', { ascending: true })
        .order('current_month', { ascending: true })
        .then(({ data }) => (data || []) as any as CompoundMatrixProps[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function usePatientAuthorizeOrders() {
  //Fetches messages by group
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'authorizeOrders',
    async () => {
      const orders = await supabase
        .from('order')
        .select('*, prescription (*)')
        .eq('patient_id', patient.data?.id!)
        .eq('order_status', 'ORDER_PENDING_ACTION')
        .order('created_at', { ascending: false })
        .then(({ data }) => data as OrderPrescriptionProps[]);

      return orders;
    },
    { enabled: isAuthed }
  );
}

export function useAllClinicians() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;
  return useQuery(
    'allClinicians',
    async () => {
      const result = await supabase
        .from('clinician')
        .select(`*, profiles (*), state_clinician(*)`)
        .then(({ data }) => data as ClinicianProps[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useMessagesByGroup(
  group_id: number | undefined,
  pageSize: number = 10
) {
  const patient = usePatient();
  const isAuthed = !!patient.data?.id && !!group_id;

  return useInfiniteQuery(
    ['messagesByGroup', group_id],
    async ({ pageParam = 1 }) => {
      if (!group_id) return [];

      const { data: messages } = await axios.get(
        `/api/message/decrypt/${group_id}`,
        {
          params: { page: pageParam, pageSize: pageSize },
        }
      );

      // Custom sorting function
      function customSort(a: any, b: any) {
        if (a.display_at && b.display_at) {
          return a.display_at.localeCompare(b.display_at);
        } else if (a.display_at) {
          return a.display_at.localeCompare(b.created_at);
        } else if (b.display_at) {
          return a.created_at.localeCompare(b.display_at);
        } else {
          return a.created_at.localeCompare(b.created_at);
        }
      }

      // Sort and filter the messages
      const sortedData = messages?.sort(customSort);
      const filteredData = sortedData?.filter(
        (d: any) =>
          format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx") >
          format(new Date(d.display_at!), "yyyy-MM-dd'T'HH:mm:ssxxx")
      );

      return filteredData;
    },
    {
      enabled: isAuthed,
      getNextPageParam: (lastPage, allPages) => {
        const lastMessageCreatedAt =
          lastPage?.[lastPage.length - 1]?.created_at;
        return lastMessageCreatedAt ? allPages.length + 1 : null;
      },
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    }
  );
}

// export function useRatableCoachItems() {
//   const supabase = useSupabaseClient<Database>();
//   const patient = usePatient();
//   const isAuthed = !!patient.data?.id;

//   return useQuery(
//     ['rateCoaches'],
//     async () => {
//       const actionItems = await supabase
//         .from('patient_action_item')
//         .select('*')
//         .eq('patient_id', patient?.data?.id!)
//         .eq('type', 'RATE_COACH')
//         .lte('created_at', new Date().toISOString())
//         .eq('completed', false)
//         .order('created_at', { ascending: false })
//         .then(({ data }) => data as PatientActionItem[]);
//       console.log(actionItems, 'AI');
//       return actionItems;
//     },
//     { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
//   );
// }

export const useHasUnseenMessages = () => {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient?.data?.id && !!patient?.data?.profile_id;

  return useQuery(
    'useHasUnseenMessages',
    async () => {
      const unseenMessages = await supabase
        .from('messages-v2')
        .select('id, display_at, messages_group_id')
        .neq('visible', false)
        .eq('recipient', patient?.data?.profile_id!)
        .eq('has_seen', false);

      // Filter for either null or timestamp not in the future
      const parsedUnseenMessages = (unseenMessages.data || []).filter(
        message =>
          message.display_at === null ||
          new Date(message.display_at).getTime() <= new Date().getTime()
      );

      return { data: parsedUnseenMessages };
    },
    { enabled: isAuthed }
  );
};

export function usePromoTextValues(key: string) {
  const supabase = useSupabaseClient<Database>();

  return useQuery(
    ['promoBannerText', key],
    async () => {
      if (!key) {
        throw new Error('Key is required');
      }

      // Query for a single key
      return supabase
        .from('promo_banner_text')
        .select('key, text')
        .eq('key', key)
        .single()
        .then(({ data }) => data?.text || '');
    },
    { enabled: !!key }
  );
}

export function usePromoValues(key: string) {
  const supabase = useSupabaseClient<Database>();

  return useQuery(
    ['promoBannerText', key],
    async () => {
      if (!key) {
        throw new Error('Key is required');
      }

      // Query for a single key
      return supabase
        .from('promo_banner_text')
        .select('key, text, countdown')
        .eq('key', key)
        .single()
        .then(({ data }) => data);
    },
    { enabled: !!key }
  );
}

export const useCreateProviderTask = () => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  type queryObj = {
    task_type: string;
    patient_id: number;
    queue_type: string;
    note?: string;
    visible?: boolean;
    priority_level?: 0 | 1;
  };

  return useCallback(
    async (taskType: string, note?: string) => {
      const isBundled = await supabase
        .from('patient_subscription')
        .select('patient_id')
        .eq('patient_id', patient?.id!)
        .in('price', [297, 217, 446, 349, 449, 718])
        .then(({ data }) => !!(data || []).length);

      let queueType = 'Provider (QA)';

      if (!taskType.includes('PRESCRIPTION')) {
        queueType = 'Provider';
      }

      const queryObj: queryObj = {
        task_type: taskType,
        patient_id: patient!.id,
        queue_type: queueType,
        priority_level: taskType === 'SIDE_EFFECT' ? 1 : 0,
      };
      if (note) queryObj.note = note;

      const query = await supabase
        .from('task_queue')
        .insert(queryObj)
        .select()
        .maybeSingle()
        .then(({ data }) => data);

      return query;
    },
    [patient]
  );
};

export function useIsBundled() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['isBundled', patient?.id],
    async () => {
      return supabase
        .from('patient_subscription')
        .select('patient_id')
        .eq('patient_id', patient?.id!)
        .in('price', [297, 217, 446, 349, 449, 718, 249])
        .then(({ data }) => !!(data || []).length);
    },
    { enabled: isAuthed }
  );
}

export function useClinicFavorites(medicationQuantityId: number) {
  const supabase = useSupabaseClient<Database>();
  return useQuery(['clinicFavorites', medicationQuantityId], async () => {
    return supabase
      .from('clinic_favorites')
      .select('*')
      .eq('medication_quantity_id', medicationQuantityId)
      .throwOnError()
      .then(({ data }) => data || []);
  });
}

export function useVWOVariationName(campaignKey: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!campaignKey && !!patient?.profile_id;
  return useQuery(
    ['VWOVariationName', campaignKey],
    async () => {
      const abCampaignUser = await supabase
        .from('ab_campaign_user')
        .select('*')
        .eq('profile_id', patient?.profile_id!)
        .eq('campaign_key', campaignKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => data);
      return abCampaignUser;
    },
    { enabled: isAuthed }
  );
}

export function useABZVariationName(campaignKey: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed =
    !!patient?.profile_id && !!campaignKey && !!patient?.profile_id;
  return useQuery(
    ['useABZVariationName', campaignKey],
    async () => {
      const abCampaignUser = await supabase
        .from('ab_zealthy_user_variation')
        .select('variation_name')
        .eq('campaign_key', campaignKey)
        .eq('profile_id', patient?.profile_id!)
        .single()
        .then(({ data }) => data);

      return {
        variation_name: abCampaignUser?.variation_name,
      };
    },
    { enabled: isAuthed }
  );
}

export function usePreferredPharmacy() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(
    ['preferredPharmacy'],
    async () => {
      const pharmacy = await supabase
        .from('patient_pharmacy')
        .select('name')
        .eq('patient_id', patient?.id!)
        .single()
        .then(({ data }) => data);

      return pharmacy?.name;
    },
    { enabled: !!patient?.id }
  );
}

export function usePharmacyTurnAroundTimeSingle(
  pharmacy:
    | 'Belmar'
    | 'Empower'
    | 'GoGoMeds'
    | 'Hallandale'
    | 'Revive'
    | 'Tailor-Made'
) {
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!pharmacy;
  const supabase = useSupabaseClient();

  async function fetchLatestBacklog(
    pharmacy: 'Belmar' | 'Empower' | 'GGM' | 'Hallandale' | 'Revive' | 'TMC'
  ) {
    const latestBacklog = await supabase
      .from('systematic_backlog')
      .select('oldest_systematic_order')
      .eq('pharmacy', pharmacy)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data?.oldest_systematic_order ?? '');

    return format(parseISO(latestBacklog), 'MM-dd-yyyy');
  }

  const pharmacyMap: {
    [key: string]:
      | 'Belmar'
      | 'Empower'
      | 'GGM'
      | 'Hallandale'
      | 'Revive'
      | 'TMC';
  } = {
    Belmar: 'Belmar',
    Empower: 'Empower',
    GoGoMeds: 'GGM',
    Hallandale: 'Hallandale',
    Revive: 'Revive',
    'Tailor-Made': 'TMC',
  };
  return useQuery(
    ['pharmacyTurnAroundTimeSingle', pharmacy],
    async () => {
      const latestBacklog = await fetchLatestBacklog(pharmacyMap[pharmacy]);
      return latestBacklog;
    },
    { enabled: isAuthed, staleTime: Infinity }
  );
}

export function usePharmacyTurnAroundTimeAll() {
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  const supabase = useSupabaseClient();

  async function fetchLatestBacklog(pharmacy: string) {
    const latestBacklog = await supabase
      .from('systematic_backlog')
      .select('oldest_systematic_order')
      .eq('pharmacy', pharmacy)
      .order('week_start', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    return latestBacklog;
  }

  return useQuery(
    'pharmacyTurnAroundTime',
    async () => {
      const belmarPromise = fetchLatestBacklog('Belmar').then(data => {
        return data?.oldest_systematic_order
          ? format(parseISO(data.oldest_systematic_order), 'MM-dd-yyyy')
          : '';
      });

      const tmcPromise = fetchLatestBacklog('TMC').then(data => {
        return data?.oldest_systematic_order
          ? format(parseISO(data.oldest_systematic_order), 'MM-dd-yyyy')
          : '';
      });

      const ggmPromise = fetchLatestBacklog('GGM').then(data => {
        return data?.oldest_systematic_order
          ? format(parseISO(data.oldest_systematic_order), 'MM-dd-yyyy')
          : '';
      });

      const hallandalePromise = fetchLatestBacklog('Hallandale').then(data => {
        return data?.oldest_systematic_order
          ? format(parseISO(data.oldest_systematic_order), 'MM-dd-yyyy')
          : '';
      });

      const revivePromise = fetchLatestBacklog('Revive').then(data => {
        return data?.oldest_systematic_order
          ? format(parseISO(data.oldest_systematic_order), 'MM-dd-yyyy')
          : '';
      });

      const empowerPromise = fetchLatestBacklog('Empower').then(data => {
        return data?.oldest_systematic_order
          ? format(parseISO(data.oldest_systematic_order), 'MM-dd-yyyy')
          : '';
      });

      const results = await Promise.all([
        belmarPromise,
        tmcPromise,
        ggmPromise,
        hallandalePromise,
        revivePromise,
        empowerPromise,
      ]);

      const [
        BelmarTat,
        TMCTat,
        GoGoMedsTat,
        HallandaleTat,
        ReviveTat,
        EmpowerTat,
      ] = results;

      return {
        Belmar: BelmarTat,
        Empower: EmpowerTat,
        Hallandale: HallandaleTat,
        GoGoMeds: GoGoMedsTat,
        Revive: ReviveTat,
        'Tailor-Made': TMCTat,
      } as { [key: string]: string };
    },
    { enabled: isAuthed }
  );
}

export function usePatientIntakes() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(['patientIntakes'], async () => {
    const intakes = await supabase
      .from('online_visit')
      .select('*, questionnaire_response!inner(*)')
      .eq('patient_id', patient?.id!)
      .then(({ data }) => data);

    return intakes;
  });
}

export function usePatientAppointment(id: number) {
  const supabase = useSupabaseClient<Database>();

  return useQuery(['appointment', id], async () => {
    return supabase
      .from('appointment')
      .select('*')
      .eq('id', id)
      .throwOnError()
      .maybeSingle()
      .then(({ data }) => data);
  });
}

export function useLiveVisitAvailability(isEnabled = true) {
  const { availability } = useTreatMeNow();

  return useQuery(
    ['liveVisit'],
    async () => {
      return availability().then(({ data }) => data);
    },
    {
      enabled: isEnabled,
    }
  );
}

export function usePatientZealthyRating() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['subscriberFeedback'],
    async () => {
      const feedback = await supabase
        .from('subscriber_feedback')
        .select('*')
        .eq('patient_id', patient?.id!)
        .then(({ data }) => data);
      return feedback;
    },
    { enabled: isAuthed }
  );
}

export function usePatientAppointments() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['appointment', patient?.id],
    async () => {
      return supabase
        .from('appointment')
        .select('*')
        .eq('patient_id', patient?.id!)
        .order('created_at', { ascending: false })
        .then(({ data }) => data);
    },
    { enabled: isAuthed }
  );
}

export function useAudits() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!patient?.profile_id;

  return useQuery(
    ['audit', patient?.id],
    async () => {
      return supabase
        .from('audit')
        .select('*')
        .eq('reviewer_id', patient?.profile_id!)
        .eq('is_patient', true)
        .then(({ data }) => data);
    },
    { enabled: isAuthed }
  );
}

export function useNotifications(type: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!patient?.profile_id;

  return useQuery(
    ['notifications', patient?.id, type],
    async () => {
      return supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', patient?.profile_id!)
        .eq('type', type)
        .limit(1)
        .single()
        .then(({ data }) => data);
    },
    { enabled: isAuthed }
  );
}

export function useFutureNotifications(type: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id && !!patient?.profile_id;

  return useQuery(
    ['notifications', patient?.id, type],
    async () => {
      return supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', patient?.profile_id!)
        .eq('type', type)
        .eq('is_read', false)
        .lt('skip_count', 3)
        .limit(1)
        .order('display_at', { ascending: true })
        .single()
        .then(({ data }) => data);
    },
    { enabled: isAuthed }
  );
}

type ClinicianProfile = {
  profile_id: string;
  profile: {
    first_name: string;
    last_name: string;
  } | null;
};

type PatientCareTeamRow = {
  clinician_id: number | null;
  clinician: ClinicianProfile | ClinicianProfile[] | null;
};

//check this function in code review
export function usePatientCoach() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['patient_coach', patient?.id],
    async () => {
      if (!patient?.id) {
        return null;
      }

      const { data, error } = await supabase
        .from('patient_care_team')
        .select(
          `id, clinician_id,
          clinician:clinician(
            profile_id,
            profile:profile_id(
              first_name, last_name
            )
          )`
        )
        .eq('patient_id', patient?.id)
        .or('role.eq.Mental Health Coach,role.eq.Weight Loss Coach');

      if (error) {
        throw new Error(`Error fetching patient's coach: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return null;
      }

      const firstRow = data?.[0] as PatientCareTeamRow;
      const clinicianData = Array.isArray(firstRow.clinician)
        ? firstRow.clinician[0]
        : firstRow.clinician;

      if (!clinicianData || !clinicianData.profile) {
        return null;
      }

      const profile = clinicianData.profile;

      return {
        clinician_id: firstRow.clinician_id,
        profile_id: clinicianData.profile_id,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
      };
    },
    {
      enabled: isAuthed,
    }
  );
}

export function usePatientLabOrders() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['patientLabOrder', patient?.id],
    async () => {
      const result = await supabase
        .from('lab_order')
        .select(`*`)
        .eq('patient_id', patient?.id!)
        .order('created_at', { ascending: false })
        .then(({ data }) => data as LabOrder[]);

      return result;
    },
    { enabled: isAuthed }
  );
}

export type Faxes = Database['public']['Tables']['faxes']['Row'];
export type FaxesProps = Faxes & { patient: { profiles: { email: string } } };

export function useAllFaxes(filters?: { status: string[] }) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    'faxes',
    async () => {
      let query = supabase.from('faxes').select(`*, patient(profiles(email))`, {
        count: 'exact',
      });

      if (filters?.status?.length) {
        query = query.in('fax_status', filters?.status);
      }

      const result = await query.order('created_at', { ascending: false }).then(
        ({ data, count }) =>
          ({ data, count } as any as {
            data: FaxesProps[];
            count: number;
          })
      );

      return result;
    },
    { enabled: isAuthed }
  );
}

export function useDaysSinceLastAppointment(care: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['days_since_appointment', patient?.id, care],
    async () => {
      if (!patient?.id) return false;
      const appointment = await supabase
        .from('appointment')
        .select('*')
        .eq('patient_id', patient?.id!)
        .eq('appointment_type', 'Provider')
        .eq('care', care)
        .order('ends_at', { ascending: false })
        .limit(1)
        .then(({ data }) => data as any);

      if (appointment.length === 0) return false;

      const latestAppointmentDate = new Date(appointment[0].ends_at);
      const currDate = new Date();
      const differenceInDays = Math.floor(
        (currDate.getTime() - latestAppointmentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (appointment[0].status === 'Completed') {
        return differenceInDays;
      }
      return 0;
    },
    { enabled: isAuthed }
  );
}

export function usePsychiatryAppointments() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(
    ['recent_psychiatry_appointments', patient?.id],
    async () => {
      const { data: appointments } = await supabase
        .from('appointment')
        .select()
        .eq('patient_id', patient?.id!)
        .eq('appointment_type', 'Provider')
        .eq('care', 'Anxiety or depression')
        .order('created_at', { ascending: false });
      return appointments;
    },
    { enabled: isAuthed }
  );
}

export function useLastAppointment(care: string, order: string = 'created_at') {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['last_appointment', care],
    async () => {
      //@ts-ignore
      const { data: appointment, error } = await supabase
        .from('appointment')
        .select()
        .eq('patient_id', patient?.id!)
        .eq('appointment_type', 'Provider')
        .eq('care', care)
        .order(order, { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) console.error('Supabase Error:', error);
      console.log('Fetched appointment:', appointment);

      return appointment;
    },
    {
      enabled: isAuthed,
      staleTime: 0,
      cacheTime: 0,
      retry: false,
    }
  );
}

export function useStripeSubscription(referenceId: string) {
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['stripeSubscription', referenceId],
    async () => {
      const { data: subscriptionData } = await axios.post(
        '/api/service/payment/get-subscription',
        {
          subscriptionId: referenceId,
        }
      );
      return subscriptionData;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

export function useIsFirstAppointment(care: string) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(
    ['is_first_appointment', patient?.id, care],
    async () => {
      const { data: appointment } = await supabase
        .from('appointment')
        .select()
        .eq('patient_id', patient?.id!)
        .eq('appointment_type', 'Provider')
        .eq('care', care)
        .eq('status', 'Completed');

      return appointment?.length === 0;
    },
    { enabled: isAuthed }
  );
}

export function usePatientInvoices(amountPaid: number) {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    'patientInvoices',
    async () => {
      const result = await supabase
        .from('invoice')
        .select('*')
        .eq('patient_id', patient.data?.id!)
        .eq('status', 'paid')
        .eq('amount_paid', amountPaid)
        .then(({ data }) => (data || []) as Invoice[]);

      return result;
    },
    { enabled: isAuthed, cacheTime: 0, staleTime: 0 }
  );
}

export function useIsEligibleForZealthy10() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { data: patientPriorAuth } = usePatientPriorAuths();
  const { data: weightLossSubscription, refetch } = useWeightLossSubscription();
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { variant } = useIntakeState();
  const compoundPatientPrescriptions = patientPrescriptions?.filter(
    presc => presc.medication_quantity_id === 98
  );
  const isAuthed = !!patient?.id;

  return useQuery(
    [
      'isEligibleForZealthy10',
      patient?.id!,
      weightLossSubscription,
      compoundPatientPrescriptions,
      patientPriorAuth,
    ],
    async () => {
      const existingCoupon = await supabase
        .from('coupon_code_redeem')
        .select('*')
        .eq('profile_id', patient?.profile_id!)
        .eq('code', 'ZEALTHY10')
        .then(data => data.data);
      if (
        existingCoupon?.length! > 0 &&
        existingCoupon?.some(coupon => !coupon.redeemed)
      ) {
        return true;
      }
      // Patient is not eligible if all coupons with code are redeemed
      else if (
        existingCoupon?.length! > 0 &&
        existingCoupon?.every(coupon => coupon.redeemed)
      ) {
        return false;
      }

      const now = new Date();
      const sixtyDaysAgo = subDays(now, 60);
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      if (patientPriorAuth) {
        const paDeniedInstances = patientPriorAuth.filter(
          (auth: PriorAuth) =>
            auth.status === 'PA Denied' &&
            isAfter(new Date(auth.created_at), sixtyDaysAgo)
        );

        const hasSamePrescriptionReqId = paDeniedInstances.some(
          (auth: PriorAuth, index: number, self: PriorAuth[]) =>
            self.some(
              (a: PriorAuth, i: number) =>
                i !== index &&
                a.prescription_request_id === auth.prescription_request_id
            )
        );

        if (hasSamePrescriptionReqId) {
          const mostRecentDenial = paDeniedInstances.reduce((latest, current) =>
            isAfter(new Date(current.created_at), new Date(latest.created_at))
              ? current
              : latest
          );

          const fifteenDaysAgo = subDays(now, 15);
          const isWithinFifteenDays = isAfter(
            new Date(mostRecentDenial.created_at),
            fifteenDaysAgo
          );

          if (
            isWithinFifteenDays &&
            compoundPatientPrescriptions?.length === 0
          ) {
            return true;
          }
        }
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const weightLossVisits = await supabase
        .from('online_visit')
        .select(`*`)
        .eq('specific_care', 'Weight loss')
        .is('potential_insurance', null)
        .eq('patient_id', patient?.id!)
        .lte('paid_at', sevenDaysAgo.toISOString())
        .then(data => data.data);

      if (
        weightLossVisits?.length! > 0 &&
        compoundPatientPrescriptions?.length === 0
      ) {
        return true;
      }

      if ([297, 449].includes(weightLossSubscription?.price || 0)) return;

      if (variant === 'cancellation-discount') {
        return true;
      }

      return false;
    },
    { enabled: isAuthed, cacheTime: 0, staleTime: 0 }
  );
}

export function useAllPatientInvoices() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;

  return useQuery(
    ['allPatientInvoices', patient?.id],
    async () => {
      const result = await supabase
        .from('invoice')
        .select('*')
        .eq('patient_id', patient?.id!)
        .then(({ data }) => (data || []) as Invoice[]);

      return result;
    },
    { enabled: isAuthed, cacheTime: 0, staleTime: 0 }
  );
}

export function use85521PatientLogic() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(
    ['isPatient85521', patient?.id],
    async () => {
      if (!patient?.id) {
        return { is85521: false };
      }
      try {
        // Step 1: Get prescriptions with non-null matrix_id and duration_in_days for this patient
        const { data: prescriptions, error: prescriptionsError } =
          await supabase
            .from('prescription')
            .select('id, matrix_id, duration_in_days')
            .eq('patient_id', patient?.id)
            .not('matrix_id', 'is', null);
        if (
          prescriptionsError ||
          !prescriptions ||
          prescriptions.length === 0
        ) {
          return { is85521: false };
        }
        // Get prescription IDs
        const prescriptionIds = prescriptions.map(p => p.id);
        // Step 2: Find the most recent order with a non-null tracking number
        const { data: orders, error: ordersError } = await supabase
          .from('order')
          .select('id, prescription_id, date_shipped')
          .in('prescription_id', prescriptionIds)
          .not('tracking_number', 'is', null)
          .order('date_shipped', { ascending: false })
          .limit(1);
        if (ordersError || !orders || orders.length === 0) {
          return { is85521: false };
        }
        const mostRecentOrder = orders[0];
        // Step 3: Find the prescription for this order
        const relevantPrescription = prescriptions.find(
          p => p.id === mostRecentOrder.prescription_id
        );
        if (!relevantPrescription || relevantPrescription.matrix_id === null) {
          return { is85521: false };
        }

        // Step 4: Calculate the order age
        if (!mostRecentOrder.date_shipped) {
          return { is85521: false };
        }
        const updatedAt = new Date(mostRecentOrder.date_shipped);
        const now = new Date();
        const ageInDays = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Step 5: Determine eligibility based on duration and age
        let is85521 = false;
        if (relevantPrescription.duration_in_days) {
          switch (relevantPrescription.duration_in_days) {
            case 30: // 1 month
              is85521 = ageInDays < 10;
              break;
            case 90: // 3 months
              is85521 = ageInDays < 30;
              break;
            case 180: // 6 months
              is85521 = ageInDays < 60;
              break;
            case 360: // 12 months
              is85521 = ageInDays < 100;
              break;
          }
        }
        return { is85521 };
      } catch (error) {
        console.error('Error in 85521 patient logic:', error);
        return { is85521: false };
      }
    },
    { enabled: isAuthed, cacheTime: 0, staleTime: 0 }
  );
}

export function useSpecificCares() {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(
    ['specificCares', patient?.id],
    async () => {
      if (!patient?.id) {
        return [] as string[];
      }

      const { data, error } = await supabase
        .from('patient_cares')
        .select('cares')
        .eq('patient_id', patient.id)
        .maybeSingle();

      if (error || !data || !data.cares) {
        return [] as string[];
      }

      const caresArray = data.cares as (string | null)[];

      const specificCares = caresArray.filter(
        (item): item is string => item !== null && item !== undefined
      );

      return specificCares;
    },
    { enabled: isAuthed, cacheTime: 0, staleTime: 0 }
  );
}

export function useCompoundMatrixDurationByPrice(price: number) {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const isAuthed = !!patient?.id;
  return useQuery(
    'compoundMatrixDuration',
    async () => {
      const result = await supabase
        .from('compound_matrix')
        .select('duration_in_days')
        .eq('price', price)
        .limit(1)
        .single()
        .then(({ data }) => (data || '') as String);

      return result;
    },
    { enabled: isAuthed }
  );
}

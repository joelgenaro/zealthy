import {
  PrescriptionRequestProps,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useVisitState } from '@/components/hooks/useVisit';
import { DeliveryAddressForm } from '@/components/shared/DeliveryAddress';
import { useApi } from '@/context/ApiContext';
import { Database } from '@/lib/database.types';
import { Endpoints } from '@/types/endpoints';
import { Pathnames } from '@/types/pathnames';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router, { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { supabaseClient } from '@/lib/supabaseClient';
import { useStripe } from '@stripe/react-stripe-js';

type UpdatePrescriptionOptions = {
  newPRStatus: string;
  task?: Database['public']['Tables']['task_queue']['Insert'];
};

interface CrossCheckVerificationProps {
  nextPage: (nextPage?: string) => void;
}

export interface FormAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
}

const CrossCheckVerification = ({ nextPage }: CrossCheckVerificationProps) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const api = useApi();
  const { specificCare, potentialInsurance } = useIntakeState();
  const { id: visit_id } = useVisitState();
  const profile = patient?.profiles;
  const router = useRouter();
  const stripe = useStripe();
  const [loading, setLoading] = useState<boolean>(false);
  const [canRedirect, setCanRedirect] = useState<boolean>(false);
  const { data: variant8205 } = useVWOVariationName('8205');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [notVerifiedEventFired, setNotVerifiedEventFired] =
    useState<boolean>(false);
  const [verifiedEventFired, setVerifiedEventFired] = useState<boolean>(false);

  const trackVerificationComplete = useCallback(() => {
    if (
      variant8205?.variation_name === 'Variation-3' &&
      !verifiedEventFired &&
      typeof window !== 'undefined'
    ) {
      if (window?.freshpaint) {
        window.freshpaint.track('nonwl-completed-ID-verification');
        console.log('CrossCheck - Tracked: nonwl-completed-ID-verification');
        setVerifiedEventFired(true);
      }

      // Clear the not-verified timer since verification succeeded here
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [variant8205, verifiedEventFired]);

  useEffect(() => {
    if (
      variant8205?.variation_name === 'Variation-3' &&
      patient &&
      (patient.has_verified_identity || patient.vouched_verified) &&
      !verifiedEventFired
    ) {
      trackVerificationComplete();
    }
  }, [patient, variant8205, verifiedEventFired, trackVerificationComplete]);

  const updatePrescriptionRequest = useCallback(
    async (options: UpdatePrescriptionOptions) => {
      return supabase
        .from('prescription_request')
        .update({
          status: options.newPRStatus,
        })
        .eq('status', 'PRE_INTAKES')
        .eq('patient_id', patient?.id!)
        .select('*')
        .then(({ data }) => (data || []) as PrescriptionRequestProps[])
        .then(async req => {
          await Promise.all(
            req.map(async r => {
              if (options.task) {
                const addToQueue = await supabase
                  .from('task_queue')
                  .insert(options.task)
                  .select()
                  .maybeSingle()
                  .then(({ data }) => data);
                await supabase
                  .from('prescription_request')
                  .update({ queue_id: addToQueue?.id })
                  .eq('id', r?.id);
              }
            })
          );

          return req;
        });
    },
    [patient?.id, profile?.email, supabase]
  );

  const onSuccess = useCallback(async () => {
    if (!patient?.id) {
      return;
    }

    return api
      .post<{ isOlderThan24: boolean; verified: boolean }>(
        Endpoints.IDENTITY_CROSS_CHECK,
        {
          patientId: patient?.id!,
        }
      )
      .then(async ({ data }) => {
        if (
          variant8205?.variation_name === 'Variation-3' &&
          data.verified &&
          !verifiedEventFired
        ) {
          trackVerificationComplete();
        }

        if (specificCare === 'Preworkout') {
          await updatePrescriptionRequest({
            newPRStatus: 'REQUESTED',
            task: {
              task_type: 'PRESCRIPTION_REQUEST',
              patient_id: patient?.id,
              queue_type: 'Provider (QA)',
            },
          }).then(async () => {
            if (visit_id) {
              await supabase
                .from('online_visit')
                .update({ requested_prescription: true })
                .eq('id', visit_id);
            }
          });
        }

        if (data.isOlderThan24 && data.verified) {
          nextPage();
          return;
        }

        if (!data.isOlderThan24) {
          nextPage('V_IDENTITY_Q3');
          return;
        }

        return nextPage('V_IDENTITY_Q2');
      })
      .catch(e => {
        nextPage('V_IDENTITY_Q3');
      });
  }, [
    api,
    nextPage,
    patient?.id,
    specificCare,
    variant8205?.variation_name,
    visit_id,
    verifiedEventFired,
    updatePrescriptionRequest,
    supabase,
    trackVerificationComplete,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      patient?.has_verified_identity ||
      patient?.vouched_verified ||
      notVerifiedEventFired ||
      verifiedEventFired ||
      variant8205?.variation_name !== 'Variation-3'
    ) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (window?.freshpaint) {
        if (
          !patient?.has_verified_identity &&
          !patient?.vouched_verified &&
          !notVerifiedEventFired &&
          !verifiedEventFired
        ) {
          window.freshpaint.track('nonwl-purchased-but-not-verified');
          console.log('CrossCheck - Tracked: nonwl-purchased-but-not-verified');
          setNotVerifiedEventFired(true);
        }
      }
    }, 10000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [patient, variant8205, notVerifiedEventFired, verifiedEventFired]);

  useEffect(() => {
    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      ![
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
      canRedirect
    ) {
      onSuccess();
    }
  }, [specificCare, potentialInsurance, patient?.id, canRedirect, onSuccess]);

  useEffect(() => {
    if (router.query['payment_intent_client_secret'] !== undefined) {
      setLoading(true);
    } else {
      setCanRedirect(true);
    }
    const getPiInfo = async () => {
      if (!router || !stripe) return;
      const data = await stripe.retrievePaymentIntent(
        router.query['payment_intent_client_secret'] as string
      );

      const klarnaErrors = [
        'Customer cancelled checkout on Klarna',
        'Customer was declined by Klarna',
        'Klarna checkout was not completed and has expired',
      ];

      // Check if Klarna Payment was cancelled
      const cancelledKlarnaPayment = klarnaErrors.includes(
        data?.paymentIntent?.last_payment_error?.message || ''
      );

      // If so, delete the prescription request and go back to payment page
      if (cancelledKlarnaPayment) {
        await supabaseClient
          .from('prescription_request')
          .delete()
          .eq('uncaptured_payment_intent_id', router.query['payment_intent']!)
          .select();

        if (router.query['redirect-if-failed'] !== undefined) {
          const redirect = (
            router.query['redirect-if-failed'] as string
          ).replaceAll('~', '&');
          console.log(redirect);
          router.push(redirect);
        }
      } else {
        setLoading(false);
        setCanRedirect(true);
      }
    };
    getPiInfo();
  }, [
    router.query['payment_intent'],
    router.query['payment_intent_client_secret'],
    router.query['redirect-if-failed'],
    stripe,
    supabaseClient,
    router,
  ]);

  useEffect(() => {
    if (patient?.vouched_verified && specificCare === 'Preworkout') {
      if (
        variant8205?.variation_name === 'Variation-3' &&
        !verifiedEventFired
      ) {
        trackVerificationComplete();
      }

      updatePrescriptionRequest({
        newPRStatus: 'REQUESTED',
        task: {
          task_type: 'PRESCRIPTION_REQUEST',
          patient_id: patient?.id,
          queue_type: 'Provider (QA)',
        },
      })
        .then(async () => {
          if (visit_id) {
            await supabase
              .from('online_visit')
              .update({ requested_prescription: true })
              .eq('id', visit_id);
          }
        })
        .finally(() => Router.push(Pathnames.POST_CHECKOUT_COMPLETE_VISIT));
    }
  }, [
    patient?.vouched_verified,
    specificCare,
    visit_id,
    updatePrescriptionRequest,
    supabase,
    variant8205?.variation_name,
    verifiedEventFired,
    trackVerificationComplete,
  ]);

  if (!patient) {
    return null;
  }

  if (
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    ![
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
  ) {
    return <Loading />;
  }

  if (loading || !stripe || !router || !supabaseClient) {
    return <Loading />;
  }

  return <DeliveryAddressForm onSuccess={onSuccess} patient={patient} />;
};

export default CrossCheckVerification;

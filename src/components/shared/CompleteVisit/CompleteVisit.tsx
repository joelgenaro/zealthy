import {
  PrescriptionRequestProps,
  useAllPatientPrescriptionRequest,
  useAllVisiblePatientSubscription,
} from '@/components/hooks/data';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useFlowState } from '@/components/hooks/useFlow';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useSelector } from '@/components/hooks/useSelector';
import { useVisitAsync, useVisitSelect } from '@/components/hooks/useVisit';
import Loading from '@/components/shared/Loading/Loading';
import { useABTest } from '@/context/ABZealthyTestContext';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { useVWO } from '@/context/VWOContext';
import { Database } from '@/lib/database.types';
import { supabaseClient } from '@/lib/supabaseClient';
import { Pathnames } from '@/types/pathnames';
import { calculatePatientStatus } from '@/utils/calculatePatientStatus';
import {
  compoundPrescriptionRequestedEvent,
  prescriptionRenewalFinishedEvent,
  prescriptionRequestedEvent,
  prescriptionRequestedFirstTimeEvent,
  PurchaseOpipPostCheckoutEvent,
} from '@/utils/freshpaint/events';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { addDays } from 'date-fns';
import { rename } from 'fs';
import Router from 'next/router';
import { memo, useCallback, useEffect, useState } from 'react';

interface CompleteVisitProps {
  nextPage?: () => void;
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}

const weightLossCare = [
  SpecificCareOption.WEIGHT_LOSS,
  SpecificCareOption.WEIGHT_LOSS_ACCESS,
  SpecificCareOption.WEIGHT_LOSS_ACCESS_V2,
];

type UpdatePrescriptionOptions = {
  newPRStatus: string;
  task?: Database['public']['Tables']['task_queue']['Insert'];
};

const CompleteVisit = ({ nextPage, patient, profile }: CompleteVisitProps) => {
  const supabase = useSupabaseClient<Database>();
  const visit_id = useVisitSelect(visit => visit.id);
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const calculatedSpecificCare = useCalculateSpecificCare();
  const { updateOnlineVisit } = useVisitAsync();
  const { updatePatient } = usePatientAsync();
  const { updateActionItem } = useMutatePatientActionItems();
  const submitQuestionnaireResponses = useQuestionnaireResponses();
  const { data: subscriptions, isLoading: subsLoading } =
    useAllVisiblePatientSubscription();
  const coaching = useSelector(store => store.coaching);
  const vwo = useVWO();
  const ABZTest = useABTest();
  const { data: patientPrescriptionRequests } =
    useAllPatientPrescriptionRequest();
  const [mobileActionItemCreated, setMobileActionItemCreated] = useState(false);
  const { currentFlow } = useFlowState();

  const isWeightLoss =
    weightLossCare.includes(specificCare || SpecificCareOption.DEFAULT) ||
    weightLossCare.includes(calculatedSpecificCare);

  const updatePrescriptionRequest = useCallback(
    async (options: UpdatePrescriptionOptions) => {
      const { data: hasQuantity98, error: checkError } = await supabase
        .from('prescription_request')
        .select('id')
        .eq('patient_id', patient.id)
        .eq('medication_quantity_id', 98)
        .limit(1);

      if (checkError) {
        console.error('Error checking for compound med:', checkError);
      }

      // Only show Wegovy if weight loss AND no compound requested
      if (
        isWeightLoss &&
        (!hasQuantity98 || hasQuantity98.length === 0) &&
        potentialInsurance !== 'Semaglutide Bundled Oral Pills'
      ) {
        await supabase
          .from('prescription_request')
          .update({ is_visible: true })
          .eq('patient_id', patient.id)
          .eq('specific_medication', 'Wegovy')
          .select();
      } else {
        await supabase
          .from('prescription_request')
          .update({ is_visible: true })
          .eq('patient_id', patient.id)
          .eq('is_visible', false)
          .is('uncaptured_payment_intent_id', null)
          .neq('specific_medication', 'Wegovy')
          .select();
      }

      // Mark request visible if patient paid with klarna
      const request = await supabase
        .from('prescription_request')
        .update({ is_visible: true })
        .eq('patient_id', patient.id)
        .not('uncaptured_payment_intent_id', 'is', null)
        .select('*')
        .then(({ data }) => (data || []) as PrescriptionRequestProps[]);

      if (
        !patient.has_verified_identity &&
        request.some(req => req.note?.includes('3 months'))
      ) {
        // do nun
      }

      return supabase
        .from('prescription_request')
        .update({
          status: options.newPRStatus,
        })
        .eq('status', 'PRE_INTAKES')
        .eq('patient_id', patient.id)
        .select('*')
        .then(({ data }) => (data || []) as PrescriptionRequestProps[])
        .then(async req => {
          prescriptionRequestedFirstTimeEvent(
            profile.email!,
            medicationAttributeName(
              req[0]?.specific_medication! || req[0]?.note!,
              specificCare!
            ),
            req?.[0]?.note?.includes('3 months') ? '3-month' : '1-month'
          );
          if (
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            req.some(
              r =>
                ['semaglutide', 'tirzepatide'].includes(
                  r.specific_medication?.toLowerCase() ?? ''
                ) ||
                ['semaglutide', 'tirzepatide'].includes(
                  r.note?.toLowerCase() ?? ''
                )
            ) &&
            potentialInsurance !==
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
          ) {
            compoundPrescriptionRequestedEvent(
              profile.email!,
              medicationAttributeName(
                req[0]?.specific_medication! || req[0]?.note!,
                specificCare
              ),
              req?.[0]?.note?.includes('3 months') ? '3-month' : '1-month'
            );
          }

          if (
            req[0]?.type === 'Enclomiphene' &&
            req[0]?.quantity === 365 &&
            patient
          ) {
            window.VWO.event('twelveMonthEnclomipheneRequested');
            await Promise.allSettled([
              vwo?.track('7865_3', 'twelveMonthEnclomipheneRequested', patient),
              vwo?.track('8205', 'twelveMonthEnclomipheneRequested', patient),
            ]);
          } else if (
            req[0]?.type === 'Enclomiphene' &&
            req[0]?.quantity === 90 &&
            patient
          ) {
            window.VWO.event('threeMonthEnclomipheneRequested');
            await Promise.all([
              vwo?.track('7865_3', 'threeMonthEnclomipheneRequested', patient),
              vwo?.track('8205', 'threeMonthEnclomipheneRequested', patient),
            ]);
          } else if (
            req[0]?.type === 'Enclomiphene' &&
            req[0]?.quantity === 30 &&
            patient
          ) {
            window.VWO.event('oneMonthEnclomipheneRequested');
            await Promise.all([
              vwo?.track('7865_3', 'oneMonthEnclomipheneRequested', patient),
              vwo?.track('8205', 'oneMonthEnclomipheneRequested', patient),
            ]);
          }

          const skipInsuranceNoCompoundRequested =
            patient.insurance_skip &&
            !patientPrescriptionRequests?.some(
              request => request.medication_quantity_id === 98
            );

          await Promise.all(
            req.map(async r => {
              if (options.task) {
                if (
                  !options.task.note &&
                  r.type === 'WEIGHT_LOSS_GLP1 (ORAL)'
                ) {
                  options.task.note =
                    'This patient requested oral semaglutide (not injectable)';
                }

                const isBrandNameGLP1 = r.medication_quantity_id === 124;
                const skipInsuranceNoCompoundRequestedNote =
                  "You will want to use the macro 'Provider - Candidate - No Insurance and Hasn't Requested Compound' " +
                  'if patient is a candidate, since they do not wish to use insurance. ';

                if (r.is_visible) {
                  const addToQueue = await supabase
                    .from('task_queue')
                    .insert({
                      ...options.task,
                      note:
                        isBrandNameGLP1 && skipInsuranceNoCompoundRequested
                          ? skipInsuranceNoCompoundRequestedNote +
                            options.task.note
                          : options.task.note,
                    })
                    .select()
                    .maybeSingle()
                    .then(({ data }) => data);
                  await supabase
                    .from('prescription_request')
                    .update({ queue_id: addToQueue?.id })
                    .eq('id', r?.id);
                }
              }

              if (specificCare !== SpecificCareOption.WEIGHT_LOSS) {
                prescriptionRequestedEvent(
                  profile.email!,
                  medicationAttributeName(
                    r.specific_medication! || r.note!,
                    specificCare!
                  ),
                  r?.note?.includes('3 months') ? '3-month' : '1-month'
                );
              }

              if (variant === '6471' || variant === '5865') {
                PurchaseOpipPostCheckoutEvent(
                  profile.email!,
                  medicationAttributeName(
                    req[0]?.specific_medication! || req[0]?.note!,
                    specificCare!
                  ),
                  req?.[0]?.note?.includes('3 months') ? '3-month' : '1-month'
                );
              }
            })
          );

          return req;
        });
    },
    [
      patient.id,
      profile.email,
      specificCare,
      supabase,
      patientPrescriptionRequests,
      patient.insurance_skip,
      variant,
    ]
  );

  const handleRequestTask = useCallback(
    async (patient_id: number) => {
      const hasWeightLossAccess = subscriptions?.some(sub =>
        sub.subscription.name.includes('Weight Loss Access')
      );

      const isMedicareAccess =
        specificCare?.includes('Weight loss access') ||
        potentialInsurance?.includes('Medicare') ||
        hasWeightLossAccess;

      const isPsychiatry =
        specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ||
        calculatedSpecificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION;

      const isBundled =
        subscriptions?.some(sub =>
          [297, 449, 891, 249].includes(sub.price || 0)
        ) && specificCare === SpecificCareOption.WEIGHT_LOSS;

      const isEnclomiphene =
        specificCare === SpecificCareOption.ENCLOMIPHENE ||
        calculatedSpecificCare === SpecificCareOption.ENCLOMIPHENE;

      const isBirthControl =
        specificCare === SpecificCareOption.BIRTH_CONTROL ||
        calculatedSpecificCare === SpecificCareOption.BIRTH_CONTROL;

      const isAMH = specificCare === SpecificCareOption.ASYNC_MENTAL_HEALTH;
      const isPreworkout = specificCare === SpecificCareOption.PRE_WORKOUT;

      const isED =
        specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION ||
        calculatedSpecificCare === SpecificCareOption.ERECTILE_DYSFUNCTION;

      const isEDHL =
        specificCare === SpecificCareOption.SEX_PLUS_HAIR ||
        calculatedSpecificCare === SpecificCareOption.SEX_PLUS_HAIR;

      const renewalFlows = [
        'enclomiphene-prescription-renewal',
        'bc-prescription-renewal',
        'sleep-prescription-renewal',
        'enclomiphene-prescription-renewal',
        'mhl-prescription-renewal',
        'fhl-prescription-renewal',
        'preworkout-renewal',
        'edhl-prescription-renewal',
        'ed-prescription-renewal',
      ];
      if (renewalFlows.includes(currentFlow || '')) {
        const prescriptions = await updatePrescriptionRequest({
          newPRStatus: 'REQUESTED',
          task: {
            task_type: 'PRESCRIPTION_REFILL',
            patient_id: patient.id,
            queue_type: 'Provider (QA)',
          },
        });
        const renewalRequest = prescriptions.find(p => p.renewing_prescription);
        if (renewalRequest && renewalRequest.renewing_prescription) {
          await supabaseClient
            .from('patient_action_item')
            .update({
              completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq('type', 'PRESCRIPTION_RENEWAL')
            .eq('completed', false)
            .eq('patient_id', patient.id);
          const patientEmail = await supabaseClient
            .from('profiles')
            .select('email')
            .eq('id', patient.profile_id)
            .limit(1)
            .single()
            .then(data => data.data?.email);
          const pastPrescription = await supabaseClient
            .from('prescription')
            .select(
              '*, medication_quantity!inner(*, medication_dosage!inner(*, medication(*)))'
            )
            .eq('id', renewalRequest.renewing_prescription)
            .limit(1)
            .single()
            .then(data => data.data);
          await prescriptionRenewalFinishedEvent(
            patient.profile_id,
            patientEmail || '',
            pastPrescription?.medication_quantity.medication_dosage.medication
              ?.display_name || '',
            pastPrescription?.medication || ''
          );
        }
        return;
      }
      if (isMedicareAccess) {
        await supabase.from('task_queue').insert({
          task_type: 'COUNTER_SIGN_MEDICARE',
          patient_id: patient_id,
          note: 'Medicare Access patient - must counter-sign Medicare agreement',
          queue_type: 'Lead Coordinator',
        });
      } else if (isPsychiatry || isPreworkout) {
        return;
      } else if (isWeightLoss && !patient?.has_verified_identity) {
        if (potentialInsurance === PotentialInsuranceOption.ADDITIONAL_PA) {
          await updateActionItem({
            patient_id: patient_id,
            completed_at: new Date().toISOString(),
            completed: true,
            type: 'ADDITIONAL_PA_QUESTIONS',
          });
        }
        if (
          potentialInsurance === PotentialInsuranceOption.WEIGHT_LOSS_CONTINUE
        ) {
          await updateActionItem({
            patient_id: patient_id,
            completed_at: new Date().toISOString(),
            completed: true,
            type: 'CONTINUE_WEIGHT_LOSS',
          });
        }

        const requests = await updatePrescriptionRequest({
          newPRStatus: 'REQUESTED - ID must be uploaded',
          task: {
            task_type: 'PRESCRIPTION_REQUEST_ID_REQUIRED',
            patient_id: patient.id,
            queue_type: 'Provider (QA)',
            note: "This patient has not uploaded ID. Please proceed as normal, write a clinical note and approve request if eligible. The order will not be dispensed until the patient's ID is verified.",
          },
        });

        if (requests.length) {
          let goal;
          if (requests.some(p => p.note?.includes('BUNDLED - 3 months'))) {
            goal = 'bundled3MonthsPrescriptionRequest';
          } else if (
            requests.some(p => p.note?.includes('BUNDLED - 6 months'))
          ) {
            goal = 'bundled6MonthPrescriptionRequest';
          } else if (
            requests.some(p => p.note?.includes('BUNDLED - 12 months'))
          ) {
            goal = 'bundledYearPlan';
          } else {
            goal = 'bundled1MonthPrescriptionRequest';
          }

          await Promise.all([
            vwo.track('Clone_Clone_4313', goal, patient),
            vwo.track('15685', goal, patient),
            vwo.track('7458', goal, patient),
            vwo.track('7930', goal, patient),
            vwo.track('8676', goal, patient),
          ]);
        }
      } else if (
        potentialInsurance === PotentialInsuranceOption.ADDITIONAL_PA
      ) {
        await updateActionItem({
          patient_id: patient_id,
          completed_at: new Date().toISOString(),
          completed: true,
          type: 'ADDITIONAL_PA_QUESTIONS',
        });
        await updatePrescriptionRequest({
          newPRStatus: 'REQUESTED',
          task: {
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient_id,
            queue_type: 'Provider (QA)',
          },
        });
      } else if (
        potentialInsurance === PotentialInsuranceOption.WEIGHT_LOSS_CONTINUE
      ) {
        await updateActionItem({
          patient_id: patient_id,
          completed_at: new Date().toISOString(),
          completed: true,
          type: 'CONTINUE_WEIGHT_LOSS',
        });
        await updatePrescriptionRequest({
          newPRStatus: 'REQUESTED',
          task: {
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient_id,
            queue_type: 'Provider (QA)',
          },
        });
      } else if (isBundled) {
        const prescriptions = await updatePrescriptionRequest({
          newPRStatus: 'REQUESTED',
          task: {
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient_id,
            queue_type: 'Provider (QA)',
          },
        });

        if (prescriptions.length) {
          let goal;
          if (prescriptions.some(p => p.note?.includes('BUNDLED - 3 months'))) {
            goal = 'bundled3MonthsPrescriptionRequest';
          } else if (
            prescriptions.some(p => p.note?.includes('BUNDLED - 6 months'))
          ) {
            goal = 'bundled6MonthPrescriptionRequest';
          } else if (
            prescriptions.some(p => p.note?.includes('BUNDLED - 12 months'))
          ) {
            goal = 'bundledYearPlan';
          } else {
            goal = 'bundled1MonthPrescriptionRequest';
          }

          await Promise.all([
            vwo.track('Clone_Clone_4313', goal, patient),
            vwo.track('15685', goal, patient),
            vwo.track('7458', goal, patient),
            vwo.track('7743', goal, patient),
            vwo.track('8078', goal, patient),
            vwo.track('7930', goal, patient),
            vwo.track('8676', goal, patient),
          ]);
        }
      } else if (isEnclomiphene) {
        await Promise.all([
          updatePrescriptionRequest({
            newPRStatus: 'REQUESTED',
          }),
        ]);
      } else if (isBirthControl) {
        await Promise.all([
          updatePrescriptionRequest({
            newPRStatus: 'REQUESTED',
            task: {
              task_type: 'PRESCRIPTION_REQUEST',
              patient_id: patient_id,
              queue_type: 'Provider (QA)',
            },
          }),
        ]);
      } else if (isAMH) {
        return;
      } else if (isED) {
        return;
      } else if (isEDHL) {
        return;
      } else {
        const prescriptions = await updatePrescriptionRequest({
          newPRStatus: 'REQUESTED',
          task: {
            task_type: 'PRESCRIPTION_REQUEST',
            patient_id: patient_id,
            queue_type: 'Provider (QA)',
          },
        });

        if (prescriptions.length) {
          const goal = prescriptions.some(p =>
            p.note?.includes('NOT BUNDLED - 3 months')
          )
            ? '3MonthPrescriptionRequestSubmitted'
            : '1MonthPrescriptionRequestSubmitted';

          const promises = [
            vwo.track('5867', goal, patient),
            vwo.track('6822-2', goal, patient),
            vwo.track('6822-3', goal, patient),
            vwo.track('7458', goal, patient),
            vwo.track('8078', goal, patient),
            vwo.track('8201', goal, patient),
            vwo.track('6888', goal, patient),
            vwo.track('8288', goal, patient),
            ABZTest.trackMetric('6977', patient?.profile_id!, goal),
            vwo.track('7060', goal, patient),
            ABZTest.trackMetric('6465_new', patient?.profile_id!, goal),
            vwo.track('3722', goal, patient),
            vwo?.track('Clone_5871', goal, patient),
            ABZTest.trackMetric('Clone_5871', patient?.profile_id!, goal),
            vwo.track('6303', goal, patient),
            vwo.track('4424-1', goal, patient),
            vwo.track('6758', goal, patient),
            vwo.track('5751', goal, patient),
            vwo.track('6826', goal, patient),
            vwo.track('Clone_6775', goal, patient),
            vwo.track('Clone_6775_2', goal, patient),
            vwo.track('5053', goal, patient),
            vwo.track('75801', goal, patient),
            vwo.track('4798', goal, patient),
            vwo.track('780101', goal, patient),
            vwo.track('780102', goal, patient),
            vwo.track('7934', goal, patient),
            vwo.track('7960', goal, patient),
            vwo.track('7380', goal, patient),
            vwo.track('5483', goal, patient),
            vwo.track('7935', goal, patient),
            vwo.track('9363', goal, patient),
            vwo.track('8685', goal, patient),
            vwo.track('9502', goal, patient),
          ];

          await Promise.all(promises);
        }
      }
    },
    [
      calculatedSpecificCare,
      patient,
      potentialInsurance,
      specificCare,
      subscriptions,
      supabase,
      updateActionItem,
      updatePrescriptionRequest,
      vwo,
      currentFlow,
    ]
  );

  const handleCoachActionItem = useCallback(
    async (patientId: number) => {
      //coaching is only available for these care options
      const coach = coaching.find(
        coach =>
          (specificCare &&
            coach.name.toLowerCase().includes(specificCare?.toLowerCase())) ||
          (calculatedSpecificCare &&
            coach.name
              .toLowerCase()
              .includes(calculatedSpecificCare?.toLowerCase()))
      );

      if (!coach) return;

      await supabase.from('patient_action_item').insert({
        patient_id: patientId,
        created_at: addDays(new Date(), 45).toISOString(),
        type: 'RATE_COACH',
        title: 'Rate your coach',
        body: "Help us improve by rating your coach. This helps us reward our best coaches and enables you to request a different coach if you'd like.",
        path:
          Pathnames.PATIENT_PORTAL_RATE_COACH +
          (coach.type === 'WEIGHT_LOSS' ? 'WEIGHT_LOSS' : 'MENTAL_HEALTH'),
      });
    },
    [calculatedSpecificCare, coaching, specificCare, supabase]
  );

  const handleMobileAppActionItem = useCallback(
    async (patientId: number) => {
      if (patient.status === 'ACTIVE' || mobileActionItemCreated) {
        return;
      }
      await supabase.from('patient_action_item').insert({
        patient_id: patientId,
        type: 'DOWNLOAD_MOBILE_APP',
        title: 'Get the Zealthy App',
        body: 'Unlock exclusive features and take control of your health journey–get the Zealthy mobile app today!',
        path: `${Pathnames.PATIENT_PORTAL}?action=download-app`,
      });
      setMobileActionItemCreated(true);
    },
    [patient, supabase, mobileActionItemCreated]
  );

  const handleZealthyRating = useCallback(async () => {
    if (
      (!patient.multi_purchase_rating_prompted &&
        // If patient has more than 1 subscription created, and is not in MH flow
        (((subscriptions?.length ?? 0) > 1 &&
          specificCare !== SpecificCareOption.ANXIETY_OR_DEPRESSION) ||
          // If patient completes a visit, has WL subscription, and is not in WL flow
          ((subscriptions?.length ?? 0) >= 1 &&
            subscriptions?.some(
              sub =>
                [4, 14, 18, 19].includes(sub.subscription_id) ||
                [249, 297, 217, 446, 349, 449, 718, 891].includes(
                  sub.price ?? 0
                )
            ) &&
            specificCare !== SpecificCareOption.WEIGHT_LOSS) ||
          // If patient has primary care subscription and is not in primary care flow
          ((subscriptions?.length ?? 0) >= 1 &&
            subscriptions?.some(sub => sub.subscription_id === 1) &&
            specificCare !== SpecificCareOption.PRIMARY_CARE) ||
          // If patient has MH subscription but is not in MH flow
          ((subscriptions?.length ?? 0) >= 1 &&
            subscriptions?.some(sub => sub.subscription_id === 7) &&
            specificCare !== SpecificCareOption.ANXIETY_OR_DEPRESSION))) ||
      // If patient has existing med sub not matching care for current flow
      (!patient.multi_purchase_rating_prompted &&
        (subscriptions?.length ?? 0) > 0 &&
        subscriptions?.every(
          sub => (sub.care?.length ?? 0) > 0 && sub.care !== specificCare
        ))
    ) {
      sessionStorage.setItem('willPromptRateZealthyPurchase', 'true');

      if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
        window.freshpaint?.track('purchased-second-product');
      }
    }
  }, [patient, supabase]);

  // Memoize the clear session storage function
  const clearSessionStorageKeys = useCallback(() => {
    const keysToRemove = [
      'patientHeightFt',
      'patientHeightIn',
      'patientWeight',
      'weight-loss-flow',
      'patientHeight',
      'patientBMI',
    ];

    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
  }, []);

  const completeVisit = useCallback(async () => {
    if (!patient?.id || !visit_id) {
      Router.push(Pathnames.PATIENT_PORTAL);
      return;
    }

    const newStatus = calculatePatientStatus(
      PatientStatus.ACTIVE,
      patient?.status as PatientStatus
    );

    try {
      await Promise.all([
        updateOnlineVisit({
          status: 'Completed',
          completed_at: new Date().toISOString(),
        }),
        updatePatient({
          status: newStatus,
          has_completed_onboarding: true,
        }),
        submitQuestionnaireResponses(),
        handleRequestTask(patient?.id),
        handleCoachActionItem(patient?.id),
        handleMobileAppActionItem(patient?.id),
        handleZealthyRating(),
      ]);

      clearSessionStorageKeys();
      nextPage ? nextPage() : Router.replace(Pathnames.PATIENT_PORTAL);
    } catch (err) {
      console.error('Error completing visit:', err);
      // You might want to add error handling UI here
    }
  }, [
    patient?.id,
    visit_id,
    updateOnlineVisit,
    updatePatient,
    submitQuestionnaireResponses,
    handleRequestTask,
    handleCoachActionItem,
    clearSessionStorageKeys,
    currentFlow,
    nextPage,
  ]);

  useEffect(() => {
    if (patient && !subsLoading && specificCare && vwo) {
      completeVisit();
    }
  }, [patient, specificCare, subsLoading, vwo, completeVisit, currentFlow]);

  // Show loading state while dependencies are loading
  if (subsLoading) {
    return <Loading />;
  }

  return <Loading />;
};

// Memoize the entire component
export default memo(CompleteVisit);

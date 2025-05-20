import {
  useCompoundMatrix,
  usePatient,
  usePatientAddress,
  usePatientAppointments,
  usePatientPrescriptions,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useAddZealthySubscription } from '@/components/hooks/useAddZealthySubscription';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePayment } from '@/components/hooks/usePayment';
import { useQuestionnaireResponses } from '@/components/hooks/useQuestionnaireResponses';
import { useSelector } from '@/components/hooks/useSelector';
import Loading from '@/components/shared/Loading/Loading';
import {
  CoachingState,
  CoachingType,
} from '@/context/AppContext/reducers/types/coaching';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVWO } from '@/context/VWOContext';
import { Database } from '@/lib/database.types';
import { CreateSubscriptionInput } from '@/types/api/create-subscriptions';
import { MedicationPayload } from '@/types/medicationPayload';
import { Pathnames } from '@/types/pathnames';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback, useEffect, useMemo } from 'react';
import {
  getSpecialWeightLossMedication,
  isBundledPlan,
  MEDICATION_QUERY,
  medicationName,
  medicationType,
  planToEvent,
  weightLossMedicationName,
} from './helpers';
import {
  prescriptionRequestedEvent,
  PurchaseOpipEvent,
} from '@/utils/freshpaint/events';
import medicationAttributeName from '@/utils/medicationAttributeName';
import { calculatePatientStatus } from '@/utils/calculatePatientStatus';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { useVisitAsync } from '@/components/hooks/useVisit';
import { usePatientAsync } from '@/components/hooks/usePatient';
import { bmgBundledEvent } from '@/utils/bmg/events';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useNextDosage } from '@/components/hooks/useTitrationSelection';
import { format } from 'date-fns';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { useFlowState } from '@/components/hooks/useFlow';

interface CreateSubscriptionsStripeProps {
  patient: Database['public']['Tables']['patient']['Row'];
  profile: Database['public']['Tables']['profiles']['Row'];
}

type PrescriptionRequestInput =
  Database['public']['Tables']['prescription_request']['Insert'];

const CreateSubscriptionsStripe = ({
  patient,
  profile,
}: CreateSubscriptionsStripeProps) => {
  const vwoClientInstance = useVWO();
  const { data: patientAddress, status: addressStatus } = usePatientAddress();
  const supabase = useSupabaseClient<Database>();
  const { createSubscriptions } = usePayment();
  const coaches = useSelector(store => store.coaching);
  const { specificCare, variant } = useIntakeState();
  const calculatedSpecificCare = useCalculateSpecificCare();
  const { updateOnlineVisit } = useVisitAsync();
  const { updatePatient } = usePatientAsync();
  const { data: matrixData, status: matrixStatus } = useCompoundMatrix();
  const { data: patientPrescriptions, status: prescriptionStatus } =
    usePatientPrescriptions();
  const { data: patientInfo, status: patientStatus } = usePatient();
  const answers = useAnswerState();
  const { data: variationName8205 } = useVWOVariationName('8205');
  const { data: patientAppointments, status: apptStatus } =
    usePatientAppointments();
  const { currentFlow } = useFlowState();
  const medications = useSelector(store => store.visit.medications);
  const weightLoss = useSelector(store =>
    store.coaching.find(c => c.type === CoachingType.WEIGHT_LOSS)
  );
  const amh = useSelector(store =>
    store.visit.selectedCare.careSelections.find(
      c => c.reason === 'Mental health'
    )
  );
  const isED = useSelector(store =>
    store.visit.selectedCare.careSelections.find(
      c => c.reason === 'Erectile dysfunction'
    )
  );

  const freeConsultAppointment = useMemo(() => {
    return patientAppointments?.find(
      a => a.care === 'Weight Loss Free Consult'
    );
  }, [patientAppointments]);

  const specificCareNoAddressRequired = [
    SpecificCareOption.ANXIETY_OR_DEPRESSION,
    SpecificCareOption.PRE_WORKOUT,
    SpecificCareOption.SKINCARE,
    SpecificCareOption.ACNE,
    SpecificCareOption.ROSACEA,
    SpecificCareOption.ANTI_AGING,
    SpecificCareOption.MELASMA,
    SpecificCareOption.PRIMARY_CARE,
    SpecificCareOption.WEIGHT_LOSS,
  ].includes(specificCare || SpecificCareOption.DEFAULT);

  const showZealthySubscription = useAddZealthySubscription();
  const submitQuestionnaireResponses = useQuestionnaireResponses();

  const createPrescriptionRequest = async () => {
    const freeConsultMedication = medications.find(
      m => m.medication_quantity_id === 98
    );

    const { data: taskResponse, error: taskError } = await supabase
      .from('task_queue')
      .insert({
        task_type: 'PRESCRIPTION_REQUEST',
        patient_id: patient?.id,
        queue_type: 'Provider (QA)',
        assigned_clinician_id: freeConsultAppointment?.clinician_id,
        clinician_assigned_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
      })
      .select()
      .maybeSingle();

    //find out if its Semaglutide or Tirzepatide
    const plan =
      freeConsultMedication?.display_name
        ?.toLowerCase()
        .concat('_multi_month') ?? 'semaglutide_multi_month';

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matrixId = useNextDosage(
      patientInfo!,
      plan,
      matrixData!,
      freeConsultMedication?.display_name?.toLowerCase(),
      []
    )?.med.id;

    const { data: prescriptionReponse, error: prescriptionError } =
      await supabase.from('prescription_request').insert({
        patient_id: patient?.id,
        status: 'REQUESTED',
        region: patient?.region,
        shipping_method: 1,
        number_of_month_requested:
          freeConsultMedication?.recurring.interval_count,
        note: 'Free Consult Medication Subscription',
        total_price: freeConsultMedication?.price,
        specific_medication: freeConsultMedication?.name,
        medication_quantity_id: 98,
        queue_id: taskResponse?.id,
        type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        matrix_id: matrixId,
        charge: false, //We are already charging them inside the flow
      });
  };

  // This is for free consult weight loss jumpstart medication
  useEffect(() => {
    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT &&
      matrixData &&
      patientInfo &&
      apptStatus === 'success'
    ) {
      createPrescriptionRequest();
    }
  }, [specificCare, matrixData, patientInfo, apptStatus]);

  // prescription requests
  const fetchWeightLoss = useCallback(
    async (plan: CoachingState) => {
      const { name, dosage } = weightLossMedicationName(plan);

      let query = supabase
        .from('medication_quantity')
        .select(
          'id, medication_dosage!inner(dosage!inner(dosage), medication!inner(name))'
        )
        .eq('medication_dosage.medication.name', name);

      if (dosage) {
        query = query.eq('medication_dosage.dosage.dosage', dosage);
      }

      const { data } = await query.single();

      return data;
    },
    [supabase]
  );

  const fetchSkincareMedication = useCallback(async () => {
    const name = medicationName(calculatedSpecificCare) ?? '';

    return supabase
      .from('medication')
      .select(MEDICATION_QUERY)
      .eq('name', name)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const response = (data as MedicationPayload)?.medication_dosage?.[0]
          .medication_quantity?.[0];

        return {
          medication_quantity_id: response?.id,
          price: response?.price,
        };
      });
  }, [calculatedSpecificCare, supabase]);
  const getPrescriptionRequests = useCallback(async () => {
    const medicationsRequests: PrescriptionRequestInput[] = medications
      .filter(
        m =>
          ![
            '3 Month Tirzepatide Jumpstart',
            '3 Month Semaglutide Jumpstart',
          ].includes(m.name)
      )
      .filter(m => {
        if (m.type === 'Sex + Hair') {
          return currentFlow === 'edhl-prescription-renewal';
        } else return true;
      })
      .map(m => ({
        medication_quantity_id: m?.medication_quantity_id || undefined,
        discounted_price: m?.discounted_price,
        patient_id: patient?.id,
        total_price: m?.price,
        region: patient?.region,
        specific_medication: m?.display_name,
        status: 'PRE_INTAKES',
        note: m?.note,
        type: m?.type,
        quantity: m?.quantity,
        renewing_prescription: m?.renewing_prescription,
      }));

    if (
      [
        'Rosacea',
        'Hyperpigmentation Dark Spots',
        'Acne',
        'Fine Lines & Wrinkles',
        'Skincare',
      ].includes(specificCare || '')
    ) {
      const type = medicationType(calculatedSpecificCare);
      const medicationQuantity = await fetchSkincareMedication();

      if (type && medicationQuantity) {
        medicationsRequests.push({
          patient_id: patient.id,
          status: 'REQUESTED',
          specific_medication: `Prescription ${type} Treatment - Cream`,
          total_price: medicationQuantity.price,
          type: type as MedicationType,
          medication_quantity_id: medicationQuantity.medication_quantity_id,
          region: patient?.region,
        });
      }
    }

    if (
      weightLoss &&
      specificCare !== SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT
    ) {
      const medicationQuantity = await fetchWeightLoss(weightLoss);
      const isBundled = isBundledPlan(weightLoss);
      const specificMedication = getSpecialWeightLossMedication(weightLoss);
      const isSema =
        specificMedication === 'Zealthy Weight Loss + Semaglutide Program';
      const isTirz =
        specificMedication === 'Zealthy Weight Loss + Tirzepatide Program';
      let plan = 'semaglutide_monthly';
      if (isTirz) {
        plan = 'tirzepatide_monthly';
      }

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const firstDosage = useNextDosage(
        patientInfo!,
        plan,
        matrixData!,
        isSema ? 'semaglutide' : 'tirzepatide',
        patientPrescriptions,
        true,
        answers
      );

      medicationsRequests.push({
        is_bundled: isBundled,
        number_of_month_requested: 1,
        type:
          weightLoss?.name === 'Zealthy Weight Loss + Oral Semaglutide Tablets'
            ? MedicationType.WEIGHT_LOSS_GLP1_ORAL
            : MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
        medication_quantity_id: medicationQuantity?.id!,
        status: 'PRE_INTAKES',
        is_visible: false,
        note: specificMedication + ', 1 month',
        patient_id: patient?.id,
        region: patient?.region,
        specific_medication: specificMedication,
        matrix_id: firstDosage?.med ? firstDosage.med.id : null,
        ...(weightLoss?.name ===
          'Zealthy Weight Loss + Oral Semaglutide Tablets' && {
          oral_matrix_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 1 : 2,
        }),
      });

      if (variant === '6471' || variant === '5865') {
        await PurchaseOpipEvent(
          profile.email!,
          medicationAttributeName(specificMedication, specificCare!),
          '1-month',
          variant === '5865'
        );
      }
    }

    return medicationsRequests;
  }, [
    medications,
    matrixData,
    patientInfo,
    patientPrescriptions,
    answers,
    specificCare,
    weightLoss,
    patient.id,
    patient?.region,
    calculatedSpecificCare,
    fetchSkincareMedication,
    fetchWeightLoss,
    currentFlow,
  ]);

  const getEDPrescriptionRequests = useCallback(async () => {
    const medicationsRequests: PrescriptionRequestInput[] = medications.map(
      m => ({
        medication_quantity_id: m?.medication_quantity_id || undefined,
        discounted_price: m?.discounted_price,
        patient_id: patient?.id,
        total_price: m?.price,
        region: patient?.region,
        specific_medication: m?.display_name,
        status: 'REQUESTED',
        note: m?.note,
        type: m?.type,
        quantity: m?.quantity,
        renewing_prescription: m?.renewing_prescription,
      })
    );
    return medicationsRequests;
  }, [medications, patient.id, patient?.region]);

  const completeVisit = useCallback(
    async (request: PrescriptionRequestInput) => {
      if (patient?.id) {
        const newStatus = calculatePatientStatus(
          PatientStatus.ACTIVE,
          patient?.status as PatientStatus
        );

        const promises = [
          supabase
            .from('task_queue')
            .insert({
              task_type: 'PRESCRIPTION_REQUEST',
              patient_id: patient?.id,
              queue_type: 'Provider (QA)',
            })
            .select()
            .maybeSingle()
            .then(({ data }) => {
              if (data?.id) {
                return supabase
                  .from('prescription_request')
                  .update({ queue_id: data.id })
                  .eq('id', request?.id!);
              }
            }),
          updateOnlineVisit({
            status: 'Completed',
            completed_at: new Date().toISOString(),
          }),
          updatePatient({
            status: newStatus,
          }),
        ];

        Promise.all(promises);
      }
    },
    [patient?.id, updateOnlineVisit, updatePatient]
  );

  const submitPrescriptionRequests = useCallback(async () => {
    const medicationRequests = isED
      ? await getEDPrescriptionRequests()
      : await getPrescriptionRequests();

    const request = await supabase
      .from('prescription_request')
      .insert(medicationRequests)
      .select()
      .then(({ data }) => data);

    if (
      isED ||
      [
        'Rosacea',
        'Hyperpigmentation Dark Spots',
        'Acne',
        'Fine Lines & Wrinkles',
        'Skincare',
      ].includes(specificCare || '')
    ) {
      await completeVisit(request?.[0]!);
      await prescriptionRequestedEvent(
        profile.email!,
        medicationAttributeName(
          request?.[0]?.specific_medication! || request?.[0]?.note!,
          specificCare!
        ),
        request?.[0]?.note?.includes('3 months') ? '3-month' : '1-month'
      );
      if (request?.[0]?.type === 'Anti-Aging') {
        window.VWO.event('prSubmittedAntiAging');
      } else if (request?.[0]?.type === 'Melasma') {
        window.VWO.event('prSubmittedMelasma');
      } else if (request?.[0]?.type === 'Rosacea') {
        window.VWO.event('prSubmittedRosacea');
      } else if (request?.[0]?.type === 'Acne') {
        window.VWO.event('prSubmittedAcne');
      } else {
      }
      await Promise.all([
        vwoClientInstance?.track(
          'ED5618',
          'prescriptionRequestSubmittedEd',
          patient
        ),
        vwoClientInstance?.track(
          '15618',
          'prescriptionRequestSubmittedEd',
          patient
        ),
        vwoClientInstance?.track(
          '5483-2',
          'prescriptionRequestSubmittedEd',
          patient
        ),
        vwoClientInstance?.track(
          '6399',
          'prescriptionRequestSubmittedEd',
          patient
        ),
        vwoClientInstance?.track(
          '5618',
          'prescriptionRequestSubmittedEd',
          patient
        ),
        vwoClientInstance?.track(
          '8552',
          'prescriptionRequestSubmittedEd',
          patient
        ),
      ]);
      window.VWO?.event('prescriptionRequestSubmittedEd');
    }

    if (amh) {
      window?.freshpaint?.track('prescription-request-submitted-amh');
    }
  }, [isED, supabase, amh, prescriptionRequestedEvent]);

  // subscriptions
  const fetchZealthySubscription = useCallback(async () => {
    return supabase
      .from('subscription')
      .select('price, reference_id, id')
      .eq('name', 'Zealthy Subscription')
      .single();
  }, [supabase]);

  const getSubscriptions = useCallback(async () => {
    const subscriptions: CreateSubscriptionInput[] = coaches.map(c => ({
      planId: c.planId,
      recurring: c.recurring,
      id: c.id,
    }));
    if (showZealthySubscription) {
      const { data: zealthySubscription } = await fetchZealthySubscription();
      if (zealthySubscription) {
        subscriptions.push({
          planId: zealthySubscription.reference_id,
          id: zealthySubscription.id,
          recurring: {
            interval: 'month',
            interval_count: 3,
          },
        });
      }
    }
    return subscriptions;
  }, [coaches, fetchZealthySubscription, showZealthySubscription]);

  const sendEvent = useCallback(async () => {
    const event = planToEvent[weightLoss?.name || ''];

    if (event) {
      window?.freshpaint?.track(event, {
        email: profile?.email!,
        phone: profile?.phone_number!,
        first_name: profile?.first_name!,
        last_name: profile?.last_name!,
        state: patient.region!,
      });

      await bmgBundledEvent(
        profile?.email!,
        profile?.phone_number!,
        profile?.first_name!,
        profile?.last_name!,
        patient.region!,
        patientAddress?.zip_code!,
        profile.utm_parameters,
        event
      );
    }
  }, [
    patient.region,
    profile?.email,
    profile?.first_name,
    profile?.last_name,
    profile?.phone_number,
    weightLoss?.name,
  ]);

  const createStripeSubscriptions = useCallback(async () => {
    return getSubscriptions()
      .then(subscriptions => createSubscriptions(patient.id, subscriptions))
      .then(() => sendEvent());
  }, [createSubscriptions, getSubscriptions, patient.id, sendEvent]);

  useEffect(() => {
    if (
      !patientInfo ||
      !patientPrescriptions ||
      !coaches ||
      !answers ||
      !specificCare ||
      !calculatedSpecificCare ||
      // Skip address check only for Enclomiphene Variation-4
      (!specificCareNoAddressRequired &&
        !patientAddress &&
        !(
          specificCare === SpecificCareOption.ENCLOMIPHENE &&
          variationName8205?.variation_name === 'Variation-3'
        )) ||
      !patientAppointments
    ) {
      return;
    }
    Promise.allSettled([
      createStripeSubscriptions(),
      submitPrescriptionRequests(),
      submitQuestionnaireResponses(),
    ]).finally(() => {
      if (
        currentFlow === 'enclomiphene-prescription-renewal' ||
        currentFlow === 'menopause-refill' ||
        currentFlow === 'sleep-prescription-renewal' ||
        currentFlow === 'bc-prescription-renewal' ||
        currentFlow === 'mhl-prescription-renewal' ||
        currentFlow === 'fhl-prescription-renewal' ||
        currentFlow === 'preworkout-renewal' ||
        currentFlow === 'edhl-prescription-renewal' ||
        currentFlow === 'ed-prescription-renewal'
      ) {
        Router.replace(Pathnames.CHECKOUT_COMPLETE);
      } else {
        Router.replace(Pathnames.CHECKOUT_SCHEDULE_APPOINTMENT);
      }
    });
  }, [
    addressStatus,
    specificCare,
    prescriptionStatus,
    apptStatus,
    currentFlow,
  ]);

  return <Loading />;
};

export default CreateSubscriptionsStripe;

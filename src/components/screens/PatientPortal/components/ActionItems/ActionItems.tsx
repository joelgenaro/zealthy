import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { List, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Pill from '@/components/shared/icons/Pill';
import Clock from '@/components/shared/icons/Clock';
import Health from '@/components/shared/icons/Health';
import LabTube from '@/components/shared/icons/LabTube';
import Document from '@/components/shared/icons/Document';
import HomeIcon from '@mui/icons-material/Home';
import Attention from '@/components/shared/icons/AttentionIcon';
import HandsHeart from '@/components/shared/icons/HandsHeart';
import CalendarOutline from '@/components/shared/icons/CalendarOutline';
import {
  useActivePatientSubscription,
  usePatient,
  usePatientActionItems,
  usePatientAddress,
  usePatientDocuments,
  usePatientIncompleteVisits,
  usePatientPayment,
  useSearchBuckets,
  useWeightLossSubscription,
  usePatientOrders,
  PatientCareTeamProps,
  usePreferredPharmacy,
  usePatientPrescriptionRequest,
  usePersonalizedPsychiatrySubscription,
  useAllPatientPrescriptionRequest,
  useLanguage,
  usePaymentMethodUpdatedRecently,
  useVWOVariationName,
  usePatientUnpaidInvoices,
} from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { CarePersonType } from '@/types/carePersonType';
import PatientPortalItem from '../PatientPortalItem';
import { ApptProps } from '../../PatientPortal';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import CreatedVisitActionItem from './components/CreatedVisitActionItem';
import AddInsuranceActionItem from './components/AddInsuranceActionItem';
import {
  AccessTime,
  Fingerprint,
  HandshakeOutlined,
  NoteAltOutlined,
} from '@mui/icons-material';
import { differenceInDays, differenceInWeeks, subDays } from 'date-fns';
import CancelableActionItem from './components/CancelableActionItem';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import {
  useReactivateSubscription,
  useRenewSubscription,
} from '@/components/hooks/mutations';
import { formatDate } from '@/utils/date-fns';
import { useVWO } from '@/context/VWOContext';
import { useAllVisiblePatientSubscription } from '@/components/hooks/data';
import { useRouter } from 'next/router';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import MedicineIcon from '@/components/shared/icons/MedicineIcon';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import MobileDownloadPopup from '@/components/screens/Question/components/MobileAppDownload/MobileDownloadPopup';
import MedicationBottle from '@/components/shared/icons/MedicationBottle';
import getConfig from '../../../../../../config';

type Visit = Database['public']['Tables']['online_visit']['Row'];
type LabOrder = Database['public']['Tables']['lab_order']['Row'];
type Prescription = Database['public']['Tables']['prescription']['Row'];
type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Row'];

interface Subscription {
  order: {
    id: number;
    prescription: Prescription;
  };
}

interface Props {
  patientId: number | undefined;
  activeWeightLoss: boolean;
  isNotWeightLossCompound?: boolean;
  setActionItemCount?: (count: number) => void;
  showHeader?: boolean;
  refresh?: boolean;
  careTeam?: PatientCareTeamProps[] | undefined;
  showRefillModal?: boolean;
  setShowRefillModal?: (m: any) => void;
  hasNonCompoundGLP1Request: boolean;
}

const ActionItems = ({
  patientId,
  activeWeightLoss,
  isNotWeightLossCompound,
  setActionItemCount,
  showHeader = true,
  refresh = false,
  careTeam,
  setShowRefillModal,
  hasNonCompoundGLP1Request,
}: Props) => {
  const supabase = useSupabaseClient<Database>();
  const actionRef = useRef<HTMLUListElement | null>(null);
  const { data: unpaidInvoices } = usePatientUnpaidInvoices();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { data: patient, refetch } = usePatient();
  const { data: incompleteVisits = [] } = usePatientIncompleteVisits();
  const { data: patientSubscriptions, isFetched } =
    useActivePatientSubscription();
  const paymentMethodUpdatedRecently: any = usePaymentMethodUpdatedRecently();
  const { isLoading: payLoading, data: paymentProfile } = usePatientPayment();
  const { data: patientAddress } = usePatientAddress();
  const { data: actionItems = [] } = usePatientActionItems();
  const { data: variant8288 } = useVWOVariationName('8288');
  const { data: documents, isSuccess } = usePatientDocuments();
  const { data: weightLoss } = useWeightLossSubscription();
  const language = useLanguage();
  const { data: personalizedPsychiatrySubscription } =
    usePersonalizedPsychiatrySubscription();
  const vwo = useVWO();
  const { data: allVisibleSubscriptions, refetch: refetchSub } =
    useAllVisiblePatientSubscription();

  const [isMobileUser, setIsMobileUser] = useState(false);

  const isMobile = useIsMobile();

  const weightLossSubs = useMemo(() => {
    return allVisibleSubscriptions?.filter(s =>
      s?.subscription?.name?.includes('Weight Loss')
    );
  }, [allVisibleSubscriptions]);
  const isBundled =
    weightLossSubs?.some(s => s?.price === 449) ||
    weightLossSubs?.some(s => s?.price === 297) ||
    weightLossSubs?.some(s => s?.price === 249) ||
    weightLossSubs?.some(s => s?.price === 891);
  const renewPrescription = useRenewSubscription();
  const reactivateSubscription = useReactivateSubscription();

  const { data: files } = useSearchBuckets(
    `patient-${patientId}/weight-verification`,
    'image1'
  );

  const {
    data: orders,
    refetch: refetchOrders,
    isFetching: loadingOrders,
  } = usePatientOrders();

  const { data: pendingPrescriptionRequest } = usePatientPrescriptionRequest();
  const { data: prescriptionRequests = [] } =
    useAllPatientPrescriptionRequest();

  const [isMentalHealth, setIsMentalHealth] = useState<boolean>(false);
  const [hasRecentExpiredSubscription, setHasRecentExpiredSubscription] =
    useState(false);
  const [noshowedAppts, setNoshowedAppts] = useState<ApptProps[] | null>(null);
  const [labOrderRequests, setLabOrderRequests] = useState<LabOrder[] | null>(
    null
  );
  const [showMobileDownloadPopup, setShowMobileDownloadPopup] = useState(false);
  const router = useRouter();
  const [mentalHealthCheckInRequest, setMentalHealthCheckInRequest] =
    useState<boolean>(false);
  const [showRestartWeightLoss, setShowRestartWeightLoss] = useState(false);
  const [
    showRestartPersonalizedPsychiatry,
    setShowRestartPersonalizedPsychiatry,
  ] = useState(false);
  const [appointmentData, setAppointmentData] = useState<ApptProps[] | null>(
    null
  );
  const [providerRequested, setProviderRequested] = useState<ApptProps[] | []>(
    []
  );
  const [secondPADeny, setSecondPADeny] = useState<boolean>(false);
  const [pAApproved, setPAApproved] = useState<
    Database['public']['Tables']['prior_auth']['Row'] | null
  >(null);

  const [expiredPrescriptions, setExpiredPrescriptions] = useState<
    Subscription[]
  >([]);

  const [authFailedPrescriptions, setAuthFailedPrescriptions] = useState<
    PrescriptionRequest[] | []
  >([]);

  const [docNames, setDocNames] = useState<string[] | null>(null);
  const [unrespondedMessages, setUnrespondedMessages] = useState<any[]>([]);
  const [showPsychiatryFollowUp, setShowPsychiatryFollowUp] =
    useState<boolean>(false);

  const weightLossSubscription = patientSubscriptions?.find(s =>
    s.subscription.name.toLowerCase().includes('weight loss')
  );

  const canceledWeightLoss = weightLoss?.status === 'canceled';

  const scheduleForCancelationWeightLoss =
    weightLoss?.status === 'scheduled_for_cancelation';

  const canceledPersonalizedPsychiatry =
    personalizedPsychiatrySubscription?.status === 'canceled';

  const scheduleForCancelationPersonalizedPsychiatry =
    personalizedPsychiatrySubscription?.status === 'scheduled_for_cancelation';

  const freeConsultAppointment = appointmentData?.find(
    a => a.care === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT
  );

  const skincareOrders = orders?.filter(order => {
    const medicationName = order?.prescription?.medication?.toLowerCase() || '';
    return ['melasma', 'rosacea', 'acne', 'tretinoin'].some(
      keyword =>
        medicationName.includes(keyword) &&
        order?.order_status === 'PENDING_SKINCARE_ORDER'
    );
  });

  const { data: preferredPharmacy } = usePreferredPharmacy();

  const handleReactivationWL = useCallback(async () => {
    if (scheduleForCancelationWeightLoss) {
      await reactivateSubscription.mutateAsync(weightLoss?.reference_id!);
    } else {
      await renewPrescription.mutateAsync(weightLoss);
    }
  }, [
    renewPrescription,
    reactivateSubscription,
    weightLoss,
    scheduleForCancelationWeightLoss,
  ]);
  const handleReactivationPS = useCallback(async () => {
    if (canceledPersonalizedPsychiatry) {
      await reactivateSubscription.mutateAsync(
        personalizedPsychiatrySubscription?.reference_id
      );
    } else {
      await renewPrescription.mutateAsync(personalizedPsychiatrySubscription);
    }
  }, [
    renewPrescription,
    reactivateSubscription,
    personalizedPsychiatrySubscription,
    canceledPersonalizedPsychiatry,
  ]);

  const handleOpenReactivateWL = useCallback(
    () => setShowRestartWeightLoss(true),
    []
  );
  const handleOpenReactivatePS = useCallback(
    () => setShowRestartPersonalizedPsychiatry(true),
    []
  );

  const handleCloseReactivateWL = useCallback(() => {
    setShowRestartWeightLoss(false);
    window.location.reload();
  }, []);
  const handleCloseReactivatePS = useCallback(() => {
    setShowRestartPersonalizedPsychiatry(false);
    window.location.reload();
  }, []);

  const fetchIsMobileUser = async () => {
    const hasLoggedInMobile = await supabase
      .from('patient')
      .select('app_last_logged_in')
      .eq('id', patientId!)
      .single()
      .then(({ data }) => data?.app_last_logged_in);

    setIsMobileUser(!!hasLoggedInMobile);
  };

  async function fetchExpiredSubscriptions() {
    const subs = await supabase
      .from('patient_subscription')
      .select('*')
      .eq('patient_id', patientId!)
      .eq('visible', true)
      .neq('subscription_id', 5) // exclude patient prescriptions
      .order('created_at', { ascending: false })
      .then(({ data }) => data || []);

    const expired = subs.filter(sub =>
      ['canceled', 'scheduled_for_cancelation'].includes(sub.status)
    );

    if (expired.length > 0) {
      expired.forEach(sub => {
        const hasActive = subs.some(
          s =>
            s.subscription_id === sub.subscription_id &&
            ['active', 'trialing'].includes(s.status)
        );
        const weeksSince = differenceInWeeks(
          new Date(),
          new Date(sub.updated_at || '')
        );
        if (weeksSince < 8 && !hasActive) {
          setHasRecentExpiredSubscription(true);
        }
      });
    }
  }

  async function fetchAppointments() {
    const appointments = await supabase
      .from('appointment')
      .select(
        'id, created_at, starts_at, ends_at, care, encounter_type, duration, visit_type, status, appointment_type, feedback, clinician (id, type, specialties, canvas_practitioner_id, profiles(*))'
      )
      .eq('patient_id', patientId!);

    const scheduledAppointments = appointments?.data
      ?.filter(a => a.encounter_type === 'Scheduled')
      ?.filter(
        a => differenceInWeeks(new Date(), new Date(a.starts_at || '')) < 4
      );

    const providerRequested = scheduledAppointments?.filter(
      a => a.status === 'ProviderRequested'
    );

    setProviderRequested(providerRequested as ApptProps[]);

    const noshowed = scheduledAppointments?.filter(a =>
      ['Noshowed', 'Patient-Noshowed', 'Provider-Noshowed'].includes(a.status)
    );

    setNoshowedAppts(noshowed as ApptProps[]);
  }

  async function fetchPatientDiagnosis() {
    const diagnosis = await supabase
      .from('patient_diagnosis')
      .select()
      .eq('patient_id', patientId!)
      .in('ICD_10', ['F411', 'F331', 'F419', 'F330', 'F321', 'F32A']);

    if ((diagnosis.data?.length ?? 0) > 0) {
      const lastVisit = await supabase
        .from('visit_reason')
        .select(
          `*, visit_id!inner(patient_id, status), reason_for_visit!inner(reason)`
        )
        .eq('visit_id.patient_id', patientId!)
        .eq('reason_for_visit.reason', 'Anxiety or depression')
        .eq('visit_id.status', 'Completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => data);

      const daysSinceLastVisit = differenceInDays(
        new Date(),
        new Date(lastVisit?.created_at || '')
      );

      if (daysSinceLastVisit >= 25 && daysSinceLastVisit < 40) {
        setMentalHealthCheckInRequest(true);
      }
    }
  }

  async function fetchIsPatientMentalHealth() {
    const mentalHealth = await supabase
      .from('visit_reason')
      .select(
        `*, visit_id!inner(patient_id, status), reason_for_visit!inner(reason)`
      )
      .eq('visit_id.patient_id', patientId!)
      .in('reason_for_visit.reason', ['Anxiety or depression', 'Mental health'])
      .eq('visit_id.status', 'Completed');

    if ((mentalHealth.data?.length ?? 0) > 0) {
      setIsMentalHealth(true);
    }
  }

  async function fetchLabOrderRequests() {
    const labRequests = await supabase
      .from('lab_order')
      .select()
      .eq('patient_id', patientId!)
      .eq('status', 'REQUESTED');

    setLabOrderRequests(labRequests.data as LabOrder[]);
  }

  async function fetchAllAppointments() {
    const appts = await supabase
      .from('appointment')
      .select(
        `id, created_at, starts_at, ends_at, appointment_type, care, visit_type, duration, status, clinician (*, profiles(*))`
      )
      .match({
        patient_id: patientId,
        encounter_type: 'Scheduled',
      })
      .order('created_at', { ascending: false });

    setAppointmentData(appts.data as ApptProps[]);
  }

  const mentalHealthAppointments = appointmentData?.filter(
    appt => appt?.appointment_type === CarePersonType.MENTAL_HEALTH
  );

  const latestMentalHealthAppointment =
    mentalHealthAppointments && mentalHealthAppointments[0];

  const isPastTwentyOneDays =
    differenceInDays(
      new Date(),
      new Date(latestMentalHealthAppointment?.ends_at || '')
    ) >= 21;

  async function fetchExpiredPrescriptions() {
    return supabase
      .from('patient_prescription')
      .select(`order!inner(id, prescription!inner(*))`)
      .eq('patient_id', patientId!)
      .eq('order.prescription.status', 'ended')
      .eq('visible', true)
      .then(({ data }) => (data || []) as Subscription[])
      .then(setExpiredPrescriptions);
  }

  async function fetchAuthFailedPrescriptionRequests() {
    const authFailed = await supabase
      .from('prescription_request')
      .select()
      .eq('status', 'AUTH_FAILED')
      .eq('patient_id', patientId!)
      .then(({ data }) => data as PrescriptionRequest[]);

    if (authFailed?.length) {
      const filteredRequests = authFailed.filter(request => {
        const weeksSince = differenceInWeeks(
          new Date(),
          new Date(request.updated_at || '')
        );
        return weeksSince < 4;
      });
      setAuthFailedPrescriptions(filteredRequests as PrescriptionRequest[]);
    }
  }

  type Props = {
    created_at: string;
    order_status: string;
    prescription: {
      medication: string;
      medication_quantity_id: number;
      duration_in_days: number;
      count_of_refills_allowed: number;
    };
  };

  async function fetchWeightLossRefill() {
    const { data } = await supabase
      .from('order')
      .select(
        `created_at, order_status, prescription(medication, medication_quantity_id, duration_in_days, count_of_refills_allowed)`
      )
      .eq('patient_id', patientId!)
      .neq('order_status', 'CANCELLED')
      .neq('order_status', 'Cancelled')
      .neq('order_status', 'Order Canceled')
      .order('created_at', { ascending: false })
      .returns<Props[]>();

    let prescriptionLength = 30;

    // check most recent successful weight loss order
    const mostRecent = data?.find(d => {
      let prescription = d?.prescription;
      if (Array.isArray(prescription)) {
        prescription = prescription[0];
      }
      if (prescription?.duration_in_days) {
        prescriptionLength =
          prescription?.duration_in_days *
          ((prescription?.count_of_refills_allowed ?? 0) + 1);
      }
      return (
        isWeightLossMed(prescription?.medication || '') &&
        !d?.order_status?.includes('cancel')
      );
    });

    const requests = await supabase
      .from('prescription_request')
      .select(
        `*, medication_quantity ( id, medication_dosage ( medication (*) ) )`
      )
      .eq('patient_id', patientId!)
      .then(({ data }) => data);

    const checkinTask = await supabase
      .from('task_queue')
      .select()
      .eq('patient_id', patientId!)
      .eq('task_type', 'WEIGHT_LOSS_CHECKIN')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(
        ({ data }) => data as Database['public']['Tables']['task_queue']['Row']
      );
    const hasRecentCheckInTask =
      differenceInDays(new Date(), new Date(checkinTask?.created_at || '')) <
      21;

    // most recent weight loss prescription request that was created less than 21 days ago
    const hasRecentWeightLossRequest = requests?.some(request => {
      let medication_quantity = request?.medication_quantity;
      if (Array.isArray(medication_quantity)) {
        medication_quantity = medication_quantity[0];
      }
      let dosage = medication_quantity?.medication_dosage;
      if (Array.isArray(dosage)) {
        dosage = dosage[0];
      }
      let medication = dosage?.medication;
      if (Array.isArray(medication)) {
        medication = medication[0];
      }
      const daysSince = differenceInDays(
        new Date(),
        new Date(request.created_at || '')
      );
      return isWeightLossMed(medication?.name || '') && daysSince < 21;
    });

    if (mostRecent && mostRecent.created_at) {
      const daysSince = differenceInDays(
        new Date(),
        new Date(mostRecent.created_at)
      );
      const refillCliff = prescriptionLength - 7;
      const dosageCliff = 28;

      if (
        mostRecent.prescription.medication_quantity_id === 98 &&
        daysSince >= refillCliff &&
        !hasRecentWeightLossRequest
      ) {
        if (daysSince - refillCliff >= 5) {
          setShowRefillModal!(true);
        }
      }
      if (
        mostRecent.prescription.medication_quantity_id === 98 &&
        mostRecent.prescription.duration_in_days === 90 &&
        daysSince >= refillCliff - 13 &&
        !hasRecentWeightLossRequest
      ) {
        if (daysSince - refillCliff >= 5) {
          setShowRefillModal!(true);
        }
      }
    }
  }

  async function fetchPatientFolders() {
    const docs = await supabase.storage
      .from('patients')
      .list(`patient-${patient?.id}`)
      // filter documents added

      .then(({ data }) => data || []);

    setDocNames(
      docs
        .filter(
          d => differenceInWeeks(new Date(), new Date(d.created_at || '')) < 4
        )
        .map(d => d?.name)
    );
  }

  async function fetchResponseRequired() {
    const required = await supabase
      .from('messages-v2')
      .select(
        `*,
      sender!inner(*),
      recipient!inner(*),
      messages_group_id!inner(*)`
      )
      .eq('recipient', patient?.profile_id!)
      .eq('requires_response', true)
      .neq('visible', false)
      .gte('created_at', subDays(new Date(), 30).toISOString())
      .then(({ data }) => data as any);
    let unrespondedMessages = [];
    for (const r of required || []) {
      const patientResponded = await supabase
        .from('messages-v2')
        .select(
          `*,
        sender!inner(*),
        recipient!inner(*),
        messages_group_id!inner(*)`
        )
        .eq('sender', r.recipient?.id)
        .eq('messages_group_id', r.messages_group_id?.id)
        .gt('created_at', r.created_at)
        .neq('visible', false)
        .limit(1)
        .single()
        .then(({ data }) => data);

      if (patientResponded) continue;
      else unrespondedMessages.push(r);
    }
    setUnrespondedMessages(unrespondedMessages as any);
  }

  const mustAddInsurance = useMemo(() => {
    return (
      activeWeightLoss &&
      isSuccess &&
      !documents?.find(d => d.name.includes('front')) &&
      !patient?.insurance_skip
    );
  }, [activeWeightLoss, documents, isSuccess, patient?.insurance_skip]);

  const mustAddInsurance8288 = useMemo(() => {
    return (
      activeWeightLoss &&
      isSuccess &&
      !documents?.find(d => d.name.includes('front'))
    );
  }, [activeWeightLoss, isSuccess, documents]);

  async function fetchSecondPADeny() {
    const patientPAs = await supabase
      .from('prior_auth')
      .select()
      .eq('patient_id', patientId!)
      .order('created_at', { ascending: false })
      .then(({ data }) => data);

    const paApproval = patientPAs?.find(p => p.status === 'PA Approved');
    const secondPA = patientPAs?.find(
      p => p.attempt_count === 2 && p.status === 'PA Denied'
    );

    const prescriptionRequests = await supabase
      .from('prescription_request')
      .select()
      .eq('patient_id', patientId!)
      .eq('status', 'REQUESTED')
      .or(
        'specific_medication.ilike.%semaglutide%,specific_medication.ilike.%tirzepatide%'
      )
      .gte('created_at', secondPA?.updated_at)
      .then(({ data }) => data);
    if (secondPA?.id && !prescriptionRequests?.length) {
      setSecondPADeny(true);
    }
    if (
      paApproval &&
      paApproval.sub_status === 'PATIENT_ACTION_NEEDED' &&
      differenceInDays(
        new Date(weightLossSubscription?.current_period_end || ''),
        new Date()
      ) < 32
    ) {
      setPAApproved(paApproval);
    }
  }

  useEffect(() => {
    if (setActionItemCount) {
      const count = actionRef?.current?.children.length || 0;
      setActionItemCount(count);
    }
  }, [actionRef?.current?.children.length, setActionItemCount]);

  const dummyPrescriptionRequest = prescriptionRequests?.find(
    r => r.note === 'Approve or Deny, DO NOT PRESCRIBE'
  );

  useEffect(() => {
    if (
      freeConsultAppointment &&
      dummyPrescriptionRequest?.status === 'APPROVED' &&
      freeConsultAppointment.status === 'Completed' &&
      !weightLossSubscription &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ) {
      window.freshpaint.track('wl-free-consult-time-to-build-your-order');
      return;
    }
  }, [
    freeConsultAppointment,
    weightLossSubscription,
    dummyPrescriptionRequest,
  ]);

  async function fetchLatestPsychiatryAppointment() {
    const appointment = await supabase
      .from('appointment')
      .select('*')
      .eq('patient_id', patientId!)
      .eq('appointment_type', 'Provider')
      .eq('care', 'Anxiety or depression')
      .order('ends_at', { ascending: false })
      .limit(1)
      .then(({ data }) => data as any);

    if (appointment.length === 0) return;

    const latestAppointmentDate = new Date(appointment[0].ends_at);
    const currDate = new Date();
    const differenceInDays = Math.floor(
      (currDate.getTime() - latestAppointmentDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    setShowPsychiatryFollowUp(differenceInDays > 75);
  }

  useEffect(() => {
    if (patientId) {
      Promise.allSettled([
        fetchIsPatientMentalHealth(),
        fetchExpiredPrescriptions(),
        fetchAllAppointments(),
        fetchExpiredSubscriptions(),
        fetchPatientDiagnosis(),
        fetchLabOrderRequests(),
        fetchAppointments(),
        fetchIsMobileUser(),
        fetchWeightLossRefill(),
        fetchAuthFailedPrescriptionRequests(),
        fetchPatientFolders(),
        fetchResponseRequired(),
        fetchLatestPsychiatryAppointment(),
      ]);
    }
  }, [patientId, refresh]);

  useEffect(() => {
    if (isFetched) {
      fetchSecondPADeny();
    }
  }, [isFetched]);

  const missedVisit = useMemo(() => {
    return noshowedAppts
      ?.filter(a => a.clinician?.type?.find(t => t.includes('Provider')))
      .filter(
        a => differenceInWeeks(new Date(), new Date(a.starts_at || '')) < 4
      )[0];
  }, [noshowedAppts]);
  const missedVisitCoach = useMemo(() => {
    return noshowedAppts
      ?.filter(a =>
        a.clinician?.type?.find(t => t.includes('Coach (Mental Health)'))
      )
      .filter(
        a => differenceInWeeks(new Date(), new Date(a.starts_at || '')) < 4
      )[0];
  }, [noshowedAppts]);

  const hasConfirmedVisit = useMemo(() => {
    const confirmedVisit = appointmentData
      ?.filter(
        a =>
          a.appointment_type === 'Provider' &&
          a.status === 'Confirmed' &&
          a.care === 'Anxiety or depression'
      )
      .filter(a => a.starts_at && new Date(a?.starts_at) > new Date());
    return confirmedVisit?.length === 0 ? false : true;
  }, [appointmentData]);

  const cancelledVisit = useMemo(() => {
    const mostRecentPSAppointment = appointmentData
      ?.filter(a => a.appointment_type === 'Provider')
      .filter(a => a.care === 'Anxiety or depression')[0];

    return mostRecentPSAppointment?.status === 'Cancelled'
      ? mostRecentPSAppointment
      : null;
  }, [appointmentData]);

  const cancelledVisitCoach = useMemo(() => {
    const mostRecentPSAppointment = appointmentData
      ?.filter(a => a.appointment_type === 'Coach (Mental Health)')
      .filter(a => a.care === 'Anxiety or depression')[0];

    return mostRecentPSAppointment?.status === 'Cancelled'
      ? mostRecentPSAppointment
      : null;
  }, [appointmentData]);

  const verifyAddress = useMemo(() => {
    if (!patientAddress) return false;
    return !patientAddress.verified_address;
  }, [patientAddress]);

  const hasVerifiedIdentity = useMemo(() => {
    return patient?.has_verified_identity || patient?.vouched_verified;
  }, [patient?.has_verified_identity, patient?.vouched_verified]);

  if (!patientId) return null;

  let verifyText = 'Verify your address';
  let correctAddressText =
    'We want to make we have your correct address. This is required to continue care at Zealthy.';
  if (language === 'esp') {
    verifyText = 'Verifica tu direccion';
    correctAddressText =
      'Queremos asegurarnos que tengamos tu direccion correcta. Esto es un requerimiento para continuar servicio en Zealthy.';
  }

  return (
    <Stack gap={1}>
      {(actionRef?.current?.children?.length || 0) > 0 && showHeader && (
        <Typography fontWeight="600" variant="h3" sx={{ fontSize: '18px' }}>
          Action Items
        </Typography>
      )}
      <List ref={actionRef} sx={{ padding: 0 }}>
        {(incompleteVisits || [])
          .filter((v: Visit) => v.status === 'Paid')
          .filter((v: Visit) => {
            const createdAt = new Date(v.created_at || '');
            const now = new Date();
            return differenceInWeeks(now, createdAt) < 4;
          })
          .map(visit => (
            <CreatedVisitActionItem key={visit.id} visit={visit} />
          ))}

        {freeConsultAppointment &&
        dummyPrescriptionRequest?.status === 'APPROVED' &&
        freeConsultAppointment.status === 'Completed' &&
        !weightLossSubscription ? (
          <PatientPortalItem
            data={{
              head: 'Time to build your order',
              body: 'Click this button to customize and complete your order, including selecting medications and reviewing details before checking out.',
              icon: MedicineIcon,
              path: '/questionnaires-v2/weight-loss-free-consult/ONBOARDING_PRECHECKOUT',
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="free-consult-checkout"
            newWindow={false}
          />
        ) : null}
        {['Cancelled', 'Noshowed', 'Provider-Noshowed'].includes(
          freeConsultAppointment?.status ?? ''
        ) ? (
          <PatientPortalItem
            data={{
              head: 'Schedule Free Consultation',
              body: 'Need an appointment? Click to schedule a free consultation with a Zealthy provider.',
              icon: CalendarOutline,
              path: `/patient-portal/free-consult/appointment`,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="verify-address"
            newWindow={false}
          />
        ) : null}
        {showPsychiatryFollowUp ? (
          <PatientPortalItem
            data={{
              head: 'Schedule a follow-up appointment',
              body: 'Your Zealthy provider requested you schedule a follow-up during your last visit.',
              icon: AccessTime,
              path: Pathnames.PATIENT_PORTAL_MENTAL_FOLLOWUP,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="verify-identity"
            newWindow={false}
          />
        ) : null}
        {/* this is for weight loss only */}
        {(activeWeightLoss || personalizedPsychiatrySubscription) &&
        !hasVerifiedIdentity &&
        patient?.status === 'ACTIVE' ? (
          <PatientPortalItem
            data={{
              head: 'Verify your identity to get your treatment plan',
              body: `In order to get a treatment plan from a ${siteName} provider, you need to upload an ID to verify your identity first.`,
              icon: Fingerprint,
              path: Pathnames.PATIENT_PORTAL_IDENTITY_VERIFICATION,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="verify-identity"
            newWindow={false}
          />
        ) : null}
        {pAApproved ? (
          <PatientPortalItem
            data={{
              head: 'Get discount and medication covered by insurance',
              body: `To get your prescription for ${pAApproved.rx_submitted}, which you have been approved to have covered by your insurance, pay for at least 2 additional months of membership with a 20% limited time discount so that we can ensure we can monitor your treatment plan effectively.`,
              icon: NoteAltOutlined,
              path: `/patient-portal/pa-approved/glp1?authId=${pAApproved.id}`,
            }}
            newWindow={false}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="prior-auth-approved"
          />
        ) : null}

        {verifyAddress ? (
          <PatientPortalItem
            data={{
              head: verifyText,
              body: correctAddressText,
              icon: HomeIcon,
              path: `/patient-portal/profile?page=address`,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="verify-address"
            newWindow={false}
          />
        ) : null}

        {(!patientAddress || patientAddress.address_line_1 === '') &&
        patient?.status === 'ACTIVE' ? (
          <PatientPortalItem
            data={{
              head: 'Add your address',
              body: 'We need your home address, which will also be the address we ship any medications to.',
              icon: AccessTime,
              path: `/patient-portal/profile?page=address`,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="add-address"
            newWindow={false}
          />
        ) : null}

        {(authFailedPrescriptions?.length ?? 0) > 0 &&
          authFailedPrescriptions?.map(req => (
            <PatientPortalItem
              data={{
                head: 'Select a different preferred medication',
                body: 'Since your insurance denied medication coverage, your provider recommends we try to get your insurance to cover Wegovy instead. Let us know if you’d like to proceed.',
                icon: Attention,
                path: `/patient-portal/weight-loss-treatment/${req.id}`,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key="pre-auth-failed"
              newWindow={false}
            />
          ))}

        {docNames?.includes('requested') ? (
          <PatientPortalItem
            data={{
              head: 'Complete document upload',
              body: 'In order to get your prior authorization, your insurance coordinator recommends that you upload additional documents.',
              icon: Attention,
              path: `/patient-portal/documents`,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="requested-documents"
            newWindow={false}
          />
        ) : null}

        {(mustAddInsurance &&
          isNotWeightLossCompound &&
          patient?.status === 'ACTIVE') ||
        (variant8288?.variation_name === 'Variation-1' &&
          isNotWeightLossCompound &&
          mustAddInsurance8288 &&
          patient?.status === 'ACTIVE') ? (
          <AddInsuranceActionItem patientId={patient?.id!} refetch={refetch} />
        ) : null}

        {(unrespondedMessages?.length ?? 0) > 0 &&
          unrespondedMessages.map(message => (
            <PatientPortalItem
              data={{
                head: `Reply to a message from your ${
                  message.messages_group_id?.name !== 'Other'
                    ? `${message.messages_group_id?.name} `
                    : ''
                }care team`,
                body: 'You have a message that may require a response.',
                icon: Attention,
                path: `/messages?complete=${message.messages_group_id?.name}`,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key="new-message"
              newWindow={false}
            />
          ))}

        {(incompleteVisits || []).length ? (
          <Stack>
            {incompleteVisits!
              .filter((v: Visit) => v.status === 'Created')
              .filter((v: Visit) => {
                const createdAt = new Date(v.created_at || '');
                const now = new Date();
                return differenceInWeeks(now, createdAt) < 4;
              })
              .map((visit: any) => (
                <CreatedVisitActionItem key={visit.id} visit={visit} />
              ))}
          </Stack>
        ) : null}

        {isMentalHealth &&
          (patientSubscriptions?.filter(
            sub => sub?.subscription?.name === 'Zealthy Personalized Psychiatry'
          ).length ?? 0) > 0 &&
          !hasConfirmedVisit &&
          (missedVisit || cancelledVisit) && (
            <PatientPortalItem
              data={{
                head: 'Reschedule your visit with a psychiatric provider',
                body: 'We want to meet with you! Please go ahead and reschedule your visit.',
                icon: CalendarOutline,
                path: `${Pathnames.SCHEDULE_APPOINTMENT}?id=${
                  missedVisit?.clinician?.id || cancelledVisit?.clinician?.id
                }&appt-id=${missedVisit?.id || cancelledVisit?.id}`,
              }}
              iconBg="#FFD08D"
              color="#FEFFC2"
              text="text.primary"
              key="reschedule-psychiatric-provider"
              newWindow={false}
            />
          )}

        {isMentalHealth &&
          (patientSubscriptions?.filter(
            sub => sub?.subscription?.name === 'Mental Health Coaching'
          ).length ?? 0) > 0 &&
          (missedVisitCoach || cancelledVisitCoach) && (
            <PatientPortalItem
              data={{
                head: 'Reschedule your visit with a mental health coach',
                body: 'We want to meet with you! Please go ahead and reschedule your visit.',
                icon: CalendarOutline,
                path: `${Pathnames.PATIENT_PORTAL_SCHEDULE_COACH}/mental-health`,
              }}
              iconBg="#FFD08D"
              color="#FEFFC2"
              text="text.primary"
              key="reschedule-coach"
              newWindow={false}
            />
          )}

        {!activeWeightLoss &&
        (canceledWeightLoss || scheduleForCancelationWeightLoss) ? (
          <PatientPortalItem
            data={{
              head: 'Reactivate membership for weight loss',
              body: 'To continue care at Zealthy, reactivate your membership here.',
              icon: Clock,
              path: '/patient-portal/profile',
            }}
            iconBg="#FFD08D"
            color="#FEFFC2"
            text="text.primary"
            key="no-insurance-policy-wl"
            newWindow={false}
            action={
              canceledWeightLoss || scheduleForCancelationWeightLoss
                ? handleOpenReactivateWL
                : undefined
            }
            // isReactivate={true}
          />
        ) : null}

        {canceledPersonalizedPsychiatry && hasRecentExpiredSubscription ? (
          <PatientPortalItem
            data={{
              head: 'Reactivate membership for personalized psychiatry',
              body: 'To continue care at Zealthy, reactivate your membership here.',
              icon: Clock,
              path: '/patient-portal/profile',
            }}
            iconBg="#FFD08D"
            color="#FEFFC2"
            text="text.primary"
            key="no-insurance-policy-mh"
            newWindow={false}
            action={handleOpenReactivatePS}
          />
        ) : null}

        {skincareOrders?.length
          ? skincareOrders?.map(o => (
              <PatientPortalItem
                data={{
                  head: 'Complete Checkout',
                  body: 'To receive your skincare treatment, complete your checkout here',
                  icon: Clock,
                  path: `/patient-portal/complete/skincare-approval/${o?.id}`,
                }}
                iconBg="#FFD08D"
                color="#FEFFC2"
                text="text.primary"
                key="complete-skincare-checkout"
                newWindow={false}
              />
            ))
          : null}

        {mentalHealthCheckInRequest && (
          <PatientPortalItem
            data={{
              head: 'Complete your anxiety or depression check-in',
              body: "It's time for your anxiety or depression check-in. Please help us stay on top of your mental health journey.",
              icon: Document,
              path: Pathnames.PATIENT_PORTAL_MENTAL_CHECK_IN,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="mental-health-check-in"
            newWindow={false}
          />
        )}

        {(labOrderRequests?.length ?? 0) > 0 &&
          labOrderRequests?.map(lab => (
            <PatientPortalItem
              data={{
                head: 'Schedule lab work or upload recent labs',
                body: 'Zealthy ordered lab work for you. Schedule an appointment at a Quest or Labcorp location near you, or upload recent lab work that you completed.',
                icon: LabTube,
                path: `/patient-portal/lab-work?id=${lab.id}`,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key={`lab-work-${lab.id}`}
              newWindow={false}
            />
          ))}
        {isMentalHealth &&
          (patientSubscriptions
            ?.filter(
              sub =>
                sub?.subscription?.name === 'Zealthy Personalized Psychiatry'
            )
            .filter(
              sub =>
                differenceInWeeks(new Date(), new Date(sub.created_at || '')) <
                4
            ).length ?? 0) > 0 &&
          patientSubscriptions?.filter(
            sub => sub?.subscription?.name === 'Mental Health Coaching'
          ).length === 0 && (
            <PatientPortalItem
              data={{
                head: 'Sign up for 1:1 coaching today',
                body: 'Zealthy offers 1:1 coaching for mental health.',
                icon: HandshakeOutlined,
                path: Pathnames.PATIENT_PORTAL_MENTAL_COACH,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key="mental-health-coaching-signup"
              newWindow={false}
            />
          )}
        {isMentalHealth &&
          (patientSubscriptions?.filter(
            sub => sub?.subscription?.name === 'Mental Health Coaching'
          ).length ?? 0) > 0 &&
          isPastTwentyOneDays && (
            <PatientPortalItem
              data={{
                head: 'Schedule your next coaching session',
                body: 'Stay on top of your goals by scheduling your next 1:1 session with your mental health coach.',
                icon: HandsHeart,
                path: `${Pathnames.PATIENT_PORTAL_SCHEDULE_COACH}/mental-health`,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key="mental-health-coaching-schedule"
              newWindow={false}
            />
          )}
        {providerRequested?.length > 0 &&
          activeWeightLoss &&
          providerRequested
            .filter(r => r.duration === 15)
            .map(req => (
              <PatientPortalItem
                data={{
                  head: 'Schedule a weight loss follow-up appointment',
                  body: 'Your Zealthy provider requested you schedule a live follow-up visit. This visit is included in the Zealthy Weight Loss Program.',
                  icon: Health,
                  path: `patient-portal/schedule-weight-loss/${req.id}`,
                }}
                iconBg="#FDB97A"
                color="#FEFFC2"
                text="text.primary"
                key={`requested-weight-loss-follow-up-${req.id}`}
                newWindow={false}
              />
            ))}
        {providerRequested?.length > 0 &&
          activeWeightLoss &&
          providerRequested
            .filter(r => (r?.duration ?? 0) > 15)
            .map(req => (
              <PatientPortalItem
                data={{
                  head: 'Schedule a follow-up appointment',
                  body: 'Your Zealthy provider requested you schedule a follow-up during your last visit.',
                  icon: Health,
                  path: `/patient-portal/schedule-appointment/${req.id}`,
                }}
                iconBg="#FDB97A"
                color="#FEFFC2"
                text="text.primary"
                key={`requested-follow-up-${req.id}`}
                newWindow={false}
              />
            ))}
        {providerRequested?.length > 0 &&
          !activeWeightLoss &&
          providerRequested.map(req => (
            <PatientPortalItem
              data={{
                head: 'Schedule a follow-up appointment',
                body: 'Your Zealthy provider requested you schedule a follow-up during your last visit.',
                icon: Health,
                path: `/patient-portal/schedule-appointment/${req.id}`,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key={`requested-follow-up-${req.id}`}
              newWindow={false}
            />
          ))}
        {(expiredPrescriptions?.filter(
          p =>
            differenceInWeeks(
              new Date(),
              new Date(p?.order?.prescription?.updated_at || '')
            ) < 8
        ).length ?? 0) > 0 &&
          !pendingPrescriptionRequest?.length && (
            <PatientPortalItem
              data={{
                head: 'Renew prescription',
                body: 'One or more of your prescriptions is out of refills. Go ahead and request more refills from your provider!',
                icon: Pill,
                path: Pathnames.PRESCRIPTION_ORDERS,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key="prescription-renewal"
              newWindow={false}
            />
          )}
        {!paymentProfile && !payLoading && (
          <PatientPortalItem
            data={{
              head: 'Please update payment method',
              body: 'Your card information is no longer valid. To continue your Zealthy membership, please update your payment method.',
              icon: Health,
              path: Pathnames.PATIENT_PORTAL_UPDATE_PAYMENT,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            key="update-payment-method"
            newWindow={false}
          />
        )}
        {(['requires_payment_method', 'canceled', 'failed'].includes(
          paymentProfile?.status as string
        ) ||
          (unpaidInvoices?.length ?? 0) > 0) &&
          !payLoading && (
            <PatientPortalItem
              data={{
                head: 'Please update payment method',
                body: 'Your card information is no longer valid. To continue your Zealthy membership, please update your payment method.',
                icon: Health,
                path: Pathnames.PATIENT_PORTAL_UPDATE_PAYMENT,
              }}
              iconBg="#FDB97A"
              color="#FEFFC2"
              text="text.primary"
              key="update-payment-method"
              newWindow={false}
            />
          )}
        {!isMentalHealth &&
          noshowedAppts
            ?.filter(
              a =>
                differenceInWeeks(new Date(), new Date(a.starts_at || '')) < 4
            )
            .map(appt => (
              <PatientPortalItem
                key={`${appt.id}-action-item`}
                data={{
                  head: 'Reschedule Zealthy visit',
                  body: 'We want to meet with you! Please go ahead and reschedule your visit.',
                  icon: CalendarOutline,
                  path: `${Pathnames.SCHEDULE_APPOINTMENT}?id=${appt?.clinician?.id}&appt-id=${appt.id}`,
                }}
                iconBg="#FDB97A"
                color="#FEFFC2"
                text="text.primary"
                newWindow={false}
              />
            ))}
        {actionItems.map(item => (
          <CancelableActionItem actionItem={item} key={item.id} />
        ))}
        {(hasNonCompoundGLP1Request &&
          !preferredPharmacy &&
          !patient?.insurance_skip &&
          !isBundled) ||
        (hasNonCompoundGLP1Request &&
          !preferredPharmacy &&
          variant8288?.variation_name === 'Variation-1' &&
          !isBundled) ? (
          <PatientPortalItem
            data={{
              head: 'Add your preferred pharmacy',
              body: 'Add the pharmacy that you’d like us to send medications to, such as brand name GLP-1 medications like Wegovy or Zepbound',
              icon: AccessTime,
              path: `${Pathnames.PATIENT_PORTAL_ADD_PHARMACY}&act=true`,
            }}
            iconBg="#FDB97A"
            color="#FEFFC2"
            text="text.primary"
            newWindow={false}
          />
        ) : null}
      </List>
      <SubscriptionRestartModal
        titleOnSuccess={'Your subscription has been reactivated.'}
        onConfirm={handleReactivationWL}
        onClose={handleCloseReactivateWL}
        title={
          scheduleForCancelationWeightLoss
            ? 'Continue your subscription?'
            : 'Reactivate your weight loss subscription?'
        }
        description={
          scheduleForCancelationWeightLoss
            ? [
                `Once you confirm below, your subscription will no longer be set to expire on ${formatDate(
                  weightLoss?.current_period_end
                )} and will remain active.`,
                `Once re-activated, you will be able to receive GLP-1 and other weight loss treatment from Zealthy. Without re-activating, you will not be able to receive GLP-1 medication from Zealthy since we need to ensure we can monitor your treatment plan.`,
              ]
            : [
                'Once you confirm below, your Zealthy Weight Loss subscription will become active.',
                'This will enable you to receive care including GLP-1 medication if appropriate for weight loss, get continued access to our coordination team to help make medications more affordable, and begin working with your coach again.',
              ]
        }
        open={showRestartWeightLoss}
        buttonText="Yes, reactivate"
      />
      <SubscriptionRestartModal
        titleOnSuccess={'Your membership has been reactivated.'}
        onConfirm={handleReactivationPS}
        onClose={handleCloseReactivatePS}
        title={
          scheduleForCancelationPersonalizedPsychiatry
            ? 'Continue your membership?'
            : 'Reactivate your personalized psychiatry membership?'
        }
        description={
          scheduleForCancelationPersonalizedPsychiatry
            ? [
                `Once you confirm below, your subscription will no longer be set to expire on ${formatDate(
                  personalizedPsychiatrySubscription?.current_period_end
                )} and will remain active.`,
                `Once re-activated, you will be able to receive GLP-1 and other weight loss treatment from Zealthy. Without re-activating, you will not be able to receive GLP-1 medication from Zealthy since we need to ensure we can monitor your treatment plan.`,
              ]
            : [
                'Once you confirm below, your Zealthy Personalized Psychiatry membership will become active.',
                'This will enable you to receive your medication shipped monthly (included in membership - no additional cost), schedule and complete visits with an expert psychiatric provider, and continue to access unlimited messaging with your psychiatric care team.',
              ]
        }
        open={showRestartPersonalizedPsychiatry}
        buttonText={`Yes, ${
          scheduleForCancelationPersonalizedPsychiatry
            ? 'continue'
            : 'reactivate'
        } my membership`}
      />
      <MobileDownloadPopup
        open={showMobileDownloadPopup}
        onClose={() => setShowMobileDownloadPopup(false)}
        addToQueue={() => {}}
      />
    </Stack>
  );
};

export default ActionItems;

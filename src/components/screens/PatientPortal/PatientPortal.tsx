import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, IconButton, List, Typography, useTheme } from '@mui/material';
import {
  PrescriptionRequestProps,
  useActivePatientSubscription,
  useCompoundMatrix,
  usePatientCareTeam,
  usePatientWeightLossReferrals,
  useWeightLossSubscription,
  usePatientActionItems,
  usePatientPrescriptionRequest,
  useAllVisiblePatientSubscription,
  useLiveVisitAvailability,
  usePatientLabOrders,
  useAllPatientPrescriptionRequest,
  useVWOVariationName,
  usePatientPharmacy,
  usePatient,
  use85521PatientLogic,
  usePatientPrescriptions,
  usePatientIntakes,
  usePatientPriorAuths,
  usePatientUnpaidInvoices,
  useSpecificCares,
} from '@/components/hooks/data';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';

import type {
  OrderProps,
  OrderPropsWithPrescriptionRequest,
} from '../Prescriptions/OrderHistoryContent';
import {
  addMinutes,
  addDays,
  isAfter,
  differenceInDays,
  differenceInMinutes,
  differenceInWeeks,
  subMinutes,
} from 'date-fns';
import { format } from 'date-fns-tz';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import Delivery from '@/components/shared/icons/Delivery';
import HandsHeart from '@/components/shared/icons/HandsHeart';
import WeightScale from '@/components/shared/icons/WeightScale';
import HandShake from '@/components/shared/icons/HandShake';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import TipsAndUpdatesOutlined from '@mui/icons-material/TipsAndUpdatesOutlined';
import VaccinesOutlinedIcon from '@mui/icons-material/VaccinesOutlined';
import { Pathnames } from '@/types/pathnames';
import { Database, Json } from '@/lib/database.types';
import { getCare, getCareWeightLoss } from '@/constants/patent-portal';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAppDispatchContext } from '@/context/AppContext';
import { CommonActionTypes } from '@/context/AppContext/reducers/types/common';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { PatientSubscriptionProps } from '@/lib/auth';
import OrderCompoundModal from './components/OrderCompoundModal';
import MyTreatmentPlanItem from './components/MyTreatmentPlan/MyTreatmentPlanItem';
import OrderCompoundCard from '../Prescriptions/components/OrderCompoundCard';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import InjectionVideoModal from '@/components/shared/InjectionVideoModal';
import { OrderStatus } from '@/types/orderStatus';
import { orderStatusMap } from '@/utils/orderStatus';
import { Stack } from '@mui/system';
import PatientPortalItem from './components/PatientPortalItem';
import { PhoneOutlined } from '@mui/icons-material';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { FileObject } from '@supabase/storage-js';
import TrendingCarousel from './components/TrendingCarousel';
import TrendUp from '@/components/shared/icons/TrendUp';
import SubscriptionRestartModal from '@/components/shared/SubscriptionRestartModal';
import {
  useReactivateSubscription,
  useRenewSubscription,
  useUpdatePatient,
} from '@/components/hooks/mutations';
import OrderTracker from './components/OrderTracker';
import { formatDate } from '@/utils/date-fns';
import isPatientSixtyFivePlus from '@/utils/isPatientSixtyFivePlus';
import ViewMoreDosagesModal from './components/ViewMoreDosagesModal';
import SkincareApprovalModal from './components/SkincareApprovalModal/SkincareApprovalModal';
import { useVisitTypeContext } from './components/ScheduleVisit/components/CareTeam/VisitTypeContext';
import RefillRequestModal from './components/RefillRequestModal';
import ReactPlayer from 'react-player';
import ActionItemDrawer from './components/ActionItems/components/ActionItemDrawer';
import CalendarWhite from '@/components/shared/icons/CalendarWhite';
import RedditPopUp from './components/RedditPopUp';
import isRating5Stars from '@/utils/isRating5Stars';
import EnclomipheneLabCard from './components/EnclomipheneLabCard';
import PriorityModals from './components/PriorityModals';
import PackageBlack from '@/components/shared/icons/PackageBlack';
import Router, { useRouter } from 'next/router';
import VoiceSelection from '@/components/shared/icons/VoiceSelection';
import Syringe from '@/components/shared/icons/Syringe';
import PillV2 from '@/components/shared/icons/PillV2';
import RateOrderModal from '@/components/screens/PatientPortal/components/RateOrderModal';
import WeightLossRedirectPopup from './components/WeightLossRedirectPopup/WeightLossRedirectPopup';
import ExclusiveOfferPopup from './components/ExclusiveOfferPopup/ExclusiveOfferPopup';
import ExclusiveOfferPopupEd from './components/ExclusiveOfferPopupEd/ExclusiveOfferPopupEd';
import RateVisitModal from '@/components/screens/PatientPortal/components/RateVisitModal';
import { useVWO } from '@/context/VWOContext';
import Health from '@/components/shared/icons/Health';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import OrderOralCompoundCard from '@/components/screens/Prescriptions/components/OrderOralCompoundCard';
import getConfig from '../../../../config';
import { usePayment } from '@/components/hooks/usePayment';
import TimelineTracker from './components/TimelineTracker/TimelineTracker';
import MobileDownloadPopup from '@/components/screens/Question/components/MobileAppDownload/MobileDownloadPopup';
import Spinner from '@/components/shared/Loading/Spinner';
import { isMobile as isMobileDevice } from 'react-device-detect';
import RateZealthyGenericModal from '@/components/screens/PatientPortal/components/RateZealthyGenericModal';
import {
  SpecificCareOption,
  PotentialInsuranceOption,
} from '@/context/AppContext/reducers/types/intake';

const ActionItems = dynamic(() => import('./components/ActionItems'), {
  ssr: false,
});

type Patient = Database['public']['Tables']['patient']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Prescription = Database['public']['Tables']['prescription']['Row'];
type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Row'];
type PatientReferralRedeem =
  Database['public']['Tables']['patient_referral_redeem']['Row'];
export type Order = Database['public']['Tables']['order']['Row'] & {
  prescription: Prescription;
};
type Invoice = Database['public']['Tables']['invoice']['Row'];

export interface ApptProps {
  id: number | null;
  clinician: {
    id: number | null;
    zoom_link?: string | null;
    daily_room?: string | null;
    canvas_practitioner_id: string | null;
    profiles: Profile;
    type: string[];
    specialties: string | null;
  };
  starts_at: string | null;
  ends_at: string | null;
  care: string | null;
  duration: number | null;
  visit_type: string | null;
  status: string | null;
  appointment_type?: string | null;
  daily_room?: string | null;
  created_at: string;
  feedback?: Json | null;
}

const appointmentSorting = (a: ApptProps) => {
  if (a.appointment_type === 'Provider') {
    return -1;
  } else {
    return 1;
  }
};

interface Props {
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Patient;
  profile: Profile;
}

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const PatientPortal = ({
  visibleSubscriptions,
  patient: patientInfo,
  profile,
}: Props) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const dispatch = useAppDispatchContext();
  const supabase = useSupabaseClient<Database>();
  const { data: careTeam } = usePatientCareTeam();
  const { data: patientPriorAuths } = usePatientPriorAuths();
  const { data: availability } = useLiveVisitAvailability();
  const { data: weightLossPatient, isLoading } = useWeightLossSubscription();
  const { data: patientPrescriptions } = usePatientPrescriptions();
  const { data: patientReferrals } = usePatientWeightLossReferrals();
  const renewPrescription = useRenewSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const { data: activePatientSubscriptions } = useActivePatientSubscription();
  const { data: allVisibleSubscriptions, refetch: refetchSub } =
    useAllVisiblePatientSubscription();
  const { fetchFiles } = useUploadDocument();
  const { data: matrixData } = useCompoundMatrix();
  const { data: patientPharmacy, refetch: refetchPharmacy } =
    usePatientPharmacy();
  const { selectedVisitType, setSelectedVisitType } = useVisitTypeContext();
  const { data: actionItems = [] } = usePatientActionItems();
  const { data: labOrders } = usePatientLabOrders();
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [weightLossOrders, setWeightLossOrders] = useState<OrderProps[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileObject[]>([]);
  const [enclomipheneUploadedFiles, setEnclomipheneUploadedFiles] = useState<
    FileObject[]
  >([]);
  const [uploadedFaxes, setUploadedFaxes] = useState<FileObject[]>([]);
  const { data: patientIntakes, status: intakeStatus } = usePatientIntakes();
  const [weightLossPrescriptionRequest, setWeightLossPrescriptionRequest] =
    useState<PrescriptionRequestProps | null>(null);
  const [otherPrescriptionRequests, setOtherPrescriptionRequests] = useState<
    PrescriptionRequestProps[]
  >([]);
  const [enclomiphenePrescriptionRequest, setEnclomiphenePrescriptionRequest] =
    useState<PrescriptionRequestProps | null>(null);
  const [appointmentData, setAppointmentData] = useState<ApptProps[] | null>(
    null
  );
  const [showDosageUpdate, setShowDosageUpdate] = useState(false);
  const [didCheckDuplicates, setDidCheckDuplicates] = useState(false);
  const [didCheckIDVerification, setDidCheckIDVerification] = useState(false);
  const [showWeightLossRefill, setShowWeightLossRefill] =
    useState<boolean>(false);
  const [showWeightLossCompoundRefill, setShowWeightLossCompoundRefill] =
    useState(false);
  const [showRestartWeightLoss, setShowRestartWeightLoss] = useState(false);
  const [
    showRestartPersonalizedPsychiatry,
    setShowRestartPersonalizedPsychiatry,
  ] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState<
    ApptProps[] | null
  >(null);
  const [noshowedAppts, setNoshowedAppts] = useState<ApptProps[] | null>(null);
  const [ratableAppts, setRatableAppts] = useState<ApptProps[] | null>(null);
  const [promptRateZealthyPurchase, setPromptRateZealthyPurchase] =
    useState(false);
  const [ratableOrder, setRatableOrder] = useState<Order | null>(null);
  const [hasValidOrder, setHasValidOrder] = useState<boolean>(false);
  const [hasNonGLP1Request, setHasNonGLP1Request] = useState<boolean>(false);
  const [hasWeightLossOrder, setHasWeightLossOrder] = useState<boolean>(false);
  const [isMentalHealth, setIsMentalHealth] = useState<boolean>(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [displayRefillRequestModal, setDisplayRefillRequestModal] =
    useState<boolean>(false);
  const [showWlRedirectPopup, setShowWlRedirectPopup] =
    useState<boolean>(false);

  const [showExclusiveOffer, setShowExclusiveOffer] = useState<boolean>(false);
  const [showExclusiveOfferEd, setShowExclusiveOfferEd] =
    useState<boolean>(false);
  const [hasPendingBirthControlRequest, setHasPendingBirthControlRequest] =
    useState<boolean>(false);
  const [hasPendingWeightLossRequest, setHasPendingWeightLossRequest] =
    useState<boolean>(false);
  const [hasPendingEdRequest, setHasPendingEdRequest] =
    useState<boolean>(false);
  const [hasPendingHairLossRequest, setHasPendingHairLossRequest] =
    useState<boolean>(false);
  const [hasPendingHairLossFRequest, setHasPendingHairLossFRequest] =
    useState<boolean>(false);
  const [hasPendingMenopauseRequest, setHasPendingMenopauseRequest] =
    useState<boolean>(false);
  const [
    hasPendingCompoundWeightLossRequest,
    setHasPendingCompoundWeightLossRequest,
  ] = useState<boolean>(false);
  const [hasPendingRosaceaRequest, setHasPendingRosaceaRequest] =
    useState<boolean>(false);
  const [hasPendingMelasmaRequest, setHasPendingMelasmaRequest] =
    useState<boolean>(false);
  const [hasPendingAcneRequest, setHasPendingAcneRequest] =
    useState<boolean>(false);
  const [hasPendingAntiAgingRequest, setHasPendingAntiAgingRequest] =
    useState<boolean>(false);
  const [hasPendingEnclomipheneRequest, setHasPendingEnclomipheneRequest] =
    useState<boolean>(false);
  const [hasPendingPreworkoutRequest, setHasPendingPreworkoutRequest] =
    useState<boolean>(false);
  const [hasPendingMentalHealthRequest, setHasPendingMentalHealthRequest] =
    useState<boolean>(false);
  const [hasPrescription, setHasPrescription] = useState<boolean>(false);
  const [wegovyPrescribed, setWegovyPrescribed] = useState<boolean>(false);
  const [showInjectionVideo, setShowInjectionVideo] = useState<boolean>(false);
  const [showRefillInstructionsVideo, setShowRefillInstructionsVideo] =
    useState<boolean>(false);
  const [nonGLP1Orders, setNonGLP1Orders] = useState<OrderProps[]>([]);
  const [openReferralModal, setOpenReferralModal] = useState<boolean>(false);
  const [openSkincareApprovalModal, setOpenSkincareApprovalModal] =
    useState<boolean>(false);
  const [hasCompletedAppointment, setHasCompletedAppointment] =
    useState<boolean>(false);
  const [providerAppts, setProviderAppts] = useState<ApptProps[] | null>(null);
  const payment = usePayment();
  const [isProviderCallItem, setIsProviderCallItem] = useState<boolean>(false);
  const [hasNonCompoundGLP1Request, setHasNonCompoundGLP1Request] =
    useState(false);
  const [showMobileDownloadPopup, setShowMobileDownloadPopup] = useState(false);
  const [showMobileRatingPopup, setShowMobileRatingPopup] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasPurchasedLab, setHasPurchasedLab] = useState<Invoice | null>();
  const [patientZealthyRating, setPatientZealthyRating] = useState([]);
  const [patientCoachRatings, setPatientCoachRatings] = useState([]);
  const [orderRatingDisplayAt, setOrdersRatingDisplayAt] = useState(null);
  const isPatient65OrOlder = isPatientSixtyFivePlus(profile?.birth_date || '');

  const [abTestLoading, setAbTestLoading] = useState(true);

  const vwo = useVWO();
  const { data: unpaidInvoices = [] } = usePatientUnpaidInvoices();
  const updatePatient = useUpdatePatient();

  const { data: variation5053, status: status5053 } =
    useVWOVariationName('5053');
  const { data: variation75801, status: status75801 } =
    useVWOVariationName('75801');
  const { data: variation7960, status: status7960 } =
    useVWOVariationName('7960');
  const { data: variation8078, status: status8078 } =
    useVWOVariationName('8078');
  const { data: variation7935, status: status7935 } =
    useVWOVariationName('7935');
  const { data: variation8205, status: status8205 } =
    useVWOVariationName('8205');
  const { data: variation8912, status: status8912 } =
    useVWOVariationName('8912');
  const { data: variation8685, status: status8685 } =
    useVWOVariationName('8685');

  const variation8676 = vwo.getVariationName('8676', String(patientInfo?.id));
  const isVariation8676 = variation8676 === 'Variation-1';
  const { data: patient } = usePatient();

  useEffect(() => {
    const track9521 = async () => {
      await vwo?.track('8279_6', 'account_created', patient);
    };
    if (patient && vwo) {
      track9521();
    }
  }, [patient, vwo]);

  const { data: prescriptionRequests = [] } =
    useAllPatientPrescriptionRequest();

  const router = useRouter();

  const { data: specificCares } = useSpecificCares();

  useEffect(() => {
    if (router.query?.action === 'download-app') {
      if (isMobileDevice) {
        setTimeout(() => {
          window.open('https://link.getzealthy.com/FEbcTpIshSb', '_top');
        });
      } else {
        setShowMobileDownloadPopup(true);
      }
    }
  }, [router.query]);

  const isEnclomiphenePatient = useMemo(() => {
    return prescriptionRequests.some(p =>
      p.specific_medication?.includes('Enclomiphene')
    );
  }, [prescriptionRequests]);

  const showLabKitOrderModal = useMemo(() => {
    const now = new Date();
    return !labOrders?.some(order => {
      if (order?.created_at) {
        const orderDate = new Date(order.created_at);
        return differenceInDays(now, orderDate) <= 14;
      }
      return false;
    });
  }, [labOrders]);
  type RefillProps = {
    created_at: string;
    order_status: string;
    sent_to_pharmacy_at: string;
    prescription: {
      medication: string;
      medication_quantity_id: number;
      duration_in_days: number;
      count_of_refills_allowed: number;
    };
  };

  const videoUrl = (() => {
    const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

    if (variation8205 && variation8205.variation_name !== 'Control') {
      if (
        variation8205.variation_name === 'Variation-4' ||
        variation8205.variation_name === 'Variation-2'
      ) {
        return isProd
          ? 'https://api.getzealthy.com/storage/v1/object/public/videos//DR.J-Enclo-Welcome-Video.mp4'
          : 'https://staging.api.getzealthy.com/storage/v1/object/public/videos/dr-joseph-enclo-vid.mp4';
      }

      if (
        variation8205.variation_name === 'Variation-1' ||
        variation8205.variation_name === 'Variation-3'
      ) {
        return isProd
          ? 'https://api.getzealthy.com/storage/v1/object/public/videos/Mark-enclo-welcome-video.mp4'
          : 'https://staging.api.getzealthy.com/storage/v1/object/public/videos/Marks%20Enclomiphene%20Shortvid_2112025.mp4';
      }
    }

    return '';
  })();

  const posterUrl = (() => {
    const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

    if (variation8205 && variation8205.variation_name !== 'Control') {
      if (
        variation8205.variation_name === 'Variation-4' ||
        variation8205.variation_name === 'Variation-2'
      ) {
        return isProd
          ? 'https://ordynhmcwwnczgnvuomz.supabase.co/storage/v1/object/public/images/announcements/enclo-drJ-vid-thumbnail.png'
          : 'https://ordynhmcwwnczgnvuomz.supabase.co/storage/v1/object/public/images/announcements/enclo-drJ-vid-thumbnail.png';
      }

      if (
        variation8205.variation_name === 'Variation-1' ||
        variation8205.variation_name === 'Variation-3'
      ) {
        return isProd
          ? 'https://ordynhmcwwnczgnvuomz.supabase.co/storage/v1/object/public/images/announcements/enclo-MJ-vid-thumbnail.png'
          : 'https://ordynhmcwwnczgnvuomz.supabase.co/storage/v1/object/public/images/announcements/enclo-MJ-vid-thumbnail.png';
      }
    }

    return '';
  })();

  const [glp1PrescribedMed, setGlp1PrescribedMed] = useState<string | null>();

  const hasIncompleteWlIntake = useMemo(() => {
    return !!patientIntakes?.find(
      i =>
        ['Created', 'Paid'].includes(i?.status) &&
        i?.specific_care === 'Weight loss'
    );
  }, [patientIntakes]);

  const isWeightLoss = visibleSubscriptions?.some(sub =>
    sub?.subscription?.name?.toLowerCase()?.includes('weight loss')
  );

  const hasCanceledWlSub = useMemo(() => {
    return !!allVisibleSubscriptions?.find(
      sub =>
        ['canceled', 'scheduled_for_cancelation'].includes(sub.status) &&
        sub.subscription_id === 4
    );
  }, [allVisibleSubscriptions]);

  useEffect(() => {
    const isWlRedirect = sessionStorage.getItem('showWlRedirectPopup');
    if (!!isWlRedirect && !hasIncompleteWlIntake && intakeStatus === 'success')
      setShowWlRedirectPopup(true);
  }, [hasIncompleteWlIntake, intakeStatus]);

  const vwoContext = useVWO();
  const variation8552 = vwoContext.getVariationName(
    '8552',
    String(patient?.id)
  );
  const { data: data85521 } = use85521PatientLogic();

  useEffect(() => {
    const isExclusiveOffer = sessionStorage.getItem('showExclusiveOffer');
    const shownExclusiveOffer = JSON.parse(
      sessionStorage.getItem('shownExclusiveOffer') || 'null'
    );
    if (
      (!!isExclusiveOffer ||
        (data85521?.is85521 && variation8552 === 'Variation-1')) &&
      !shownExclusiveOffer
    )
      setShowExclusiveOffer(true);
  }, [data85521, variation8552]);

  const variation85522 = vwoContext.getVariationName(
    '8552_2',
    String(patient?.id)
  );

  useEffect(() => {
    const isExclusiveOfferEd = sessionStorage.getItem('showExclusiveOfferEd');
    if (!!isExclusiveOfferEd) setShowExclusiveOfferEd(true);
  }, []);

  useEffect(() => {
    const assignAbTestVariation = async () => {
      if (variation5053?.variation_name) {
        return;
      } else if (
        patientInfo &&
        [
          'NJ',
          'NV',
          'OH',
          'OK',
          'OR',
          'PA',
          'SC',
          'TN',
          'TX',
          'UT',
          'VA',
          'WA',
          'WI',
        ].includes(patientInfo.region || '')
      ) {
        await vwo.activateBefore('5053', {
          userId: patientInfo?.profile_id,
          patientId: patientInfo.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
        });
      }
    };

    if (status5053 === 'success' && isWeightLoss) {
      assignAbTestVariation();
    }
  }, [patientInfo, profile, status5053, variation5053]);

  useEffect(() => {
    const assignAbTestVariation8685 = async () => {
      if (variation8685?.variation_name) {
        setAbTestLoading(false);
        return;
      } else if (
        patientInfo &&
        ['SC', 'KS', 'IN', 'GA', 'NH', 'NY', 'CA', 'CO'].includes(
          patientInfo.region || ''
        )
      ) {
        try {
          await vwo.activateBefore('8685', {
            userId: patientInfo?.profile_id,
            patientId: patientInfo.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
          });
        } catch (error) {
          console.error('Error activating AB test:', error);
        } finally {
          setAbTestLoading(false);
        }
      } else {
        setAbTestLoading(false);
      }
    };

    if (status8685 === 'success' && isWeightLoss) {
      assignAbTestVariation8685();
    } else if (status8685 !== 'success' || !isWeightLoss) {
      setAbTestLoading(false);
    }
  }, [patientInfo, profile, status8685, variation8685, isWeightLoss, vwo]);

  useEffect(() => {
    const assignAbTestVariation75801 = async () => {
      if (variation75801?.variation_name) {
        return;
      } else if (
        patientInfo &&
        [
          'AZ',
          'CA',
          'CO',
          'CT',
          'FL',
          'GA',
          'IA',
          'IL',
          'IN',
          'KS',
          'KY',
          'LA',
          'MN',
          'MO',
          'NC',
        ].includes(patientInfo.region || '')
      ) {
        await vwo.activateBefore('75801', {
          userId: patientInfo?.profile_id,
          patientId: patientInfo.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
        });
      }
    };

    if (status75801 === 'success' && isWeightLoss) {
      assignAbTestVariation75801();
    }
  }, [patientInfo, profile, status75801, variation75801]);

  useEffect(() => {
    const assignAbTestVariation = async () => {
      if (variation7960?.variation_name) {
        return;
      } else {
        await vwo.activateBefore('7960', {
          userId: patientInfo?.profile_id,
          patientId: patientInfo.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
        });
      }
    };
    if (status7960 === 'success' && isWeightLoss) {
      assignAbTestVariation();
    }
  }, [patientInfo, profile, status7960, variation7960]);

  useEffect(() => {
    const isPortal = router.pathname.includes('/patient-portal');
    if (isPortal) window.STZ?.trackEvent('PatientPortal');
  }, []);

  const mostRecentMentalHealthAppointment = appointmentData
    ?.filter(
      a =>
        a.care === 'Anxiety or depression' && a.appointment_type === 'Provider'
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

  const isRecurringMedication = visibleSubscriptions?.find(
    s => s.product === 'Recurring Weight Loss Medication'
  );

  const recurringMedicationSub = allVisibleSubscriptions?.filter(
    s => s.product === 'Recurring Weight Loss Medication'
  );

  const hasActiveWeightLoss = allVisibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name?.includes('Weight Loss') &&
      ['active', 'trialing', 'past_due'].includes(sub?.status)
  );

  const hasActiveWeightLossUpdated = allVisibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name.includes('Weight Loss') &&
      ['active', 'trialing', 'past_due'].includes(sub?.status)
  );

  const hasRecentActiveWeightLoss = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name?.includes('Weight Loss') &&
      ['active', 'trialing'].includes(sub?.status) &&
      differenceInDays(new Date(), new Date(sub?.created_at || '')) <= 10
  );

  const hasActiveWeightLossCompound = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name?.includes('Weight Loss') &&
      ['active', 'trialing'].includes(sub?.status) &&
      [449, 297, 39, 249].includes(sub?.price || 0)
  );

  const hasCancelledWeightLoss = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name.includes('Weight Loss') &&
      ['cancelled', 'canceled'].includes(sub?.status)
  );

  const weightLossSubs = visibleSubscriptions?.filter(s =>
    s?.subscription?.name?.includes('Weight Loss')
  );

  const isBundled =
    weightLossSubs?.some(s => s?.price === 449) ||
    weightLossSubs?.some(s => s?.price === 297) ||
    weightLossSubs?.some(s => s?.price === 249) ||
    weightLossSubs?.some(s => s?.price === 891);

  useEffect(() => {
    const assignAbTestVariation = async () => {
      if (variation8912?.variation_name) {
        return;
      } else {
        await vwo.activateBefore('8912', {
          userId: patientInfo?.profile_id,
          patientId: patientInfo.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
        });
      }
    };
    if (
      status8912 === 'success' &&
      specificCares?.includes(SpecificCareOption.WEIGHT_LOSS) &&
      !isBundled &&
      unpaidInvoices?.length
    ) {
      assignAbTestVariation();
    }
  }, [patientInfo, profile, status8912, variation8912]);

  const isMonthly = weightLossSubs.find(s => s?.interval === 'month');

  const canceledWeightLoss = weightLossSubs?.find(s => s.status === 'canceled');

  const sfcWeightLoss = weightLossSubs?.find(
    s => s.status === 'scheduled_for_cancelation'
  );

  const hasActivePsychiatry = allVisibleSubscriptions?.some(
    sub =>
      sub?.subscription?.id === 7 &&
      ['active', 'trialing', 'past_due'].includes(sub?.status)
  );

  const activeWeightLossOrders = weightLossOrders
    ? weightLossOrders.filter(
        (order: any) => !['CANCELED', 'CANCELLED'].includes(order.order_status)
      )
    : [];

  const activeRecurringMedicationSub = recurringMedicationSub
    ? recurringMedicationSub?.filter(
        sub => !['canceled', 'cancelled'].includes(sub.status)
      )
    : [];

  const mostRecent1MonthWeightLossPrescription = prescriptionRequests.find(
    pr =>
      pr.note?.toLowerCase().includes('1 month') &&
      pr.status?.toLowerCase().includes('sent') &&
      pr.is_visible
  );
  const mostRecent3MonthWeightLossPrescription = prescriptionRequests.find(
    pr =>
      pr.note?.toLowerCase().includes('3 month') &&
      pr.status?.toLowerCase().includes('sent') &&
      pr.is_visible
  );
  const mostRecent6MonthWeightLossPrescription = prescriptionRequests.find(
    pr =>
      pr.note?.toLowerCase().includes('6 month') &&
      pr.status?.toLowerCase().includes('sent') &&
      pr.is_visible
  );
  const mostRecent12MonthWeightLossPrescription = prescriptionRequests.find(
    pr =>
      pr.note?.toLowerCase().includes('12 month') &&
      pr.status?.toLowerCase().includes('sent') &&
      pr.is_visible
  );

  const weightLossPrescriptions: (PrescriptionRequest | undefined)[] = [
    mostRecent1MonthWeightLossPrescription,
    mostRecent3MonthWeightLossPrescription,
    mostRecent6MonthWeightLossPrescription,
    mostRecent12MonthWeightLossPrescription,
  ];

  const mostRecentWeightLossPrescription =
    weightLossPrescriptions.reduce<PrescriptionRequest | null>(
      (latest, current) => {
        if (!current) return latest;
        return !latest ||
          new Date(current.created_at!) > new Date(latest.created_at!)
          ? current
          : latest;
      },
      null
    );

  const showRefillVideo = useMemo(() => {
    if (!mostRecentWeightLossPrescription) return false;

    const createdAtDate = new Date(
      mostRecentWeightLossPrescription.created_at!
    );

    switch (mostRecentWeightLossPrescription) {
      case mostRecent1MonthWeightLossPrescription:
        return isAfter(new Date(), addDays(createdAtDate, 20));
      case mostRecent3MonthWeightLossPrescription:
        return isAfter(new Date(), addDays(createdAtDate, 45));
      case mostRecent6MonthWeightLossPrescription:
        return isAfter(new Date(), addDays(createdAtDate, 120));
      case mostRecent12MonthWeightLossPrescription:
        return isAfter(new Date(), addDays(createdAtDate, 300));
      default:
        return false;
    }
  }, [mostRecentWeightLossPrescription]);

  const playerRef = useRef<ReactPlayer>(null);

  const onReady = useCallback(() => {
    if (!isVideoReady) {
      const timeToStart = 1;
      playerRef?.current?.seekTo(timeToStart, 'seconds');
      setIsVideoReady(true);
    }
  }, [isVideoReady]);

  useEffect(() => {
    const brandNameMeds = [
      'mounjaro',
      'zepbound',
      'ozempic',
      'wegovy',
      'saxenda',
      'victoza',
    ];

    activeWeightLossOrders?.forEach(order => {
      const medication = order?.prescription_id?.medication?.toLowerCase();
      const medicationWords = medication?.split(/\s+/);

      const matchedBrand = medicationWords
        ? brandNameMeds.find(brand => medicationWords.includes(brand))
        : null;

      if (matchedBrand) {
        const capitalizedBrand =
          matchedBrand.charAt(0).toUpperCase() + matchedBrand.slice(1);
        setGlp1PrescribedMed(capitalizedBrand);
      }
    });
  }, [activeWeightLossOrders]);

  const getWillShowRateZealthyPurchase = async () => {
    if (sessionStorage.getItem('willPromptRateZealthyPurchase') === 'true') {
      setPromptRateZealthyPurchase(true);

      await updatePatient.mutateAsync({
        multi_purchase_rating_prompted: true,
      });
      sessionStorage.removeItem('willPromptRateZealthyPurchase');
    }
  };
  useEffect(() => {
    getWillShowRateZealthyPurchase();
  }, [Router.asPath]);

  async function fetchIsPatientMentalHealth() {
    const mentalHealth = await supabase
      .from('visit_reason')
      .select(
        `*, visit_id!inner(patient_id, status), reason_for_visit!inner(reason)`
      )
      .eq('visit_id.patient_id', patientInfo?.id)
      .in('reason_for_visit.reason', ['Anxiety or depression', 'Mental health'])
      .eq('visit_id.status', 'Completed');

    if ((mentalHealth.data?.length ?? 0) > 0) {
      setIsMentalHealth(true);
    }
  }

  const scheduleForCancelationPersonalizedPsychiatry =
    allVisibleSubscriptions?.find(
      sub =>
        sub?.subscription?.id === 7 &&
        sub?.status === 'scheduled_for_cancelation'
    );
  const cancelledPersonalizedPsychiatry = allVisibleSubscriptions?.find(
    sub =>
      sub?.subscription?.id === 7 &&
      ['cancelled', 'canceled'].includes(sub?.status)
  );

  const hasCancelledPsychiatry = allVisibleSubscriptions?.some(
    sub =>
      sub?.subscription?.id === 7 &&
      ['cancelled', 'canceled'].includes(sub?.status)
  );

  const isCoachingOnly =
    weightLossPatient?.subscription?.name?.includes('Coaching Only');

  const handleReactivation = useCallback(async () => {
    if (sfcWeightLoss) {
      await reactivateSubscription.mutateAsync(sfcWeightLoss?.reference_id!);
    } else {
      await renewPrescription.mutateAsync(canceledWeightLoss);
    }
  }, [
    sfcWeightLoss,
    reactivateSubscription,
    renewPrescription,
    canceledWeightLoss,
  ]);

  const handleReactivationPS = useCallback(async () => {
    if (scheduleForCancelationPersonalizedPsychiatry) {
      await reactivateSubscription.mutateAsync(
        scheduleForCancelationPersonalizedPsychiatry.reference_id
      );
    } else {
      await renewPrescription.mutateAsync(cancelledPersonalizedPsychiatry);
    }
  }, [
    scheduleForCancelationPersonalizedPsychiatry,
    reactivateSubscription,
    renewPrescription,
    hasCancelledPsychiatry,
  ]);

  const handleOpenReactivateWL = useCallback(
    () => setShowRestartWeightLoss(true),
    []
  );

  const handleOpenReactivatePsychiatry = useCallback(
    () => setShowRestartPersonalizedPsychiatry(true),
    []
  );

  const { data: requests } = usePatientPrescriptionRequest();
  const showGLP1Item = useMemo(() => {
    return !!requests?.find(r =>
      [
        'Zepbound',
        'Wegovy',
        'Ozempic',
        'Mounjaro',
        'Saxenda',
        'Victoza',
        'Bupropion and Naltrexone',
        'Metformin',
      ].includes(r.specific_medication ?? '')
    );
  }, [requests]);

  const updateData = useCallback(() => {
    if (Array.isArray(requests)) {
      let hasWeightLossRequest = false;
      requests
        ?.filter(r => r.status !== 'PRE_INTAKES')
        .forEach(request => {
          const medication =
            request?.medication_quantity?.medication_dosage?.medication;

          if (medication?.name === 'Non-GLP1 Medication') {
            setHasNonGLP1Request(true);
          }
          if (request?.medication_quantity_id === 98) {
            setHasPendingCompoundWeightLossRequest(true);
          }
          if (request?.medication_quantity_id === 124) {
            setHasNonCompoundGLP1Request(true);
          }
          if (
            medication?.display_name?.toLowerCase().includes('birth control')
          ) {
            setHasPendingBirthControlRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('menopause')) {
            setHasPendingMenopauseRequest(true);
          }
          if (medication?.display_name?.includes('ED')) {
            setHasPendingEdRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('hair loss')) {
            setHasPendingHairLossRequest(true);
          }
          if (
            medication?.display_name?.toLowerCase().includes('female hair loss')
          ) {
            setHasPendingHairLossFRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('rosacea')) {
            setHasPendingRosaceaRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('acne')) {
            setHasPendingAcneRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('melasma')) {
            setHasPendingMelasmaRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('anti-aging')) {
            setHasPendingAntiAgingRequest(true);
          }
          if (
            medication?.display_name?.toLowerCase().includes('enclomiphene')
          ) {
            setHasPendingEnclomipheneRequest(true);
            setEnclomiphenePrescriptionRequest(request);
          }
          if (medication?.display_name?.toLowerCase().includes('preworkout')) {
            setHasPendingPreworkoutRequest(true);
          }
          if (
            ['personalized psychiatry', 'mental health'].includes(
              request?.type?.toLowerCase() || ''
            )
          ) {
            setHasPendingMentalHealthRequest(true);
          }

          if (
            (request?.specific_medication || '') === 'Wegovy' &&
            patientInfo?.insurance_skip &&
            requests.indexOf(request) === 0
          ) {
            hasWeightLossRequest = true;
            setWeightLossPrescriptionRequest(null);
          } else if (isWeightLossMed(medication?.name || '')) {
            hasWeightLossRequest = true;
            setWeightLossPrescriptionRequest(request);
          } else {
            setOtherPrescriptionRequests(prev => [...prev, request]);
          }
        });

      setHasPendingWeightLossRequest(hasWeightLossRequest);
    }
  }, [requests]);

  async function fetchOrders() {
    const allOrders = await supabase
      .from('order')
      .select(
        '*, prescription_id:prescription!inner(*), prescription_request_id:prescription_request(*)'
      )
      .eq('patient_id', patientInfo?.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => (data || []) as OrderPropsWithPrescriptionRequest[]);

    const filteredOrders = allOrders?.filter(
      o =>
        !(
          o.order_status?.includes('AUTO_REFILL') ||
          o.order_status?.includes('BUNDLED_REFILL') ||
          ['PAYMENT_FAILED', 'CANCELED', 'CANCELLED'].includes(o.order_status!)
        )
    );

    // Compute hasValidOrder and update the state
    const validOrderExists = filteredOrders?.length > 0;

    setHasValidOrder(validOrderExists || hasValidOrder);

    if (filteredOrders?.length) {
      setOrders(filteredOrders);

      // only show most recent order with type ED if there are multiple ED orders
      const edOrders = filteredOrders.filter(
        o =>
          (o?.prescription_request_id?.type === 'ED' ||
            o?.prescription_id?.medication
              ?.toLowerCase()
              .includes('hardies')) &&
          !o?.prescription_id?.medication
            ?.toLowerCase()
            .includes('enclomiphene')
      );

      if (edOrders.length) {
        const mostRecentEdOrder = edOrders.reduce((prev, current) =>
          prev?.created_at! > current?.created_at! ? prev : current
        );
        filteredOrders.forEach(order => {
          if (
            edOrders.includes(order) &&
            order?.created_at !== mostRecentEdOrder?.created_at
          ) {
            order.order_status = 'CANCELLED';
          }
        });
      }

      const enclomipheneOrders = filteredOrders.filter(o =>
        o?.prescription_id?.medication?.toLowerCase().includes('enclomiphene')
      );

      if (enclomipheneOrders.length) {
        const mostRecentEnclomipheneOrder = enclomipheneOrders.reduce(
          (prev, current) =>
            prev?.created_at! > current?.created_at! ? prev : current
        );
        filteredOrders.forEach(order => {
          if (
            enclomipheneOrders.includes(order) &&
            order?.created_at !== mostRecentEnclomipheneOrder?.created_at
          ) {
            order.order_status = 'CANCELLED';
          }
        });
      }

      setNonGLP1Orders(
        filteredOrders?.filter(
          o => !isWeightLossMed(o?.prescription_id?.medication || '')
        )
      );
    }

    const groupedData: { [key: string]: any[] } = {};
    const allWeightLossOrders = filteredOrders?.filter(o =>
      isWeightLossMed(o?.prescription_id?.medication?.toLowerCase() || '')
    );

    allWeightLossOrders?.forEach(order => {
      const key = `${order.total_dose || order?.prescription_id?.medication}-${
        order?.group_id ||
        format(new Date(order.created_at || ''), 'dd-MM-yyyy HH:mm')
      }`;

      if (groupedData[key]) {
        groupedData[key].push(order);
      } else {
        groupedData[key] = [order];
      }
    });

    const groupedOrders = Object.entries(groupedData)?.map(o => o[1]);
    const result: OrderProps[] = [];
    for (const group of groupedOrders) {
      const sortedOrders = group?.toSorted((a, b) => b?.id - a?.id);
      if (
        sortedOrders?.length &&
        differenceInDays(
          new Date(),
          new Date(sortedOrders?.[0]?.created_at || '')
        ) <
          (sortedOrders?.reduce(
            (total, item) => total + item?.prescription_id?.duration_in_days,
            0
          ) || 0) +
            35 &&
        !sortedOrders?.every(o =>
          o.order_status.toLowerCase().includes('cancel')
        )
      ) {
        setWeightLossOrders([...sortedOrders]);
        break;
      } else {
        setWeightLossOrders([]);
      }
    }
  }

  const AppointmentsSvgIcon = () => (
    <svg
      width="28"
      height="26"
      viewBox="0 0 28 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.375 25.5C15.2292 25.5 15.0833 25.4844 14.9375 25.4531C14.7917 25.4219 14.6458 25.3854 14.5 25.3438L6.90625 22.5312C6.40625 22.3438 6.01042 22.0365 5.71875 21.6094C5.42708 21.1823 5.28125 20.7188 5.28125 20.2188C5.28125 20.1146 5.33333 19.8229 5.4375 19.3438L8.59375 10.5H6.75L10.0625 5.53125C10.1667 5.40625 10.2031 5.27083 10.1719 5.125C10.1406 4.97917 10.0729 4.85417 9.96875 4.75L9.53125 4.3125L3.1875 9.8125C2.83333 10.1042 2.56771 10.4531 2.39062 10.8594C2.21354 11.2656 2.125 11.6979 2.125 12.1562V19.875H0.25V12.1562C0.25 11.4271 0.401042 10.7344 0.703125 10.0781C1.00521 9.42188 1.42708 8.85417 1.96875 8.375L9.625 1.75L11.1562 3.28125L11.5625 2.15625C11.75 1.65625 12.0573 1.25521 12.4844 0.953125C12.9115 0.651042 13.3854 0.5 13.9062 0.5C14.0729 0.5 14.224 0.510417 14.3594 0.53125C14.4948 0.552083 14.6458 0.59375 14.8125 0.65625L22.4062 3.46875C22.9062 3.65625 23.3021 3.96875 23.5938 4.40625C23.8854 4.84375 24.0312 5.3125 24.0312 5.8125C24.0312 5.9375 23.9792 6.21875 23.875 6.65625L23.1562 8.65625C23.7604 8.76042 24.2604 9.04167 24.6562 9.5C25.0521 9.95833 25.25 10.5 25.25 11.125C25.25 11.2292 25.2448 11.3333 25.2344 11.4375C25.224 11.5417 25.1979 11.6458 25.1563 11.75H25.25C25.9375 11.75 26.526 11.9948 27.0156 12.4844C27.5052 12.974 27.75 13.5625 27.75 14.25C27.75 14.75 27.6198 15.1979 27.3594 15.5938C27.099 15.9896 26.7604 16.2917 26.3438 16.5C26.3854 16.6458 26.4219 16.7865 26.4531 16.9219C26.4844 17.0573 26.5 17.2083 26.5 17.375C26.5 18.0625 26.2552 18.651 25.7656 19.1406C25.276 19.6302 24.6875 19.875 24 19.875H23.9063C23.9479 19.9792 23.974 20.0833 23.9844 20.1875C23.9948 20.2917 24 20.3958 24 20.5C24 21.1875 23.7552 21.776 23.2656 22.2656C22.776 22.7552 22.1875 23 21.5 23H18.0312L17.75 23.8438C17.5833 24.3646 17.276 24.7708 16.8281 25.0625C16.3802 25.3542 15.8958 25.5 15.375 25.5ZM16.1875 20.7188L20.6875 8.125L13.0938 5.3125L8.59375 17.9062L16.1875 20.7188ZM18.6875 21.125H21.5C21.6667 21.125 21.8125 21.0625 21.9375 20.9375C22.0625 20.8125 22.125 20.6667 22.125 20.5C22.125 20.3333 22.0625 20.1875 21.9375 20.0625C21.8125 19.9375 21.6667 19.875 21.5 19.875H19.1562L18.6875 21.125ZM19.8125 18H24C24.1667 18 24.3125 17.9375 24.4375 17.8125C24.5625 17.6875 24.625 17.5417 24.625 17.375C24.625 17.2083 24.5625 17.0625 24.4375 16.9375C24.3125 16.8125 24.1667 16.75 24 16.75H20.2812L19.8125 18ZM20.9375 14.875H25.25C25.4167 14.875 25.5625 14.8125 25.6875 14.6875C25.8125 14.5625 25.875 14.4167 25.875 14.25C25.875 14.0833 25.8125 13.9375 25.6875 13.8125C25.5625 13.6875 25.4167 13.625 25.25 13.625H21.375L20.9375 14.875ZM22.0625 11.75H22.75C22.9167 11.75 23.0625 11.6875 23.1875 11.5625C23.3125 11.4375 23.375 11.2917 23.375 11.125C23.375 10.9583 23.3125 10.8125 23.1875 10.6875C23.0625 10.5625 22.9167 10.5 22.75 10.5H22.5L22.0625 11.75Z"
        fill="black"
      />
    </svg>
  );

  async function fetchPrescriptions() {
    const orders = await supabase
      .from('order')
      .select('*, prescription ( medication )')
      .eq('patient_id', patientInfo?.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => data as OrderProps[]);
    const isPrescriptionComplete = orders?.some(
      order =>
        order.order_status === 'Complete' ||
        order.order_status === 'DELIVERED' ||
        order.order_status === 'Has Shipped' ||
        order.order_status === 'SENT_TO_LOCAL_PHARMACY'
    );

    if (isPrescriptionComplete) {
      setHasPrescription(true);
    }
  }

  async function fetchRatableOrders() {
    const orders = await supabase
      .from('order')
      .select(`*, prescription ( medication, pharmacy )`)
      .eq('patient_id', patientInfo?.id)
      .or('feedback.is.null,feedback->skip_attempts.lt.3')
      .order('created_at', { ascending: false })
      .then(({ data }) => data || []);

    const filtered = orders.filter(o => {
      let shipment_details = o?.shipment_details;
      let order_status = o?.order_status;
      if (
        (shipment_details &&
          shipment_details?.toLowerCase()?.includes('delivered')) ||
        (order_status && order_status?.toLowerCase() === 'delivered')
      ) {
        const nextDisplayTime = sessionStorage.getItem(`skipOrderRating`);
        if (!nextDisplayTime || new Date(nextDisplayTime) <= new Date())
          return true;
      }
      return false;
    });

    if (filtered?.length) {
      setRatableOrder(filtered[0] as Order);
    }
  }

  async function fetchAppointments() {
    const appointments = await supabase
      .from('appointment')
      .select(
        'id, daily_room, created_at, starts_at, ends_at, care, encounter_type, duration, visit_type, status, appointment_type, feedback, clinician (id, type, specialties, canvas_practitioner_id, profiles(*))'
      )
      .eq('patient_id', patientInfo?.id);

    const ratable = appointments?.data?.filter(a => {
      const skipFeedback = a.feedback as {
        status?: string;
        skip_attempts?: number;
      };
      return (
        a.status === 'Completed' &&
        (a.feedback === null ||
          (skipFeedback.skip_attempts && skipFeedback.skip_attempts < 3))
      );
    });

    setRatableAppts(ratable as ApptProps[]);
    setPatientAppointments(appointments?.data as ApptProps[]);
  }
  async function fetchProviderAppointments() {
    const appointments = await supabase
      .from('appointment')
      .select(
        'id, daily_room, created_at, care, starts_at, ends_at, encounter_type, duration, visit_type, status, appointment_type, feedback, clinician (id, type, specialties, canvas_practitioner_id, profiles(*))'
      )
      .eq('patient_id', patientInfo?.id)
      .order('created_at', { ascending: false });

    const provider = appointments?.data?.filter(
      a => a.appointment_type === 'Provider' && a.care === 'Weight loss'
    );

    setProviderAppts(provider as ApptProps[]);
  }

  async function fetchUpcomingAppointments() {
    const appts = await supabase
      .from('appointment')
      .select(
        `id, daily_room, created_at, care, starts_at, ends_at, visit_type, appointment_type, duration, status, clinician (*, profiles(*))`
      )
      .or(`status.eq.Confirmed`)
      .match({
        patient_id: patientInfo?.id,
        encounter_type: 'Scheduled',
      })
      .gt('starts_at', subMinutes(new Date(), 15).toISOString())
      .order('starts_at', { ascending: true })
      .then(({ data }) => (data || []) as ApptProps[]);

    setAppointmentData(appts.sort(appointmentSorting) as ApptProps[]);
  }

  async function fetchNoShowAppointments() {
    const appointments = await supabase
      .from('appointment')
      .select(
        'id, daily_room, created_at, care, starts_at, ends_at, encounter_type, duration, visit_type, status, appointment_type, feedback, clinician (id, type, specialties, canvas_practitioner_id, profiles(*))'
      )
      .eq('patient_id', patientInfo?.id);

    const scheduledAppointments = appointments?.data
      ?.filter(a => a.encounter_type === 'Scheduled')
      .filter(
        a => differenceInWeeks(new Date(), new Date(a.starts_at || '')) < 4
      );

    const noshowed = scheduledAppointments?.filter(a =>
      a.status.toLowerCase().includes('noshowed')
    );

    setNoshowedAppts(noshowed as ApptProps[]);
  }

  async function fetchWegovyPrescriptions() {
    const wegovyPrescriptions = await supabase
      .from('prescription')
      .select()
      .eq('patient_id', patientInfo?.id)
      .ilike('medication', `%${'wegovy'}%`)
      .then(({ data }) => data);

    setWegovyPrescribed(!!wegovyPrescriptions?.length);
  }

  async function fetchWeightLossRefill() {
    const { data } = await supabase
      .from('order')
      .select(
        `created_at, sent_to_pharmacy_at, order_status, prescription(medication, medication_quantity_id, duration_in_days, count_of_refills_allowed)`
      )
      .eq('patient_id', patientInfo?.id)
      .neq('order_status', 'CANCELLED')
      .neq('order_status', 'Cancelled')
      .neq('order_status', 'Order Canceled')
      .order('created_at', { ascending: false })
      .returns<RefillProps[]>();

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
      .eq('patient_id', patientInfo?.id)
      .then(({ data }) => data);

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

    //as long as we have a prev wl order, show rx refill modal

    if (mostRecent) {
      setShowWeightLossRefill(true);
      setShowWeightLossCompoundRefill(true);
    }

    if (mostRecent && mostRecent.created_at) {
      const daysSince = differenceInDays(
        new Date(),
        new Date(mostRecent.sent_to_pharmacy_at || mostRecent.created_at)
      );
      const refillCliff = prescriptionLength - 7;
      const dosageCliff = 28;

      if (
        mostRecent.prescription.medication_quantity_id === 98 &&
        mostRecent.prescription.duration_in_days === 90 &&
        daysSince >= dosageCliff &&
        daysSince <= refillCliff - 13 &&
        !hasRecentWeightLossRequest
      ) {
        setShowDosageUpdate(true);
      }
    }
  }

  async function bundle() {
    const activeBundle = await supabase
      .from('patient_subscription')
      .select()
      .eq('patient_id', patientInfo?.id)
      .in('status', ['trialing', 'active'])
      .in('price', [297, 446])
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);
  }
  const fetchInsuranceData = async () => {
    const files = await fetchFiles(`patient-${patientInfo.id}/insurance-card`);
    if (files.length > 0) {
      setUploadedFiles(files);
    }
  };

  const fetchEnclomipheneLabData = async () => {
    const enclomipheneLabsFolder = await fetchFiles(
      `patient-${patientInfo.id}/enclomiphene-labs`
    );
    const oldEnclomipheneFolder = await fetchFiles(
      `patient-${patientInfo.id}/enclomiphene`
    );
    const prepLabsFolder = await fetchFiles(
      `patient-${patientInfo.id}/prep-labs`
    );
    const labWorkFolder = await fetchFiles(
      `patient-${patientInfo.id}/lab-work`
    );

    const labFiles = [
      ...enclomipheneLabsFolder,
      ...oldEnclomipheneFolder,
      ...prepLabsFolder,
      ...labWorkFolder,
    ];

    if (labFiles.length > 0) {
      setEnclomipheneUploadedFiles(labFiles);
    }
  };

  const fetchFaxes = async () => {
    const files = await fetchFiles(`patient-${patientInfo.id}/faxes`);
    if (files.length > 0) {
      setUploadedFaxes(files);
    }
  };

  const fetchLabInvoices = async () => {
    const labInvoice = await supabase
      .from('invoice')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('patient_id', patientInfo?.id)
      .neq('status', 'draft')
      .eq('amount_paid', 72.5)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    setHasPurchasedLab(labInvoice);
  };

  const fetchZealthyRatings = async () => {
    const ratings: any = await supabase
      .from('subscriber_feedback')
      .select('*')
      .eq('patient_id', patientInfo?.id)
      .then(({ data }) => data);

    setPatientZealthyRating(ratings);
  };

  const fetchCoachRatings = async () => {
    const ratings: any = await supabase
      .from('audit')
      .select('*')
      .eq('reviewer_id', patientInfo?.profile_id)
      .eq('is_patient', true)
      .then(({ data }) => data);

    setPatientCoachRatings(ratings);
  };

  useEffect(() => {
    if (!profile?.email || !patientReferrals) return;

    const redeemed = patientReferrals?.redemptions?.filter(
      (redemption: PatientReferralRedeem) => redemption.redeemed
    )?.length;

    window.freshpaint?.identify(profile?.id, {
      referral_leads: patientReferrals?.redemptions?.length || 0,
      referral_conversions: redeemed || 0,
    });
  }, [patientReferrals, profile]);

  const handleCloseReferralModal = async () => {
    setOpenReferralModal(false);
    await supabase
      .from('patient')
      .update({ has_seen_referral: true })
      .eq('id', patientInfo?.id);
  };

  useEffect(() => {
    if (
      (patientInfo?.region === 'FL' || patientInfo?.region === 'TX') &&
      isWeightLoss &&
      !patientInfo?.has_seen_referral &&
      !isPatient65OrOlder
    ) {
      setOpenReferralModal(true);
    }
  }, [
    isWeightLoss,
    patientInfo?.region,
    patientInfo?.has_seen_referral,
    isPatient65OrOlder,
  ]);

  const refillRequestActionItem = actionItems?.find(
    actionItem => actionItem.type === 'PRESCRIPTION_RENEWAL_REQUEST'
  );

  useEffect(() => {
    if (!!refillRequestActionItem) {
      setDisplayRefillRequestModal(true);
    }
  }, [refillRequestActionItem]);

  const processDateOrShipDate = useMemo(() => {
    return labOrders?.[0]?.date_shipped
      ? differenceInDays(
          new Date(),
          new Date(labOrders?.[0]?.date_shipped || new Date())
        ) <= 10
      : differenceInDays(
          new Date(),
          new Date(labOrders?.[0]?.created_at || new Date())
        ) <= 10;
  }, [labOrders]);

  const displayDeliveredLabKitCard = useMemo(() => {
    return (
      ([
        'ORDERED',
        'inTransitToPatient',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
      ].includes(labOrders?.[0]?.status || '') &&
        processDateOrShipDate) ||
      (['DELIVERED'].includes(labOrders?.[0]?.status || '') &&
        differenceInDays(
          new Date(),
          new Date(labOrders?.[0]?.date_delivered || new Date())
        ) <= 20)
    );
  }, [labOrders, processDateOrShipDate]);

  const checkIDVerification = async () => {
    if (didCheckIDVerification) return;

    setDidCheckIDVerification(true);
    if (
      weightLossPatient &&
      (patientInfo?.has_verified_identity || patientInfo?.vouched_verified)
    ) {
      window?.freshpaint?.track('weight-loss-completed-ID-verification');
    }
  };

  const cleanDuplicateSubscriptions = async () => {
    if (!patientInfo?.id || didCheckDuplicates) return;
    setDidCheckDuplicates(true);

    try {
      const { data, error } = await supabase
        .from('patient_subscription')
        .select('*')
        .eq('patient_id', patientInfo.id)
        .eq('subscription_id', 4)
        .eq('price', 135)
        .eq('visible', true);

      if (error)
        throw new Error(error.message || 'Error fetching subscriptions');

      if (!data || data.length <= 1) {
        console.log('No duplicate subscriptions found');
        return;
      }

      // Pick the earliest created subscription that's active first, otherwise earliest overall
      const activeSubs = data.filter(sub => sub.status === 'active');
      let subscriptionToKeep: Database['public']['Tables']['patient_subscription']['Row'];

      if (activeSubs.length > 0) {
        activeSubs.sort(
          (a, b) =>
            new Date(a.created_at || '').getTime() -
            new Date(b.created_at || '').getTime()
        );
        subscriptionToKeep = activeSubs[0];
      } else {
        data.sort(
          (a, b) =>
            new Date(a.created_at || '').getTime() -
            new Date(b.created_at || '').getTime()
        );
        subscriptionToKeep = data[0];
      }

      const duplicates = data.filter(
        sub => sub.reference_id !== subscriptionToKeep?.reference_id
      );

      for (const sub of duplicates) {
        // If subscription is already canceled, just hide it
        if (sub.status === 'canceled') {
          await supabase
            .from('patient_subscription')
            .update({ visible: false })
            .eq('reference_id', sub.reference_id);
        } else {
          // scheduled_for_cancelation or active → do full cancel & hide
          const response = await payment.cancelSubscription(
            sub.reference_id!,
            'Duplicate subscription detected.'
          );
          console.log('response', response);
          if (response.data.error) {
            throw new Error(
              response.data.error.message || 'Cancellation failed.'
            );
          }
          await supabase
            .from('patient_subscription')
            .update({ visible: false })
            .eq('reference_id', sub.reference_id);
        }
      }
      console.log('Duplicate subscriptions canceled successfully.');
      refetchSub();
    } catch (err) {
      console.error('Error during subscription deduplication:', err);
    }
  };

  useEffect(() => {
    if (patientInfo?.id) {
      Promise.allSettled([
        fetchOrders(),
        fetchAppointments(),
        fetchRatableOrders(),
        fetchPrescriptions(),
        fetchUpcomingAppointments(),
        fetchWegovyPrescriptions(),
        fetchNoShowAppointments(),
        fetchIsPatientMentalHealth(),
        fetchInsuranceData(),
        fetchWeightLossRefill(),
        bundle(),
        fetchProviderAppointments(),
        fetchLabInvoices(),
        fetchEnclomipheneLabData(),
        fetchFaxes(),
        fetchZealthyRatings(),
        fetchCoachRatings(),
      ]).then(() => {
        checkIDVerification();
        cleanDuplicateSubscriptions();
      });
    }
  }, [patientInfo?.id]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  // clear session storage
  useEffect(() => {
    dispatch({ type: CommonActionTypes.RESET });
  }, [dispatch]);
  useEffect(() => {
    // Prevent navigating back using browser's back button
    const handlePopstate = () => {
      // Revert the navigation attempt by going forward again
      window.history.forward();
    };

    // Attach the event listener when the component mounts
    window.addEventListener('popstate', handlePopstate);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  const skincareOrders = orders?.filter(order => {
    return order?.order_status === 'PENDING_SKINCARE_ORDER';
  });

  const enclomipheneOrders = orders?.some(order =>
    order.prescription_id?.medication?.toLowerCase().includes('enclomiphene')
  );

  const handleGoToProviderSchedule = (key: string) => {
    if (sfcWeightLoss) {
      setIsProviderCallItem(true);
      setShowRestartWeightLoss(true);
      return;
    } else if (!sfcWeightLoss && key === 'provider-call') {
      setSelectedVisitType(key);
    }
  };

  useEffect(() => {
    // Check if there's a 15-minute appointment with a "Completed" status
    if (
      providerAppts?.some(
        appointment =>
          appointment.status === 'Completed' && appointment.duration === 15
      )
    ) {
      setHasCompletedAppointment(true);
    }
  }, [providerAppts]);

  const isOrderRatedBelow5 = orders?.every((order: any) =>
    isRating5Stars(order?.feedback?.rating)
  );
  const isAppointmentRatedBelow5 = patientAppointments?.every((app: any) =>
    isRating5Stars(app?.feedback?.rating)
  );
  const isZealthyRatedBelow5 = patientZealthyRating?.every((rating: any) =>
    isRating5Stars(rating?.score)
  );
  const isCoachRatedBelow5 = patientCoachRatings?.every((rating: any) =>
    isRating5Stars(rating?.review_score)
  );

  const isOrderRated = orders?.some((order: any) => order?.feedback?.rating);
  const isAppointmentRated = patientAppointments?.some(
    (app: any) => app?.feedback?.rating
  );
  const isZealthyRated = patientZealthyRating?.some(
    (rating: any) => rating?.score
  );
  const isCoachRated = patientCoachRatings?.some(
    (rating: any) => rating?.review_score
  );
  const isAnyRated5 =
    isOrderRatedBelow5 &&
    isAppointmentRatedBelow5 &&
    isZealthyRatedBelow5 &&
    isCoachRatedBelow5 &&
    (isOrderRated || isAppointmentRated || isZealthyRated || isCoachRated);

  /// My Treatment Plan Items ///
  const myTreatmentPlanItemsArray = [];

  const uniqueKeys = new Set();
  const addItem = (item: any) => {
    if (!uniqueKeys.has(item.key)) {
      uniqueKeys.add(item.key);
      myTreatmentPlanItemsArray.push(item);
    }
  };

  const [visibleItems, setVisibleItems] = useState<number>(5);
  const [seeMore, setSeeMore] = useState<boolean>(false);

  const hasVerifiedIdentity = useMemo(() => {
    return patientInfo.has_verified_identity || patientInfo.vouched_verified;
  }, [patientInfo.has_verified_identity, patientInfo.vouched_verified]);

  const handleSeeAll = () => {
    setVisibleItems(
      prevItems => prevItems + (myTreatmentPlanItemsArray.length - prevItems)
    );
    setSeeMore(true);
  };
  const handleSeeLess = () => {
    setVisibleItems(5);
    setSeeMore(false);
  };

  const isOver60Days = (date?: string | null) => {
    if (!date) return false;
    const differenceInDays =
      (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    return differenceInDays > 60;
  };

  const showRefillCard = useMemo(() => {
    if (
      variation5053?.variation_name === 'Variation-1' &&
      mostRecent3MonthWeightLossPrescription
    ) {
      if (isOver60Days(mostRecent3MonthWeightLossPrescription.created_at)) {
        return true;
      } else return false;
    } else if (
      !!weightLossPatient &&
      (showWeightLossCompoundRefill || showWeightLossRefill)
    ) {
      return true;
    } else {
      return false;
    }
  }, [
    variation5053,
    mostRecent3MonthWeightLossPrescription,
    weightLossPatient,
    showWeightLossCompoundRefill,
    showWeightLossRefill,
  ]);

  isEnclomiphenePatient &&
    showLabKitOrderModal &&
    addItem({
      data: {
        head: 'Order Lab Kit',
        body: `Order a lab kit to your home and get started on enclomiphene (required if you don't have labs already with total testosterone level).`,
        icon: PackageBlack,
        path: Pathnames.ENCLOMIPHENE_LAB_KIT_ORDER,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'order-lab-kit',
    });

  const medication =
    weightLossOrders?.[0]?.prescription_id?.medication
      ?.split(' ')[0]
      .toLowerCase() || '';

  // Combine conditions into a single variable
  const allowShowOrderCompoundCard =
    // Ensure there are weight loss orders
    weightLossOrders?.length > 0 &&
    // Check if the medication is either semaglutide or tirzepatide
    ['semaglutide', 'tirzepatide'].includes(medication);

  const allowShowOralSemaglutideOrderCard =
    // Ensure there are weight loss orders
    weightLossOrders?.length > 0 &&
    // Check if the medication is either semaglutide or tirzepatide
    medication.includes('oral');
  //

  isBundled &&
    isMonthly &&
    addItem({
      data: {
        head: `Receive 20% off on a 3 month supply of ${
          weightLossSubs.find(s => s?.price === 249)
            ? 'Oral Semaglutide'
            : weightLossSubs.find(s => s?.price === 449)
            ? 'Tirzepatide'
            : 'Semaglutide'
        }`,
        body: `For a limited time save $${
          weightLossSubs.find(s => s?.price === 449) ? '180' : '148'
        } on a 3 month supply of ${
          weightLossSubs.find(s => s?.price === 449)
            ? 'Tirzepatide'
            : 'Semaglutide'
        } by paying for 2 months of your membership upfront.`,
        icon: NoteAltOutlinedIcon,
        path: `/patient-portal/weight-loss-treatment/bundled/${
          weightLossSubs.find(s => s?.price === 449)
            ? 'Tirzepatide'
            : weightLossSubs.find(s => s.price === 249)
            ? 'Oral Semaglutide'
            : 'Semaglutide'
        }`,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'bundle-weight-loss-renew',
    });
  {
    isWeightLoss &&
    !patientInfo?.glp1_ineligible &&
    patientPriorAuths?.length === 0 &&
    variation8685?.variation_name !== 'Variation-2' &&
    variation8685?.variation_name !== 'Variation-3'
      ? addItem({
          data: {
            head: 'Request a name brand weight loss medication',
            body: 'We can help you request prescriptions for name brand GLP-1 medications such as Wegovy, Zepbound, Ozempic, or Mounjaro.',
            icon: NoteAltOutlinedIcon,
            path: '/patient-portal/weight-loss-treatment/glp1',
            disableInsuranceUpdate: true,
          },
          newWindow: false,
          color: theme.palette.background.paper,
          iconBg: '#8ACDA0',
          text: theme.palette.text.primary,
          key: 'regular-name-brand-request',
        })
      : null;
  }

  !!weightLossPatient &&
    !isCoachingOnly &&
    !isBundled &&
    !patientInfo?.glp1_ineligible &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data: {
        head: 'Request compound Semaglutide or Tirzepatide',
        body: `If you do not wish for your insurance to cover your medication,
        you can request medication from a partner compound pharmacy.`,
        icon: Syringe,
        path: patientPrescriptions?.some(
          presc => presc.medication_quantity_id === 98
        )
          ? Pathnames.WL_REFILL_TREATMENT
          : isBundled
          ? Pathnames.WL_BUNDLED_TREATMENT
          : Pathnames.WL_NONBUNDLED_TREATMENT,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'weight-loss-compound',
    });

  isMentalHealth &&
    (activePatientSubscriptions?.filter(
      sub => sub?.subscription?.name === 'Zealthy Personalized Psychiatry'
    ).length ?? 0) > 0 &&
    mostRecentMentalHealthAppointment?.status !== 'Confirmed' &&
    addItem({
      data: {
        head: 'Schedule follow-up with psychiatric provider',
        body: `Follow-up appointments for your psychiatric care
              (included in your Personalized Psychiatry
              membership).`,
        icon: PhoneOutlined,
        path: Pathnames.PATIENT_PORTAL_SCHEDULE_PSYCHIATRY,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'psychiatry-subscription-followup',
    });

  showRefillCard &&
    addItem({
      data: {
        head: 'Request weight loss Rx refill',
        body: `To make sure you don't have gaps in medication coverage, request your refill about 1 week before your last dose.`,
        icon: MedicationOutlinedIcon,
        path: '/patient-portal/visit/weight-loss-refill',
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'weight-loss-request-refill',
    });

  {
    isWeightLoss &&
    !patientInfo?.glp1_ineligible &&
    patientPriorAuths?.length === 0 &&
    (variation8685?.variation_name === 'Variation-2' ||
      variation8685?.variation_name === 'Variation-3')
      ? addItem({
          data: {
            head: 'Request a name brand weight loss medication',
            body: 'We can help you request prescriptions for name brand GLP-1 medications such as Wegovy, Zepbound, Ozempic, or Mounjaro.',
            icon: NoteAltOutlinedIcon,
            path: '/patient-portal/weight-loss-treatment/glp1',
            disableInsuranceUpdate: true,
          },
          newWindow: false,
          color: theme.palette.background.paper,
          iconBg: '#8ACDA0',
          text: theme.palette.text.primary,
          key: 'ab-test-8685-name-brand-request',
        })
      : null;
  }

  myTreatmentPlanItemsArray.push(
    ...(patientInfo?.status === 'ACTIVE'
      ? getCareWeightLoss
          ?.filter(data => {
            if (patientInfo?.status !== 'ACTIVE' && data.head === 'Messages') {
              return false;
            }
            if (
              data.head === 'Medication, prescription renewals & delivery' &&
              hasValidOrder
            ) {
              return true;
            }
          })
          .slice(0, 1)
          .map((data, i) => ({
            data,
            newWindow: false,
            color: theme.palette.background.paper,
            iconBg: '#8ACDA0',
            text: theme.palette.text.primary,
            key: `${i}-get-care`,
          }))
      : getCare
          .filter(data => {
            if (patientInfo?.status === 'ACTIVE' && data.head === 'Messages') {
              return true;
            }
            if (hasValidOrder) {
              addItem({
                data: {
                  head: 'Medication, prescription renewals & delivery',
                  body: `Review your medication prescription requests and medications orders, including Rx being shipped to your home or sent to a pharmacy near you.`,
                  icon: Delivery,
                  path: Pathnames.MANAGE_PRESCRIPTIONS,
                },
                newWindow: false,
                color: theme.palette.background.paper,
                iconBg: '#8ACDA0',
                text: theme.palette.text.primary,
                key: 'order-history',
              });
            }
          })
          .slice(0, 1)
          .map((data, i) => ({
            data,
            newWindow: false,
            color: theme.palette.background.paper,
            iconBg: '#8ACDA0',
            text: theme.palette.text.primary,
            key: `${i}-get-care`,
          })))
  );
  //
  (hasActiveWeightLoss || sfcWeightLoss) &&
    !allowShowOrderCompoundCard &&
    !hasCompletedAppointment &&
    !['Confirmed'].includes(providerAppts?.[0]?.status || '') &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data: {
        head: availability?.available
          ? 'Meet with my provider'
          : 'Schedule call with your provider',
        body: `If you have any questions about ${siteName} and how the weight loss program works, ${
          availability?.available ? 'complete' : 'schedule'
        } a 15 min call.`,
        icon: VoiceSelection,
        path: sfcWeightLoss
          ? Pathnames.PATIENT_PORTAL
          : availability?.available
          ? Pathnames.PATIENT_PORTAL_LIVE_VISIT
          : Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'provider-call',
    });
  //
  glp1PrescribedMed &&
    glp1PrescribedMed.length > 1 &&
    !patientInfo?.insurance_skip &&
    addItem({
      data: {
        head: `Get help finding ${glp1PrescribedMed} near you`,
        body: `Are you having trouble finding ${glp1PrescribedMed} in stock? Sign up
            here to have a Zealthy coordinator find a pharmacy with
            ${glp1PrescribedMed} in stock.`,
        icon: VaccinesOutlinedIcon,
        path: '/patient-portal/wegovy-near-you',
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'wegovy-near-you',
    });

  //
  (hasActiveWeightLoss || sfcWeightLoss) &&
    allowShowOrderCompoundCard &&
    !hasCompletedAppointment &&
    !['Confirmed'].includes(providerAppts?.[0]?.status || '') &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data: {
        head: availability?.available
          ? 'Meet with my provider'
          : 'Schedule call with your provider',
        body: `If you have any questions about ${siteName} and how the weight loss program works, ${
          availability?.available ? 'complete' : 'schedule'
        } a 15 min call.`,
        icon: VoiceSelection,
        path: sfcWeightLoss
          ? Pathnames.PATIENT_PORTAL
          : availability?.available
          ? Pathnames.PATIENT_PORTAL_LIVE_VISIT
          : Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'provider-call',
    });
  // removed as per 7576 / keeping just in case
  // (weightLossPatient ||
  //   hasPendingEnclomipheneRequest ||
  //   !!enclomipheneOrders) &&
  //   !isBundled &&
  //   addItem({
  //     data: {
  //       head: 'Document Upload',
  //       body: `Upload lab work, pharmacy benefits, insurance, and other information.`,
  //       icon: UploadIcon,
  //       path: weightLossPatient
  //         ? Pathnames.PATIENT_PORTAL_DOCUMENTS
  //         : Pathnames.PATIENT_PORTAL_DOCUMENTS_V2,
  //     },
  //     newWindow: false,
  //     color: theme.palette.background.paper,
  //     iconBg: '#8ACDA0',
  //     text: theme.palette.text.primary,
  //     key: 'upload-document',
  //   });
  //
  isBundled &&
    hasPrescription &&
    weightLossOrders?.every(
      wlo =>
        [OrderStatus.SENT_TO_LOCAL_PHARMACY].includes(
          orderStatusMap[wlo.order_status || '']
        ) || wlo.date_shipped !== null
    );
  //
  !isBundled &&
    patientInfo?.status === 'ACTIVE' &&
    patientPriorAuths &&
    patientPriorAuths.length > 0 &&
    !patientInfo?.insurance_skip &&
    addItem({
      data: {
        head: 'Insurance approval statuses to cover GLP-1',
        body: 'Check the status of any prior authorization that Zealthy has submitted for your insurance to cover GLP-1 medication.',
        icon: NoteAltOutlinedIcon,
        path: Pathnames.PATIENT_PORTAL_PRIOR_AUTHORIZATIONS,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'insurance-approval',
    });
  //
  if (
    patientInfo?.status === 'ACTIVE' &&
    patientAppointments &&
    patientAppointments.length > 0
  ) {
    addItem({
      data: {
        head: 'Appointments',
        body: 'Keep track of your future and past appointments here.',
        icon: AppointmentsSvgIcon,
        path: Pathnames.PATIENT_PORTAL_APPOINTMENTS,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'appointments',
    });
  }
  //
  weightLossSubs &&
    !hasWeightLossOrder &&
    !hasNonGLP1Request &&
    hasActiveWeightLoss &&
    !isBundled &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data: {
        head: 'Request metformin or bupropion/naltraxone',
        body: `Medications such as metformin and bupropion/naltraxone
          are included in your weight loss membership and shipped
          to your home. Request non-GLP-1 Rx now.
          `,
        icon: PillV2,
        path: '/patient-portal/non-glp-request',
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'non-glp-weight-loss',
    });
  //
  hasActiveWeightLoss &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data: {
        head: 'Fitness and nutrition planning',
        body: `View your personalized monthy fitness and nutrition plan.`,
        icon: AssignmentOutlinedIcon,
        path: Pathnames.PATIENT_PORTAL_FITNESS_NUTRITION,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'fitness-nutrition-plan',
    });
  //
  hasActiveWeightLoss &&
    !isPatient65OrOlder &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data:
        patientInfo?.region === 'CA'
          ? {
              head: 'Invite friends to Zealthy for $10 off',
              body: `If your referral purchases any services or medication through Zealthy, you'll both receive $10 off towards a future treatment.`,
              icon: HandShake,
              path: Pathnames.PATIENT_PORTAL_ACCOUNTABILITY_PARTNER,
            }
          : {
              head: 'Invite an accountability partner',
              body: `Get a discount on your membership by inviting a buddy
              to join you on your Zealthy weight loss plan.`,
              icon: HandShake,
              path: Pathnames.PATIENT_PORTAL_ACCOUNTABILITY_PARTNER,
            },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'accountability-partner',
    });
  //
  hasActiveWeightLoss &&
    patientInfo?.status === PatientStatus.ACTIVE &&
    addItem({
      data: {
        head: 'Track your weight loss progress',
        body: `Use your Zealthy weight loss tracker to track how you're
              doing.`,
        icon: WeightScale,
        path: Pathnames.PATIENT_PORTAL_WEIGHT_LOGGER,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'weight-loss-tracker',
    });
  //
  hasActiveWeightLoss &&
    !isBundled &&
    !isLoading &&
    patientInfo?.status === 'ACTIVE' &&
    addItem({
      data: {
        head: 'Zealthy’s weight loss program lessons',
        body: 'Learn more about how Zealthy’s weight loss program works to help members like you achieve lasting weight loss.',
        icon: TipsAndUpdatesOutlined,
        path: Pathnames.PATIENT_PORTAL_WEIGHT_LOSS_LESSONS,
      },
      newWindow: false,
      color: theme.palette.background.paper,
      iconBg: '#8ACDA0',
      text: theme.palette.text.primary,
      key: 'weight-loss-lessons',
    });

  if (router.query['from-webflow'] === 'true') {
    return (
      <Box>
        <Spinner />
        <ActionItemDrawer />
      </Box>
    );
  }

  // If still loading the AB test, show spinner
  if (abTestLoading) {
    return <Spinner />;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: `${isMobile ? '40px' : '10px'}`,
          marginTop: '-25px',
        }}
      >
        {variation7935?.variation_name === 'Variation-1' &&
          !hasCanceledWlSub && <TimelineTracker />}
        {variation8205 &&
          variation8205?.variation_name !== 'Variation-2' &&
          variation8205?.variation_name !== 'Control' && <TimelineTracker />}
        {profile?.first_name && (
          <Typography
            fontWeight="700"
            variant="h3"
            sx={{ fontSize: '28px', lineHeight: '2rem' }}
          >
            {hasActiveWeightLoss
              ? `We're here to help with your medical weight loss,  ${profile?.first_name}. `
              : `Hi, ${profile?.first_name}`}
          </Typography>
        )}
        {variation7935?.variation_name === 'Variation-2' &&
          !hasCanceledWlSub && <TimelineTracker />}
        {hasCancelledWeightLoss && !hasActiveWeightLoss && (
          <PatientPortalItem
            data={{
              head: "You're always welcome back!",
              body: 'As a previous Zealthy Weight Loss member, you can reactivate and get Rx treatment with just a few clicks.',
              icon: WeightScale,
              path: '/patient-portal/profile',
            }}
            color={theme.palette.primary.dark}
            text={
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#FFFFFF'
                : theme.palette.text.primary
            }
            newWindow={false}
            iconBg="#b3bdcf"
            action={handleOpenReactivateWL}
          />
        )}
        {hasCancelledPsychiatry && !hasActivePsychiatry && (
          <PatientPortalItem
            data={{
              head: "You're always welcome back!",
              body: 'As a previous Zealthy Personalized Psychiatry member, you can reactivate and get Rx treatment with just a few clicks.',
              icon: HandsHeart,
              path: '/patient-portal/profile',
            }}
            color={theme.palette.primary.dark}
            text={
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#FFFFFF'
                : theme.palette.text.primary
            }
            newWindow={false}
            iconBg="#b3bdcf"
            action={handleOpenReactivatePsychiatry}
          />
        )}

        {!weightLossPrescriptionRequest &&
        !hasActiveWeightLoss &&
        sfcWeightLoss ? (
          <PatientPortalItem
            key={'sfc-wl-reactivate-subscription'}
            data={{
              head: 'Reactivate since you already paid for your current month',
              subHead: `You already paid for your current month of Zealthy weight loss membership but your membership is scheduled to be cancelled`,
              body: 'Reactivate to get Rx, coaching, and other benefits of the Zealthy weight loss program',
              path: '/patient-portal',
            }}
            color={theme.palette.primary.dark}
            text={
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#FFFFFF'
                : theme.palette.text.primary
            }
            newWindow={false}
            action={handleOpenReactivateWL}
          />
        ) : null}

        {!hasPendingMentalHealthRequest &&
        !hasActivePsychiatry &&
        scheduleForCancelationPersonalizedPsychiatry ? (
          <PatientPortalItem
            key={'sfc-pp-reactivate-subscription'}
            data={{
              head: 'Reactivate since you already paid for your current month',
              subHead: `You already paid for your current month of Zealthy personalized psychiatry membership but your membership is scheduled to be cancelled`,
              body: 'Reactivate to get Rx, coaching, and other benefits of the Zealthy personalized psychiatry program',
              path: '/patient-portal',
            }}
            color={theme.palette.primary.dark}
            text={
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#FFFFFF'
                : theme.palette.text.primary
            }
            newWindow={false}
            action={handleOpenReactivatePsychiatry}
          />
        ) : null}

        {hasRecentActiveWeightLoss && !isBundled && siteName === 'Zealthy' && (
          <Box sx={{ aspectRatio: '16/9', width: '100%' }}>
            <ReactPlayer
              url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/WelcomeVideo_update032024%20(1).mp4`}
              width="100%"
              height="100%"
              frameBorder={0}
              controls
              pip
              allowFullScreen
              config={{
                file: {
                  tracks: [],
                },
              }}
              ref={playerRef}
              onReady={onReady}
            />
          </Box>
        )}

        {(variation8205?.variation_name === 'Variation-1' ||
          variation8205?.variation_name === 'Variation-3' ||
          variation8205?.variation_name === 'Variation-4' ||
          variation8205?.variation_name === 'Variation-2') && (
          <Box sx={{ margin: 0 }}>
            <video
              width="100%"
              controls
              preload="auto"
              style={{ borderRadius: '10px' }}
              poster={posterUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}

        <Stack gap="2rem">
          {allowShowOralSemaglutideOrderCard &&
            allVisibleSubscriptions &&
            allVisibleSubscriptions.length > 0 && (
              <OrderOralCompoundCard
                key={'new-order-' + weightLossOrders[0]?.id}
                order={weightLossOrders}
                refetchOrder={fetchOrders}
                subscriptions={allVisibleSubscriptions}
                recurringWeightLossPrescription={
                  recurringMedicationSub?.find(s =>
                    [...weightLossOrders?.map((i: any) => i.id)].includes(
                      s.order_id
                    )
                  ) as any
                }
                refetchSubs={refetchSub}
              />
            )}
          {allowShowOrderCompoundCard &&
            allVisibleSubscriptions &&
            allVisibleSubscriptions.length > 0 && (
              <OrderCompoundCard
                key={'new-order-' + weightLossOrders[0]?.id}
                order={weightLossOrders}
                refetchOrder={fetchOrders}
                matrixData={matrixData!}
                subscriptions={allVisibleSubscriptions}
                recurringWeightLossPrescription={
                  recurringMedicationSub?.find(s =>
                    [...weightLossOrders?.map((i: any) => i.id)].includes(
                      s.order_id
                    )
                  ) as any
                }
                refetchSubs={refetchSub}
              />
            )}
        </Stack>
        <Stack gap="2rem">
          {nonGLP1Orders?.length > 0
            ? nonGLP1Orders.map((order, index) => (
                <OrderTracker
                  key={'new-order-' + index}
                  order={order}
                  subscriptions={allVisibleSubscriptions}
                  isCompoundCard={false}
                  isFailedPayment={order?.order_status === 'PAYMENT_FAILED'}
                  refetchSubs={refetchSub}
                  patientPharmacy={patientPharmacy}
                />
              ))
            : null}
        </Stack>
        <Stack gap="2rem">
          {(weightLossOrders?.length > 0 &&
            weightLossOrders.some(
              o =>
                !o?.prescription_id?.medication?.toLowerCase().includes('oral')
            ) &&
            !allowShowOrderCompoundCard) ||
          (weightLossOrders?.length > 0 &&
            weightLossOrders.some(o =>
              o?.prescription_id?.medication?.toLowerCase().includes('oral')
            ) &&
            !allowShowOralSemaglutideOrderCard)
            ? weightLossOrders.map((order, index) => (
                <OrderTracker
                  key={'new-order-' + index}
                  order={order}
                  subscriptions={allVisibleSubscriptions}
                  isCompoundCard={false}
                  isFailedPayment={order?.order_status === 'PAYMENT_FAILED'}
                  refetchSubs={refetchSub}
                  patientPharmacy={patientPharmacy}
                />
              ))
            : null}
        </Stack>
        {weightLossOrders?.every(
          order => order.prescription_id?.medication_quantity_id === 98
        ) &&
          !weightLossOrders?.every(order =>
            [
              OrderStatus.BUNDLED_REFILL_2,
              OrderStatus.BUNDLED_REFILL_3,
              OrderStatus.ORDER_PENDING_ACTION,
              OrderStatus.CANCELED,
            ].includes(orderStatusMap[order.order_status || ''])
          ) && (
            <>
              <Typography variant="h3">
                How to administer your GLP-1 medication
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    aspectRatio: '16/9',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  {showInjectionVideo ? (
                    <ReactPlayer
                      url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/Injection%20Instructions%20-%20How%20to%20inject-%20Updated.mp4`}
                      width="100%"
                      height="100%"
                      controls
                      playing
                      pip
                      allowFullScreen
                    />
                  ) : (
                    <Box onClick={() => setShowInjectionVideo(true)}>
                      <img
                        width="100%"
                        height="100%"
                        alt="How to administer your GLP-1 medication"
                        src="/images/injection-video-image.png"
                      />
                      <IconButton
                        sx={{
                          position: 'relative',
                          bottom: isMobile ? '5rem' : '10rem',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                          color: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          padding: '10px',
                        }}
                      >
                        <SmartDisplayIcon sx={{ fontSize: '4rem' }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}

        {showRefillVideo && variation8078?.variation_name === 'Variation-1' && (
          <>
            <Typography variant="h3">
              How to get a refill of your GLP-1 medication
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  aspectRatio: '16/9',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                {showRefillInstructionsVideo ? (
                  <ReactPlayer
                    url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/videos/How_to_get_refills-v1.mp4`}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    pip
                    allowFullScreen
                  />
                ) : (
                  <Box onClick={() => setShowRefillInstructionsVideo(true)}>
                    <img
                      width="100%"
                      height="100%"
                      alt="How to get refills"
                      src="/images/injection-video-image.png"
                    />
                    <IconButton
                      sx={{
                        position: 'relative',
                        bottom: isMobile ? '5rem' : '10rem',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        },
                        color: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        padding: '10px',
                      }}
                    >
                      <SmartDisplayIcon sx={{ fontSize: '4rem' }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}

        {!!enclomiphenePrescriptionRequest &&
        labOrders?.[0] &&
        labOrders?.[0]?.tasso_order_id &&
        displayDeliveredLabKitCard ? (
          <EnclomipheneLabCard lab={labOrders[0]} />
        ) : null}
        <Stack>
          {weightLossSubs &&
            !isVariation8676 &&
            weightLossSubs?.filter(sub => sub.price === 249).length > 0 && (
              <PatientPortalItem
                data={{
                  head: 'Switch to injected semaglutide',
                  body: 'Includes semaglutide weekly injections, ongoing care with medical provider, and unlimited messaging with your care team',
                  icon: Health,
                  path: '/patient-portal/switch-bundled/semaglutide',
                }}
                iconBg="#b3bdcf"
                color={theme.palette.primary.dark}
                text={
                  ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#FFFFFF'
                    : theme.palette.text.primary
                }
                key="oral-sema-switch-injectable-sema"
                newWindow={false}
              />
            )}

          {weightLossSubs &&
            !isVariation8676 &&
            weightLossSubs?.filter(sub => sub.price === 249).length > 0 && (
              <PatientPortalItem
                data={{
                  head: 'Switch to injected tirzepatide',
                  body: 'Includes tirzepatide weekly injections, ongoing care with medical provider, and unlimited messaging with your care team',
                  icon: Health,
                  path: '/patient-portal/switch-bundled/tirzepatide',
                }}
                iconBg="#b3bdcf"
                color={theme.palette.primary.dark}
                text={
                  ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#FFFFFF'
                    : theme.palette.text.primary
                }
                key="oral-sema-switch-injectable-tirz"
                newWindow={false}
              />
            )}

          {appointmentData?.filter(a => {
            if (
              differenceInMinutes(new Date(a.starts_at || ''), new Date()) <= 30
            ) {
              if (
                differenceInMinutes(
                  new Date(),
                  addMinutes(new Date(a.starts_at || ''), 15)
                ) <= 10
              ) {
                return true;
              }
            }
          })?.[0] && (
            <List>
              {appointmentData
                ?.filter(a => {
                  if (
                    differenceInMinutes(
                      new Date(a.starts_at || ''),
                      new Date()
                    ) <= 30
                  ) {
                    if (
                      differenceInMinutes(
                        new Date(),
                        addMinutes(new Date(a.starts_at || ''), 15)
                      ) <= 10
                    ) {
                      return true;
                    }
                  }
                })
                ?.map(appt => {
                  let specialties = 'Zealthy Provider';

                  if (
                    appt.appointment_type === 'Provider' &&
                    hasActivePsychiatry &&
                    appt.care === 'Mental Health'
                  ) {
                    specialties = 'Zealthy Mental Health Provider';
                  }

                  if (appt.appointment_type === 'Coach (Mental Health)') {
                    specialties = 'Zealthy Mental Health Coach';
                  }

                  if (appt.appointment_type === 'Coach (Weight Loss)') {
                    specialties = 'Zealthy Weight Loss Coach';
                  }

                  return (
                    <PatientPortalItem
                      data={{
                        path: `
                          /visit/room/${appt?.daily_room || ''}?appointment=${
                          appt.id
                        }`,
                        head: `Join ${appt?.visit_type || 'the'} Visit with ${
                          appt?.clinician?.profiles?.first_name
                        } ${appt?.clinician?.profiles?.last_name}`,
                        subHead: specialties,
                        body: `${format(
                          new Date(appt.starts_at || ''),
                          `EEE MMM d 'at' h:mm a z`
                        )}`,
                      }}
                      color={theme.palette.primary.dark}
                      image={
                        appt?.clinician?.profiles?.avatar_url ||
                        ProfilePlaceholder
                      }
                      text={
                        ['Zealthy', 'FitRx'].includes(siteName ?? '')
                          ? '#FFFFFF'
                          : theme.palette.text.primary
                      }
                      key={appt?.id}
                      newWindow={true}
                    />
                  );
                })}
            </List>
          )}
          {appointmentData
            ?.filter(a => a.status !== 'Cancelled')
            .filter(
              a => new Date(a.starts_at || '') > addMinutes(new Date(), 30)
            )?.[0] && (
            <List>
              {appointmentData
                ?.filter(
                  a =>
                    new Date(a.starts_at || '') > addMinutes(new Date(), 30) &&
                    a.status === 'Confirmed'
                )
                ?.map(appt => {
                  let specialties = 'Zealthy Provider';

                  if (
                    appt.appointment_type === 'Provider' &&
                    hasActivePsychiatry &&
                    appt.care === 'Anxiety or depression'
                  ) {
                    specialties = 'Zealthy Mental Health Provider';
                  }
                  if (
                    appt.appointment_type === 'Provider' &&
                    isWeightLoss &&
                    appt.care === 'Weight loss'
                  ) {
                    specialties = 'Zealthy Weight Loss Provider';
                  }

                  if (appt.appointment_type === 'Coach (Mental Health)') {
                    specialties = 'Zealthy Mental Health Coach';
                  }

                  if (appt.appointment_type === 'Coach (Weight Loss)') {
                    specialties = 'Zealthy Weight Loss Coach';
                  }

                  return (
                    <PatientPortalItem
                      data={{
                        path: `/patient-portal/appointment/${appt?.id}`,
                        head: `Upcoming ${appt?.visit_type || ''} Visit with ${
                          appt?.clinician?.profiles?.first_name
                        } ${appt?.clinician?.profiles?.last_name}`,
                        subHead: specialties,
                        body: `${format(
                          new Date(appt.starts_at || ''),
                          `EEE MMM d 'at' h:mm a z`
                        )}`,
                        icon: CalendarWhite,
                      }}
                      color={theme.palette.primary.dark}
                      text={
                        ['Zealthy', 'FitRx'].includes(siteName ?? '')
                          ? '#FFFFFF'
                          : theme.palette.text.primary
                      }
                      key={appt?.id}
                      newWindow={false}
                    />
                  );
                })}
            </List>
          )}

          {weightLossPrescriptionRequest &&
            (!hasActiveWeightLoss && (sfcWeightLoss || canceledWeightLoss) ? (
              <PatientPortalItem
                key={'sfc-wl-prescription-request'}
                data={{
                  head: 'Reactivate so a provider can review your prescription request',
                  subHead: `You submitted a prescription request but it cannot be reviewed since your membership is ${
                    canceledWeightLoss
                      ? 'cancelled'
                      : 'scheduled to be cancelled'
                  }`,
                  body: 'Reactivate to have a provider review your Weight Loss Medication prescription request. A typical response time is 1-2 business days.',
                  path: '/patient-portal',
                }}
                color={theme.palette.primary.dark}
                text={
                  ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#FFFFFF'
                    : theme.palette.text.primary
                }
                newWindow={false}
                action={handleOpenReactivateWL}
              />
            ) : hasVerifiedIdentity &&
              weightLossPrescriptionRequest &&
              !(sfcWeightLoss || canceledWeightLoss) ? (
              <PatientPortalItem
                key={`wl-prescription-request`}
                data={{
                  head: 'You have a pending prescription request',
                  body: `Our provider team is reviewing your ${
                    weightLossPrescriptionRequest?.specific_medication ||
                    weightLossPrescriptionRequest?.note ||
                    weightLossPrescriptionRequest.medication_quantity
                      ?.medication_dosage?.medication?.name ||
                    ''
                  } prescription request. A typical response time is 1-2 business days`,
                  icon: MedicationOutlinedIcon,
                }}
                color={theme.palette.primary.dark}
                text={
                  ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#FFFFFF'
                    : theme.palette.text.primary
                }
                newWindow={false}
                iconBg="#FFF"
              />
            ) : (
              <PatientPortalItem
                key={`wl-prescription-request`}
                data={{
                  head: 'Upload ID so a provider can review your prescription request',
                  subHead: `You submitted a prescription request but it cannot be reviewed since your ID was not uploaded.`,
                  body: `Upload your ID to have a provider review your Weight Loss Medication prescription request. A typical response time is
                1-2 business days.`,
                  path: Pathnames.PATIENT_PORTAL_IDENTITY_VERIFICATION,
                  icon: MedicationOutlinedIcon,
                }}
                color={theme.palette.primary.dark}
                text={
                  ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#FFFFFF'
                    : theme.palette.text.primary
                }
                newWindow={false}
                iconBg="#FFF"
              />
            ))}

          {hasPendingMentalHealthRequest &&
          !hasActivePsychiatry &&
          (scheduleForCancelationPersonalizedPsychiatry ||
            cancelledPersonalizedPsychiatry) ? (
            <PatientPortalItem
              key={'sfc-pp-prescription-request'}
              data={{
                head: 'Reactivate so a provider can review your prescription request',
                subHead: `You submitted a prescription request but it cannot be reviewed since your membership is ${
                  cancelledPersonalizedPsychiatry
                    ? 'cancelled'
                    : 'scheduled to be cancelled'
                }`,
                body: 'Reactivate to have a provider review your Mental Health Medication prescription request. A typical response time is 1-2 business days.',
                path: '/patient-portal',
              }}
              color={theme.palette.primary.dark}
              text={
                ['Zealthy', 'FitRx'].includes(siteName ?? '')
                  ? '#FFFFFF'
                  : theme.palette.text.primary
              }
              newWindow={false}
              action={handleOpenReactivatePsychiatry}
            />
          ) : (
            (otherPrescriptionRequests?.length ?? 0) > 0 &&
            !hasPendingEnclomipheneRequest &&
            otherPrescriptionRequests
              ?.filter(
                p => p.type === 'Personalized Psychiatry' //Personalized Psychaitry does not have a medication quantity id
              )
              ?.map(r => (
                <PatientPortalItem
                  key={`${r.id}-prescription-request`}
                  data={{
                    head: 'You have a pending prescription request',
                    body: 'Our provider team is reviewing your prescription request. A typical response time is 12 hours or less.',
                    icon: MedicationOutlinedIcon,
                  }}
                  color={theme.palette.primary.dark}
                  text={
                    ['Zealthy', 'FitRx'].includes(siteName ?? '')
                      ? '#FFFFFF'
                      : theme.palette.text.primary
                  }
                  newWindow={false}
                  iconBg="#FFF"
                />
              ))
          )}

          {(otherPrescriptionRequests?.length ?? 0) > 0 &&
            !hasPendingEnclomipheneRequest &&
            otherPrescriptionRequests
              ?.filter(p => p.medication_quantity_id)
              ?.map(r => (
                <PatientPortalItem
                  key={`${r.id}-prescription-request`}
                  data={{
                    head: 'You have a pending prescription request',
                    body: 'Our provider team is reviewing your prescription request. A typical response time is 12 hours or less.',
                    icon: MedicationOutlinedIcon,
                  }}
                  color={theme.palette.primary.dark}
                  text={
                    ['Zealthy', 'FitRx'].includes(siteName ?? '')
                      ? '#FFFFFF'
                      : theme.palette.text.primary
                  }
                  newWindow={false}
                  iconBg="#FFF"
                />
              ))}
          {(otherPrescriptionRequests?.length ?? 0) > 0 &&
            hasPendingEnclomipheneRequest &&
            otherPrescriptionRequests
              ?.filter(p => p.medication_quantity_id)
              ?.map(r => (
                <PatientPortalItem
                  key={`${r.id}-prescription-request`}
                  data={{
                    head: 'You have a pending prescription request',
                    body: 'Our provider team is reviewing your Enclomiphine prescription request. A typical response time is 12 hours or less.',
                    icon: MedicationOutlinedIcon,
                  }}
                  color={theme.palette.primary.dark}
                  text={
                    ['Zealthy', 'FitRx'].includes(siteName ?? '')
                      ? '#FFFFFF'
                      : theme.palette.text.primary
                  }
                  newWindow={false}
                  iconBg="#FFF"
                />
              ))}
        </Stack>
        {/* <br></br> */}

        <ActionItems
          patientId={patientInfo?.id}
          activeWeightLoss={hasActiveWeightLossUpdated || false}
          isNotWeightLossCompound={!hasActiveWeightLossCompound}
          careTeam={careTeam}
          showRefillModal={showRefillModal}
          setShowRefillModal={setShowRefillModal}
          hasNonCompoundGLP1Request={hasNonCompoundGLP1Request}
        />

        <br></br>
        {myTreatmentPlanItemsArray.length > 0 && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                fontWeight="600"
                variant="h3"
                sx={{ fontSize: '18px' }}
              >
                My Treatment Plan
              </Typography>
              {myTreatmentPlanItemsArray.length < 5 ||
              patientInfo?.status !== 'ACTIVE' ? null : (
                <Typography
                  sx={{
                    color: 'green',
                    cursor: 'pointer',
                    fontSize: `${isMobile ? '15px' : '20px'}`,
                  }}
                  onClick={seeMore ? handleSeeLess : handleSeeAll}
                >
                  {seeMore ? 'See Less' : 'See all'}
                </Typography>
              )}
            </Box>
            <List sx={{ padding: 0 }}>
              {myTreatmentPlanItemsArray
                .slice(0, visibleItems)
                .map(({ data, color, text, newWindow = false, key }, i) => (
                  <div
                    key={`${key} - ${i}`}
                    onClick={() =>
                      key !== 'provider-call'
                        ? ''
                        : handleGoToProviderSchedule(key)
                    }
                  >
                    <MyTreatmentPlanItem
                      data={data}
                      newWindow={newWindow}
                      key={i}
                      color={color}
                      text={text}
                    />
                  </div>
                ))}
            </List>
          </>
        )}
        {patientInfo?.status === 'ACTIVE' ? (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                fontWeight="600"
                variant="h3"
                sx={{ fontSize: '18px' }}
              >
                Trending
              </Typography>
              <Box sx={{ width: 'max-content' }}>
                <TrendUp />
              </Box>
            </Box>
            <TrendingCarousel
              patientRegion={patientInfo?.region}
              gender={profile?.gender}
              sfcWeightLoss={!!sfcWeightLoss}
              cancelledWeightLoss={!!canceledWeightLoss}
              hasPendingPreworkoutRequest={hasPendingPreworkoutRequest}
              hasActivePsychiatry={!!hasActivePsychiatry}
              hasBirthControlRequest={hasPendingBirthControlRequest}
              hasMenopauseRequest={hasPendingMenopauseRequest}
              hasEdRequest={hasPendingEdRequest}
              hasHairLossRequest={hasPendingHairLossRequest}
              weightLossSubs={weightLossSubs}
              isBundledWeightLoss={isBundled}
              weightLossOrders={weightLossOrders}
              hasAcneRequest={hasPendingAcneRequest}
              hasMelasmaRequest={hasPendingMelasmaRequest}
              hasRosaceaRequest={hasPendingRosaceaRequest}
              hasAntiAgingRequest={hasPendingAntiAgingRequest}
              hasEnclomipheneRequest={hasPendingEnclomipheneRequest}
              hasHairLossFRequest={hasPendingHairLossFRequest}
            />
          </>
        ) : null}
        {isAnyRated5 ? <RedditPopUp /> : null}

        <OrderCompoundModal visibleSubscriptions={visibleSubscriptions} />
        <InjectionVideoModal
          open={showInjectionVideo}
          onClose={() => setShowInjectionVideo(false)}
        />
        <SubscriptionRestartModal
          titleOnSuccess={'Your subscription has been reactivated.'}
          onConfirm={handleReactivation}
          onClose={() => setShowRestartWeightLoss(false)}
          title={
            !!sfcWeightLoss
              ? 'Continue your subscription?'
              : 'Reactivate your weight loss subscription?'
          }
          description={
            !!sfcWeightLoss
              ? [
                  `Once you confirm below, your subscription will no longer be set to expire on ${formatDate(
                    sfcWeightLoss?.current_period_end || ''
                  )} and will remain active.`,
                  isProviderCallItem
                    ? 'This will enable you to schedule this visit and continue to get weight loss treatment at Zealthy.'
                    : `Once re-activated, you will be able to receive GLP-1 and other weight loss treatment from Zealthy. Without re-activating, you will not be able to receive GLP-1 medication from Zealthy since we need to ensure we can monitor your treatment plan.`,
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
          onClose={() => setShowRestartPersonalizedPsychiatry(false)}
          title={
            scheduleForCancelationPersonalizedPsychiatry
              ? 'Continue your membership?'
              : 'Reactivate your personalized psychiatry membership?'
          }
          description={
            scheduleForCancelationPersonalizedPsychiatry
              ? [
                  `Once you confirm below, your membership will no longer be set to expire on ${formatDate(
                    scheduleForCancelationPersonalizedPsychiatry?.current_period_end
                  )} and will remain active.`,
                  `Once re-activated, you will be able to receive psychiatric medication and video visits from Zealthy as part of your membership. Without re-activating, you will not be able to receive psychiatric medication from Zealthy since we need to ensure we can monitor your treatment plan.`,
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
        {patientInfo?.region === 'CO' && showRefillModal && (
          <ViewMoreDosagesModal
            patientFirstName={profile?.first_name || ''}
            patientLastName={profile?.last_name || ''}
            patientEmail={profile?.email || ''}
          />
        )}
        {skincareOrders?.map(order => (
          <SkincareApprovalModal
            key={order.id}
            order={order}
            open={openSkincareApprovalModal}
            handleOpen={setOpenSkincareApprovalModal}
          />
        ))}
        <RefillRequestModal
          open={displayRefillRequestModal}
          hasPendingWeightLossRequest={hasPendingWeightLossRequest}
        />
        <PriorityModals
          patient={patientInfo}
          hasActiveSub={!!hasActiveWeightLoss}
          allVisibleSubs={allVisibleSubscriptions}
        />
        {promptRateZealthyPurchase && (
          <RateZealthyGenericModal
            isOpen={promptRateZealthyPurchase}
            onClose={() => setPromptRateZealthyPurchase(false)}
          />
        )}
        {ratableOrder && (
          <RateOrderModal isOpen={!!ratableOrder} order={ratableOrder} />
        )}
        {showWlRedirectPopup ? (
          <WeightLossRedirectPopup isOpen={showWlRedirectPopup} />
        ) : null}
        {showExclusiveOffer && (
          <ExclusiveOfferPopup
            isOpen={showExclusiveOffer}
            setShowExclusiveOffer={setShowExclusiveOffer}
          />
        )}
        {showExclusiveOfferEd && (
          <ExclusiveOfferPopupEd
            isOpen={showExclusiveOfferEd}
            setShowExclusiveOfferEd={setShowExclusiveOfferEd}
          />
        )}
        <RateVisitModal
          isOpen={!!ratableAppts?.length}
          visit={ratableAppts?.[0]!}
        />
        <MobileDownloadPopup
          open={showMobileDownloadPopup}
          onClose={() => setShowMobileDownloadPopup(false)}
          addToQueue={() => {}}
        />
      </Box>
      <ActionItemDrawer />
    </>
  );
};

export default PatientPortal;

import { User } from '@supabase/supabase-js';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import getConfig from '../../../../config';
import PatientPortalItem from '@/components/screens/PatientPortal/components/PatientPortalItem/PatientPortalItem';
import { Database } from '@/lib/database.types';
import OrderCompoundCard from './components/OrderCompoundCard';
import OrderOralCompoundCard from './components/OrderOralCompoundCard';
import NoOrderText from './components/NoOrderText';
import TrendingCarousel from '../PatientPortal/components/TrendingCarousel';
import TrendUp from '@/components/shared/icons/TrendUp';
import {
  useActivePatientSubscription,
  useAllVisiblePatientSubscription,
  useCompoundMatrix,
  usePatientPharmacy,
  useAllPatientPrescriptionRequest,
  useAllNestedPatientPrescriptionRequest,
  useActiveWeightLossSubscription,
  usePatientActionItems,
  usePatientPriorAuths,
  usePatientInsurance,
  usePatientIntakes,
  PrescriptionRequestProps,
} from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import PrescriptionList from '../Profile/components/PrescriptionList';
import OrderTracker from '../PatientPortal/components/OrderTracker';

type Patient = Database['public']['Tables']['patient']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Prescription = Database['public']['Tables']['prescription']['Row'];
type Order = Database['public']['Tables']['order']['Row'];

interface SessionUserProps {
  sessionUser: User;
}

export type OrderProps = Order & {
  prescription_id: Prescription | null;
};

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

function isWeightLossMedication(med: string | undefined | null): boolean {
  if (!med) return false;
  return isWeightLossMed(med.toLowerCase());
}

export type OrderPropsWithPrescriptionRequest = Order & {
  prescription_id: Prescription | null;
  prescription_request_id: PrescriptionRequestProps | null;
};

export default function OrderHistoryContent({ sessionUser }: SessionUserProps) {
  const theme = useTheme();
  const supabase = useSupabaseClient<Database>();
  const isMobile = useIsMobile();

  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patientAddress, setPatientAddress] = useState<any>(null);
  const [orderData, setOrderData] = useState<OrderProps[] | null>(null);

  const [hasPendingWeightLossRequest, setHasPendingWeightLossRequest] =
    useState<boolean>(false);
  const [hasPendingBirthControlRequest, setHasPendingBirthControlRequest] =
    useState<boolean>(false);
  const [hasPendingMenopauseRequest, setHasPendingMenopauseRequest] =
    useState<boolean>(false);
  const [hasPendingEdRequest, setHasPendingEdRequest] =
    useState<boolean>(false);
  const [hasPendingHairLossRequest, setHasPendingHairLossRequest] =
    useState<boolean>(false);
  const [hasPendingHairLossFRequest, setHasPendingHairLossFRequest] =
    useState<boolean>(false);
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
  const [hasActivePsychiatry, setHasActivePsychiatry] =
    useState<boolean>(false);
  const [hasWeightLossOrder, setHasWeightLossOrder] = useState<boolean>(false);
  const [hasNonGLP1Request, setHasNonGLP1Request] = useState<boolean>(false);
  const [hasActiveWeightLoss, setHasActiveWeightLoss] =
    useState<boolean>(false);
  const [weightLossOrdersState, setWeightLossOrdersState] = useState<
    OrderProps[]
  >([]);
  const [weightLossPrescriptionRequest, setWeightLossPrescriptionRequest] =
    useState<any>(null);
  const [isCoachingOnly, setIsCoachingOnly] = useState<boolean>(false);
  const [isBundled, setIsBundled] = useState<boolean>(false);

  const { data: allPrescriptionRequests = [] } =
    useAllPatientPrescriptionRequest();
  const { data: requests = [] } = useAllNestedPatientPrescriptionRequest();
  const { data: patientSubscriptions } = useActivePatientSubscription();
  const { data: visibleSubscriptions = [] } =
    useAllVisiblePatientSubscription();
  const { data: patientPharmacy } = usePatientPharmacy();
  const { data: matrixData } = useCompoundMatrix();
  const { data: weightLossPatient } = useActiveWeightLossSubscription();
  const { data: actionItems = [] } = usePatientActionItems();
  const { data: patientPriorAuths } = usePatientPriorAuths();
  const { data: patientInsuranceInfo } = usePatientInsurance();
  const { data: patientIntakes } = usePatientIntakes();

  const fetchPatientAndProfile = useCallback(async () => {
    const { data: pat, error: patError } = await supabase
      .from('patient')
      .select()
      .eq('profile_id', sessionUser?.id)
      .single();
    if (patError) {
      console.error('Error fetching patient:', patError);
      return;
    }
    if (pat) {
      setPatientInfo(pat as Patient);
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select()
        .eq('id', sessionUser?.id)
        .single();
      if (profError) {
        console.error('Error fetching profile:', profError);
        return;
      }
      if (prof) {
        setProfile(prof as Profile);
      }
      const { data: addressData, error: addrError } = await supabase
        .from('address')
        .select()
        .eq('patient_id', pat.id)
        .single();
      if (addrError) {
        console.error('Error fetching address:', addrError);
        return;
      }
      setPatientAddress(addressData);
    }
  }, [supabase, sessionUser]);

  const fetchOrderData = useCallback(async () => {
    if (!patientInfo?.id) return;
    const { data: regularOrders, error: regularError } = await supabase
      .from('order')
      .select('*, prescription_id:prescription(*)')
      .eq('patient_id', patientInfo.id)
      .order('created_at', { ascending: false });
    if (regularError) {
      console.error('Error fetching regular orders:', regularError);
      return;
    }
    const filteredOrders = regularOrders?.filter(
      o =>
        !o?.order_status?.includes('REFILL') &&
        !o?.order_status?.includes('FUTURE') &&
        !o?.order_status?.includes('CANCEL')
    );
    setOrderData(filteredOrders || null);
  }, [supabase, patientInfo]);

  const parsePrescriptionRequests = useCallback(() => {
    if (!Array.isArray(requests)) return;
    let hasWLRequest = false;
    requests
      .filter(req => req.status !== 'PRE_INTAKES')
      .forEach(req => {
        const medication =
          req?.medication_quantity?.medication_dosage?.medication;
        const displayName = medication?.display_name?.toLowerCase() || '';
        if (medication?.name === 'Non-GLP1 Medication') {
          setHasNonGLP1Request(true);
        }
        if (req.medication_quantity_id === 98) {
          setHasPendingWeightLossRequest(true);
        }
        if (displayName.toLowerCase().includes('birth control')) {
          setHasPendingBirthControlRequest(true);
        }
        if (displayName.toLowerCase().includes('menopause')) {
          setHasPendingMenopauseRequest(true);
        }
        if (
          displayName.toLowerCase().includes('hair loss') &&
          !displayName.toLowerCase().includes('female')
        ) {
          setHasPendingHairLossRequest(true);
        }
        if (displayName.includes('female hair loss')) {
          setHasPendingHairLossFRequest(true);
        }
        if (displayName.toLowerCase().includes('rosacea')) {
          setHasPendingRosaceaRequest(true);
        }
        if (displayName.toLowerCase().includes('acne')) {
          setHasPendingAcneRequest(true);
        }
        if (displayName.toLowerCase().includes('melasma')) {
          setHasPendingMelasmaRequest(true);
        }
        if (displayName.toLowerCase().includes('anti-aging')) {
          setHasPendingAntiAgingRequest(true);
        }
        if (
          displayName.toLowerCase().includes('enclomiphene') ||
          req.type?.toLowerCase().includes('enclomiphene')
        ) {
          setHasPendingEnclomipheneRequest(true);
        }
        if (displayName.toLowerCase().includes('preworkout')) {
          setHasPendingPreworkoutRequest(true);
        }
        if (displayName.toLowerCase().includes('ed')) {
          setHasPendingEdRequest(true);
        }
        if (isWeightLossMed(medication?.name || '')) {
          hasWLRequest = true;
          setWeightLossPrescriptionRequest(req);
        }
      });
    if (hasWLRequest) {
      setHasPendingWeightLossRequest(true);
    }
  }, [requests]);

  useEffect(() => {
    fetchPatientAndProfile();
  }, [fetchPatientAndProfile]);

  useEffect(() => {
    if (patientInfo) {
      fetchOrderData();
      parsePrescriptionRequests();

      const activeWL = visibleSubscriptions.some(
        sub =>
          sub.subscription?.name?.toLowerCase().includes('weight loss') &&
          ['active', 'trialing', 'past_due'].includes(sub?.status)
      );
      setHasActiveWeightLoss(activeWL);

      const activePSY = visibleSubscriptions.some(
        sub =>
          sub.subscription?.id === 7 &&
          ['active', 'trialing', 'past_due'].includes(sub?.status)
      );
      setHasActivePsychiatry(activePSY);

      setIsCoachingOnly(
        !!weightLossPatient?.subscription?.name?.includes('Coaching Only')
      );

      const bundledFound = visibleSubscriptions.some(sub =>
        [297, 449, 249].includes(sub.price || 0)
      );
      setIsBundled(bundledFound);
    }
  }, [
    patientInfo,
    visibleSubscriptions,
    fetchOrderData,
    parsePrescriptionRequests,
    weightLossPatient,
  ]);

  const sortedOrders = useMemo(() => {
    if (!orderData) return [];
    return [...orderData].sort(
      (a, b) =>
        new Date(b.created_at || '').getTime() -
        new Date(a.created_at || '').getTime()
    );
  }, [orderData]);

  // Group weight loss orders (using the same grouping logic as before)
  const weightLossOrders = useMemo(() => {
    const allWL = sortedOrders.filter(order =>
      order.prescription_id?.medication
        ? isWeightLossMedication(order.prescription_id.medication)
        : false
    );
    const grouped: Map<string, OrderProps> = new Map();
    for (const wlOrder of allWL) {
      const groupKey = wlOrder.group_id ?? `unique-${wlOrder.id}`;
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, wlOrder);
      } else {
        const existing = grouped.get(groupKey)!;
        const existingDate = new Date(existing.created_at || '');
        const currentDate = new Date(wlOrder.created_at || '');
        if (currentDate < existingDate) {
          grouped.set(groupKey, wlOrder);
        }
      }
    }
    const result = Array.from(grouped.values());
    result.sort(
      (a, b) =>
        new Date(b.created_at || '').getTime() -
        new Date(a.created_at || '').getTime()
    );
    return result;
  }, [sortedOrders]);

  // Get non–weight loss orders from the sorted list
  const nonWeightLossOrders = useMemo(() => {
    return sortedOrders.filter(
      order =>
        !(
          order.prescription_id?.medication &&
          isWeightLossMedication(order.prescription_id.medication)
        )
    );
  }, [sortedOrders]);

  // Only show the "no orders" text if neither list has any orders

  const pendingPrescriptionRequests = useMemo(() => {
    return allPrescriptionRequests.filter(
      req => req.status?.toLowerCase().includes('requested') && req.is_visible
    );
  }, [allPrescriptionRequests]);

  const canShowCompoundButton = useMemo(
    () =>
      !!weightLossPatient &&
      !isCoachingOnly &&
      !isBundled &&
      !patientInfo?.glp1_ineligible &&
      patientInfo?.status === 'ACTIVE',
    [weightLossPatient, isCoachingOnly, isBundled, patientInfo]
  );

  const hasWlOrders = weightLossOrders.length > 0;
  const hasPrescriptionListSubscription = useMemo(
    () => visibleSubscriptions.some(sub => sub?.subscription?.id === 5),
    [visibleSubscriptions]
  );

  const showNoOrderText = useMemo(() => {
    return (
      weightLossOrders.length === 0 &&
      nonWeightLossOrders.length === 0 &&
      !hasPrescriptionListSubscription
    );
  }, [weightLossOrders, nonWeightLossOrders, hasPrescriptionListSubscription]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: isMobile ? '40px' : '10px',
        marginTop: '-25px',
        width: '100%',
      }}
    >
      <Stack spacing={3}>
        <Typography variant="h2" sx={{ marginBottom: '24px' }}>
          My medications
        </Typography>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: 'none',
            '&:before': { display: 'none' },
            backgroundColor: 'transparent',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              variant="h3"
              sx={{
                fontSize: isMobile ? '16px!important' : '20px!important',
              }}
            >
              Prescription order history
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {hasWlOrders && (
              <Stack spacing={2}>
                {weightLossOrders.map((order: OrderProps, i: number) => {
                  const medName =
                    order.prescription_id?.medication
                      ?.split(' ')[0]
                      ?.toLowerCase() || '';
                  const isOralMedication = order.prescription_id?.medication
                    ?.toLowerCase()
                    ?.includes('oral');
                  if (['semaglutide', 'tirzepatide'].includes(medName)) {
                    return isOralMedication ? (
                      <OrderOralCompoundCard
                        key={`wl-group-oral-${i}`}
                        order={[order]}
                        refetchOrder={fetchOrderData}
                        subscriptions={visibleSubscriptions}
                        recurringWeightLossPrescription={undefined}
                        refetchSubs={() => null}
                      />
                    ) : (
                      <OrderCompoundCard
                        key={`wl-group-${i}`}
                        order={[order]}
                        refetchOrder={fetchOrderData}
                        matrixData={matrixData!}
                        subscriptions={visibleSubscriptions}
                        isBundle={false}
                        recurringWeightLossPrescription={undefined}
                        refetchSubs={() => null}
                      />
                    );
                  }
                  return (
                    <OrderTracker
                      key={`new-order-${i}`}
                      order={order}
                      subscriptions={visibleSubscriptions}
                      isCompoundCard={false}
                      isFailedPayment={order?.order_status === 'PAYMENT_FAILED'}
                      refetchSubs={() => null}
                      patientPharmacy={patientPharmacy}
                    />
                  );
                })}
                {weightLossOrders.length > 0 && (
                  <Box sx={{ marginTop: '36px!important' }}>
                    <Button
                      onClick={() =>
                        window.open(
                          '/patient-portal/visit/weight-loss-refill',
                          '_self'
                        )
                      }
                      variant="text"
                      sx={{
                        backgroundColor: '#FFF8F0',
                        borderRadius: '12px',
                        border: '1px solid #E0E0E0',
                        color: '#6B6B6B',
                        textTransform: 'none',
                        fontWeight: 550,
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        width: '100%',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        '&:hover': {
                          backgroundColor: '#FDF4E8',
                        },
                      }}
                      endIcon={<ChevronRightIcon sx={{ color: '#6B6B6B' }} />}
                    >
                      Request Rx weight loss refill
                    </Button>
                  </Box>
                )}
              </Stack>
            )}

            {nonWeightLossOrders.length > 0 && (
              <Stack spacing={2} sx={{ marginTop: hasWlOrders ? '20px' : 0 }}>
                {nonWeightLossOrders.map((order: OrderProps, i: number) => (
                  <OrderTracker
                    key={`order-card-${order.id}-${i}`}
                    order={order}
                    subscriptions={visibleSubscriptions}
                    isCompoundCard={false}
                    isFailedPayment={order?.order_status === 'PAYMENT_FAILED'}
                    refetchSubs={() => null}
                    patientPharmacy={patientPharmacy}
                  />
                ))}
              </Stack>
            )}

            {showNoOrderText && (
              <Stack spacing={2}>
                <NoOrderText />
              </Stack>
            )}

            {!hasWlOrders && canShowCompoundButton && (
              <Box sx={{ marginTop: '20px' }}>
                <Button
                  onClick={() =>
                    window.open(
                      '/patient-portal/weight-loss-treatment/compound',
                      '_self'
                    )
                  }
                  variant="text"
                  sx={{
                    backgroundColor: '#FFF8F0',
                    borderRadius: '12px',
                    border: '1px solid #E0E0E0',
                    color: '#6B6B6B',
                    textTransform: 'none',
                    fontWeight: 550,
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    '&:hover': {
                      backgroundColor: '#FDF4E8',
                    },
                  }}
                  endIcon={<ChevronRightIcon sx={{ color: '#6B6B6B' }} />}
                >
                  Order semaglutide or tirzepatide
                </Button>
              </Box>
            )}

            <Box sx={{ marginTop: '32px' }}>
              {hasPrescriptionListSubscription ? <PrescriptionList /> : null}
            </Box>
          </AccordionDetails>
        </Accordion>

        {pendingPrescriptionRequests.length > 0 && <Divider />}

        {pendingPrescriptionRequests.length > 0 && (
          <Accordion
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
              backgroundColor: 'transparent',
            }}
            defaultExpanded
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: isMobile ? '16px!important' : '20px!important',
                }}
              >
                Prescription requests
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ marginBottom: '8px' }}>
                {allPrescriptionRequests
                  .filter(
                    req =>
                      req.status?.toLowerCase().includes('requested') &&
                      req.is_visible
                  )
                  .map(req => (
                    <PatientPortalItem
                      key={`prescription-request-${req.id}`}
                      data={{
                        icon: MedicationOutlinedIcon,
                        head: 'You have a pending prescription request',
                        body:
                          req?.specific_medication &&
                          req?.specific_medication !== 'glp1' &&
                          req.type?.toLowerCase().includes('weight loss')
                            ? `Our provider team is reviewing your request for: ${req?.specific_medication}. A typical response time is 1-2 business days.`
                            : req?.specific_medication === 'glp1'
                            ? `Our provider team is reviewing your ${req?.specific_medication} prescription request. A typical response time is 1-2 business days.`
                            : `Our provider team is reviewing your prescription request. Typical response time is 1-2 business days.`,
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
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '24px',
          }}
        >
          <Typography fontWeight="600" variant="h3" sx={{ fontSize: '18px' }}>
            Trending
          </Typography>
          <Box sx={{ width: 'auto' }}>
            <TrendUp />
          </Box>
        </Box>
        <Box sx={{ width: '100%' }}>
          <TrendingCarousel
            patientRegion={patientInfo?.region!}
            gender={profile?.gender}
            sfcWeightLoss={
              !!visibleSubscriptions.filter(
                sub =>
                  sub?.subscription?.name?.includes('Weight Loss') &&
                  sub.status === 'scheduled_for_cancelation'
              )
            }
            cancelledWeightLoss={
              !!visibleSubscriptions.filter(
                sub =>
                  sub?.subscription?.name?.includes('Weight Loss') &&
                  ['canceled', 'cancelled'].includes(sub.status)
              )
            }
            isBundledWeightLoss={isBundled}
            hasActivePsychiatry={hasActivePsychiatry}
            weightLossSubs={
              visibleSubscriptions.filter(sub =>
                sub?.subscription?.name?.includes('Weight Loss')
              ) || []
            }
            weightLossOrders={weightLossOrdersState}
            hasEdRequest={hasPendingEdRequest}
            hasHairLossRequest={hasPendingHairLossRequest}
            hasHairLossFRequest={hasPendingHairLossFRequest}
            hasMenopauseRequest={hasPendingMenopauseRequest}
            hasBirthControlRequest={hasPendingBirthControlRequest}
            hasRosaceaRequest={hasPendingRosaceaRequest}
            hasMelasmaRequest={hasPendingMelasmaRequest}
            hasAcneRequest={hasPendingAcneRequest}
            hasAntiAgingRequest={hasPendingAntiAgingRequest}
            hasEnclomipheneRequest={hasPendingEnclomipheneRequest}
            hasPendingPreworkoutRequest={hasPendingPreworkoutRequest}
          />
        </Box>
      </Stack>
    </Box>
  );
}

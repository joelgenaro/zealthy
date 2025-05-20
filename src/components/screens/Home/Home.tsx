import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Stack, ListItemButton } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Pathnames } from '@/types/pathnames';
import { Database } from '@/lib/database.types';
import { PatientSubscriptionProps } from '@/lib/auth';
import Form from '@/components/shared/icons/Form';
import AttentionIcon from '@/components/shared/icons/AttentionIcon';
import CustomText from '@/components/shared/Text/CustomText';
import ArrowRight from '@/components/shared/icons/ArrowRight';
import CalendarOutline from '@/components/shared/icons/CalendarOutline';
import Pill from '@/components/shared/icons/Pill';
import {
  MonitorWeightOutlined,
  NoteAltOutlined,
  QuestionAnswerOutlined,
} from '@mui/icons-material';
import {
  usePatientCompoundOrders,
  usePatientPrescriptionRequest,
} from '@/components/hooks/data';
import { isOrderShipped } from '@/utils/isOrderShipped';

interface CareTeamProps {
  role: string;
  clinician: {
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
  };
}

const options = [
  {
    label: 'View your documents',
    icon: Form,
    route: Pathnames.PATIENT_PORTAL_DOCUMENTS,
  },
  {
    label: 'Past appointments',
    route: Pathnames.PATIENT_PORTAL_PAST_APPOINTMENTS,
    icon: CalendarOutline,
  },
  {
    label: 'Request records',
    route: Pathnames.PATIENT_PORTAL_REQUEST_RECORDS,
    icon: AttentionIcon,
  },
];

const weightLossOptions = [
  {
    label: 'View your documents',
    icon: Form,
    route: Pathnames.PATIENT_PORTAL_DOCUMENTS,
  },
  {
    label: 'Message your care team',
    icon: QuestionAnswerOutlined,
    route: Pathnames.MESSAGES + '?complete=weight-loss',
  },
  {
    label: 'Log your weight',
    icon: MonitorWeightOutlined,
    route: Pathnames.PATIENT_PORTAL_WEIGHT_LOGGER,
  },
  {
    label: 'View your medications',
    route: Pathnames.PRESCRIPTION_ORDERS,
    icon: Pill,
  },
];

type Patient = Database['public']['Tables']['patient']['Row'];

interface Props {
  visibleSubscriptions: PatientSubscriptionProps[];
  patient: Patient;
}

const Home = ({ visibleSubscriptions, patient }: Props) => {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [mentalHealthCoach, setMentalHealthCoach] =
    useState<CareTeamProps | null>(null);
  const [weightLossCoach, setWeightLossCoach] = useState<CareTeamProps | null>(
    null
  );
  const { data: prescriptionRequests = [] } = usePatientPrescriptionRequest();
  const { data: compoundOrders = [] } = usePatientCompoundOrders();

  const orderIsShipped = useMemo(() => {
    return !!compoundOrders.length && compoundOrders.some(isOrderShipped);
  }, [compoundOrders]);

  const doesNotHaveOrder = useMemo(() => {
    return compoundOrders.length === 0;
  }, [compoundOrders.length]);

  const allowPurchaseCompoundMeds = doesNotHaveOrder || orderIsShipped;

  const hasPendingCompoundWeightLossRequest = useMemo(() => {
    return (
      prescriptionRequests.length &&
      prescriptionRequests.some(request => {
        return request.medication_quantity_id === 98;
      })
    );
  }, [prescriptionRequests]);

  const isRecurringMedication = visibleSubscriptions?.find(
    s =>
      s.product === 'Recurring Weight Loss Medication' &&
      s.interval_count === 30
  );
  const handleRoute = (route: string) => router.push(route);

  const hasBundledWeightLoss = visibleSubscriptions?.some(
    sub =>
      sub.subscription.name === 'Zealthy Weight Loss' &&
      [297, 449].includes(sub.price || 0)
  );

  const hasActiveWeightLoss = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name.includes('Weight Loss') &&
      ['active', 'trialing'].includes(sub?.status)
  );

  const filteredWeightLossOptions =
    hasActiveWeightLoss && !hasBundledWeightLoss && !patient?.insurance_skip
      ? weightLossOptions
      : weightLossOptions.slice(1);

  const myHealthOptions = hasActiveWeightLoss
    ? filteredWeightLossOptions
    : options;

  async function fetchIsPatientMentalHealth() {
    const mentalHealthCoachingPlan = await supabase
      .from('patient_subscription')
      .select('patient_id, status, subscription_id')
      .match({ patient_id: patient?.id, subscription_id: 3 })
      .single();

    if (mentalHealthCoachingPlan.data) {
      const data = await supabase
        .from('patient_care_team')
        .select('role, clinician!inner(*, profiles (*))')
        .eq('role', 'Mental Health Coach')
        .eq('patient_id', patient?.id)
        .then(({ data }) => data);

      let coach;
      if (data) {
        coach = data;
        if (Array.isArray(coach)) {
          coach = coach[0];
        }
      }
      setMentalHealthCoach(coach as CareTeamProps);
    }
  }

  async function fetchIsPatientWeightLoss() {
    const weightLossCoachingPlan = await supabase
      .from('patient_subscription')
      .select('patient_id, status, subscription_id')
      .match({ patient_id: patient?.id, subscription_id: 4 })
      .single();

    if (weightLossCoachingPlan.data) {
      const data = await supabase
        .from('patient_care_team')
        .select('role, clinician!inner(*, profiles (*))')
        .eq('role', 'Weight Loss Coach')
        .eq('patient_id', patient?.id)
        .then(({ data }) => data);

      let coach;
      if (data) {
        coach = data;
        if (Array.isArray(coach)) {
          coach = coach[0];
        }
      }
      setWeightLossCoach(coach as CareTeamProps);
    }
  }

  useEffect(() => {
    if (patient?.id) {
      Promise.allSettled([
        fetchIsPatientMentalHealth(),
        fetchIsPatientWeightLoss(),
      ]);
    }
  }, [patient?.id]);

  return (
    <Stack gap={{ md: 5.5, xs: 3 }} sx={{ marginBottom: '60px' }}>
      <CustomText
        sx={{ letterSpacing: '0.0025em', lineHeight: '40px' }}
        fontSize={28}
        fontWeight={700}
      >
        My Health
      </CustomText>
      <Stack gap={2}>
        {mentalHealthCoach && (
          <ListItemButton
            onClick={() =>
              handleRoute(
                `${Pathnames.PATIENT_PORTAL_SCHEDULE_COACH}/mental-health`
              )
            }
            sx={{
              '&:hover': { background: '#005315BF' },
              background: '#005315',
              borderRadius: 2,
              padding: { md: 3, xs: 2 },
            }}
          >
            <Stack direction="row" alignItems="center" gap={{ md: 3, xs: 2 }}>
              <Image
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                src={
                  mentalHealthCoach?.clinician?.profiles?.avatar_url ||
                  '/favicon_cream_black_256x256.png'
                }
                height={48}
                width={48}
                alt="avatar"
              />
              <Stack>
                <CustomText fontWeight={500} color="white">
                  {mentalHealthCoach?.clinician?.profiles?.first_name}{' '}
                  {mentalHealthCoach?.clinician?.profiles?.last_name}
                </CustomText>
                <CustomText
                  textTransform="capitalize"
                  fontSize={14}
                  color="white"
                >
                  Your Zealthy{' '}
                  {mentalHealthCoach?.role ? mentalHealthCoach?.role : 'Coach'}
                </CustomText>
              </Stack>
            </Stack>
            <ArrowRight style={{ marginLeft: 'auto', color: 'white' }} />
          </ListItemButton>
        )}
        {weightLossCoach && !hasBundledWeightLoss && (
          <ListItemButton
            onClick={() =>
              handleRoute(
                `${Pathnames.MESSAGES}?complete=${weightLossCoach?.clinician?.profiles?.first_name}-${weightLossCoach?.clinician?.profiles?.last_name}`
              )
            }
            sx={{
              '&:hover': { background: '#005315BF' },
              background: '#005315',
              borderRadius: 2,
              padding: { md: 3, xs: 2 },
            }}
          >
            <Stack direction="row" alignItems="center" gap={{ md: 3, xs: 2 }}>
              <Image
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                src={
                  weightLossCoach?.clinician?.profiles?.avatar_url ||
                  '/favicon_cream_black_256x256.png'
                }
                height={48}
                width={48}
                alt="avatar"
              />
              <Stack>
                <CustomText fontWeight={500} color="white">
                  {weightLossCoach?.clinician?.profiles?.first_name}{' '}
                  {weightLossCoach?.clinician?.profiles?.last_name}
                </CustomText>
                <CustomText
                  textTransform="capitalize"
                  fontSize={14}
                  color="white"
                >
                  Your Zealthy{' '}
                  {weightLossCoach?.role ? weightLossCoach?.role : 'Coach'}
                </CustomText>
              </Stack>
            </Stack>
            <ArrowRight style={{ marginLeft: 'auto', color: 'white' }} />
          </ListItemButton>
        )}
        {myHealthOptions.map((option, index) => (
          <ListItemButton
            onClick={() => handleRoute(option.route)}
            sx={{
              background: 'white',
              borderRadius: 2,
              border: '1px solid #D8D8D8',
              padding: { md: 3, xs: 2 },
              fontWeight: 500,
            }}
            key={index}
          >
            <Stack direction="row" alignItems="center" gap={{ md: 3, xs: 2 }}>
              <Stack
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#8ACDA0',
                  height: 48,
                  width: 48,
                  borderRadius: '50%',
                }}
              >
                <option.icon />
              </Stack>
              {option.label}
            </Stack>
            <ArrowRight style={{ marginLeft: 'auto' }} />
          </ListItemButton>
        ))}
        {hasActiveWeightLoss &&
          !hasBundledWeightLoss &&
          !hasPendingCompoundWeightLossRequest &&
          allowPurchaseCompoundMeds && (
            <ListItemButton
              onClick={() =>
                handleRoute(
                  isRecurringMedication
                    ? '/patient-portal/visit/weight-loss-refill'
                    : '/patient-portal/weight-loss-treatment/compound'
                )
              }
              sx={{
                background: 'white',
                borderRadius: 2,
                border: '1px solid #D8D8D8',
                padding: { md: 3, xs: 2 },
                fontWeight: 500,
              }}
            >
              <Stack direction="row" alignItems="center" gap={{ md: 3, xs: 2 }}>
                <Stack
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#8ACDA0',
                    height: 48,
                    width: 48,
                    borderRadius: '50%',
                  }}
                >
                  <NoteAltOutlined />
                </Stack>
                {'Order semaglutide or tirzepatide'}
              </Stack>
              <ArrowRight style={{ marginLeft: 'auto' }} />
            </ListItemButton>
          )}
      </Stack>
    </Stack>
  );
};

export default Home;

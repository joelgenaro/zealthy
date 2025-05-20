import {
  PatientSubscriptionProps,
  useActivePatientSubscription,
  useCompoundMatrix,
  useIsBundled,
  usePatient,
  usePatientCareTeam,
  usePatientPrescriptionRequest,
  usePatientSubscription,
} from '@/components/hooks/data';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { usePayment } from '@/components/hooks/usePayment';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import ChoiceItem from '@/components/shared/ChoiceItem';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import UsStates from '@/constants/us-states';
import { useABTest } from '@/context/ABZealthyTestContext';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { notEmpty } from '@/types/utils/notEmpty';
import { formatDate } from '@/utils/date-fns';
import { membershipEvent } from '@/utils/freshpaint/events';
import { CalendarToday } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Divider,
  FilledInput,
  FormControl,
  Link,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import axios from 'axios';
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  format,
} from 'date-fns';
import { useSearchParams } from 'next/navigation';
import Router from 'next/router';
import {
  ChangeEvent,
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import MembershipDetails from '../MembershipDetails';
import { useUpdateFreeMonthRedemption } from '@/components/hooks/mutations';
import CoachOnly from './components/CoachOnly';
import ConfirmDowngrade from './components/ConfirmDowngrade';
import ConfirmUpgrade from './components/ConfirmUpgrade';
import FinalOffer from './components/FinalOffer';
import FreeMonth from './components/FreeMonth';
import MedicationDiscount from './components/MedicationDiscount';
import PrePaid from './components/PrePaid';

const parseSubManage = (sub: string) => {
  const names: { [key: string]: string } = {
    'Zealthy Subscription': 'Cancel membership',
    'Mental Health Coaching': 'Cancel mental health plan',
    'Zealthy Weight Loss Access': 'Cancel weight loss access plan',
    'Zealthy 3-Month Weight Loss': 'Manage your plan',
    'Zealthy 3-Month Weight Loss [IN]': 'Manage your plan',
    'Discounted Weight Loss Plan': 'Manage your plan',
    'Zealthy 6-Month Weight Loss': 'Manage your plan',
    'Zealthy 12-Month Weight Loss': 'Manage your plan',
    'Zealthy Weight Loss': 'Manage your plan',
    'Medication Subscription': 'Cancel medication membership',
    'Zealthy Personalized Psychiatry': 'Manage your plan',
  };
  return names[sub];
};

const parseSubGiftSubText = (sub: string) => {
  const names: { [key: string]: string } = {
    'Zealthy Subscription':
      'You don’t have to stop treatment altogether. Skip your next quarterly access fee ($30 value), and continue your treatment with Zealthy.',
    'Mental Health Coaching':
      'You don’t have to stop treatment altogether. Take $20 off your next month of mental health coaching, and continue your treatment with Zealthy.',
    'Zealthy Weight Loss': 'weight loss plan',
    'Zealthy Weight Loss Access': 'weight loss access plan',
    'Medication Subscription':
      'You don’t have to stop treatment altogether. Take $20 off your next order, and continue your treatment with Zealthy.',
    'Zealthy Personalized Psychiatry':
      'You don’t have to stop treatment altogether. Take $20 off your next month of psychiatric care, and continue your treatment with Zealthy.',
  };
  return names[sub];
};
const parseSubGiftButtonText = (sub: string) => {
  const names: { [key: string]: string } = {
    'Zealthy Subscription': 'Skip next quarterly subscription',
    'Mental Health Coaching': 'Get $20 on us',
    'Zealthy Weight Loss': 'weight loss plan',
    'Zealthy Weight Loss Access': 'weight loss access plan',
    'Medication Subscription': 'Get $20 on us',
    'Zealthy Personalized Psychiatry': 'Get $20 on us',
  };
  return names[sub];
};
const parseSubGiftAppliedHeaderText = (sub: string) => {
  const names: { [key: string]: string } = {
    'Zealthy Subscription': 'You’re good to go!',
    'Mental Health Coaching': 'Membership discount applied!',
    'Zealthy Weight Loss': 'Membership discount applied!',
    'Zealthy Weight Loss Access': 'Membership discount applied!',
    'Medication Subscription': 'Membership discount applied!',
    'Zealthy Personalized Psychiatry': 'Membership discount applied!',
  };
  return names[sub];
};
const parseSubGiftAppliedSubText = (sub: PatientSubscriptionProps) => {
  const names: { [key: string]: string } = {
    'Zealthy Subscription': `We’ve paused your subscription until ${format(
      new Date(sub.current_period_end ? sub.current_period_end : ''),
      'iiii, MMMM d, yyyy'
    )}`,
    'Mental Health Coaching': 'This will apply to your next billing cycle.',
    'Zealthy Weight Loss':
      'You’ll save 50% for your next month! This will apply to your next billing cycle.',
    'Zealthy Weight Loss Access':
      'You’ll save 50% for your next month! This will apply to your next billing cycle.',
    'Medication Subscription': 'This will apply to your next billing cycle.',
    'Zealthy Personalized Psychiatry':
      'This will apply to your next billing cycle.',
  };
  return names[sub.subscription?.name];
};

const selectItems: string[] = [
  'I’m not seeing any results',
  'I don’t need the products or services I was previously using',
  'Zealthy is too expensive for me',
  'I have product leftover from another order',
  'My insurance is no longer accepted',
  'I require products or services not offered',
  'I had a negative experience',
  'I’m moving outside of the state or country',
  'Other',
];

type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'] & {
    order: Database['public']['Tables']['order']['Row'] & {
      prescription: Database['public']['Tables']['prescription']['Row'] & {
        medication_quantity: Database['public']['Tables']['medication_quantity']['Row'] & {
          medication_dosage: Database['public']['Tables']['medication_dosage']['Row'] & {
            medication: Database['public']['Tables']['medication']['Row'];
          };
        };
      };
    };
  };

const usePatientWeightLossPrescriptions = () => {
  const supabase = useSupabaseClient<Database>();

  return useCallback(
    async (patientId: number) => {
      return supabase
        .from('patient_prescription')
        .select(
          '*, order!inner(*, prescription!inner(*, medication_quantity!inner(*, medication_dosage!inner(*, medication!inner(*)))))'
        )
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .eq(
          'order.prescription.medication_quantity.medication_dosage.medication.display_name',
          'Weight Loss Medication'
        )
        .then(({ data }): Record<string, string>[] =>
          ((data || []) as PatientPrescription[])
            .map(d => {
              if (d.order.prescription.medication) {
                return {
                  [d.order.prescription.medication]: formatDate(
                    d.current_period_end
                  ),
                };
              }
              return;
            })
            .filter(notEmpty)
        );
    },
    [supabase]
  );
};

const timeFrames = [
  { name: '2 weeks', value: 2 },
  { name: '3 weeks', value: 3 },
  { name: '4 weeks', value: 4 },
  { name: '5 weeks', value: 5 },
  { name: '6 weeks', value: 6 },
  { name: '7 weeks', value: 7 },
  { name: '8 weeks', value: 8 },
];

const isWeightLoss = (subscriptionName: string) => {
  return [
    'Zealthy Weight Loss',
    'Zealthy Weight Loss Access',
    'Zealthy 3-Month Weight Loss',
    'Zealthy 3-Month Weight Loss [IN]',
    'Zealthy 6-Month Weight Loss',
    'Zealthy 12-Month Weight Loss',
    'Discounted Weight Loss Plan',
  ].includes(subscriptionName);
};

const isPersonalPsychiatry = (subscriptionName: string) => {
  return [
    'Zealthy Personalized Psychiatry',
    'Zealthy Personalized Psychiatry 3-Month',
    'Zealthy Personalized Psychiatry 6-Month',
  ].includes(subscriptionName);
};

export default function MembershipManage() {
  const { id } = Router.query;
  const reference_id: string = id as string;
  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const updateFreeMonthRedemption = useUpdateFreeMonthRedemption();
  const page = searchParams?.get('page');
  const { data: patient } = usePatient();
  const { data: careTeam } = usePatientCareTeam();
  const { data: subscriptionData, refetch: refetchSubscription } =
    usePatientSubscription(id);
  const { data: patientSubscriptions, refetch: refetchSubscriptions } =
    useActivePatientSubscription();
  const { data: compoundMedications } = useCompoundMatrix();
  const { data: prescriptionRequests } = usePatientPrescriptionRequest();
  const ABZTest = useABTest();
  const { addVariant } = useIntakeActions();
  const { variant } = useIntakeState();
  const [loading, setLoading] = useState(false);
  const { scheduleForCancelation } = usePayment();
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [otherValue, setOtherValue] = useState<string>('');
  const [feedbackValue, setFeedbackValue] = useState<string>('');
  const [reasonValue, setReasonValue] = useState<string>('');
  const [specificMedName, setSpecificMedName] = useState<string>('medication');
  const [cancelChoiceReasons, setCancelChoiceReasons] = useState(
    new Set<string>()
  );
  const [time, setTime] = useState(7);
  const [survey, setSurvey] = useState('');
  const [recurringCancelation, setRecurringCancelation] = useState<string>('');
  const getWeightLossPrescriptions = usePatientWeightLossPrescriptions();
  const patientCoordinator = careTeam?.find(t => t.role === 'Coordinator');
  const vwoClient = useVWO();
  const [hasActive98, setHasActive98] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const { data: isUserBundled, isLoading: isBundledLoading } = useIsBundled();
  const [navigateTo, setNavigateTo] = useState<string | undefined>();

  // useEffect(() => {
  //   // Add this for debugging purposes
  //   if (vwoClient && patient?.id) {
  //     console.log('Debugging VWO activation...');
  //     vwoClient.activate('your_campaign_key', patient).then((data) => {
  //       console.log('Activated VWO Variation:', data);
  //     });
  //   }
  // }, [vwoClient, patient]);

  useEffect(() => {
    if (!patient?.id) {
      setLoadingPrescriptions(false);
      return;
    }

    (async () => {
      setLoadingPrescriptions(true);

      const { data, error } = await supabase
        .from('prescription')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('status', 'active')
        .eq('medication_quantity_id', 98);

      if (error) {
        console.error('Error fetching prescriptions:', error);
      }

      setHasActive98((data?.length ?? 0) > 0);

      setLoadingPrescriptions(false);
    })();
  }, [patient?.id, supabase]);

  const isCoachingOnly =
    subscriptionData?.subscription.name.includes('Coaching Only');

  const daysUntilPeriodEnd = differenceInDays(
    new Date(
      subscriptionData?.current_period_end
        ? subscriptionData?.current_period_end
        : ''
    ),
    new Date(
      subscriptionData?.current_period_start
        ? subscriptionData?.current_period_start
        : ''
    )
  );

  const handleSetSpecificMedName = (name: string) => {
    setSpecificMedName(name);
  };

  const recurringMedication = patientSubscriptions?.find(
    s => s.product === 'Recurring Weight Loss Medication'
  );
  const medicationName = recurringMedication?.order?.prescription?.medication
    ?.split(' ')[0]
    .toLowerCase();
  const lowestDoseMedication = compoundMedications?.find(
    m =>
      m.active &&
      m.current_month === 1 &&
      m.subscription_plan ===
        `${recurringMedication?.order?.prescription?.medication
          ?.split(' ')[0]
          .toLowerCase()}_monthly` &&
      m?.states?.includes(
        UsStates?.find(s => s.abbreviation === patient?.region)?.name || ''
      )
  );
  const hasNextMonthFree =
    daysUntilPeriodEnd > 31 && subscriptionData?.interval === 'month';

  const handleSurveyChange = (value: string) => {
    setSurvey(value);
  };
  const handleSurveyNext = async () => {
    if (survey === 'YES') {
      await supabase
        .from('patient_subscription')
        .update({ survey: true })
        .eq('reference_id', reference_id);
    }
    Router.push(
      {
        query: { id, page: 'goodbye' },
      },
      undefined,
      { shallow: true }
    );
  };
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };
  const handleTimeFrame: ChangeEventHandler<HTMLInputElement> = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setTime(parseInt(e.target.value, 10));

  const handleCancelWeightLossAppointments = async () => {
    if (!patient?.id) {
      return;
    }

    const appointments = await supabase
      .from('appointment')
      .select('*')
      .eq('patient_id', patient?.id)
      .eq('status', 'Confirmed')
      .eq('care', SpecificCareOption.WEIGHT_LOSS);

    if (!appointments.data) return;

    for (const appointment of appointments.data) {
      await supabase
        .from('appointment')
        .update({ status: 'Cancelled' })
        .eq('id', appointment?.id);
    }
  };

  const handleCancelMedication = useCallback(async () => {
    await scheduleForCancelation(
      recurringMedication?.reference_id || '',
      `${'Cancel Medication Only'} ${selectedValue} - ${otherValue} - ${feedbackValue} - ${reasonValue}`,
      Array.from(cancelChoiceReasons)
    );

    refetchSubscriptions();
    Router.push(
      {
        query: { id, page: 'cancelled' },
      },
      undefined,
      { shallow: true }
    );
    window.VWO?.event('medSubscriptionScheduledForCancel');

    await Promise.allSettled([
      vwoClient?.track('4320', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('6140', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('3452-2', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track(
        '5871_new',
        'medSubscriptionScheduledForCancel',
        patient
      ),
      vwoClient?.track('4819', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('5053', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('4918', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('5751', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('4798', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('5483', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('5483', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('5483-2', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('8552', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('8552_2', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('9057_1', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('9057_2', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('9057_3', 'medSubscriptionScheduledForCancel', patient),
      vwoClient?.track('8284', 'medSubscriptionScheduledForCancel', patient),
    ]);
    toast.success('Medication subscription scheduled for cancellation');
  }, [recurringMedication?.reference_id]);

  async function handleCancelSubscription() {
    setLoading(true);

    await scheduleForCancelation(
      reference_id,
      `${selectedValue} - ${otherValue} - ${feedbackValue} - ${reasonValue}`,
      Array.from(cancelChoiceReasons)
    );

    let prescriptions = null;

    if (
      isWeightLoss(subscriptionData?.subscription?.name || '') &&
      patient?.id
    ) {
      prescriptions = await getWeightLossPrescriptions(patient.id);
      await handleCancelWeightLossAppointments();
    }

    membershipEvent(
      patient?.profiles.first_name,
      patient?.profiles?.email,
      patientSubscriptions?.filter(
        (sub: any) => sub.reference_id === reference_id
      )[0].subscription.name,
      subscriptionData?.current_period_end,
      prescriptions
    );

    Router.push(
      {
        query: { id, page: 'cancelled' },
      },
      undefined,
      { shallow: true }
    );

    await Promise.allSettled([
      vwoClient?.track('4320', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('8201', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('6140', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('7458', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('8078', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track(
        'Clone_7077',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track('7895', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('4381', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('5777', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('5053', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track(
        '5871_new',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track(
        'Clone_6775',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track(
        'Clone_6775_2',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track(
        '3452-2',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track('5476', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('8288', 'wlMembershipScheduleForCancellation', patient),
      ABZTest.trackMetric(
        '6465_new',
        patient?.profile_id!,
        'wlMembershipScheduleForCancellation'
      ),
      vwoClient?.track('4601', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('6303', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('4819', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('4918', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('5751', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('6031', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('6826', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('5867', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('75801', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track(
        '6822-3',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track('7638', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('6867', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('7752', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('7743', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('4798', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('5483', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('7960', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('7380', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('7935', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track(
        '780101',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track(
        '780102',
        'wlMembershipScheduleForCancellation',
        patient
      ),

      vwoClient?.track(
        '7746-2',
        'wlMembershipScheduleForCancellation',
        patient
      ),

      vwoClient?.track('8676', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('8552', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track(
        '8552_2',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track('9363', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track('8685', 'wlMembershipScheduleForCancellation', patient),
      vwoClient?.track(
        '9057_1',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track(
        '9057_2',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track(
        '9057_3',
        'wlMembershipScheduleForCancellation',
        patient
      ),
      vwoClient?.track('9205', 'wlMembershipScheduleForCancellation', patient),
    ]);
    toast.success('Membership scheduled for cancellation');
    refetchSubscriptions();
    setLoading(false);
  }

  async function handleReasonSave() {
    if (!id) {
      return;
    }
    await supabase
      .from('patient_subscription')
      .update({ cancel_reason: `${reasonValue}` })
      .eq('reference_id', id);
    Router.push(
      {
        query: { id, page: 'feedback' },
      },
      undefined,
      { shallow: true }
    );
  }
  async function handleFeedbackSave() {
    if (!id) {
      return;
    }
    await supabase
      .from('patient_subscription')
      .update({
        cancel_reason: `${reasonValue} - ${feedbackValue}`,
      })
      .eq('reference_id', id);
    Router.push(
      {
        query: { id, page: 'sharing' },
      },
      undefined,
      { shallow: true }
    );
  }
  const freeMonthRuntime = addMonths(
    new Date(subscriptionData?.current_period_end || ''),
    1
  );

  async function handleApplyFreeMonth() {
    setLoading(true);
    const trialEnd = addMonths(
      new Date(subscriptionData?.current_period_end || ''),
      1
    );

    // checks to see if user has already redeemed their free month
    if (patient?.weight_loss_free_month_redeemed) {
      toast.error('You have already used your free month.');
      setLoading(false);
      return;
    }

    try {
      const applyCredit = await axios.post(
        '/api/service/payment/apply-credit-balance',
        {
          referenceId: reference_id,
          trialEnd,
          isFromCancellation: true,
        }
      );

      if (applyCredit.status === 200) {
        // Record the redemption using the mutation hook
        if (!patient?.id) {
          toast.error('Patient ID not found');
          return;
        }

        try {
          await updateFreeMonthRedemption.mutateAsync(patient.id);
          toast.success('Your next month of Zealthy weight loss will be free!');
          Router.push(Pathnames.PATIENT_PORTAL);
        } catch (updateError) {
          console.error('Failed to record free month redemption:', updateError);
          toast.error(
            'Failed to record your free month. Please contact support.'
          );
        }
      } else {
        toast.error(
          applyCredit?.data?.error ||
            'There was an error applying your free month.'
        );
      }
    } catch (error) {
      toast.error('You have already used your free month.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyGift() {
    if (subscriptionData?.subscription.name === 'Zealthy Subscription') {
      const pausedSub = await axios.post(
        '/api/service/payment/pause-subscription',
        {
          subscriptionId: reference_id,
          resumeDate: `${format(
            addDays(
              new Date(
                subscriptionData?.current_period_end
                  ? subscriptionData?.current_period_end
                  : ''
              ),
              differenceInDays(
                new Date(
                  subscriptionData?.current_period_end
                    ? subscriptionData?.current_period_end
                    : ''
                ),
                new Date(
                  subscriptionData?.current_period_start
                    ? subscriptionData?.current_period_start
                    : ''
                )
              )
            ),
            'iiii, MMMM d, yyyy'
          )}`,
        }
      );
      if (pausedSub.status === 200) {
        refetchSubscription();
        Router.push(
          {
            query: { id, page: 'gift-applied' },
          },
          undefined,
          { shallow: true }
        );
      }
    } else {
      const couponApplied = await axios.post(
        '/api/service/payment/apply-coupon-subscription',
        {
          subscriptionId: reference_id,
          couponId:
            subscriptionData?.subscription?.name === 'Zealthy Weight Loss' ||
            subscriptionData?.subscription?.name ===
              'Zealthy Weight Loss Access' ||
            subscriptionData?.subscription?.name ===
              'Discounted Weight Loss Plan'
              ? process.env.NEXT_PUBLIC_FIFTY_PERCENT_OFF
              : process.env.NEXT_PUBLIC_TWENTY_DOLLARS_OFF,
        }
      );

      if (couponApplied.status === 200) {
        Router.push(
          {
            query: { id, page: 'gift-applied' },
          },
          undefined,
          { shallow: true }
        );
      }
    }
  }
  async function handleDelayMedication() {
    const delayMed = await axios.post(
      '/api/service/payment/delay-subscription',
      {
        subscriptionId: reference_id,
        resumeDate: addWeeks(
          new Date(
            subscriptionData?.current_period_end
              ? subscriptionData?.current_period_end
              : ''
          ),
          time
        ),
        cancel_at: addWeeks(new Date(subscriptionData?.cancel_at || ''), time),
      }
    );
    if (delayMed.status === 200) {
      refetchSubscription();
      Router.push(
        {
          query: { id, page: 'delay-applied' },
        },
        undefined,
        { shallow: true }
      );
    }
  }
  const handleDowngrade = useCallback(async () => {
    setLoading(true);
    if (recurringCancelation === 'medicationOnly') {
      const downgradeMed = await axios.post(
        '/api/service/payment/downgrade-subscription',
        {
          recurringId: recurringMedication?.reference_id,
          patient,
          newMedication: {
            ...lowestDoseMedication,
            interval: 'days',
            interval_count: 30,
          },
        }
      );
      if (downgradeMed.status === 200) {
        refetchSubscription();
        Router.push(
          {
            query: {
              id,
              page: 'downgrade-success',
            },
          },
          undefined,
          { shallow: true }
        );
      }
    }
    if (recurringCancelation === 'membershipAndMedication') {
      const downgradeMed = await axios.post(
        '/api/service/payment/downgrade-medication',
        {
          recurringId: recurringMedication?.reference_id,
          patient,
          newMedication: {
            ...lowestDoseMedication,
            interval: 'days',
            interval_count: 30,
          },
        }
      );

      const couponApplied = await axios.post(
        '/api/service/payment/apply-coupon-subscription',
        {
          subscriptionId: reference_id,
          couponId: process.env.NEXT_PUBLIC_FIFTY_PERCENT_OFF,
        }
      );
      if (downgradeMed.status === 200 && couponApplied.status === 200) {
        refetchSubscription();
        Router.push(
          {
            query: {
              id,
              page: 'downgrade-success',
            },
          },
          undefined,
          { shallow: true }
        );
      }
    }
    setLoading(false);
  }, [recurringCancelation]);

  const handleCancelMembership = async () => {
    setLoading(true);

    const applyDiscount = await axios.post(
      '/api/service/payment/apply-coupon-subscription',
      {
        subscriptionId: reference_id,
        couponId: process.env.NEXT_PUBLIC_FIFTY_PERCENT_OFF,
      }
    );

    if (applyDiscount.status === 200) {
      toast.success(
        `Discount successfully applied. You will save 50% off your next month.`
      );
    } else {
      console.error('Failed to apply discount:', applyDiscount.data);
    }

    setLoading(false);
  };

  const handleCheckCancellationType = async () => {
    setLoading(true);

    const hasMedication = recurringMedication?.order?.prescription?.medication;
    const isMembershipActive =
      subscriptionData?.current_period_end &&
      new Date(subscriptionData.current_period_end) > new Date();

    if (!hasMedication && isMembershipActive) {
      try {
        await handleCancelMembership();
        Router.push(
          {
            query: { id, page: 'downgrade-membership-success' },
          },
          undefined,
          { shallow: true }
        );
      } catch (error) {
        console.error('Failed to apply discount:', error);
      }
    } else {
      Router.push(
        {
          query: { id, page: 'downgrade-success' },
        },
        undefined,
        { shallow: true }
      );
    }

    setLoading(false);
  };

  const handleClick = useCallback(() => {
    Router.push(
      {
        query: { id, page: 'guides' },
      },
      undefined,
      { shallow: true }
    );
  }, [id]);

  const handleContinue = useCallback(() => {
    if (!cancelChoiceReasons || cancelChoiceReasons.size === 0) {
      alert('You must select a reason.');
      return;
    }

    if (subscriptionData?.price === 249) {
      Router.push(
        {
          query: {
            id,
            page: recurringMedication?.order_id
              ? 'cancel-recurring-medication'
              : 'downgrade-medication',
          },
        },
        undefined,
        { shallow: true }
      );
      return;
    }

    if (subscriptionData?.subscription_id === 7) {
      return handleClick();
    }

    if (subscriptionData?.subscription_id === 1) {
      return Router.push(
        {
          query: { id, page: `goodbye` },
        },
        undefined,
        { shallow: true }
      );
    }

    Router.push(
      {
        query: { id, page: `free-month-${page}` },
      },
      undefined,
      { shallow: true }
    );
  }, [cancelChoiceReasons, id, recurringMedication, subscriptionData]);

  const isOther = (text: string) => {
    return text.toLowerCase().includes('other');
  };

  const handleMultipleSelectChoiceReasons = (item: string) => {
    setCancelChoiceReasons(prev => {
      const newSelected = new Set(prev);

      if (isOther(item)) {
        newSelected.clear();
        newSelected.add(item);
      } else {
        const hasOther = Array.from(newSelected).some(reason =>
          isOther(reason)
        );
        if (hasOther) {
          Array.from(newSelected).forEach(reason => {
            if (isOther(reason)) {
              newSelected.delete(reason);
            }
          });
        }

        if (newSelected.has(item)) {
          newSelected.delete(item);
        } else {
          newSelected.add(item);
        }
      }

      return newSelected;
    });
  };

  // Determine the handler function based on variation
  const handleSelectChoiceReasons = (item: string) => {
    handleMultipleSelectChoiceReasons(item);
  };

  const downgradeSaving =
    (recurringMedication?.price || 0) /
      ((recurringMedication?.interval_count || 0) === 90 ? 3 : 1) -
    (lowestDoseMedication?.price || 0);

  const periodLength = differenceInDays(
    new Date(
      subscriptionData?.current_period_end
        ? subscriptionData?.current_period_end
        : ''
    ),
    new Date(
      subscriptionData?.current_period_start
        ? subscriptionData?.current_period_start
        : ''
    )
  );

  const totalMonthsLeft = differenceInDays(
    new Date(subscriptionData?.current_period_end || ''),
    new Date()
  );

  const expectedLength = subscriptionData?.subscription?.name?.includes('3')
    ? 3
    : subscriptionData?.subscription?.name?.includes('6')
    ? 6
    : subscriptionData?.subscription?.name?.includes('12')
    ? 12
    : 1;

  const membershipInterval =
    (expectedLength || 1) > 1
      ? ` Already paid ${expectedLength} ${
          subscriptionData?.interval === 'year'
            ? 'month'
            : subscriptionData?.interval
        }s`
      : `/${subscriptionData?.interval}`;

  const nextMonthFree =
    periodLength > 59 &&
    periodLength < 65 &&
    expectedLength === 1 &&
    totalMonthsLeft > 30;

  const alreadyPaidTwoMonths =
    expectedLength === 1 && periodLength > 80 && totalMonthsLeft > 30;

  const unsubscribeText = `Important: Once you select "Unsubscribe" below, any medication orders${
    ![1, 3, 5, 7, 22, 23, 24].includes(subscriptionData?.subscription.id ?? 0)
      ? ', including GLP-1s such as semaglutide or tirzepatide,'
      : ''
  } associated with your plan will not be dispensed, and you will not be able to request any refills from Zealthy. Please ensure that you have consulted with your medical provider to confirm that this decision is clinically appropriate.`;

  return (
    <>
      {page === 'coach-only' && (
        <CoachOnly basePath={`/patient-portal/manage-memberships/${id}`} />
      )}
      {page === 'pre-pay' && (
        <PrePaid
          basePath={`/patient-portal/manage-memberships/${id}`}
          type={
            isWeightLoss(subscriptionData?.subscription.name || '')
              ? 'weight loss'
              : 'personalized psychiatry'
          }
          setSpecificMedName={handleSetSpecificMedName}
        />
      )}

      {page === 'confirm-downgrade' && <ConfirmDowngrade />}

      {page === 'weight-loss-pending-request' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',

            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '2rem',
            }}
          >
            If you proceed, you will not be able to receive the{' '}
            {specificMedName} that you requested at this time because our
            providers do not review requests for cancelled members.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: '2rem',
              fontSize: '1rem!important',
            }}
          >
            This is because your provider must monitor your care during the
            entire period of taking your medication, and if you’re cancelling
            they wouldn’t be able to do that.
          </Typography>
          <Typography
            sx={{
              marginBottom: '2rem',
              fontSize: '1rem!important',
            }}
          >
            By continuing to cancel, you acknowledge you understand you will not
            receive your {specificMedName}.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => Router.push(`${Pathnames.PATIENT_PORTAL}`)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '2rem',
              padding: '1rem',
            }}
          >
            Nevermind, I’d like my provider to review my request
          </Button>
          <Button
            color="grey"
            fullWidth
            onClick={() => {
              window.scrollTo({ top: 0, left: 0 });
              Router.push(
                `${Pathnames.PATIENT_PORTAL}/manage-memberships/${id}?page=weight-loss`
              );
            }}
          >
            Continue to cancel
          </Button>
        </Box>
      )}

      {page === 'glp1-pending-request-pa' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <Typography variant="h2" sx={{ marginBottom: '2rem' }}>
            If you proceed, you will not be able to receive your prior
            authorization to get GLP-1 medication covered by your insurance.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: '2rem',
              fontSize: '1rem!important',
            }}
          >
            This is because your provider must monitor your care during the
            entire period of taking your medication, and if you&apos;re
            cancelling they wouldn’t be able to do that.
          </Typography>
          <Typography
            sx={{
              marginBottom: '2rem',
              fontSize: '1rem!important',
            }}
          >
            By continuing to cancel, you acknowledge you understand you will not
            receive your GLP-1 medication.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => Router.push(`${Pathnames.PATIENT_PORTAL}`)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '2rem',
              padding: '1rem',
            }}
          >
            Nevermind, I’d like to get GLP-1 covered
          </Button>
          <Button
            color="grey"
            fullWidth
            onClick={() =>
              Router.push(
                `${Pathnames.PATIENT_PORTAL}/manage-memberships/${id}?page=weight-loss`
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Continue to cancel
          </Button>
        </Box>
      )}

      {page === 'confirm-upgrade' && <ConfirmUpgrade />}
      {page === 'free-month-weight-loss' && (
        <FreeMonth
          subscription={subscriptionData}
          handleApplyFreeMonth={handleApplyFreeMonth}
          loading={loading}
        />
      )}
      {page === 'free-month-personalized-psychiatry' && (
        <FreeMonth
          subscription={subscriptionData}
          handleApplyFreeMonth={handleApplyFreeMonth}
          loading={loading}
        />
      )}
      {page === 'free-month-primary-care' && (
        <FreeMonth
          subscription={subscriptionData}
          handleApplyFreeMonth={handleApplyFreeMonth}
          loading={loading}
        />
      )}
      {page === 'free-month-personalized-psychiatry' && (
        <FreeMonth
          subscription={subscriptionData}
          handleApplyFreeMonth={handleApplyFreeMonth}
          loading={loading}
        />
      )}
      {page === 'free-month-primary-care' && (
        <FreeMonth
          subscription={subscriptionData}
          handleApplyFreeMonth={handleApplyFreeMonth}
          loading={loading}
        />
      )}
      {page === 'help-center' && (
        <Box>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Visit our help center for weight loss patients.'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '2rem',
            }}
          >
            If you have questions about billing, subscriptions, or compound
            GLP-1 medications, you can learn more about our program in our Help
            Center. You are also welcome to message your care team at any time
            through our unlimited messaging service.
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() => Router.push(Pathnames.WL_MEMBER_HELP_CENTER)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Visit our Help Center'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              Router.push(
                {
                  query: {
                    id,
                    page: 'free-month-weight-loss',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'contact-zealthy-delays' && (
        <Box>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'We apologize for any delays in our response time.'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '2rem',
            }}
          >
            Our team can be reached at (877) 870-0323 anytime from Monday to
            Friday 9am-6pm ET and Saturday to Sunday 12pm-6pm ET. You can always
            message your care team through our unlimited messaging service.
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Message your care team'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              Router.push(
                {
                  query: {
                    id,
                    page: 'free-month-weight-loss',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'contact-zealthy-confusion' && (
        <Box>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'We apologize for any confusion in our previous responses.'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '2rem',
            }}
          >
            Our team can be reached at (877) 870-0323 anytime from Monday to
            Friday 9am-6pm ET and Saturday to Sunday 12pm-6pm ET. You can always
            message your care team through our unlimited messaging service.
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Message your care team'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              Router.push(
                {
                  query: {
                    id,
                    page: 'free-month-weight-loss',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'cancellation-six-and-twelve' && (
        <Box>
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {
              'You can save up to 60% off your medication price by purchasing a 6 or 12 month weight loss option.'
            }
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '2rem',
            }}
          >
            You can save on your monthly medication and membership costs by
            purchasing multiple months at once.
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() => {
              if (!loadingPrescriptions) {
                // If they DO have an active prescription w/ medication_quantity_id=98,
                // go to the refill route:
                if (hasActive98) {
                  Router.push(
                    '/patient-portal/questionnaires-v2/weight-loss-compound-refill'
                  );
                }
                // Otherwise, route them to "post-checkout" with ?id=compound&type=skip
                else {
                  Router.push({
                    pathname:
                      '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
                    query: {
                      id: 'compound',
                      type: 'skip',
                    },
                  });
                }
              }
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Explore 6 and 12 month options'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              Router.push(
                {
                  query: {
                    id,
                    page: 'goodbye',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'active-membership-reminder' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {
              'In order to receive your medication you’ll need to have an active membership.'
            }
          </Typography>
          <WhiteBox sx={{ padding: '20px', gap: '1.3rem' }}>
            It’s important to be under a provider’s care when on medication, so
            you are required to keep your membership in order to keep your
            semaglutide or tirzepatide subscription.
            <Divider />
            <Typography fontWeight={600}>Your membership</Typography>
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" sx={{ gap: '0.5rem', alignItems: 'center' }}>
                <CalendarToday />
                <Typography>
                  Runs through{' '}
                  <span
                    style={{
                      color: '#00531B',
                      fontWeight: 600,
                    }}
                  >
                    {subscriptionData?.current_period_end
                      ? format(
                          new Date(subscriptionData?.current_period_end),
                          'MMMM d, yyyy'
                        )
                      : format(new Date(), 'MMMM d, yyyy')}
                  </span>
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: '#D7FFE4',
                  padding: '8px 20px',
                  borderRadius: '30px',
                }}
              >
                <Typography
                  variant="h4"
                  style={{
                    color: '#00531B',
                    fontWeight: 600,
                  }}
                >
                  {`$${subscriptionData?.price}/mo`}
                </Typography>
              </Box>
            </Box>
          </WhiteBox>
          <br />
          <Button
            size="small"
            fullWidth
            onClick={() => Router.push(`/patient-portal`)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Return to home page'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              Router.push(
                {
                  query: {
                    id,
                    page: 'free-month-weight-loss',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}

      {page === 'schedule-weight-loss-provider' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            You can schedule a 15 minute visit with a Zealthy provider to
            discuss your care.
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            If you have questions or requests that can be addressed by a doctor,
            you can schedule with your medical provider here.
          </Typography>
          <Button
            fullWidth
            size="small"
            onClick={() => Router.push('/schedule-now/wl-cancel')}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Schedule with a provider'}
          </Button>
          <Button
            fullWidth
            color="grey"
            size="small"
            onClick={() =>
              Router.push(
                {
                  query: {
                    id,
                    page:
                      subscriptionData?.price === 249
                        ? 'weight-loss-benefits'
                        : 'free-month-weight-loss',
                  },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'weight-loss' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            minHeight: '100vh',
            paddingBottom: '1rem',
            marginBottom: '5rem',
          }}
        >
          <Typography variant="h2">
            Why are you looking to cancel your weight loss membership?
          </Typography>
          {[
            'My prescription was taking too long to ship',
            'Too expensive for medication',
            'Membership too expensive',
            'My insurance wouldn’t cover my medication',
            'I was not eligible for medication',
            'Responses took too long',
            'Responses were incorrect or confusing',
            'Not sure how Zealthy weight loss works',
            'Other',
          ].map(item => (
            <ChoiceItem
              key={item}
              item={{ text: item }}
              selected={cancelChoiceReasons.has(item)}
              handleItem={() => handleMultipleSelectChoiceReasons(item)}
            />
          ))}
          <Button
            size="medium"
            onClick={handleContinue}
            style={{
              marginTop: '1rem',
              marginBottom: '2rem',
              height: '3rem',
            }}
          >
            Continue
          </Button>
        </Box>
      )}

      {page === 'personalized-psychiatry' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            minHeight: '100vh',
            paddingBottom: '1rem',
            marginBottom: '5rem',
          }}
        >
          <Typography variant="h2">
            Why are you looking to cancel your personalized psychiatry
            membership?
          </Typography>
          {[
            'My prescription was taking too long to ship',
            'Too expensive for medication',
            'Membership too expensive',
            'My insurance wouldn’t cover my medication',
            'I was not eligible for medication',
            'Responses took too long',
            'Responses were incorrect or confusing',
            'Not sure how Zealthy personalized psychiatry works',
            'Other',
          ].map(item => (
            <ChoiceItem
              key={item}
              item={{ text: item }}
              selected={cancelChoiceReasons.has(item)}
              handleItem={() => handleSelectChoiceReasons(item)}
            />
          ))}
          <Button
            size="medium"
            onClick={handleContinue}
            style={{
              marginTop: '1rem',
              marginBottom: '2rem',
              height: '3rem',
            }}
          >
            Continue
          </Button>
        </Box>
      )}

      {page === 'primary-care' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            minHeight: '100vh',
            paddingBottom: '1rem',
            marginBottom: '5rem',
          }}
        >
          <Typography variant="h2">
            Why are you looking to cancel your primary care membership?
          </Typography>
          {[
            'My prescription was taking too long to ship',
            'Too expensive for medication',
            'Membership too expensive',
            'My insurance wouldn’t cover my medication',
            'I was not eligible for medication',
            'Responses took too long',
            'Responses were incorrect or confusing',
            'Not sure how Zealthy primary care works',
            'Other',
          ].map(item => (
            <ChoiceItem
              key={item}
              item={{ text: item }}
              selected={cancelChoiceReasons.has(item)}
              handleItem={() => handleSelectChoiceReasons(item)}
            />
          ))}
          <Button
            size="medium"
            onClick={handleContinue}
            style={{
              marginTop: '1rem',
              marginBottom: '2rem',
              height: '3rem',
            }}
          >
            Continue
          </Button>
        </Box>
      )}

      {page === 'weight-loss-benefits' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            By unsubscribing, you lose access to your medical care and
            prescriptions including:
          </Typography>

          <List
            sx={{
              listStyleType: 'disc',
              marginBottom: '1rem',
              lineHeight: '30px',
              paddingLeft: '15px',
            }}
          >
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography variant="body1">
                Support and prescription care from your medical provider
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography variant="body1">
                Coordination team to get GLP-1 medication covered by insurance
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography variant="body1">
                Access to affordable semaglutide and tirzepatide shipped to your
                home as well as other free medication options included in your
                membership
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item', padding: 0 }}>
              <Typography variant="body1">
                Your weight loss coach, including messaging and optional live
                sessions
              </Typography>
            </ListItem>
          </List>

          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            You can still change your mind if you want to achieve lasting weight
            loss!
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() => Router.back()}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {"I've changed my mind"}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: {
                    id,
                    page: recurringMedication?.order_id
                      ? 'cancel-recurring-medication'
                      : 'goodbye',
                  },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'continue' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Continue to unsubscribe?'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {
              'After unsubscribing, your access to some Zealthy member benefits will change.'
            }
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {
              'You won’t be able to request any additional refills and current refills will be paused since your Zealthy provider won’t be able to monitor you for the duration of the refill.'
            }
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'You’ll still have access to any messages and progress tracking until the end of your subscription.'
            }
          </Typography>
          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Return to account'}
          </Button>
          <Button
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: { id, page: 'learn' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'learn' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {
              'Need to learn more about GLP-1 medication or Zealthy’s Weight Loss Program?'
            }
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {
              'You can read more about the Zealthy Weight Loss program as well as GLP-1 medications like Wegovy, Ozempic, and Mounjaro.'
            }
          </Typography>
          <Button
            size="small"
            fullWidth
            href="https://www.getzealthy.com/blog"
            target="_blank"
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Review more information'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: { id, page: 'medication' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'medication' && ( //remove
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Your GLP-1 medication may be covered by your insurance!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Medications like Wegovy are GLP-1 medications that are FDA-approved for weight loss. Would you like your Care Team to contact your insurance provider about these GLP-1 medications?'
            }
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Ask about GLP-1 medication'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: { id, page: 'care-team' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'care-team' && ( //remove
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Do you have questions for your care team? We can help! '}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Let your care team know what’s going on. They can make changes to your care plan or help you explore insurance coverage or alternative medication options.'
            }
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() =>
              Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Message your care team'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: {
                    id,
                    page: recurringMedication?.order_id
                      ? 'cancel-recurring-medication'
                      : 'sorry',
                  },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue unsubscribe'}
          </Button>
        </Box>
      )}
      {page === 'cancel-recurring-medication' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {
              'In order to receive your medication you’ll need to have an active membership.'
            }
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {
              'It’s important to be under a provider’s care when on medication, so you are required to keep your membership in order to keep your semaglutide or tirzepatide subscription.'
            }
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {`However, you can cancel your ${medicationName} subscription without cancelling your membership, and continue to get medical care & support for prior authorizations for brand name GLP-1s, weight loss coaching, and more.`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {`Your membership: $${subscriptionData?.price}/month`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`Your ${medicationName} subscription: $${
              recurringMedication?.price
            }${
              recurringMedication?.interval_count === 30
                ? '/month'
                : ' every 3 months'
            }`}
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() => Router.push(`/patient-portal`)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Return to home page'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              setRecurringCancelation('medicationOnly');
              Router.push(
                {
                  query: {
                    id,
                    page: 'goodbye',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Cancel Medication'}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() => {
              setRecurringCancelation('membershipAndMedication');
              Router.push(
                {
                  query: {
                    id,
                    page: 'goodbye',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Cancel Membership and Medication'}
          </Button>
        </Box>
      )}
      {page === 'downgrade-medication' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {recurringCancelation === 'medicationOnly' ? (
            <>
              <Typography
                variant="h2"
                sx={{
                  marginBottom: '1rem',
                }}
              >
                {/* removed due to 8276 but keeping just in case */}
                {`Downgrade your plan and save${
                  downgradeSaving > 0
                    ? ` $${
                        downgradeSaving % 1 === 0
                          ? downgradeSaving
                          : downgradeSaving.toFixed(2)
                      } per month`
                    : `${
                        (recurringMedication?.price || 0) -
                          (lowestDoseMedication?.price || 0) >
                        0
                          ? ` $${
                              (recurringMedication?.price || 0) -
                              (lowestDoseMedication?.price || 0)
                            }`
                          : ''
                      }`
                }.`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                {`You’ll receive monthly supplies of ${medicationName}, and your monthly cost will only be $${lowestDoseMedication?.price}/month for ${medicationName}.`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                {`You won’t be billed today. Will apply to your next billing cycle.`}
              </Typography>
              <LoadingButton
                size="small"
                fullWidth
                disabled={loading}
                onClick={handleDowngrade}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {'Continue with downgraded plan'}
              </LoadingButton>
              <Button
                size="small"
                fullWidth
                color="grey"
                onClick={() =>
                  Router.push(
                    {
                      query: {
                        id,
                        page: 'goodbye',
                      },
                    },
                    undefined,
                    { shallow: true }
                  )
                }
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {'Continue unsubscribe'}
              </Button>
            </>
          ) : (
            <>
              <Typography
                variant="h2"
                sx={{
                  marginBottom: '1rem',
                }}
              >
                {/* removed due to 8276 but keeping just in case */}
                {`Reduce the cost of your plan by 50% and save${
                  downgradeSaving > 0
                    ? ` $${
                        downgradeSaving % 1 === 0
                          ? downgradeSaving
                          : downgradeSaving.toFixed(2)
                      } per month`
                    : `${
                        (recurringMedication?.price || 0) -
                          (lowestDoseMedication?.price || 0) >
                        0
                          ? ` $${
                              (recurringMedication?.price || 0) -
                              (lowestDoseMedication?.price || 0)
                            }`
                          : ''
                      }`
                }.`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                {`For one time only, we’ll throw in 50% off your next month of Zealthy weight loss membership, so the month will only be $${(
                  (subscriptionData?.price || 0) / 2
                ).toFixed(
                  2
                )} including all medical care, coaching, and care coordination.`}
              </Typography>
              <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                {`You won’t be billed today. Will apply to your next billing cycle.`}
              </Typography>
              <LoadingButton
                size="small"
                fullWidth
                disabled={loading}
                onClick={handleCheckCancellationType}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {'Continue with downgraded plan'}
              </LoadingButton>
              {variant === 'no-insurance-cancellation' ||
              variant === 'membership-too-expensive-cancellation' ? (
                <Button
                  size="small"
                  fullWidth
                  color="grey"
                  onClick={() =>
                    Router.push(
                      {
                        query: {
                          id,
                          page: 'free-month-weight-loss',
                        },
                      },
                      undefined,
                      { shallow: true }
                    )
                  }
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  {'Continue unsubscribe'}
                </Button>
              ) : (
                <Button
                  size="small"
                  fullWidth
                  color="grey"
                  onClick={() =>
                    Router.push(
                      {
                        query: {
                          id,
                          page: 'goodbye',
                        },
                      },
                      undefined,
                      { shallow: true }
                    )
                  }
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  {'Continue unsubscribe'}
                </Button>
              )}
            </>
          )}
        </Box>
      )}
      {page === 'downgrade-success' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {`Your lower price for medication subscription has been applied.`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {`You’ll save on your medication subscription going forward.`}
          </Typography>
          <Button
            size="small"
            fullWidth
            onClick={() => Router.push(`/patient-portal`)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Done'}
          </Button>
        </Box>
      )}
      {page === 'downgrade-membership-success' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '2rem',
            }}
          >
            {
              '50% off your next month of weight loss membership has been applied.'
            }
          </Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: '2rem',
              fontWeight: 'bold',
              color: 'primary.main',
              backgroundColor: '#f0f0f0',
              padding: '8px',
              borderRadius: '4px',
            }}
          >
            {`You will receive a $${(
              (subscriptionData?.price ?? 0) * 0.5
            ).toFixed(2)} discount on your next month!`}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {
              'You’ll continue to have access to your Zealthy medical team, coordination team, and weight loss coach, which means we’ll continue to help you get your GLP-1 medication covered if you have insurance and will continue to give you access to order affordable semaglutide, the active ingredient in Ozempic and Wegovy, or tirzepatide, the active ingredient in Zepbound and Mounjaro, shipped directly to your door.'
            }
          </Typography>
          <Button
            fullWidth
            onClick={() => Router.push(`/patient-portal`)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Return to account'}
          </Button>
        </Box>
      )}

      {page === 'discount' && (
        <MedicationDiscount recurringMedication={recurringMedication} />
      )}

      {page === 'downgrade-plan' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
              fontWeight: 'bold',
            }}
          >
            Switch to a discounted Weight Loss plan for only $99/month all
            inclusive (no additional fees!).
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '2rem',
              fontSize: '16px',
              lineHeight: '1.5',
              color: '#333',
            }}
          >
            Join our discounted Weight Loss plan to get Metformin or
            Bupropion/Naltrexone for only $99/month. This includes your
            medication (either Bupropion/Naltrexone or Metformin) as well as
            access to a weight loss coach, fitness, and nutritional plans to
            help you achieve lasting weight loss.
          </Typography>

          <LoadingButton
            size="small"
            fullWidth
            disabled={loading}
            onClick={() => {
              Router.push(
                {
                  pathname: '/patient-portal/manage-memberships/downgrade',
                  query: {
                    page: 'confirm-downgrade',
                    plan: 'Discounted Weight Loss Plan',
                  },
                },
                undefined,
                { shallow: true }
              );
            }}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
              backgroundColor: '#165B33',
              color: '#FFF',
              '&:hover': {
                backgroundColor: '#114424',
              },
            }}
          >
            Switch to a discounted plan
          </LoadingButton>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: {
                    id,
                    page: 'downgrade-medication',
                  },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
              backgroundColor: '#FFF',
              border: '1px solid #CCC',
              '&:hover': {
                backgroundColor: '#F0F0F0',
              },
            }}
          >
            Continue unsubscribe
          </Button>
        </Box>
      )}

      {page === 'discount-applied' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Membership discount applied!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
            {
              'You’ll save 50% for your next month! This will apply to your next billing cycle.'
            }
          </Typography>
          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Done'}
          </Button>
        </Box>
      )}
      {page === 'sorry' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'We’re sorry to see you go!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'We’d really appreciate your feedback as we work to improve the Zealthy member experience.'
            }
          </Typography>
          <Button
            fullWidth
            onClick={() =>
              Router.push(
                {
                  query: { id, page: 'reason' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue'}
          </Button>
        </Box>
      )}
      {page === 'reason' && ( //remove
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Is there anything else you’d like to say? '}
          </Typography>
          <FormControl
            sx={{
              marginBottom: '3rem',
              width: '100%',
            }}
          >
            <FilledInput
              sx={{
                background: '#EEEEEE',
                '&:hover': {
                  background: '#EEEEEE',
                },
              }}
              onChange={e => setReasonValue(e.target.value)}
              fullWidth
              placeholder="Type here..."
              multiline
              disableUnderline={true}
              rows={8}
            />
          </FormControl>
          <Button
            fullWidth
            disabled={!reasonValue.length}
            onClick={handleReasonSave}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Next'}
          </Button>
        </Box>
      )}
      {page === 'feedback' && ( //remove
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'What might encourage you to join Zealthy again in the future?'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'For example: new benefits, price changes, etc.'}
          </Typography>
          <FormControl
            sx={{
              marginBottom: '3rem',
              width: '100%',
            }}
          >
            <FilledInput
              sx={{
                background: '#EEEEEE',
                '&:hover': {
                  background: '#EEEEEE',
                },
              }}
              onChange={e => setFeedbackValue(e.target.value)}
              fullWidth
              placeholder="Your feedback will help improve the program for other members?"
              multiline
              disableUnderline={true}
              rows={8}
            />
          </FormControl>
          <Button
            fullWidth
            disabled={!feedbackValue.length}
            onClick={handleFeedbackSave}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Next'}
          </Button>
        </Box>
      )}
      {page === 'sharing' && ( //remove
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Would you be open to sharing more about your experience?'}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {
              'A member of the Zealthy team may contact you via phone for a brief survey. If you speak with them, you’ll receive a $20 gift card for your time.'
            }
          </Typography>
          <FormControl
            sx={{
              marginBottom: '3rem',
              width: '100%',
            }}
          >
            <ListItemButton
              selected={survey === 'YES'}
              onClick={() => handleSurveyChange('YES')}
              sx={{
                border: `1px solid ${
                  survey === 'YES' ? '#1B1B1B' : '#00000033'
                }`,
                borderRadius: '12px',
                padding: '20px 24px',
                color: '#1B1B1B',
                marginBottom: '1rem',
              }}
            >
              Yes
            </ListItemButton>
            <ListItemButton
              selected={survey === 'NO'}
              onClick={() => handleSurveyChange('NO')}
              sx={{
                border: `1px solid ${
                  survey === 'NO' ? '#1B1B1B' : '#00000033'
                }`,
                borderRadius: '12px',
                padding: '20px 24px',
                color: '#1B1B1B',
              }}
            >
              No
            </ListItemButton>
          </FormControl>
          <Button
            fullWidth
            onClick={handleSurveyNext}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Next'}
          </Button>
        </Box>
      )}
      {page === 'goodbye' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {recurringMedication?.order_id ? (
            recurringCancelation === 'medicationOnly' ? (
              <>
                {' '}
                <Typography
                  variant="h2"
                  sx={{
                    marginBottom: '1rem',
                  }}
                >
                  {'Confirm cancelling medication subscription.'}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                  {`Please select the cancel button below to confirm the cancellation of your ${medicationName} subscription. `}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                  {
                    'You will continue to have access to your medical care, prior authorizations for GLP-1s, coaching, and more, but you will no longer receive your medication delivered to your home. You will also no longer pay the amount below.'
                  }
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                  {`Your ${medicationName} subscription: $${
                    recurringMedication?.price
                  }${
                    recurringMedication?.interval_count === 30
                      ? '/month'
                      : ' every 3 months'
                  }`}
                </Typography>
                <Button
                  fullWidth
                  onClick={() => Router.push('/patient-portal')}
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  {'Keep My Medication Subscription'}
                </Button>
                <Button
                  fullWidth
                  color="grey"
                  onClick={handleCancelMedication}
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {'Confirm to Cancel Medication Subscription'}
                </Button>
              </>
            ) : (
              <>
                <Typography
                  variant="h2"
                  sx={{
                    marginBottom: '1rem',
                  }}
                >
                  {'Confirm what you are cancelling.'}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                  {
                    'Please select the cancel button below to confirm your cancellation and what you wish to cancel.'
                  }
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                  {
                    'If you cancel membership and your medication, you will continue to have access to your account until your next renewal date, at which time your account will be cancelled. However, you won’t be able to request any additional refills, and current refills will be paused since your Zealthy provider won’t be able to monitor you for the duration of the refill.'
                  }
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                  {
                    'If you cancel medication only, you will continue to have access to your medical care, prior authorizations for GLP-1s, coaching, and more, but you will no longer receive your medication delivered to your home.'
                  }
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '1rem' }}>
                  {`Your membership: $135/month`}
                </Typography>
                <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
                  {`Your ${medicationName} subscription: $${
                    recurringMedication?.price
                  }${
                    recurringMedication?.interval_count === 30
                      ? '/month'
                      : ' every 3 months'
                  }`}
                </Typography>
                <Button
                  fullWidth
                  onClick={() => Router.push('/patient-portal')}
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  {'Keep My Subscriptions'}
                </Button>
                <Button
                  fullWidth
                  color="grey"
                  onClick={handleCancelMedication}
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                  }}
                >
                  {'Confirm to Cancel Medication'}
                </Button>
                <Button
                  fullWidth
                  color="grey"
                  onClick={handleCancelSubscription}
                  sx={{
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {'Confirm to Cancel Membership & Medication'}
                </Button>
              </>
            )
          ) : (
            <>
              <Typography
                variant="h2"
                sx={{
                  marginBottom: '1rem',
                }}
              >
                {'Thank you!'}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  marginBottom: '1rem',
                }}
              >
                Your responses will help us improve the program in the future.
                Please select the unsubscribe button below to confirm your
                cancellation.
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                sx={{
                  marginBottom: '1rem',
                }}
              >
                {unsubscribeText}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  marginBottom: '3rem',
                }}
              >
                You will continue to have access to your account until your next
                renewal date, at which time your account will be cancelled.
              </Typography>

              <Button
                size="small"
                fullWidth
                onClick={() => window.open('/messages', '_blank')}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                {'Message Care Team'}
              </Button>
              <LoadingButton
                color="grey"
                fullWidth
                size="small"
                loading={loading}
                disabled={loading}
                onClick={() => handleCancelSubscription()}
                sx={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                {'Unsubscribe'}
              </LoadingButton>
            </>
          )}
        </Box>
      )}
      {!page && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            background: '#FFFFFF',
            border: '1px solid #D8D8D8',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            gap: '8px',
          }}
        >
          {subscriptionData ? (
            <MembershipDetails
              subscription={subscriptionData}
              showRenewal={false}
            />
          ) : null}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'flex-start',
            }}
          >
            <Link
              onClick={() =>
                Router.push(
                  {
                    query: {
                      id,
                      page:
                        !patient?.weight_loss_medication_eligible &&
                        !isCoachingOnly
                          ? 'coach-only'
                          : subscriptionData?.subscription.name ===
                              'Zealthy Weight Loss Access' ||
                            subscriptionData?.price === 99
                          ? 'weight-loss'
                          : [isWeightLoss, isPersonalPsychiatry].some(func =>
                              func(subscriptionData?.subscription.name || '')
                            ) && subscriptionData?.price !== 119
                          ? 'pre-pay'
                          : subscriptionData?.subscription_id === 1
                          ? 'primary-care'
                          : 'weight-loss',
                    },
                  },
                  undefined,
                  { shallow: true }
                )
              }
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {`${
                (subscriptionData?.subscription?.name &&
                  parseSubManage(subscriptionData?.subscription?.name)) ||
                'Manage your plan'
              }`}
            </Link>
            <Link
              onClick={() => Router.push('/patient-portal/profile')}
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {'Back to profile'}
            </Link>
          </Box>
        </Box>
      )}
      {page === 'guides' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Waiting to see results? Just a little bit longer!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Some treatments take time to work. See our Zealthy guides to getting the best results from your treatment.'
            }
          </Typography>

          <Button
            fullWidth
            href="http://getzealthy.com/blog"
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Read the guides'}
          </Button>
          <Button
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: { id, page: 'provider' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue to cancel'}
          </Button>
        </Box>
      )}
      {page === 'provider' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Unsure what to do or expect? Talk to your provider?'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Let your care team know how you’re doing. They can make changes to your treatment plan, if needed, to help you achieve your goals.'
            }
          </Typography>

          <Box
            sx={{
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              margin: 'auto',
              marginBottom: '3rem',
              padding: '2rem',
              gap: '1rem',
            }}
          >
            <Typography variant="h3">Get Assistance</Typography>
            <Avatar
              alt={''}
              src="/doctor-images/male-doctor-1.png"
              sx={{
                width: '3.5rem',
                height: '3.5rem',
                margin: 'auto',
              }}
            />
            <Button
              fullWidth
              onClick={() => Router.push('/messages')}
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {'Message Care Team'}
            </Button>
          </Box>

          <Button
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  query: { id, page: 'gift' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue to cancel'}
          </Button>
        </Box>
      )}
      {page === 'gift' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Continue your treatment with a little gift - on us!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`${
              subscriptionData?.subscription?.name &&
              parseSubGiftSubText(subscriptionData?.subscription?.name)
            }`}
          </Typography>

          <Button
            fullWidth
            onClick={handleApplyGift}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {`${
              subscriptionData?.subscription?.name &&
              parseSubGiftButtonText(subscriptionData?.subscription?.name)
            }`}
          </Button>
          <LoadingButton
            fullWidth
            color="grey"
            loading={loading}
            disabled={loading}
            onClick={() =>
              subscriptionData?.subscription.name ===
              'Zealthy Personalized Psychiatry'
                ? Router.push(
                    {
                      query: { id, page: 'warning' },
                    },
                    undefined,
                    { shallow: true }
                  )
                : subscriptionData?.subscription?.name !==
                  'Medication Subscription'
                ? handleCancelSubscription()
                : Router.push(
                    {
                      query: { id, page: 'delay' },
                    },
                    undefined,
                    { shallow: true }
                  )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {subscriptionData?.subscription?.name !== 'Medication Subscription'
              ? 'Cancel subscription'
              : 'Continue to cancel'}
          </LoadingButton>
        </Box>
      )}
      {page === 'gift-applied' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {`${
              subscriptionData?.subscription?.name &&
              parseSubGiftAppliedHeaderText(
                subscriptionData?.subscription?.name
              )
            }`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`${
              subscriptionData && parseSubGiftAppliedSubText(subscriptionData)
            }`}
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Done'}
          </Button>
        </Box>
      )}
      {page === 'delay' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Are you sure you want to cancel?'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'You may be charged for a new treatment plan if you decide to continue your treatment later. Want to delay your next order instead? Keep it simple and resume when you’re ready.'
            }
          </Typography>

          <FormControl
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Typography
              sx={{
                marginBottom: '1rem',
              }}
            >
              {'Delay your next order'}
            </Typography>
            <TextField select fullWidth onChange={handleTimeFrame} value={time}>
              {timeFrames.map(option => (
                <MenuItem key={option.name} value={option.value}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <Typography
              sx={{
                marginBottom: '3rem',
              }}
            >{`Your plan will resume on ${format(
              addWeeks(
                new Date(subscriptionData?.current_period_end || ''),
                time
              ),
              'iiii, MMMM d, yyyy'
            )}`}</Typography>
          </FormControl>
          <Button
            fullWidth
            onClick={handleDelayMedication}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Delay order'}
          </Button>
          <LoadingButton
            fullWidth
            color="grey"
            loading={loading}
            disabled={loading}
            onClick={() => handleCancelSubscription()}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Cancel subscription'}
          </LoadingButton>
        </Box>
      )}
      {page === 'delay-applied' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'You’re good to go!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`We’ve paused your subscription until ${format(
              new Date(
                subscriptionData?.current_period_end
                  ? subscriptionData?.current_period_end
                  : ''
              ),
              'iiii, MMMM d, yyyy'
            )}`}
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Done'}
          </Button>
        </Box>
      )}
      {page === 'warning' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Warning: your scheduled visit and Rx order will be canceled'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`If you cancel now, you will not be able to continue receiving your Rx orders and your scheduled psychiatry visit will be canceled.`}
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {`Keep your membership`}
          </Button>
          <LoadingButton
            fullWidth
            color="grey"
            loading={loading}
            disabled={loading}
            onClick={() => handleCancelSubscription()}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue to cancel'}
          </LoadingButton>
        </Box>
      )}
      {page === 'cancelled' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Your membership is now set to cancel'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            Good luck with your journey to a healthier you! If we support in any
            way in the future, check out our other offerings here.
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            View Zealthy treatments
          </Button>
        </Box>
      )}

      {page === 'final-offer' && <FinalOffer />}
    </>
  );
}

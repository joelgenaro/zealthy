import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cancelActionItems } from './cancelActionItems';
import { cancelAppointmentsForCare } from './cancelAppointmentsForCare';
import { cancelMentalHealthPrescriptions } from './cancelMentalHealthPrescriptions';
import { cancelTasks } from './cancelTasks';
import { cancelUpcomingOrders } from './cancelUpcomingOrders';
import { cancelWeightLossPrescriptions } from './cancelWeightLossPrescriptions';

type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Database['public']['Tables']['subscription']['Row'];
  };

const weightLossSubscriptions = [
  'Zealthy Weight Loss',
  'Zealthy Weight Loss Access',
  'Zealthy 3-Month Weight Loss',
  'Zealthy 3-Month Weight Loss [IN]',
  'Zealthy 6-Month Weight Loss',
  'Zealthy 12-Month Weight Loss',
];

const psychiatrySubscriptions = [
  'Zealthy Personalized Psychiatry',
  'Zealthy Personalized Psychiatry 3-month',
  'Zealthy Personalized Psychiatry 6-month',
  'Zealthy Personalized Psychiatry 12-month',
];

const mentalHealthCoachingSubscriptions = ['Mental Health Coaching'];

export const handleSubscriptionCancelation = async (reference_id: string) => {
  //cancel weight loss associated prescriptions
  const oldSubscription = await supabaseAdmin
    .from('patient_subscription')
    .select('*, subscription(*)')
    .eq('reference_id', reference_id)
    .limit(1)
    .maybeSingle()
    .throwOnError()
    .then(({ data }) => data as PatientSubscription);

  if (!oldSubscription) {
    console.log({
      level: 'info',
      message: `Could not find subscription by id: ${reference_id}`,
    });
    return;
  }
  console.log('oldSubscription -- handleSubCancelation', oldSubscription);

  if (
    weightLossSubscriptions.includes(oldSubscription.subscription?.name) &&
    !oldSubscription.cancel_reason?.includes('Upgrade')
  ) {
    console.log({
      message: `Canceling prescriptions for weight loss subscription: ${oldSubscription?.reference_id}`,
    });

    await Promise.allSettled([
      cancelWeightLossPrescriptions(oldSubscription.patient_id),
      cancelAppointmentsForCare('Weight loss', oldSubscription.patient_id),
      cancelTasks(oldSubscription.patient_id),
      cancelActionItems(oldSubscription.patient_id),
      cancelUpcomingOrders(oldSubscription.patient_id),
    ]);

    return;
  }

  if (
    psychiatrySubscriptions.includes(oldSubscription.subscription.name) &&
    !oldSubscription.cancel_reason?.includes('Upgrade')
  ) {
    console.log({
      message: `Canceling prescriptions for psychiatry subscription: ${oldSubscription?.reference_id}`,
    });

    await Promise.allSettled([
      cancelMentalHealthPrescriptions(
        oldSubscription.patient_id,
        'Zealthy Personalized Psychiatry'
      ),
      cancelAppointmentsForCare(
        'Anxiety or depression',
        oldSubscription.patient_id
      ),
      cancelTasks(oldSubscription.patient_id),
    ]);

    return;
  }

  if (
    mentalHealthCoachingSubscriptions.includes(
      oldSubscription.subscription.name
    )
  ) {
    console.log({
      message: `Canceling prescriptions for mental health coaching subscription: ${oldSubscription?.reference_id}`,
    });

    await Promise.allSettled([
      cancelMentalHealthPrescriptions(
        oldSubscription.patient_id,
        'Mental Health Coaching'
      ),
      cancelAppointmentsForCare(
        'Anxiety or depression',
        oldSubscription.patient_id
      ),
    ]);

    return;
  }

  if (oldSubscription.subscription.name === 'Zealthy Subscription') {
    await cancelAppointmentsForCare('Primary care', oldSubscription.patient_id);
    return;
  }
};

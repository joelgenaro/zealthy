import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios from 'axios';
import { SubscriptionResult } from './fetch-visible-subscriptions';

type Subscription = Database['public']['Tables']['subscription']['Row'];

type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
  };

type Prescription = Database['public']['Tables']['prescription']['Row'];

type Order = Database['public']['Tables']['order']['Row'] & {
  prescription: Prescription;
};

type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'] & {
    order: Order;
  };

type Patient = {
  profiles: {
    id: string;
    email: string;
  };
};

const formatSubscriptions = (subscriptions: SubscriptionResult[]) => {
  const subs = subscriptions.reduce(
    (acc, sub) => {
      if (sub.status === 'active') {
        acc.subscriptionsActive.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'past_due') {
        acc.subscriptionsPastDue.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'unpaid') {
        acc.subscriptionsUnpaid.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'scheduled_for_cancelation') {
        acc.subscriptionsScheduledForCancelation.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'canceled') {
        acc.subscriptionsCanceled.push(sub.name || '');
        return acc;
      }

      return acc;
    },
    {
      subscriptionsActive: [] as string[],
      subscriptionsPastDue: [] as string[],
      subscriptionsUnpaid: [] as string[],
      subscriptionsScheduledForCancelation: [] as string[],
      subscriptionsCanceled: [] as string[],
    }
  );

  return {
    subscriptionsActive: subs['subscriptionsActive'].join(','),
    subscriptionsPastDue: subs['subscriptionsPastDue'].join(','),
    subscriptionsUnpaid: subs['subscriptionsUnpaid'].join(','),
    subscriptionsScheduledForCancelation:
      subs['subscriptionsScheduledForCancelation'].join(','),
    subscriptionsCanceled: subs['subscriptionsCanceled'].join(','),
  };
};

const formatPrescriptions = (prescriptions: SubscriptionResult[]) => {
  const subs = prescriptions.reduce(
    (acc, sub) => {
      if (sub.status === 'active') {
        acc.prescriptionsActive.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'past_due') {
        acc.prescriptionsPastDue.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'unpaid') {
        acc.prescriptionsUnpaid.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'scheduled_for_cancelation') {
        acc.prescriptionsScheduledForCancelation.push(sub.name || '');
        return acc;
      }

      if (sub.status === 'canceled') {
        acc.prescriptionsCanceled.push(sub.name || '');
        return acc;
      }

      return acc;
    },
    {
      prescriptionsActive: [] as string[],
      prescriptionsPastDue: [] as string[],
      prescriptionsUnpaid: [] as string[],
      prescriptionsScheduledForCancelation: [] as string[],
      prescriptionsCanceled: [] as string[],
    }
  );

  return {
    prescriptionsActive: subs['prescriptionsActive'].join(','),
    prescriptionsPastDue: subs['prescriptionsPastDue'].join(','),
    prescriptionsUnpaid: subs['prescriptionsUnpaid'].join(','),
    prescriptionsScheduledForCancelation:
      subs['prescriptionsScheduledForCancelation'].join(','),
    prescriptionsCanceled: subs['prescriptionsCanceled'].join(','),
  };
};

export const pushSubscriptionsToCustomerIo = async (patient_id: number) => {
  try {
    const { email, profile_id } = await supabaseAdmin
      .from('patient')
      .select(
        `
    profiles(email, id)
  `
      )
      .eq('id', patient_id)
      .single()
      .then(({ data }) => {
        const profile = (data as unknown as Patient)?.profiles;
        return {
          email: profile?.email,
          profile_id: profile?.id,
        };
      });

    if (!email) {
      throw new Error(`Could not find email for patient: ${patient_id}`);
    }

    // possibly do this down the line
    // await axios.put(
    //   `https://track.customer.io/api/v1/customers/${profile_id}`,
    //   { email },
    //   {
    //     auth: {
    //       username: process.env.CUSTOMER_IO_SITE_ID!,
    //       password: process.env.CUSTOMER_IO_TRACK_API_KEY!,
    //     },
    //   }
    // );

    const [subscriptions, prescriptions] = await Promise.all([
      supabaseAdmin
        .from('patient_subscription')
        .select('*, subscription(*)')
        .eq('patient_id', patient_id)
        .not('subscription_id', 'eq', 5)
        .eq('visible', true)
        .then(({ data }) => (data || []) as PatientSubscription[])
        .then(
          subs =>
            subs.map(sub => ({
              name: sub.subscription.name,
              status: sub.status,
            })) as SubscriptionResult[]
        ),
      supabaseAdmin
        .from('patient_prescription')
        .select('*, order(*, prescription(*))')
        .eq('patient_id', patient_id)
        .eq('visible', true)
        .then(({ data }) => (data || []) as PatientPrescription[])
        .then(
          subs =>
            subs.map(sub => ({
              name: sub.order.prescription.medication,
              status: sub.status,
            })) as SubscriptionResult[]
        ),
    ]);

    const formattedSubscriptions = formatSubscriptions(subscriptions);
    const formattedPrescriptions = formatPrescriptions(prescriptions);

    if (process.env.VERCEL_ENV === 'production') {
      const identity = await axios.post('https://api.perfalytics.com/track', {
        event: '$identify',
        properties: {
          distinct_id: profile_id,
          id: profile_id,
          email: email,
          token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
          time: new Date().valueOf(),
          $user_agent:
            'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
          $current_url: 'https://app.getzealthy.com',
          $user_props: {
            ...formattedSubscriptions,
            ...formattedPrescriptions,
          },
        },
      });

      const message = `Identity event has been send to ${email}. Details: ${JSON.stringify(
        identity.data
      )}`;
      console.log(message);
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

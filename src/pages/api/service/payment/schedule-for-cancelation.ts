import type { NextApiRequest, NextApiResponse } from 'next';
import { MarkSubscriptionForCancelationRequest } from '@/types/api/schedule-for-cancelation';
import getStripeInstance from '../../stripe/createClient';
import {
  createServerSupabaseClient,
  SupabaseClient,
} from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import {
  mhCoachingCancelationEvent,
  personalizePsychiatryCancelationEvent,
} from '@/utils/freshpaint/events';
import { PatientProps } from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * @description mark subscription for cancelation at the end of current period
 */

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

const stripe = getStripeInstance();

const cancelWeightLossPrescriptions = async (
  patientId: number,
  supabase: SupabaseClient<Database>
) => {
  const prescriptions = await supabase
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
    .then(({ data }) => data || []);

  console.log(`Canceling prescriptions: ${prescriptions.map(p => p.id)}`);

  await Promise.all(
    prescriptions.map(p =>
      stripe.subscriptions.cancel(p.reference_id, {
        cancellation_details: {
          comment: 'Parent weight loss subscription got canceled',
        },
      })
    )
  );
};

const cancelAppointmentsForCare = async (
  patientId: number,
  care: string,
  supabase: SupabaseClient<Database>
) => {
  console.log(
    `Canceling appointment for patient: ${patientId} for care: ${care}`
  );

  return supabase
    .from('appointment')
    .update({
      status: 'Cancelled',
      cancelation_reason: `${care} subscription was canceled.`,
      canceled_at: new Date().toISOString(),
    })
    .eq('care', care)
    .eq('patient_id', patientId)
    .eq('status', 'Confirmed');
};

const cancelAppointmentsForCareMentalHealth = async (
  patientId: number,
  care: string,
  appointmentType: string,
  supabase: SupabaseClient<Database>
) => {
  console.log(
    `Canceling appointment for patient: ${patientId} for care: ${care}`
  );

  return supabase
    .from('appointment')
    .update({
      status: 'Cancelled',
      cancelation_reason: `${care} subscription was canceled.`,
      canceled_at: new Date().toISOString(),
    })
    .eq('care', care)
    .eq('appointment_type', appointmentType)
    .eq('patient_id', patientId)
    .eq('status', 'Confirmed');
};

const cancelMentalHealthPrescriptions = async (
  patientId: number,
  type: string,
  supabase: SupabaseClient<Database>
) => {
  const prescriptions = await supabase
    .from('patient_prescription')
    .select(
      '*, order!inner(*, prescription!inner(*, medication_quantity!inner(*, medication_dosage!inner(*, medication!inner(*)))))'
    )
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .eq(
      'order.prescription.medication_quantity.medication_dosage.medication.display_name',
      'Mental Health Medication'
    )
    .then(({ data }) => data || []);

  const patientEmail = await supabase
    .from('patient')
    .select(`profiles(email)`)
    .eq('id', patientId)
    .single()
    .then(({ data }) => data as PatientProps);

  if (type === 'Zealthy Personalized Psychiatry')
    personalizePsychiatryCancelationEvent(
      patientEmail?.profiles?.id,
      patientEmail?.profiles?.email
    );
  if (type === 'Mental Health Coaching')
    mhCoachingCancelationEvent(
      patientEmail?.profiles?.id,
      patientEmail?.profiles?.email
    );

  console.log(`Canceling prescriptions: ${prescriptions.map(p => p.id)}`);

  prescriptions.forEach(p =>
    stripe.subscriptions.cancel(p.reference_id, {
      cancellation_details: {
        comment: 'Parent personal psychiatry subscription got canceled',
      },
    })
  );
};

export default async function scheduleForCancelation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subscriptionId, cancelationReason, cancelChoiceReasons } =
    req.body as MarkSubscriptionForCancelationRequest;
  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const response = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    //cancel all appointments and medications
    //cancel weight loss associated prescriptions
    const oldSubscription = await supabase
      .from('patient_subscription')
      .select('*, subscription(*)')
      .eq('reference_id', subscriptionId)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data as PatientSubscription);

    let queueId = null;
    try {
      const patientId = oldSubscription?.patient_id;

      if (patientId) {
        const queueEntry = await supabaseAdmin
          .from('task_queue')
          .insert({
            task_type: 'SCHEDULED_CANCELATION',
            patient_id: patientId,
            queue_type: 'Patient Experience',
          })
          .select()
          .single();

        queueId = queueEntry.data?.id;
      } else {
        const prescriptionData = await supabaseAdmin
          .from('patient_prescription')
          .select('patient_id')
          .eq('reference_id', subscriptionId)
          .maybeSingle();

        if (prescriptionData.data?.patient_id) {
          const queueEntry = await supabaseAdmin
            .from('task_queue')
            .insert({
              task_type: 'SCHEDULED_CANCELATION',
              patient_id: prescriptionData.data.patient_id,
              queue_type: 'Patient Experience',
            })
            .select()
            .single();

          queueId = queueEntry.data?.id;
        }
      }
    } catch (error) {
      console.error('Error creating task queue entry:', error);
    }

    const promises: any[] = [
      supabase
        .from('patient_subscription')
        .update({
          status: 'scheduled_for_cancelation',
          cancel_reason: cancelationReason,
          cancel_choice_reason: cancelChoiceReasons,
        })
        .eq('reference_id', subscriptionId),
    ];

    if (queueId) {
      promises.push(
        supabase
          .from('patient_prescription')
          .update({
            status: 'scheduled_for_cancelation',
            cancel_reason: cancelationReason,
            cancel_choice_reason: cancelChoiceReasons,
            queue_id: queueId,
          })
          .eq('reference_id', subscriptionId)
      );
    }

    if (
      oldSubscription &&
      weightLossSubscriptions.includes(oldSubscription.subscription?.name)
    ) {
      console.log(
        `Canceling prescriptions for weight loss subscription: ${oldSubscription?.reference_id}`
      );

      promises.push(
        cancelWeightLossPrescriptions(oldSubscription.patient_id, supabase),
        cancelAppointmentsForCare(
          oldSubscription.patient_id,
          'Weight loss',
          supabase
        )
      );
    }

    if (
      oldSubscription &&
      psychiatrySubscriptions.includes(oldSubscription.subscription?.name)
    ) {
      console.log(
        `Canceling prescriptions for psychiatry subscription: ${oldSubscription?.reference_id}`
      );

      promises.push(
        cancelMentalHealthPrescriptions(
          oldSubscription.patient_id,
          'Zealthy Personalized Psychiatry',
          supabase
        ),
        cancelAppointmentsForCareMentalHealth(
          oldSubscription.patient_id,
          'Anxiety or depression',
          'Provider',
          supabase
        )
      );
    }

    if (
      oldSubscription &&
      mentalHealthCoachingSubscriptions.includes(
        oldSubscription.subscription?.name
      )
    ) {
      console.log(
        `Canceling prescriptions for mental health coaching subscription: ${oldSubscription?.reference_id}`
      );
      promises.push(
        cancelMentalHealthPrescriptions(
          oldSubscription.patient_id,
          'Mental Health Coaching',
          supabase
        ),
        cancelAppointmentsForCareMentalHealth(
          oldSubscription.patient_id,
          'Anxiety or depression',
          'Coach (Mental Health)',
          supabase
        )
      );
    }

    if (
      oldSubscription &&
      oldSubscription.subscription.name === 'Zealthy Subscription'
    ) {
      promises.push(
        cancelAppointmentsForCare(
          oldSubscription.patient_id,
          'Primary care',
          supabase
        )
      );
    }

    await Promise.all(promises);

    if (response?.id) {
      res.status(200).json('Successfully cancelled subscription');
    } else {
      throw new Error(
        `There was an error cancelling your subscription: ${subscriptionId}`
      );
    }
  } catch (err: any) {
    console.error(
      `There was an error cancelling your subscription: ${subscriptionId}`,
      {
        error: err,
      }
    );

    // Check if the error is related to the patient_prescription query
    if (
      err?.message?.includes(
        'JSON object requested, multiple (or no) rows returned'
      )
    ) {
      // If the error is related to the patient_prescription query, but the subscription was canceled in Stripe
      // We can consider this a partial success
      try {
        // Check if the subscription was actually canceled in Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        if (stripeSubscription?.cancel_at_period_end === true) {
          // The subscription was successfully canceled in Stripe, so we can return a success response
          // even though there was an issue with the task queue
          return res.status(200).json({
            message:
              'Successfully cancelled subscription in Stripe, but there was an issue updating some records',
            warning: 'Task queue entry could not be created',
          });
        }
      } catch (stripeErr) {
        // If there's an error retrieving the subscription from Stripe, continue with the original error
        console.error('Error retrieving subscription from Stripe:', stripeErr);
      }
    }

    return res
      .status(404)
      .json(err?.message || 'There was an unexpected error');
  }
}

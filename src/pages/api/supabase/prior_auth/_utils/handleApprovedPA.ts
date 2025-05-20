import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { paApprovedWeightLoss } from '@/utils/freshpaint/events';
import { differenceInDays } from 'date-fns';
import { PriorAuth } from '@/components/hooks/data';
import VWOClient from '@/lib/vwo/client';

const sendCommunication = async (priorAuth: PriorAuth) => {
  // find email address

  if (!priorAuth.patient_id) {
    throw new Error('Prior auth missing patient id');
  }
  const { email, profile_id } = await supabaseAdmin
    .from('patient')
    .select('*, profiles!inner(*)')
    .eq('id', priorAuth.patient_id)
    .single()
    .then(({ data }) => {
      return {
        email: data?.profiles.email,
        profile_id: data?.profiles.id,
      };
    });

  if (!email) {
    throw new Error(`Could not find email for ${priorAuth.patient_id}`);
  }

  return { email, profile_id };
};

const handleSubStatus = async (priorAuth: PriorAuth) => {
  //check if patient has paid for 2 additional month
  if (!priorAuth.patient_id) {
    throw new Error('Prior auth missing patient id');
  }

  const { email, profile_id } = await sendCommunication(priorAuth);

  const subscriptions = await supabaseAdmin
    .from('patient_subscription')
    .select(`*, subscription!inner(*)`)
    .eq('patient_id', priorAuth.patient_id)
    .eq('visible', true)
    .ilike('subscription.name', '%Weight Loss%')
    .throwOnError()
    .then(({ data }) => data || []);

  if (subscriptions.length !== 1) {
    throw new Error(
      `Patient ${priorAuth.patient_id} has 0 or more than 1 weight loss subscription`
    );
  }

  const weightLossSubscription = subscriptions[0];
  let subStatus: Database['public']['Enums']['prior_auth_sub_status'] =
    'PATIENT_ACTION_NEEDED';

  if (
    differenceInDays(
      new Date(weightLossSubscription.current_period_end),
      new Date()
    ) > 32
  ) {
    subStatus = 'READY_TO_PRESCRIBE';
  }

  console.log({
    message: `Updating Prior Auth: ${priorAuth.id} with sub status ${subStatus}`,
  });

  await supabaseAdmin
    .from('prior_auth')
    .update({
      sub_status: subStatus,
    })
    .eq('id', priorAuth.id);

  // Only fire the paApprovedWeightLoss event if subStatus is PATIENT_ACTION_NEEDED
  if (subStatus === 'PATIENT_ACTION_NEEDED') {
    await paApprovedWeightLoss(
      profile_id,
      email,
      priorAuth.rx_submitted,
      priorAuth.id
    );
  }

  return;
};

const trackVWOEvents = async (priorAuth: PriorAuth) => {
  if (!priorAuth.patient_id) {
    throw new Error('Prior auth missing patient id');
  }

  const patient = await supabaseAdmin
    .from('patient')
    .select('id, profile_id')
    .eq('id', priorAuth.patient_id)
    .maybeSingle()
    .then(({ data }) => data);

  if (!patient) {
    throw new Error(
      `Could not find patient for patient id: ${priorAuth.patient_id}`
    );
  }

  const vwoInstance = await VWOClient.getInstance(supabaseAdmin);

  // Track VWO events for PA approval
  return Promise.allSettled([
    vwoInstance.track('8685', patient, 'wlPaApproved'),
  ]);
};

export const handleApprovedPA = async (priorAuth: PriorAuth) => {
  return Promise.allSettled([
    handleSubStatus(priorAuth),
    trackVWOEvents(priorAuth),
  ]);
};

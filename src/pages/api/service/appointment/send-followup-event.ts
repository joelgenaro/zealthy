import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { formatDate } from '@/utils/date-fns';
import { psychiatryProviderFollowup } from '@/utils/freshpaint/events';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';

type Appointment = Database['public']['Tables']['appointment']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Subscription;
  };

type InsertPayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: Appointment;
  old_record: null;
};

type Patient = {
  id: number;
  profiles: {
    id: string;
    email: string;
  };
};

const isCompletedProvider = (appointment: Appointment) => {
  return (
    appointment.appointment_type === 'Provider' &&
    appointment.status === 'Completed'
  );
};

const handlePsychiatryProviderFollowup = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('You are in the wrong place!!!!');
    }

    const { record } = req.body as InsertPayload;

    if (!record) {
      throw new Error('You are in the wrong place!!!!');
    }

    if (!isCompletedProvider(record)) {
      return res.status(200).json({ message: 'OK' });
    }

    // check if patient has active psychiatric plan
    const psychiatryPlan = await supabaseAdmin
      .from('patient_subscription')
      .select('*, subscription!inner(*)')
      .eq('patient_id', record.patient_id)
      .eq('subscription.name', 'Zealthy Personalized Psychiatry')
      .eq('status', 'active')
      .limit(1)
      .single()
      .then(({ data }) => data as PatientSubscription | null);

    if (!psychiatryPlan) {
      return res.status(200).json({ message: 'Ok' });
    }

    // find if patient has email
    const { email, id } = await supabaseAdmin
      .from('patient')
      .select('profiles(id, email)')
      .eq('id', record.patient_id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => ({
        email: (data as Patient)?.profiles?.email,
        id: (data as Patient)?.profiles?.id,
      }));

    if (!email) {
      throw new Error(`Could not find email for patient: ${record.patient_id}`);
    }

    //send event
    await psychiatryProviderFollowup(id, email, formatDate(record.starts_at!));

    res.status(200).json({
      message: `Successfully send event: "psychiatry-follow-up" to patient: ${record.patient_id}`,
    });
  } catch (err) {
    console.error('handlepsyprovfol_err', err);
    res.status(422).json({
      error: (err as Error).message || 'Something went wrong!!!',
    });
  }
};

export default async function PsychiatryProviderFollowup(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(
    req,
    res,
    handlePsychiatryProviderFollowup
  );
}

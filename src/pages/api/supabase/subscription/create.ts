import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { weightLossCoachingOnly } from '@/utils/freshpaint/events';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';

type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'];
type Subscription = Database['public']['Tables']['subscription']['Row'];

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: PatientSubscription;
  old_record: null;
};

type PatientProfile = {
  profiles: {
    id: string;
    email: string;
  };
} | null;

const handleCreateSubscription = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record } = req.body as InsertPayload;
    //find parent subscription
    const subscription = await supabaseAdmin
      .from('subscription')
      .select('*')
      .eq('id', record.subscription_id)
      .maybeSingle()
      .then(({ data }) => data as Subscription | null);

    if (subscription?.name.includes('Coaching Only')) {
      //find email
      const { email, id } = await supabaseAdmin
        .from('patient')
        .select('profiles(id, email)')
        .eq('id', record.patient_id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => ({
          email: (data as PatientProfile)?.profiles?.email,
          id: (data as PatientProfile)?.profiles?.id,
        }));

      if (!email) {
        throw new Error(`Could not find email for ${record.patient_id}`);
      }

      weightLossCoachingOnly(id, email);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error({
      errObj: err,
      errMessage: getErrorMessage(err, 'Something went wrong'),
    });
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleCreateSubscription);
}

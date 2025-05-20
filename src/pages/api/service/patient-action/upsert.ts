import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import isAfter from 'date-fns/isAfter';

type Order = Pick<
  Database['public']['Tables']['order']['Row'],
  'created_at' | 'tracking_number'
>;
type Prescription = Pick<
  Database['public']['Tables']['prescription']['Row'],
  'pharmacy'
>;

type PatientOrder = Order & {
  prescription?: Prescription;
};

type PatientSubscription = Pick<
  Database['public']['Tables']['patient_subscription']['Row'],
  'price'
> & {
  subscription: Pick<
    Database['public']['Tables']['subscription']['Row'],
    'name'
  >;
};

const plus10days = (date: string) => {
  const current = new Date(date);
  return new Date(current.setDate(current.getDate() + 10));
};

const isOrderShipped = (order: PatientOrder) => {
  if (['Hallandale', 'Red Rock'].includes(order.prescription?.pharmacy || '')) {
    return isAfter(Date.now(), plus10days(order.created_at!));
  }

  return !!order.tracking_number;
};

export default async function handlerPatientActionUpsert(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { ...upsert } =
    req.body as Database['public']['Tables']['patient_action_item']['Insert'];

  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    //if item exist return right away
    const item = await supabase
      .from('patient_action_item')
      .select('*')
      .eq('patient_id', upsert.patient_id)
      .eq('type', upsert.type)
      .eq('canceled', false)
      .eq('completed', false)
      .maybeSingle()
      .then(({ data }) => data);

    if (item) {
      res.status(200).json(item);
      return;
    }

    const [subs, prescriptionRequests, orders] = await Promise.all([
      supabase
        .from('patient_subscription')
        .select('price, subscription(name)')
        .eq('patient_id', upsert.patient_id)
        .eq('visible', true)
        .in('status', ['active', 'trialing'])
        .ilike('subscription.name', '%weight loss%')
        .then(({ data }) => (data || []) as PatientSubscription[]),
      supabase
        .from('prescription_request')
        .select('*')
        .eq('patient_id', upsert.patient_id)
        .in('status', ['REQUESTED', 'PRE_INTAKES'])
        .then(({ data }) => data || []),
      supabase
        .from('order')
        .select('created_at, tracking_number, prescription!inner(pharmacy)')
        .eq('patient_id', upsert.patient_id)
        .or('medication.ilike.%semaglutide%,medication.ilike.%tirzepatide%', {
          foreignTable: 'prescription',
        })
        .then(({ data }) => (data || []) as PatientOrder[]),
    ]);

    //if not a weight loss subscriber return
    if (subs.length === 0) {
      console.log({
        message: `Patient ${upsert.patient_id} does not have Weight loss subscription`,
        zealthy_patient_id: upsert.patient_id,
      });
      res.status(200).json({});
      return;
    }

    //if coaching plan return
    if (!!subs.every(s => s.subscription.name.includes('Coaching Only Plan'))) {
      console.log({
        message: `Patient ${upsert.patient_id} has Weight loss Coaching only subscription`,
        zealthy_patient_id: upsert.patient_id,
      });
      res.status(200).json({});
      return;
    }

    //check if they have any pending compound requests
    if (prescriptionRequests.some(p => p.medication_quantity_id === 98)) {
      console.log({
        message: `Patient ${upsert.patient_id} has pending prescription request for compound medication`,
        zealthy_patient_id: upsert.patient_id,
      });
      res.status(200).json({});
      return;
    }

    //check if they have compound order in transit
    if (!orders.length || orders.some(isOrderShipped)) {
      console.log({
        message: `Create action item ${upsert.type} for patient ${upsert.patient_id}`,
        zealthy_patient_id: upsert.patient_id,
      });

      const actionItem = await supabase
        .from('patient_action_item')
        .insert({
          ...upsert,
        })
        .select('*')
        .maybeSingle();

      res.status(actionItem.status).json(actionItem.data);
      return;
    }

    res.status(200).json({});
  } catch (err: any) {
    console.error('patient-action-upsert-err', err);
    res.status(422).json(err?.message || 'There was an unexpected error');
  }
}

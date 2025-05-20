import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { getKeys } from '@/utils/getKeys';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import VWOClient from '@/lib/vwo/client';
import { trackEventABZ } from '@/lib/abz/trackEventBE';
import axios from 'axios';

type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'];

type PendingOrder = Database['public']['Tables']['pending_order']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: PatientSubscription;
  old_record: PatientSubscription;
};

const handlePatientSubscriptionUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    const patient = await supabaseAdmin
      .from('patient')
      .select('id, profile_id')
      .eq('id', record.patient_id)
      .maybeSingle()
      .then(({ data }) => data);

    if (!patient) {
      throw new Error(
        `Could not find patient for patient id: ${record.patient_id}`
      );
    }

    const vwoInstance = await VWOClient.getInstance(supabaseAdmin);

    const pendingOrders = await supabaseAdmin
      .from('pending_order')
      .select('*')
      .eq('patient_id', record.patient_id)
      .eq('trigger', 'REACTIVATION')
      .then(data => data.data as PendingOrder[]);
    console.log('PENDING ORDERS!: ', pendingOrders);
    const sub = (
      await supabaseAdmin
        .from('subscription')
        .select('*')
        .eq('id', record.subscription_id)
        .single()
    ).data;
    if (
      record.status === 'active' &&
      changedAttributes.includes('status') &&
      sub?.name.includes('Weight Loss') &&
      pendingOrders &&
      pendingOrders?.length! > 0
    ) {
      const url =
        process.env.VERCEL_ENV === 'production'
          ? 'https://clinician-portal.getzealthy.com'
          : 'https://clinician-portal-git-development-zealthy.vercel.app';
      await Promise.all(
        pendingOrders?.map(async order => {
          console.log('processing', order);
          try {
            const response = await axios.post(url + order.url, order.params, {
              headers: {
                'supabase-signature': req.headers['supabase-signature'],
              },
            });
            console.log('RESPONSE', response.data);
            await supabaseAdmin
              .from('prescription_request')
              .update({
                status: `APPROVED - Reactivated`,
              })
              .eq('id', order.pr_id)
              .select()
              .single()
              .then(({ data }) => data);
            await supabaseAdmin
              .from('pending_order')
              .delete()
              .eq('id', order.id);
            console.log('DELETED PENDING ORDER WITH ID: ', order.id);
          } catch (e: any) {
            console.log('ERROR', e);
            if (e?.status === 402) {
              await supabaseAdmin
                .from('prescription_request')
                .update({ status: 'PAYMENT_FAILED' })
                .eq('id', order.pr_id);
            } else {
              await supabaseAdmin
                .from('prescription_request')
                .update({
                  status: 'FAILED_TO_SEND_TO_PHARMACY',
                })
                .eq('id', order.pr_id);
            }
          }
        })
      );
    }

    if (
      changedAttributes.includes('status') &&
      record.status === 'scheduled_for_cancelation'
    ) {
      if (record.subscription_id === 4) {
        await Promise.allSettled([
          vwoInstance.track(
            '7895',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8201',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7458',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8078',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6465',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6140',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6303',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '5777',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '5751',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '5476',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6758',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '5053',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance?.track(
            '5871_new',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          trackEventABZ(
            '5871_new',
            patient?.profile_id!,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance?.track(
            '5867',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance?.track(
            'Clone_5871',
            patient,
            'wlMembershipScheduleForCancellation'
          ),

          vwoInstance.track(
            'Clone_6775',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            'Clone_6775_2',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '4624',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8288',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            'Clone_4687',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '4811',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '4799',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '5071',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '4935',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6826',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6792',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6031',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6337',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6822',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '6028',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '75801',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '4798',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance?.track(
            '780101',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance?.track(
            '780102',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7746-2',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7934',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '5483',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7743',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7960',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7380',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '7935',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8676',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8552',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '9363',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8912',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '8685',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '9057_1',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '9057_2',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '9057_3',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance.track(
            '9502',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
        ]);
      }
    }

    if (
      changedAttributes.includes('status') &&
      record.status === 'canceled' &&
      !record.cancel_reason?.toLowerCase().includes('duplicate')
    ) {
      if (record.subscription_id === 4) {
        await Promise.allSettled([
          vwoInstance.track('6465', patient, 'wlMembershipCancellation'),
          vwoInstance.track('7895', patient, 'wlMembershipCancellation'),
          vwoInstance.track('7458', patient, 'wlMembershipCancellation'),
          vwoInstance.track('8078', patient, 'wlMembershipCancellation'),
          vwoInstance.track('5476', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6303', patient, 'wlMembershipCancellation'),
          vwoInstance.track('5777', patient, 'wlMembershipCancellation'),
          vwoInstance.track('4624', patient, 'wlMembershipCancellation'),
          vwoInstance.track('Clone_4687', patient, 'wlMembershipCancellation'),
          vwoInstance.track('4918', patient, 'wlMembershipCancellation'),
          vwoInstance.track('4799', patient, 'wlMembershipCancellation'),
          vwoInstance.track('5071', patient, 'wlMembershipCancellation'),
          vwoInstance.track('8288', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6822', patient, 'wlMembershipCancellation'),

          vwoInstance.track('6775', patient, 'wlMembershipCancellation'),
          vwoInstance.track(
            'Clone_6775_2',
            patient,
            'wlMembershipCancellation'
          ),
          vwoInstance.track('5867', patient, 'wlMembershipCancellation'),
          vwoInstance.track('5053', patient, 'wlMembershipCancellation'),
          vwoInstance.track('4935', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6826', patient, 'wlMembershipCancellation'),
          vwoInstance.track('5751', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6792', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6031', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6337', patient, 'wlMembershipCancellation'),
          vwoInstance.track('6028', patient, 'wlMembershipCancellation'),
          vwoInstance.track('75801', patient, 'wlMembershipCancellation'),
          vwoInstance.track('4798', patient, ''),
          vwoInstance?.track('5871_new', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('7752', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('780101', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('780102', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('7934', patient, 'wlMembershipCancellation'),
          vwoInstance.track(
            '7746-2',
            patient,
            'wlMembershipScheduleForCancellation'
          ),
          vwoInstance?.track('7743', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('5483', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('7960', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('7380', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('7935', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('8676', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('8552', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('8912', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('9363', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('8685', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('9057_1', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('9057_2', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('9057_3', patient, 'wlMembershipCancellation'),
          vwoInstance?.track('9502', patient, 'wlMembershipCancellation'),
        ]);
      }
    }

    res.status(200).json({
      message: 'OK',
    });
  } catch (err: any) {
    console.error(err);
    res.status(422).json(err?.message || 'There was an unexpected error');
  }
};

export default async function UpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(
    req,
    res,
    handlePatientSubscriptionUpdate
  );
}

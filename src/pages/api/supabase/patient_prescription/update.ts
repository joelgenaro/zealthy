import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { getKeys } from '@/utils/getKeys';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import VWOClient from '@/lib/vwo/client';

type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: PatientPrescription;
  old_record: PatientPrescription;
};

const handlePatientPrescriptionUpdate = async (
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

    if (
      changedAttributes.includes('status') &&
      record.status === 'scheduled_for_cancelation'
    ) {
      if (record.subscription_id === 5) {
        await Promise.allSettled([
          vwoInstance.track(
            '5483',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '5483-2',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance?.track(
            '6140',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance?.track(
            '4624',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance?.track(
            'Clone_4687',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '4601',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '4918',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '5071',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '4935',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '6826',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '5053',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '4798',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '8552',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '8552_2',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
          vwoInstance.track(
            '8284',
            patient,
            'medSubscriptionScheduledForCancel'
          ),
        ]);
      }
    }

    if (changedAttributes.includes('status') && record.status === 'canceled') {
      if (record.subscription_id === 5) {
        await Promise.allSettled([
          vwoInstance.track('5483', patient, 'medSubscriptionCancel'),
          vwoInstance.track('5483-2', patient, 'medSubscriptionCancel'),
          vwoInstance.track('4601', patient, 'medSubscriptionCancel'),
          vwoInstance.track('6140', patient, 'medSubscriptionCancel'),
          vwoInstance.track('5476', patient, 'medSubscriptionCancel'),
          vwoInstance.track('4624', patient, 'medSubscriptionCancel'),
          vwoInstance.track('Clone_4687', patient, 'medSubscriptionCancel'),
          vwoInstance.track('4918', patient, 'medSubscriptionCancel'),
          vwoInstance.track('5071', patient, 'medSubscriptionCancel'),
          vwoInstance.track('6822-2', patient, 'medSubscriptionCancel'),
          vwoInstance.track('6822-3', patient, 'medSubscriptionCancel'),
          vwoInstance.track('4935', patient, 'medSubscriptionCancel'),
          vwoInstance.track('5751', patient, 'medSubscriptionCancel'),
          vwoInstance.track('6826', patient, 'medSubscriptionCancel'),
          vwoInstance.track('5053', patient, 'medSubscriptionCancel'),
          vwoInstance.track('4798', patient, 'medSubscriptionCancel'),
          vwoInstance.track('8552', patient, 'medSubscriptionCancel'),
          vwoInstance.track('8552_2', patient, 'medSubscriptionCancel'),
          vwoInstance.track('8284', patient, 'medSubscriptionCancel'),
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
    handlePatientPrescriptionUpdate
  );
}

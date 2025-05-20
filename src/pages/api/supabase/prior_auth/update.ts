import { PriorAuth } from '@/components/hooks/data';
import { getKeys } from '@/utils/getKeys';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleApprovedPA } from './_utils/handleApprovedPA';
import { handlePrescribing } from './_utils/handlePrescribing';
import { handleUpdateInsuranceInfoRequest } from './_utils/handleUpdateInsuranceInfoRequest';

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: PriorAuth;
  old_record: PriorAuth;
};

const handleUpdatePriorAuth = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    if (
      changedAttributes.includes('status') &&
      record.status === 'PA Approved'
    ) {
      await handleApprovedPA(record);
    }
    if (changedAttributes.includes('status')) {
      const prevInsurancePending =
        old_record.status === 'Pending Medical Information' ||
        old_record.status === 'Pending Insurance Information';

      const updateInsuranceInfoRequested =
        record.status !== 'Pending Medical Information' &&
        record.status !== 'Pending Insurance Information';

      if (prevInsurancePending && updateInsuranceInfoRequested) {
        await handleUpdateInsuranceInfoRequest(record);
      }
    }

    if (
      changedAttributes.includes('sub_status') &&
      record.sub_status === 'READY_TO_PRESCRIBE'
    ) {
      await handlePrescribing(record);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error(err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdatePriorAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleUpdatePriorAuth);
}

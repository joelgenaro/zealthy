import { Database } from '@/lib/database.types';
import { getKeys } from '@/utils/getKeys';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleCancelledAppointment } from './_utils/handleCancelledAppointment';
import { handleCompletedAppointment } from './_utils/handleCompletedAppointment';
import { handleConfirmedAppointment } from './_utils/handleConfirmedAppointment';
import { handleNoshowedAppointment } from './_utils/handleNoshowedAppointment';
import { handleAppointmentFeedback } from './_utils/handleAppointmentFeedback';

type Appointment = Database['public']['Tables']['appointment']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: Appointment;
  old_record: Appointment;
};

const handleUpdateInvoice = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    if (changedAttributes.includes('feedback')) {
      await handleAppointmentFeedback(record);
    }

    if (changedAttributes.includes('status') && record.status === 'Cancelled') {
      await handleCancelledAppointment(record);
    }

    if (changedAttributes.includes('status') && record.status === 'Confirmed') {
      await handleConfirmedAppointment(record);
    }

    if (changedAttributes.includes('status') && record.status === 'Completed') {
      await handleCompletedAppointment(record);
    }

    if (changedAttributes.includes('status') && record.status === 'Noshowed') {
      await handleNoshowedAppointment(record);
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error('appointment-update-err', err);
    res.status(422).json({
      error: err?.message || 'There was an unexpected error',
    });
  }
};

export default async function UpdateInvoice(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleUpdateInvoice);
}

import { Database } from '@/lib/database.types';
import { getKeys } from '@/utils/getKeys';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getClinicianAlias } from '@/utils/getClinicianAlias';

type PrescriptionRequest =
  Database['public']['Tables']['prescription_request']['Row'];

type UpcomingMessage = {
  id: number;
  sender: {
    first_name: string;
    last_name: string;
    clinician: { id: number; type: string[] };
  };
  recipient: { first_name: string };
};

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: PrescriptionRequest;
  old_record: PrescriptionRequest;
};

const handleRequestUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record, old_record } = req.body as UpdatePayload;

    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    if (
      record.patient_id &&
      record.status?.toLowerCase().includes('requested') &&
      record.is_visible
    ) {
      let duplicatePrescriptionRequestQuery = supabaseAdmin
        .from('prescription_request')
        .select('*, task_queue!inner(*)')
        .ilike('status', '%REQUESTED%')
        .eq('patient_id', record.patient_id)
        .eq('is_visible', true)
        .is('task_queue.action_taken', null)
        .not('queue_id', 'is', null)
        .neq('id', record.id);

      if (record.medication_quantity_id) {
        duplicatePrescriptionRequestQuery =
          duplicatePrescriptionRequestQuery.eq(
            'medication_quantity_id',
            record.medication_quantity_id
          );
      } else {
        duplicatePrescriptionRequestQuery =
          duplicatePrescriptionRequestQuery.is('medication_quantity_id', null);
      }

      if (record.specific_medication) {
        duplicatePrescriptionRequestQuery =
          duplicatePrescriptionRequestQuery.eq(
            'specific_medication',
            record.specific_medication
          );
      } else {
        duplicatePrescriptionRequestQuery =
          duplicatePrescriptionRequestQuery.is('specific_medication', null);
      }

      // Extra fields to determine if same dosage for WL meds
      if (record.medication_quantity_id === 98 && record.matrix_id) {
        duplicatePrescriptionRequestQuery =
          duplicatePrescriptionRequestQuery.eq('matrix_id', record.matrix_id);
      } else if (
        record.oral_matrix_id &&
        record.type === 'WEIGHT_LOSS_GLP1 (ORAL)'
      ) {
        duplicatePrescriptionRequestQuery =
          duplicatePrescriptionRequestQuery.eq(
            'oral_matrix_id',
            record.oral_matrix_id
          );
      }
      const duplicatePrescriptionRequest =
        await duplicatePrescriptionRequestQuery;

      console.log(duplicatePrescriptionRequest.data, 'DUPLICATE PRs');

      if ((duplicatePrescriptionRequest.data?.length || 0) > 0) {
        await supabaseAdmin
          .from('prescription_request')
          .update({ is_visible: false })
          .eq('id', record.id);
        if (record.queue_id) {
          await supabaseAdmin
            .from('task_queue')
            .update({ visible: false })
            .eq('id', record?.queue_id);
        }
        console.log('RECORD', record.id, 'IS A DUPLICATE PR!');
        return res
          .status(200)
          .json({ message: 'Duplicate prescription request' });
      }
    }

    const reviewedStatuses = [
      'Initiate Prior Auth',
      'SENT_TO_',
      'REJECTED',
      'APPROVED',
    ];

    const prescriptionReviewed = reviewedStatuses.some(status =>
      record.status?.includes(status)
    );

    if (changedAttributes.includes('status') && prescriptionReviewed) {
      //if pres request handled before weight loss welcome message sent, update welcome message content

      const [profileId, isBundled] = await Promise.all([
        supabaseAdmin
          .from('patient')
          .select('profile_id')
          .eq('id', record.patient_id as number)
          .single()
          .then(({ data }) => data?.profile_id),
        supabaseAdmin
          .from('patient_subscription')
          .select('patient_id')
          .eq('patient_id', record.patient_id!)
          .in('price', [297, 217, 446, 349, 449, 718, 249])
          .then(({ data }) => !!(data || []).length),
      ]);

      if (!profileId) {
        throw new Error(
          `Could not find patient for patient id: ${record.patient_id}`
        );
      }

      const weightLossThread = await supabaseAdmin
        .from('messages_group')
        .select('id')
        .eq('profile_id', profileId)
        .eq('name', 'Weight Loss')
        .maybeSingle()
        .then(({ data }) => data?.id);

      if (weightLossThread) {
        const upcomingMessageId = await supabaseAdmin
          .from('messages-v2')
          .select('id')
          .eq('messages_group_id', weightLossThread)
          .gt('display_at', new Date().toISOString())
          .eq('recipient', profileId)
          .maybeSingle()
          .then(({ data }) => data?.id);

        //most of the time, upcomingMessage won't exist. only query w joins after confirming upcomingMessage exists
        if (upcomingMessageId) {
          const upcomingMessage = await supabaseAdmin
            .from('messages-v2')
            .select(
              `id, sender!inner(first_name,last_name, clinician!inner(id, type)),recipient!inner(first_name)`
            )
            .eq('id', upcomingMessageId)
            .single()
            .then(({ data }) => data as unknown as UpcomingMessage);

          const unaliasedCoordinators = [
            'lead coordinator',
            'order support',
            'provider support',
          ];

          const isAliasedSender =
            upcomingMessage?.sender?.clinician?.type?.some((type: string) =>
              type.toLowerCase().includes('coordinator')
            ) &&
            upcomingMessage?.sender?.clinician?.type?.every(
              (type: string) =>
                !unaliasedCoordinators.includes(type.toLowerCase())
            );

          const senderName = isAliasedSender
            ? getClinicianAlias(upcomingMessage?.sender?.clinician?.id).split(
                ' '
              )[0]
            : upcomingMessage?.sender?.first_name;

          const message = `<p>Hey ${
            upcomingMessage?.recipient?.first_name || ''
          }, welcome to Zealthy!</p>
    
              <p>I’m ${senderName} and I’ll be your lead coordinator. Your coordination team will be your primary point of contact, ensuring that you have all the support and resources you need.</p>
              
              <p>Your Zealthy medical provider already reviewed your request as you may have seen above.</p>
              
              ${
                isBundled
                  ? ''
                  : `<p>
                    Your weight loss coach is also here on this chain. Zealthy
                    weight loss coaches are professionals who will provide
                    guidance, support, and expertise as you work towards
                    achieving your weight loss goals. Your coach will work with
                    you to develop a personalized plan, offer nutrition advice,
                    and help you establish healthy lifestyle habits.
                  </p>`
              }
              
              <p>If you have any questions or concerns, let us know. I’m here to help as you navigate this process to achieving lasting weight loss!</p>`;

          await supabaseAdmin
            .from('messages-v2')
            .update({ message_encrypted: message })
            .eq('id', upcomingMessageId);
        }
      }
    }

    return res.status(200).json({
      message: 'OK',
    });
  } catch (err: any) {
    console.error('pres_req_up_err', err);
    res.status(422).json(err?.message || 'There was an unexpected error');
  }
};

export default async function UpdatePrescriptionRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handleRequestUpdate);
}

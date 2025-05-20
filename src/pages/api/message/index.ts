import {
  ClinicianProps,
  PatientProps,
  ProviderType,
} from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { careTeamGroups } from '@/utils/careTeamGroups';
import { findPaidOrdersWithoutTracking } from '@/utils/data/order/find-orders';
import {
  initialMessageEvent,
  messageEvent,
  messageNonPHIEvent,
  messageToSkipEvent,
  weightLossThreadResponse,
} from '@/utils/freshpaint/events';
import { getClinicianAlias } from '@/utils/getClinicianAlias';
import setTimeToTimezone from '@/utils/setTimeToTimezone';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import {
  add,
  addMinutes,
  differenceInDays,
  differenceInHours,
  format,
  isWithinInterval,
  subDays,
} from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import type { NextApiRequest, NextApiResponse } from 'next';
import { messageKeywords } from '@/constants/messageKeywords';

const findAndReplace = (array: string[], find: string) =>
  array.find(user => user.includes(find))!.replace(find, '');

const isAliasedSender = (types: ProviderType[]) => {
  const unaliasedCoordinators = [
    'lead coordinator',
    'order support',
    'provider support',
  ];

  return (
    types?.some(type => type?.toLowerCase()?.includes('coordinator')) &&
    types?.every(type => !unaliasedCoordinators?.includes(type?.toLowerCase()))
  );
};

const getMessageQueueType = async (
  message: string,
  patientRegion: string,
  providerRequestAdditionalInfo: boolean
): Promise<string> => {
  const defaultQueue = 'Coordinator';
  if (providerRequestAdditionalInfo) {
    return 'Provider';
  }
  for (const [queueType, keywords] of Object.entries(messageKeywords)) {
    for (const keyword of keywords) {
      const pattern = new RegExp(
        keyword.includes(' ')
          ? keyword.replace(/\s+/g, '\\s+')
          : `\\b${keyword}\\b`,
        'i'
      );
      if (pattern.test(message)) {
        if (queueType === 'Provider' || queueType === 'Lead Provider') {
          const oldestIncompleteTask = await supabaseAdmin
            .from('task_queue')
            .select('*, patient!inner(*)')
            .eq('queue_type', queueType)
            .eq('task_type', 'UNREAD_MESSAGE')
            .eq('visible', true)
            .eq('patient.region', patientRegion)
            .is('action_taken', null)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()
            .then(data => data.data);

          const ageOfOldestIncompleteTask = oldestIncompleteTask
            ? Math.abs(
                differenceInHours(
                  new Date(),
                  new Date(oldestIncompleteTask?.created_at)
                )
              )
            : 0;
          // If oldest incomplete UNREAD_MESSAGE task is over 36 hours old for this queue and state,
          // send to coordinator queue instead
          if (ageOfOldestIncompleteTask > 36) {
            return defaultQueue;
          }
        }
        return queueType;
      }
    }
  }
  return defaultQueue;
};

export default async function MessageSendHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Method not allowed' });

  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const {
      sender,
      recipient,
      message,
      groupId,
      messageToSkipId,
      notify = true,
      initialMessage = false,
      is_phi = true,
    } = req.body.data;

    const practitioner_profile_id = findAndReplace(
      [sender, recipient],
      'Practitioner/'
    );

    const patient_profile_id = findAndReplace([sender, recipient], 'Patient/');

    const clinician = await supabase
      .from('clinician')
      .select('id, profile_id, type, profiles(*)')
      .eq('profile_id', practitioner_profile_id)
      .single()
      .then(({ data }) => data as ClinicianProps);

    const patient = await supabase
      .from('patient')
      .select('id, profile_id, timezone, region, profiles(*)')
      .eq('profile_id', patient_profile_id)
      .single()
      .then(({ data }) => data as PatientProps);

    if (!patient?.id || !clinician?.id) {
      res.status(500).json('There was an error sending this message');
    }

    /**
     * Create a task if the message sent by the user contains cancel (It can get cancel, cancellation).
     * Can get improved if we use IA to get user intention.
     */

    const isCancelMessage = /cancel/g.test((message as string).toLowerCase());

    if (isCancelMessage) {
      console.log('CMX', 'Is Cancel MSG');
      /**
       * Check if patient has an order that has being paid in the last 3 days but does not have a tracking number
       */
      const orders = await findPaidOrdersWithoutTracking(
        supabase,
        subDays(new Date(), 3)
      );

      /**
       * If has order that has not being paid create a order escalation
       */
      if (orders.length > 0) {
        /**
         * Also create the Order Escalation Task
         */
        const { data: task } = await supabaseAdmin
          .from('task_queue')
          .insert({
            task_type: 'PHARM_ESC_INIT',
            patient_id: patient?.id,
            queue_type: 'Coordinator',
            note: 'This task was automatically generated since the patient wrote “cancelled” in their message and has an order without a tracking number. Read through the messages to determine if it makes sense to attempt to cancel the order or not. ',
          })
          .select('id')
          .throwOnError()
          .single();

        if (!task || !task.id) return;

        const orderEscalation = {
          patient_id: patient.id,
          order_id: orders[0].id,
          issue: 'Pending Clarification',
          status: 'Initiate Escalation',
          note: 'This task was automatically generated since the patient wrote “cancelled” in their message and has an order without a tracking number. Read through the messages to determine if it makes sense to attempt to cancel the order or not.',
          queue_id: task.id,
        };

        await supabase
          .from('pharmacy_escalation')
          .insert(orderEscalation)
          .throwOnError();

        await supabase
          .from('order')
          .update({ order_escalated: true })
          .eq('id', orders[0].id);
      }
    }

    console.log(patient?.timezone, 'patientTimezone');
    // get current UTC time in patients timezone
    const currentTime = zonedTimeToUtc(
      utcToZonedTime(new Date(), patient?.timezone || ''),
      patient?.timezone || ''
    );
    console.log(currentTime, 'currTime');
    // set start available time
    let start = new Date(currentTime);
    console.log(start, 'start');

    start = setTimeToTimezone(start, patient?.timezone || '', 9, 0, 0); // 9am
    console.log(start, 'startupdate');
    // set end available time
    let end = new Date();
    console.log(end, 'end');
    end = setTimeToTimezone(end, patient?.timezone || '', 19, 0, 0);
    console.log(end, 'endUpdate');
    // set next available send time based on allowable window
    let upcomingAvailableTime = new Date(currentTime);

    console.log(upcomingAvailableTime, 'upcomin');

    upcomingAvailableTime = setTimeToTimezone(
      upcomingAvailableTime,
      patient?.timezone || '',
      9,
      0,
      0
    );

    console.log(upcomingAvailableTime, 'upcomingUpdate');

    if (upcomingAvailableTime.getTime() <= currentTime.getTime()) {
      // If it's already past 7am today, find the next occurrence tomorrow
      upcomingAvailableTime = add(upcomingAvailableTime, { days: 1 });
    }

    console.log(
      upcomingAvailableTime.toISOString(),
      'nextUPCOMINGAvailableTIME'
    );
    // Check if the zoned time is within the interval

    const withinInterval = isWithinInterval(currentTime, {
      start,
      end,
    });

    console.log(withinInterval, 'IsWITHINAllowableWindow');

    const messageParams = {
      message_encrypted: message,
      sender:
        sender?.split('/')[0] === 'Patient'
          ? patient?.profile_id
          : clinician?.profile_id,
      recipient:
        recipient?.split('/')[0] === 'Patient'
          ? patient?.profile_id
          : clinician?.profile_id,
      messages_group_id: groupId,
      notify: notify,
      display_at:
        initialMessage && withinInterval
          ? addMinutes(new Date(), 13).toISOString()
          : !withinInterval && initialMessage
          ? upcomingAvailableTime.toISOString()
          : null,
      marked_as_read: sender.split('/')[0] !== 'Patient',
      is_phi,
    };

    console.log({ MESSAGE_PARAMS: messageParams });

    const { data } = await supabase
      .from('messages-v2')
      .insert(messageParams)
      .select()
      .throwOnError()
      .single();

    if (!data?.id) {
      throw new Error('Error inserting message');
    }

    if (initialMessage) {
      initialMessageEvent(
        clinician?.profiles?.email,
        patient?.profiles?.id,
        patient?.profiles?.email,
        is_phi ? null : message,
        is_phi
          ? null
          : message.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, ''),
        isAliasedSender(clinician?.type)
          ? getClinicianAlias(clinician?.id).split(' ')[0]
          : clinician?.profiles?.first_name
      );
    }
    console.log('INITIAL MESSAGE:', initialMessage);

    if (data?.notify) {
      if (!data.is_phi) {
        await messageNonPHIEvent(
          clinician.profiles.email,
          patient.profiles.id,
          patient.profiles.email,
          data.is_phi ? null : message,
          data.is_phi
            ? null
            : message.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, ''),
          isAliasedSender(clinician?.type)
            ? getClinicianAlias(clinician?.id).split(' ')[0]
            : clinician?.profiles?.first_name
        );
      } else {
        await messageEvent(
          clinician.profiles.email,
          patient.profiles.id,
          patient.profiles.email
        );
      }
    }

    const groupName = await supabase
      .from('messages_group')
      .select('name')
      .eq('id', groupId)
      .single()
      .then(({ data }) => data?.name);

    const patientPrescriptionRequests = await supabase
      .from('prescription_request')
      .select('*')
      .eq('patient_id', patient.id)
      .then(data => data.data);

    const taskType = /refund/i.test(message) ? 'REFUND_TASK' : 'UNREAD_MESSAGE';
    const providerRequestedAdditionalInfo =
      (patientPrescriptionRequests?.filter(
        pr => pr.status === 'PENDING MEDICAL INFORMATION'
      ).length || 0) > 0;
    const queueType = await getMessageQueueType(
      message,
      patient.region!,
      providerRequestedAdditionalInfo
    );
    if (
      sender.split('/')[0] === 'Patient' &&
      careTeamGroups.includes(groupName as (typeof careTeamGroups)[number])
    ) {
      const prevMessage = await supabase
        .from('messages-v2')
        .select('*, task_queue(*)')
        .eq('messages_group_id', groupId)
        .order('created_at', { ascending: false })
        .is('task_queue.action_taken', null)
        .neq('id', data.id)
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data);

      if (
        prevMessage &&
        prevMessage.task_queue &&
        queueType === prevMessage.task_queue.queue_type
      ) {
        await supabase
          .from('messages-v2')
          .update({ queue_id: prevMessage.task_queue.id })
          .eq('id', data?.id);
      } else {
        const { data: addToQueue } = await supabase
          .from('task_queue')
          .upsert({
            task_type: taskType,
            note: providerRequestedAdditionalInfo
              ? 'The patient has responded. Please make a clinical decision if possible or request additional information from the patient.'
              : null,
            patient_id: patient?.id,
            queue_type: queueType
              ? queueType
              : message.requesting_info
              ? groupName === 'Enclomiphene'
                ? 'Provider (QA)'
                : ['Mental Health', 'AMH'].includes(groupName!)
                ? 'Provider (AMH)'
                : 'Provider'
              : 'Coordinator',
          })
          .select()
          .single();

        await supabase
          .from('messages-v2')
          .update({ queue_id: addToQueue?.id })
          .eq('id', data?.id);
      }

      if (groupName === 'Weight Loss') {
        await weightLossThreadResponse(
          patient.profiles.id,
          patient.profiles.email
        );
        await supabase
          .from('patient')
          .update({
            last_weight_loss_message: new Date().toISOString(),
          })
          .eq('profile_id', messageParams?.sender);
      }

      if (message.toUpperCase().trim() === 'STOP') {
        await supabase
          .from('messages-v2')
          .update({ stop_requested: true })
          .eq('id', data?.id);
      }
    } else if (sender.split('/')[0] === 'Patient') {
      const addToQueue = await supabase
        .from('task_queue')
        .insert({
          assigned_clinician_id: clinician?.id,
          clinician_assigned_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          task_type: taskType,
          queue_type: 'Coach',
          patient_id: patient?.id,
        })
        .select()
        .single()
        .then(({ data }) => data);

      await supabase
        .from('messages-v2')
        .update({ queue_id: addToQueue?.id })
        .eq('id', data?.id);
    }

    console.log({ MESSAGE_TO_SKIP_ID: messageToSkipId });

    if (messageToSkipId > 0) {
      const { data, error } = await supabase
        .from('messages-v2')
        .update({ visible: false })
        .eq('id', messageToSkipId);

      messageToSkipEvent(
        clinician?.profiles?.email,
        patient?.profiles?.id,
        patient?.profiles?.email,
        is_phi ? null : message,
        is_phi
          ? null
          : message.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, ''),
        isAliasedSender(clinician?.type)
          ? getClinicianAlias(clinician?.id).split(' ')[0]
          : clinician?.profiles?.first_name
      );
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('message_err', error);
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}

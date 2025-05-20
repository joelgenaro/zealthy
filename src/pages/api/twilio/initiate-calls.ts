import type { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/lib/database.types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { differenceInHours, isWithinInterval } from 'date-fns';
import { PatientProps } from '@/components/hooks/data';
import { utcToZonedTime } from 'date-fns-tz';
import { automatedCallFailedPaymentEvent } from '@/utils/freshpaint/events';
import { stateToTimezone } from './mapStateToTimezone';

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { patients, message } = JSON.parse(req.body);

  try {
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    const checkCancelledSubscription = async (patientId: Number) =>
      !!(
        await supabase
          .from('patient_subscription')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'canceled')
      ).count;

    if (patients?.length) {
      if (message === 'incomplete') {
        await Promise.allSettled(
          patients?.map(async (patient: PatientProps) => {
            const hasCancelledSubscription = await checkCancelledSubscription(
              patient.id
            );

            if (hasCancelledSubscription) return;

            const region = patient?.region;
            const timezone = region
              ? stateToTimezone[region as keyof typeof stateToTimezone]
              : 'America/New_York';
            const currentTime = utcToZonedTime(new Date(), timezone || '');

            const start = new Date(currentTime);
            start.setHours(9, 0, 0); // 9am

            const end = new Date(currentTime);
            end.setHours(19, 0, 0); // 7pm

            // Check if the zoned time is within the interval
            const withinInterval = isWithinInterval(currentTime, {
              start,
              end,
            });

            const automatedCallParams = {
              method: 'POST',
              body: JSON.stringify({
                phone_number: patient?.profiles?.phone_number,
                message: 'incomplete',
              }),
            };

            const timeIntervals = [672, 504, 336, 168, 72, 24, 4];

            // Calculate the difference in hours
            const hoursDifference = differenceInHours(
              new Date(),
              new Date(patient?.created_at || '')
            );

            if (withinInterval && timeIntervals.includes(hoursDifference)) {
              // Make the automated call
              const automatedCall = await fetch(
                'https://app.getzealthy.com/api/twilio/automated-call',
                automatedCallParams
              )
                .then(res => res.json())
                .catch(e => console.log(e.json()));

              console.log(automatedCall);

              // Insert into the task queue
              await supabase.from('task_queue').insert({
                task_type: 'AUTOMATED_CALL',
                note: `Automated Call at ${hoursDifference} hours`,
                queue_type: 'Does Not Require Response',
                patient_id: patient?.id,
              });
            } else if (timeIntervals.includes(hoursDifference)) {
              //Mark call as missed due to being outside office hours
              await supabase
                .from('patient')
                .update({ missed_call: true })
                .eq('id', patient.id);
            } else if (currentTime.getHours() === 9 && patient.missed_call) {
              //If 9 am and they missed previous call then make the automated call and update db
              const automatedCall = await fetch(
                'https://app.getzealthy.com/api/twilio/automated-call',
                automatedCallParams
              )
                .then(res => res.json())
                .catch(e => console.log(e.json()));

              // Reset missed_call to false after the successful call
              await supabase
                .from('patient')
                .update({ missed_call: false })
                .eq('id', patient.id);

              // Log the retry in the task queue
              await supabase.from('task_queue').insert({
                task_type: 'AUTOMATED_CALL',
                note: 'Retry for missed call at 9 AM',
                queue_type: 'Does Not Require Response',
                patient_id: patient?.id,
              });
            }
          })
        );
      } else if (message === 'idMissing') {
        await Promise.allSettled(
          patients?.map(async (patient: PatientProps) => {
            const hasCancelledSubscription = await checkCancelledSubscription(
              patient.id
            );

            if (hasCancelledSubscription) return;

            const region = patient?.region;
            const timezone = region
              ? stateToTimezone[region as keyof typeof stateToTimezone]
              : 'America/New_York';
            const currentTime = utcToZonedTime(new Date(), timezone || '');
            const start = new Date(currentTime);
            start.setHours(9, 0, 0); // 9am

            const end = new Date(currentTime);
            end.setHours(19, 0, 0); // 7pm

            // Check if the zoned time is within the interval
            const withinInterval = isWithinInterval(currentTime, {
              start,
              end,
            });

            const automatedCallParams = {
              method: 'POST',
              body: JSON.stringify({
                phone_number: patient?.profiles?.phone_number,
                message: 'idMissing',
              }),
            };

            const timeIntervals = [672, 504, 336, 168, 72, 24, 4];

            // Calculate the difference in hours
            const hoursDifference = differenceInHours(
              new Date(),
              new Date(patient?.created_at || '')
            );

            if (withinInterval && timeIntervals.includes(hoursDifference)) {
              // Make the automated call
              const automatedCall = await fetch(
                'https://app.getzealthy.com/api/twilio/automated-call',
                automatedCallParams
              )
                .then(res => res.json())
                .catch(e => console.log(e.json()));

              console.log(automatedCall);

              // Insert into the task queue
              await supabase.from('task_queue').insert({
                task_type: 'AUTOMATED_CALL',
                note: `Automated Call at ${hoursDifference} hours`,
                queue_type: 'Does Not Require Response',
                patient_id: patient?.id,
              });
            } else if (timeIntervals.includes(hoursDifference)) {
              //Mark call as missed due to being outside office hours
              await supabase
                .from('patient')
                .update({ missed_call: true })
                .eq('id', patient.id);
            } else if (currentTime.getHours() === 9 && patient.missed_call) {
              //If 9 am and they missed previous call then make the automated call and update db
              const automatedCall = await fetch(
                'https://app.getzealthy.com/api/twilio/automated-call',
                automatedCallParams
              )
                .then(res => res.json())
                .catch(e => console.log(e.json()));

              // Reset missed_call to false after the successful call
              await supabase
                .from('patient')
                .update({ missed_call: false })
                .eq('id', patient.id);

              // Log the retry in the task queue
              await supabase.from('task_queue').insert({
                task_type: 'AUTOMATED_CALL',
                note: 'Retry for missed call at 9 AM',
                queue_type: 'Does Not Require Response',
                patient_id: patient?.id,
              });
            }
          })
        );
      } else if (message === 'failedPayment') {
        await Promise.allSettled(
          patients?.map(async (patient: any) => {
            const hasCancelledSubscription = await checkCancelledSubscription(
              patient.id
            );

            if (hasCancelledSubscription) return;

            const region = patient?.region;
            const timezone = region
              ? stateToTimezone[region as keyof typeof stateToTimezone]
              : 'America/New_York';
            const currentTime = utcToZonedTime(new Date(), timezone || '');
            const start = new Date(currentTime);
            start.setHours(9, 0, 0); // 9am

            const end = new Date(currentTime);
            end.setHours(19, 0, 0); // 7pm

            // Check if the zoned time is within the interval
            const withinInterval = isWithinInterval(currentTime, {
              start,
              end,
            });

            const automatedCallParams = {
              method: 'POST',
              body: JSON.stringify({
                phone_number: patient?.profiles?.phone_number,
                message: 'failedPayment',
              }),
            };

            const timeIntervals = [504, 432, 360, 288, 216, 144, 72, 1];

            // Calculate the difference in hours
            const hoursDifference = differenceInHours(
              new Date(),
              new Date(patient?.order_created_at || '')
            );

            if (withinInterval && timeIntervals.includes(hoursDifference)) {
              // Make the automated call
              const automatedCall = await fetch(
                'https://app.getzealthy.com/api/twilio/automated-call',
                automatedCallParams
              )
                .then(res => res.json())
                .catch(e => console.log(e.json()));

              console.log(automatedCall);

              await automatedCallFailedPaymentEvent(
                patient.profile_id,
                patient.profiles.email!,
                patient.profiles.phone_number!,
                patient.profiles.first_name!,
                patient.profiles.last_name,
                patient.region!,
                patient.profiles.birth_date!,
                patient.profiles.gender!
              );
              // Insert into the task queue
              await supabase.from('task_queue').insert({
                task_type: 'AUTOMATED_CALL',
                note: `Automated Call at ${hoursDifference} hours for failed payment`,
                queue_type: 'Does Not Require Response',
                patient_id: patient?.id,
              });
            } else if (timeIntervals.includes(hoursDifference)) {
              //Mark call as missed due to being outside office hours
              await supabase
                .from('patient')
                .update({ missed_call: true })
                .eq('id', patient.id);
            } else if (currentTime.getHours() === 9 && patient.missed_call) {
              await automatedCallFailedPaymentEvent(
                patient.profile_id,
                patient.profiles.email!,
                patient.profiles.phone_number!,
                patient.profiles.first_name!,
                patient.profiles.last_name,
                patient.region!,
                patient.profiles.birth_date!,
                patient.profiles.gender!
              );

              //If 9 am and they missed previous call then make the automated call and update db
              const automatedCall = await fetch(
                'https://app.getzealthy.com/api/twilio/automated-call',
                automatedCallParams
              )
                .then(res => res.json())
                .catch(e => console.log(e.json()));

              // Reset missed_call to false after the successful call
              await supabase
                .from('patient')
                .update({ missed_call: false })
                .eq('id', patient.id);

              // Log the retry in the task queue
              await supabase.from('task_queue').insert({
                task_type: 'AUTOMATED_CALL',
                note: 'Retry for missed call at 9 AM for failed payment',
                queue_type: 'Does Not Require Response',
                patient_id: patient?.id,
              });
            }
          })
        );
      }
    }

    res.status(200).json('Success');
  } catch (error: any) {
    console.log(error, 'error');
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { format, subMonths, subHours, differenceInMinutes } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

async function handleNextCoach(type: string) {
  let leastPatients: { clinician: any | null; earliest: Date } = {
    clinician: null,
    earliest: subMonths(new Date(), 3),
  };

  const allCoaches = await supabase
    .from('clinician')
    .select('*, profiles (*)')
    .eq('status', 'ON')
    .contains('type', [`Coach (${type})`]);

  for (const c of allCoaches?.data || []) {
    const oldestTasks = await supabase
      .from('task_queue')
      .select('*')
      .eq('assigned_clinician_id', c.id)
      .is('forwarded_clinician_id', null)
      .eq('visible', true)
      .is('completed_at', null)
      .lte('created_at', format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"))
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (
      leastPatients.earliest < new Date(oldestTasks?.created_at!) ||
      !oldestTasks
    ) {
      leastPatients = {
        clinician: c || null,
        earliest: !oldestTasks
          ? new Date()
          : new Date(oldestTasks?.created_at!),
      };
    }
  }

  return { clinician: leastPatients.clinician };
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const weightLossVisit = await supabase
    .from('visit_reason')
    .select(`online_visit!inner(*), reason_for_visit!inner(reason)`)
    .eq('reason_for_visit.reason', 'Weight loss')
    .eq('online_visit.status', 'Completed')
    .eq('online_visit.welcome_message_sent', false)
    .gt(
      'online_visit.completed_at',
      format(subHours(new Date(), 14), 'yyyy-MM-dd HH:mm:ss zzz')
    )
    .then(({ data }) => data);

  console.log(weightLossVisit?.length, 'weightLossVisit');

  const mentalHealthVisit = await supabase
    .from('visit_reason')
    .select(`created_at, online_visit!inner(*), reason_for_visit!inner(reason)`)
    .eq('reason_for_visit.reason', 'Anxiety or depression')
    .eq('online_visit.status', 'Completed')
    .eq('online_visit.welcome_message_sent', false)
    .gt(
      'online_visit.completed_at',
      format(subHours(new Date(), 14), 'yyyy-MM-dd HH:mm:ss zzz')
    )
    .then(({ data }) => data);

  console.log(mentalHealthVisit?.length, 'mentalHealthVisit');

  for (const visit of weightLossVisit || []) {
    console.log(
      differenceInMinutes(
        new Date(),
        new Date(visit.online_visit.completed_at ?? '')
      ),
      'minutesPassed'
    );

    console.log(visit.online_visit.patient_id);

    if (
      differenceInMinutes(
        new Date(),
        new Date(visit.online_visit.completed_at ?? '')
      ) >= 120 &&
      !visit.online_visit.welcome_message_sent
    ) {
      console.log({
        PATIENT_ID: `Processing patient: ${visit.online_visit.patient_id}`,
      });

      const patient = await supabase
        .from('patient')
        .select(`*, profiles(*)`)
        .eq('id', visit.online_visit.patient_id)
        .single()
        .then(({ data }) => data);

      const activeBundle = await supabase
        .from('patient_subscription')
        .select()
        .eq('patient_id', patient?.id!)
        .in('status', ['trialing', 'active'])
        .in('price', [297, 449, 249])
        .limit(1)
        .maybeSingle()
        .then(({ data }) => data);

      if (activeBundle?.reference_id) {
        console.log(`Patient ${patient?.id} is a bundle patient. Returning...`);
        continue;
      }

      let coach = await supabase
        .from('patient_care_team')
        .select('clinician (*, profiles(*))')
        .eq('patient_id', patient?.id!)
        .eq('role', 'Weight Loss Coach')
        .limit(1)
        .single()
        .then(({ data }) => data?.clinician);

      if (!coach) {
        coach = await handleNextCoach('Weight Loss').then(c => c.clinician);
        await supabase.from('patient_care_team').insert({
          patient_id: patient?.id,
          clinician_id: coach?.id,
          role: 'Weight Loss Coach',
        });
      }

      let existingGroup = await supabase
        .from('messages_group')
        .select()
        .eq(
          'name',
          `${coach?.profiles?.prefix ? `${coach?.profiles?.prefix} ` : ''}${
            coach?.profiles?.first_name
          } ${coach?.profiles?.last_name}`
        )
        .eq('profile_id', patient?.profile_id!)
        .single()
        .then(({ data }) => data);

      if (!existingGroup?.id) {
        existingGroup = await supabase
          .from('messages_group')
          .insert({
            profile_id: patient?.profile_id,
            name: `${
              coach?.profiles?.prefix ? `${coach?.profiles?.prefix} ` : ''
            }${coach?.profiles?.first_name} ${coach?.profiles?.last_name}`,
          })
          .select()
          .single()
          .then(({ data }) => data);
      }

      const groupMembers = await supabase
        .from('messages_group_member')
        .select()
        .eq('messages_group_id', existingGroup?.id!)
        .then(({ data }) => data);

      if (!groupMembers?.find(m => m.clinician_id === coach?.id)) {
        const groupMemberCoach = await supabase
          .from('messages_group_member')
          .insert({
            messages_group_id: existingGroup?.id,
            clinician_id: coach?.id,
          });
        console.log(groupMemberCoach, 'addGroupCoach');
      }

      const weightLossCoach = `
              <p>Hi ${patient?.profiles?.first_name}, I'm ${coach?.profiles?.first_name},</p>

              <p>Thanks very much for reaching out and for sharing key information about you and how you're feeling. I am a Zealthy Weight Loss Coach with experience helping our members with lasting weight loss care.</p>

              <p>I am here to provide guidance, support, and expertise as you work towards achieving your weight loss goals. Together, we can work on various areas of lifestyle including nutrition, exercise, hydration, sleep and stress, developing a customized plan that works for you and your weight loss goals.</p>
              
              <p>You can message me anytime, 365 days a year. However, if you ever experience a medical emergency, please call 911. In the meantime, if you have any questions feel free to let me know!</p>
              
              <p>If you have questions about your medication request, insurance or your work with your provider, please reach out to your Weight Loss group where your provider and coordination team (both of whom are incredible) can see your question and will best be able to advise.</p>
              
              <p>I could not be more thrilled to work with you. If you’re ready to get started, I’d love to hear a bit more about your current habits, or anything you would feel would be beneficial to begin exploring together!</p>
              `;

      const messageParams = {
        data: {
          sender: `Practitioner/${coach?.profile_id}`,
          recipient: `Patient/${patient?.profile_id}`,
          message: weightLossCoach || 'Welcome to Zealthy!!!',
          groupId: existingGroup?.id,
          notify: true,
          is_phi: false,
        },
      };

      console.log(messageParams, 'messageParams');

      const sentMessage = await fetch(
        ['production', 'preview'].includes(process.env.VERCEL_ENV!)
          ? `https://${process.env.VERCEL_URL}/api/message`
          : process.env.VERCEL_URL + '/api/message',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageParams),
        }
      )
        .then(res => res.json())
        .catch(e => console.log(e));
      console.log(sentMessage, 'sentMessageWeightLoss');

      //create a task
      await supabase
        .from('task_queue')
        .insert({
          created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          assigned_clinician_id: coach?.id,
          clinician_assigned_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
          provider_type: 'Coach (Weight Loss)',
          queue_type: 'Coach',
          task_type: 'NEW_PATIENT',
          patient_id: patient?.id,
        })
        .select();

      const updatedVisit = await supabase
        .from('online_visit')
        .update({ welcome_message_sent: true })
        .eq('id', visit.online_visit.id);

      console.log(updatedVisit, 'updatedVisitWelcomeMessage');
    }
  }

  for (const visit of mentalHealthVisit || []) {
    if (
      differenceInMinutes(
        new Date(),
        new Date(visit.online_visit.completed_at ?? '')
      ) >= 30 &&
      !visit.online_visit.welcome_message_sent
    ) {
      const patient = await supabase
        .from('patient')
        .select(`*, profiles(*)`)
        .eq('id', visit.online_visit.patient_id)
        .single()
        .then(({ data }) => data);
      console.log(patient);
      if (!patient?.has_verified_identity && !patient?.vouched_verified)
        continue;
      const appointment = await supabase
        .from('appointment')
        .select()
        .eq('appointment_type', 'Coach (Mental Health)')
        .eq('patient_id', visit.online_visit.patient_id)
        .order('starts_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => data);
      console.log(appointment);
      let coach = await supabase
        .from('clinician')
        .select('id, profiles(*)')
        .eq('id', appointment?.clinician_id!)
        .limit(1)
        .single()
        .then(({ data }) => data);
      console.log(coach);
      if (coach) {
        let existingGroup = await supabase
          .from('messages_group')
          .select()
          .eq(
            'name',
            `${coach?.profiles?.prefix ? `${coach?.profiles?.prefix} ` : ''}${
              coach?.profiles?.first_name
            } ${coach?.profiles?.last_name}`
          )
          .eq('profile_id', patient?.profile_id!)
          .single()
          .then(({ data }) => data);

        if (!existingGroup?.id) {
          existingGroup = await supabase
            .from('messages_group')
            .insert({
              profile_id: patient?.profile_id,
              name: `${
                coach?.profiles?.prefix ? `${coach?.profiles?.prefix} ` : ''
              }${coach?.profiles?.first_name} ${coach?.profiles?.last_name}`,
            })
            .select()
            .single()
            .then(({ data }) => data);
        }
        const groupMembers = await supabase
          .from('messages_group_member')
          .select()
          .eq('messages_group_id', existingGroup?.id!)
          .then(({ data }) => data);

        if (!groupMembers?.find(m => m.clinician_id === coach?.id)) {
          const groupMemberCoach = await supabase
            .from('messages_group_member')
            .insert({
              messages_group_id: existingGroup?.id,
              clinician_id: coach?.id,
            });
          console.log(groupMemberCoach, 'addGroupCoach');
        }
        const mentalHealthCoach = `
              <p>Hi ${patient?.profiles?.first_name},</p>
              
              <p>Thanks very much for reaching out and for sharing key information about you and how you're feeling. I am a Zealthy Mental Health Coach with experience helping people feel like the best versions of themself. I appreciate the opportunity to help individuals make effective progress in their lives. I believe that many problems can be worked on through coaching.</p>
              
              <p>I like to provide hope and insight to my clients in improving their outlook on life. To not only feel hope, but set plans and goals on making these improvements part of their lives. I have varied office hours and I will respond to any messages you leave as soon as I can to help you in moving forward.</p>
              
              <p>I can also work with your Zealthy psychiatric provider to make sure that the things we work on together complement the psychiatric care that you’re getting.</p>
              
              <p>It looks like you already scheduled your first appointment for the following date and time: ${format(
                new Date(appointment?.starts_at ?? ''),
                'EEEE MMM d [at] h:mm a zzz'
              )}</p>

              <p>Here's the visit link to join: <a href="https://app.getzealthy.com/visit/room/${
                appointment?.daily_room
              }?appointment=${
          appointment?.id
        }">https://app.getzealthy.com/visit/room/${
          appointment?.daily_room
        }?appointment=${appointment?.id}</a></p>
              
              <p>I’m looking forward to talking to you then, but I’m also here for you in the meantime if you want to message back and forth about anything you’re going through.</p>
              `;
        const messageParams = {
          data: {
            sender: `Practitioner/${coach?.profiles?.id}`,
            recipient: `Patient/${patient?.profile_id}`,
            message: mentalHealthCoach || 'Welcome to Zealthy!!!',
            notify: true,
            groupId: existingGroup?.id,
            is_phi: false,
          },
        };
        console.log(messageParams, 'parms');

        const sentMessage = await fetch(
          ['production', 'preview'].includes(process.env.VERCEL_ENV!)
            ? `https://${process.env.VERCEL_URL}/api/message`
            : process.env.VERCEL_URL + '/api/message',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageParams),
          }
        )
          .then(res => res.json())
          .catch(e => e);
        console.log(sentMessage, 'sentMessageMentalHealth');
        //create a task
        await supabase
          .from('task_queue')
          .insert({
            created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
            assigned_clinician_id: coach?.id,
            clinician_assigned_at: format(
              new Date(),
              "yyyy-MM-dd'T'HH:mm:ssxxx"
            ),
            provider_type: 'Coach (Mental Health)',
            queue_type: 'Coach',
            task_type: 'NEW_PATIENT',
            patient_id: patient?.id,
          })
          .select();
        const updatedVisit = await supabase
          .from('online_visit')
          .update({ welcome_message_sent: true })
          .eq('id', visit.online_visit.id);
        console.log(updatedVisit, 'updatedVisitWelcomeMessage');
      }
    }
  }

  res.status(200).json({ status: 'Success!' });
}

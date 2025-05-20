import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import {
  ClinicianProps,
  PatientProps,
  ProviderType,
} from '@/components/hooks/data';
import format from 'date-fns/format';

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
      images,
      groupId,
      messageToSkipId,
      notify = true,
      initialMessage = false,
      is_phi = true,
    } = req.body.data;

    const clinician = await supabase
      .from('clinician')
      .select('id, profile_id, type, profiles(*)')
      .eq('profile_id', recipient)
      .single()
      .then(({ data }) => data as ClinicianProps);

    const patient = await supabase
      .from('patient')
      .select('id, profile_id, timezone,  profiles(*)')
      .eq('profile_id', sender)
      .single()
      .then(({ data }) => data as PatientProps);

    if (!patient?.id || !clinician?.id) {
      res.status(500).json('There was an error sending this message');
    }

    for (const imageUrl of images) {
      const imageResponse = await fetch(imageUrl);
      const image = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(image);

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.jpg`;
      const filePath = `Patient/${patient.id}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sms-images')
        .upload(filePath, imageBuffer, {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Error uploading image to Supabase', uploadError);
        return res.status(500).json('Error uploading image');
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from('sms-images')
          .createSignedUrl(filePath, 60 * 60 * 24 * 365);

      if (signedUrlError) {
        console.error('Error creating signed URL for image', signedUrlError);
        return res.status(500).json('Error uploading image');
      }

      const signedUrl = signedUrlData.signedUrl;

      const messageParams = {
        image_url: signedUrl,
        sender,
        recipient,
        messages_group_id: groupId,
        notify: notify,
        display_at: new Date().toISOString(),
        marked_as_read: sender.split('/')[0] !== 'Patient',
        is_phi,
      };

      const { data: insertData, error: insertError } = await supabase
        .from('messages-v2')
        .insert(messageParams)
        .select()
        .throwOnError()
        .single();

      if (insertError) {
        console.error('Error inserting image url', insertError);
        return res.status(500).json('Error uploading image');
      }

      const { data: taskData, error: taskError } = await supabase
        .from('task_queue')
        .insert({
          task_type: 'IMAGE_UPLOAD_PT',
          patient_id: patient.id,
          queue_type: 'Coordinator',
          assigned_clinician_id: clinician?.id,
          clinician_assigned_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx"),
        });
    }

    res.status(200).json('Successful image upload');
  } catch (error: any) {
    console.error('message_err', error);
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}

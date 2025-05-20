import { addDays, addWeeks } from 'date-fns';
import {
  OrderPrescriptionProps,
  PatientAddress,
  PatientProps,
} from '@/components/hooks/data';
import { supabaseAdmin as supabase, supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { prescriptionRenewalEvent } from '@/utils/freshpaint/events';

const careToRenewalLink = {
  'Birth Control Medication': '/bc-prescription-renewal',
  'Hair Loss Medication': '/mhl-prescription-renewal',
  'Female Hair Loss Medication': '/fhl-prescription-renewal',
  'Sleep Support: Ramelteon': '/insomnia-prescription-renewal',
  'Enclomiphene Medication': '/enclomiphene-prescription-renewal',
  'Preworkout Medication': '/preworkout-prescription-renewal',
  'EDHL Medication': '/ed-hl-prescription-renewal',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const twoWeeksFromNow = addWeeks(new Date(), 2);
  const expiringPrescriptions = await supabaseAdmin
    .from('prescription')
    .select('*')
    .eq('status', 'active')
    .lt('expires_on', twoWeeksFromNow.toISOString())
    .gt('expires_on', new Date().toISOString())
    .then(data => data.data);

  if (expiringPrescriptions) {
    await Promise.all(
      expiringPrescriptions?.map(async script => {
        const care = await supabaseAdmin
          .from('medication')
          .select('*, medication_dosage!inner(*, medication_quantity!inner(*))')
          .eq(
            'medication_dosage.medication_quantity.id',
            script.medication_quantity_id || 0
          )
          .limit(1)
          .order('created_at', { ascending: false })
          .maybeSingle()
          .then(data => data.data?.display_name);

        const patient = await supabaseAdmin
          .from('patient')
          .select('*, profiles!inner(*)')
          .eq('id', script.patient_id || 0)
          .limit(1)
          .maybeSingle()
          .then(data => data.data);

        if (care && care in careToRenewalLink) {
          let renewalLink =
            careToRenewalLink[care as keyof typeof careToRenewalLink];
          if (
            care === 'Hair Loss Medication' &&
            patient?.profiles?.gender === 'female'
          ) {
            renewalLink = '/fhl-prescription-renewal';
          }
          // Add action item for renewal
          await supabaseAdmin.from('patient_action_item').insert({
            patient_id: script.patient_id || 0,
            type: 'PRESCRIPTION_RENEWAL',
            title: `Request ${care.replace('Female ', '')} renewal`,
            body: 'To make sure you don’t have gaps in medication coverage, request your prescription renewal now.',
            path: renewalLink,
            is_required: true,
          });

          await prescriptionRenewalEvent(
            patient?.profile_id || '',
            patient?.profiles.email || '',
            care,
            script.medication || '',
            'https://app.getzealthy.com' + renewalLink
          );

          await supabaseAdmin
            .from('prescription')
            .update({ status: 'expired' })
            .eq('id', script.id || 0);
        }
        return care;
      })
    );
  }
  console.log(
    'AFFECTED PRESCRIPTIONS: ',
    expiringPrescriptions?.map(p => p.id)
  );
  res.status(200).send('OK');
}

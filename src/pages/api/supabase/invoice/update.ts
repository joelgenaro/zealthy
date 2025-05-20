import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { getKeys } from '@/utils/getKeys';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { handleFirstPaidInvoice } from './_utils/handleFirstPaidInvoice';

type Invoice = Database['public']['Tables']['invoice']['Row'];

type UpdatePayload = {
  type: 'UPDATE';
  table: string;
  schema: string;
  record: Invoice;
  old_record: Invoice;
};

type Patient = {
  profiles: {
    email: string;
    id: string;
  };
  status: string;
} | null;

const isCompoundMedication = (description: string) =>
  ['Semaglutide', 'Tirzepatide'].some(str => description.includes(str));

const findEvent = (invoice: Invoice, attempts: number) => {
  if (invoice.description?.includes('Weight Loss')) {
    return `payment-failed-weight-loss-attempt-${attempts}`;
  }

  if (invoice.description?.includes('Personalized Psychiatry')) {
    return `payment-failed-psychiatric-care-attempt-${attempts}`;
  }

  if (isCompoundMedication(invoice.description || '')) {
    return `payment-failed-prescription-attempt-${attempts}`;
  }

  return;
};

const findCancelEvent = (invoice: Invoice) => {
  if (invoice.description?.includes('Weight Loss')) {
    return `payment-failed-weight-loss-cancelled`;
  }

  if (invoice.description?.includes('Personalized Psychiatry')) {
    return `payment-failed-psychiatric-care-cancelled`;
  }

  if (isCompoundMedication(invoice.description || '')) {
    return `payment-failed-prescription-cancelled`;
  }

  return null;
};

const handleUpdateInvoice = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const stripe = getStripeInstance();

  try {
    const { record, old_record } = req.body as UpdatePayload;
    const changedAttributes = getKeys(old_record).filter(
      key => old_record[key] !== record[key]
    );

    if (
      changedAttributes.includes('status') &&
      record.status === 'paid' &&
      record.billing_reason === 'manual' &&
      record.description !== 'Menopause Consult'
    ) {
      await handleFirstPaidInvoice(record);
    }

    // check if invoice for weight loss or psychiatric care or compound
    if (
      ![
        'weight loss',
        'zealthy personalized psychiatry',
        'semaglutide',
        'tirzepatide',
      ].some(str => record.description?.toLowerCase().includes(str))
    ) {
      return res.status(200).json({ message: 'OK' });
    }

    // check if invoice is open
    if (['void', 'paid', 'draft'].includes(record.status)) {
      return res.status(200).json({ message: 'OK' });
    }

    // check if invoice has charge
    if (!record.charge) {
      return res.status(200).json({ message: 'OK' });
    }

    // check if attempted count is more than 0
    if (record.attempted_count === 0 && record.zealthy_attempts === 0) {
      return res.status(200).json({ message: 'OK' });
    }

    // check if attempted count has changed
    if (
      record.attempted_count === old_record.attempted_count &&
      record.zealthy_attempts === old_record.zealthy_attempts
    ) {
      return res.status(200).json({ message: 'OK' });
    }

    //if we are made it here it means we have attempted to collect payment but it was successful
    console.log(
      '------------------Made it here, sending email-------------------'
    );

    const { email, profile_id, patientStatus } = await supabaseAdmin
      .from('patient')
      .select(
        `
        profiles(email, id),
        status
      `
      )
      .eq('id', record.patient_id)
      .single()
      .then(({ data }) => {
        const profile = (data as unknown as Patient)?.profiles;
        return {
          email: profile?.email,
          profile_id: profile?.id,
          patientStatus: (data as unknown as Patient)?.status,
        };
      });

    if (!email) {
      throw new Error(`Could not find email for ${record.patient_id}`);
    }

    const last4 = await stripe.charges
      .retrieve(record.charge)
      .then(charge => charge.payment_method_details?.card?.last4);

    // Only count attempts for patients who have PAYMENT_SUBMITTED or ACTIVE status
    if (
      patientStatus &&
      ['PAYMENT_SUBMITTED', 'ACTIVE'].includes(patientStatus)
    ) {
      // get current count
      const attemptCount = record.attempted_count + record.zealthy_attempts;
      const event = findEvent(record, attemptCount);

      if (
        event &&
        attemptCount > 0 &&
        process.env.VERCEL_ENV === 'production'
      ) {
        axios.post('https://api.perfalytics.com/track', {
          event,
          properties: {
            distinct_id: profile_id,
            email: email,
            time: Math.floor(Date.now() / 1000),
            last_4: last4,
            token: process.env.NEXT_PUBLIC_FRESHPAINT_ENV_ID,
            $user_agent:
              'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
            $current_url: 'https://app.getzealthy.com',
          },
        });
      }
    } else {
      console.log(
        `Not sending payment failure event because patient status is ${
          patientStatus || 'undefined'
        }`
      );
    }

    res.status(200).json({ message: 'OK' });
  } catch (err: any) {
    console.error('updateInvoiceErrr', err);
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

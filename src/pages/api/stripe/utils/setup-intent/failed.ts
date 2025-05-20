import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { paymentRejected } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import { createPortalSession } from '../customer/create-portal';

export const manageSetupFailed = async (payment: Stripe.SetupIntent) => {
  try {
    // build patient subscription
    const paymentProfile: Database['public']['Tables']['payment_profile']['Update'] =
      {
        status: payment.status,
      };

    let portalUrl;
    const last4 = payment.last_setup_error?.payment_method?.card?.last4;

    if (typeof payment.customer === 'string') {
      const createPortalResponse = await createPortalSession(payment.customer);
      if (createPortalResponse.msg === 'success') {
        portalUrl = createPortalResponse.url;
      }
    }

    if (!payment?.customer) {
      throw new Error(`Missing payment customer for payment ${payment.id}`);
    }

    // insert new subscription to DB
    const paymentFailed = await supabaseAdmin
      .from('payment_profile')
      .update(paymentProfile)
      .eq('customer_id', payment?.customer)
      .throwOnError();

    const { data: paymentUser } = await supabaseAdmin
      .from('payment_profile')
      .select('last4, patient_id')
      .eq('customer_id', payment?.customer)
      .single()
      .throwOnError();

    if (!paymentUser?.patient_id) {
      throw new Error(`Paymentuser missing for customer ${payment.customer}`);
    }

    const { data: patientInfo } = await supabaseAdmin
      .from('patient')
      .select('profile_id')
      .eq('id', paymentUser.patient_id)
      .single()
      .throwOnError();

    if (!patientInfo?.profile_id) {
      throw new Error(`Profile Id missing for ${paymentUser.patient_id}`);
    }
    const { data: patientEmail } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', patientInfo.profile_id)
      .single()
      .throwOnError();

    await paymentRejected(
      patientInfo.profile_id,
      patientEmail?.email,
      last4 || paymentUser.last4,
      portalUrl
    );

    console.log('setupintent_fail', {
      message: 'failed',
      paymentFailed,
    });
  } catch (err: any) {
    console.error(err);
    throw new Error(
      `Error in failed.ts: ${JSON.stringify(
        err?.message || 'There was an unexpected error'
      )}`
    );
  }
};

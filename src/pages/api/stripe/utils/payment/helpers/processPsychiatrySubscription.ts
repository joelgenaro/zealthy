import { paymentSuccessPsychiatry } from '@/utils/freshpaint/events';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { handleRefillPersonalizedPsychiatry } from './handleRefillPersonalizedPsychiatry';
import { getServiceSupabase } from '@/utils/supabase';

export const processPsychiatrySubscription = async (
  invoice: Stripe.Invoice,
  zealthy_patient_id: string | undefined
) => {
  const stripe = getStripeInstance();
  const supabase = getServiceSupabase();

  try {
    if (invoice.charge) {
      const charge = await stripe.charges.retrieve(invoice.charge as string);

      const email = invoice.customer_email;

      const profileId = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
        .then(({ data }) => data?.id);

      const paymentSucceededAt = new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(invoice.created * 1000));
      const total = `$${invoice.amount_paid / 100}`;
      const cardBrand = charge.payment_method_details?.card?.brand;
      const last4 = charge.payment_method_details?.card?.last4;

      const patientId = await supabase
        .from('patient')
        .select('id')
        .eq('profile_id', profileId)
        .single()
        .then(({ data }) => data?.id);

      const psychiatryAppointments = await supabaseAdmin
        .from('appointment')
        .select(
          '*, clinician!inner(npi_key, profiles!inner (first_name, last_name, email))'
        )
        .eq('patient_id', patientId)
        .eq('status', 'Confirmed')
        .eq('encounter_type', 'Scheduled')
        .eq('care', 'Anxiety or depression');

      const upcomingAppointment = psychiatryAppointments.data?.slice(-1)[0];

      await paymentSuccessPsychiatry(
        profileId,
        email,
        paymentSucceededAt,
        total,
        cardBrand,
        last4,
        `${upcomingAppointment?.clinician?.profiles?.first_name} ${upcomingAppointment?.clinician?.profiles?.last_name}`,
        upcomingAppointment?.clinician?.profiles?.email,
        upcomingAppointment?.clinician?.npi_key
      );
    } else {
      // initial payment or card update
      const customer = (await stripe.customers.retrieve(
        invoice.customer as string,
        {
          expand: ['invoice_settings.default_payment_method'],
        }
      )) as Stripe.Response<
        Stripe.Customer & {
          invoice_settings: {
            default_payment_method: Stripe.PaymentMethod;
          };
        }
      >;

      const price = !!invoice?.lines?.data
        ?.slice(-1)[0]
        ?.description?.includes('Trial period')
        ? 39
        : 99;

      const email = invoice.customer_email;

      const profileId = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
        .then(({ data }) => data?.id);

      const paymentSucceededAt = new Intl.DateTimeFormat('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(invoice.created * 1000));
      const total = `$${price}`;
      const cardBrand =
        customer.invoice_settings.default_payment_method.card?.brand;
      const last4 =
        customer.invoice_settings.default_payment_method.card?.last4;

      console.info(
        JSON.stringify({
          email,
          paymentSucceededAt,
          total,
          cardBrand,
          last4,
        })
      );

      const patientId = await supabase
        .from('patient')
        .select('id')
        .eq('profile_id', profileId)
        .single()
        .then(({ data }) => data?.id);

      const psychiatryAppointments = await supabaseAdmin
        .from('appointment')
        .select(
          '*, clinician!inner(npi_key, profiles!inner (first_name, last_name, email))'
        )
        .eq('patient_id', patientId)
        .eq('status', 'Confirmed')
        .eq('encounter_type', 'Scheduled')
        .eq('care', 'Anxiety or depression');

      const upcomingAppointment = psychiatryAppointments.data?.slice(-1)[0];

      await paymentSuccessPsychiatry(
        profileId,
        email,
        paymentSucceededAt,
        total,
        cardBrand,
        last4,
        `${upcomingAppointment?.clinician?.profiles?.first_name} ${upcomingAppointment?.clinician?.profiles?.last_name}`,
        upcomingAppointment?.clinician?.profiles?.email,
        upcomingAppointment?.clinician?.npi_key
      );
    }
    if (zealthy_patient_id) {
      handleRefillPersonalizedPsychiatry(
        Number(zealthy_patient_id),
        supabaseAdmin
      );
    }
  } catch (err) {
    console.error(err);
  }
};

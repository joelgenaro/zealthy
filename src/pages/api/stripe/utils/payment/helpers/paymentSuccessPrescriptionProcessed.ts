import { paymentSuccessPrescriptionProcessed } from '@/utils/freshpaint/events';
import { getServiceSupabase } from '@/utils/supabase';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';

/**
 *
 * prescriptionPaymentSuccess is called when a Stripe payment is successful and we have the following from the procecssMedicalSubscription function:
 *
 *  prescription?.data?.pharmacy &&
 *  existingPrescriptionOrder &&
 *  recurringSub &&
 *  patientAddress &&
 *  patient
 *
 *
 *
 * @param invoice
 * @param orderId
 * @param medicationName
 * @returns
 */

export const prescriptionPaymentSuccess = async (
  invoice: Stripe.Invoice,
  orderId: number | null | undefined,
  medicationName: string | null | undefined
) => {
  const stripe = getStripeInstance();
  const supabase = getServiceSupabase();

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

    return paymentSuccessPrescriptionProcessed(
      profileId,
      email,
      orderId,
      paymentSucceededAt,
      total,
      cardBrand,
      last4,
      medicationName
    );
  } else {
    console.log(`Could not find a charge for invoice:`);
  }
};

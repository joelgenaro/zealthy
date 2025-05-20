import { OrderPrescriptionProps } from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { fireGLP1PaymentSuccessEvent } from '@/utils/glp1EventHelpers';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';

type SendNotificationsParams = {
  email: string;
  order: OrderPrescriptionProps;
  invoiceDescription: string;
  price: number;
  durationInDays: number;
};

export const sendNotification = async ({
  order,
  invoiceDescription,
  email,
  price,
  durationInDays,
}: SendNotificationsParams) => {
  const stripe = getStripeInstance();

  try {
    // 1. Fetch the order + its related prescription
    const { data: fetchedOrder, error: orderFetchError } = await supabaseAdmin
      .from('order')
      .select('*, prescription_id:prescription(*)')
      .eq('id', order.id)
      .single();

    if (orderFetchError) {
      throw orderFetchError;
    }
    if (!fetchedOrder) {
      throw new Error(`Order not found for id: ${order.id}`);
    }

    // 2. If already fired, skip
    if (fetchedOrder.receipt_sent) {
      console.log(
        `Notification already fired for order ${fetchedOrder.id}. Skipping.`
      );
      return;
    }

    if (!fetchedOrder.patient_id) {
      throw new Error('Order missing patient_id in sendNotification');
    }

    // 3. Retrieve the Stripe customer
    const { data: paymentProfile, error: paymentProfileError } =
      await supabaseAdmin
        .from('payment_profile')
        .select('customer_id')
        .eq('patient_id', fetchedOrder.patient_id)
        .single();

    if (paymentProfileError) {
      throw paymentProfileError;
    }
    if (!paymentProfile?.customer_id) {
      throw new Error(
        `Could not find stripe customer ID for patient: ${fetchedOrder.patient_id}`
      );
    }

    const customer = (await stripe.customers.retrieve(
      paymentProfile.customer_id,
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

    // 4. Determine payment method details
    const paymentMethod = customer.invoice_settings.default_payment_method
      ? {
          id: customer.invoice_settings.default_payment_method.id,
          last4: customer.invoice_settings.default_payment_method.card?.last4,
          exp_year:
            customer.invoice_settings.default_payment_method.card?.exp_year,
          exp_month:
            customer.invoice_settings.default_payment_method.card?.exp_month,
          brand: customer.invoice_settings.default_payment_method.card?.brand,
        }
      : null;

    // 5. Check membership & medication
    const has_216 = invoiceDescription.includes(
      '+ 2 Months Weight Loss Membership'
    );
    const isWeightLoss = isWeightLossMed(
      fetchedOrder.prescription_id?.medication || ''
    );

    // 6. Fire event if conditions met
    if (email && isWeightLoss && !fetchedOrder.receipt_sent) {
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      await fireGLP1PaymentSuccessEvent(
        profileData?.id,
        email,
        fetchedOrder.id,
        fetchedOrder.created_at!,
        price / 100,
        paymentMethod?.brand,
        paymentMethod?.last4,
        durationInDays,
        fetchedOrder.prescription_id?.pharmacy,
        fetchedOrder.prescription_id,
        has_216
      );
    }

    // 7. Mark the order as having fired the event
    const { error: updateError } = await supabaseAdmin
      .from('order')
      .update({ receipt_sent: true })
      .eq('id', fetchedOrder.id);

    if (updateError) {
      throw updateError;
    }
  } catch (err) {
    const message = getErrorMessage(err);
    console.error('[sendNotification] ERROR:', message);
  }
};

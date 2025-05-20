import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import getStripeInstance from '../../createClient';

export const manageCustomerCreate = async (customer: Stripe.Customer) => {
  const stripe = getStripeInstance();

  try {
    // destructure zealthy patient id and customer id
    const {
      id: customer_id,
      metadata: { zealthy_patient_id },
    } = customer;

    const fetchedCustomer = (await stripe.customers.retrieve(customer_id, {
      expand: ['default_source', 'invoice_settings.default_payment_method'],
    })) as Stripe.Response<
      Stripe.Customer & {
        default_source: Stripe.Card;
        invoice_settings: {
          default_payment_method: Stripe.PaymentMethod;
        };
      }
    >;

    //check if already exist
    const paymentProfile = await supabaseAdmin
      .from('payment_profile')
      .select('customer_id')
      .eq('customer_id', customer_id)
      .eq('patient_id', Number(zealthy_patient_id))
      .single()
      .then(({ data }) => data);

    if (!paymentProfile) {
      const newPaymentProfile: Database['public']['Tables']['payment_profile']['Insert'] =
        {
          patient_id: Number(zealthy_patient_id),
          processor: 'Stripe',
          customer_id,
          last4:
            fetchedCustomer.default_source?.last4 ||
            fetchedCustomer.invoice_settings.default_payment_method?.card
              ?.last4,
        };

      const { error: profileError } = await supabaseAdmin
        .from('payment_profile')
        .insert([newPaymentProfile]);

      if (profileError) {
        console.error(
          `error creating payment profile for patient: ${zealthy_patient_id}`,
          { profileError }
        );
        throw new Error(
          `error creating payment profile for patient: ${zealthy_patient_id}`
        );
      }

      console.info(
        `Successfully created stripe customer for patient: ${zealthy_patient_id}`
      );
      return {
        status: 200,
        message: `Successfully created stripe customer for patient: ${zealthy_patient_id}`,
      };
    }
  } catch (err: any) {
    console.error('man_cus_create_err', { err });
    throw new Error(
      `Error in stripe customer create: ${
        err?.message || 'There was an unexpected error'
      }`
    );
  }
};

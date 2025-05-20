import { Database } from '@/lib/database.types';
import { daysFromNow } from '@/utils/date-fns';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { getOrderInvoiceDescription } from '@/utils/getOrderInvoiceDescription';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import addDays from 'date-fns/addDays';
import getUnixTime from 'date-fns/getUnixTime';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';
import { processHallandalePharmacyOrder } from '../../stripe/utils/payment/helpers/processHallandalePharmacyOrder';
import { chargeThroughInvoice } from '../../utils/chargeThroughInvoice';

export default async function payForORder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { existingOrder } = req.body;

    const supabase = createServerSupabaseClient<Database>({ req, res });

    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session)
      return res.status(401).json({
        message: 'not_authenticated',
        description:
          'The user does not have an active session or is not authenticated',
        error: new Error(' Not Authorized'),
      });

    const patientStripe = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', existingOrder.patient_id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (!patientStripe?.customer_id) {
      throw new Error(
        `Patient ${existingOrder.patient_id} does not have stripe id`
      );
    }

    const invoiceDescription = getOrderInvoiceDescription(
      'Skincare',
      existingOrder.prescription.medication || '',
      existingOrder.refill_count || 0,
      existingOrder.prescription.dispense_quantity || 0
    );

    const invoiceStatus = await chargeThroughInvoice(
      patientStripe.customer_id,
      {
        amount: existingOrder.total_price * 100,
        patientId: existingOrder.patient_id,
        currency: 'usd',
        description: invoiceDescription,
        metadata: {
          zealthy_patient_id: existingOrder.patient_id,
          zealthy_care: 'Skincare',
          zealthy_product_name: 'Skincare',
        },
      }
    );

    //handle unpaid invoice
    if (invoiceStatus === 'failed') {
      console.log({
        message: `Order ${existingOrder.id} is not paid`,
        zealthy_order_id: existingOrder.id,
        zealthy_prescription_id: existingOrder.prescription_id,
        zealthy_patient_id: existingOrder.patient_id,
      });

      await supabase
        .from('order')
        .update({
          order_status: 'PAYMENT_FAILED',
          attempted_count: 1,
          total_price: existingOrder.total_price,
        })
        .eq('id', existingOrder.id);

      res.status(200).json(existingOrder);
      return;
    }

    //handle paid invoice
    const subscription = await stripe.subscriptions.create({
      customer: patientStripe.customer_id,
      trial_end: daysFromNow(existingOrder.prescription.duration_in_days || 30),
      cancel_at: getUnixTime(
        addDays(
          new Date(),
          ((existingOrder.prescription.count_of_refills_allowed || 0) + 1) *
            (existingOrder.prescription.duration_in_days || 30)
        )
      ),
      items: [
        {
          price_data: {
            unit_amount: existingOrder.total_price * 100,
            currency: 'usd',
            product:
              process.env.VERCEL_ENV === 'production'
                ? 'prod_NwpuVp8xHH6YNK'
                : 'prod_NsjVtgm1CFPTJq',
            recurring: {
              interval: 'month',
              interval_count: 3,
            },
          },
        },
      ],
      metadata: {
        zealthy_patient_id: existingOrder.patient_id,
        zealthy_subscription_id: 5,
        zealthy_order_id: existingOrder.id,
        zealthy_care: 'Skincare',
        zealthy_product_name: existingOrder.prescription.medication,
      },
    });

    if (['trialing', 'active'].includes(subscription.status)) {
      console.log('created_sub', {
        message: `Created stripe subscription ${subscription.id} with status ${subscription.status}`,
        zealthy_order_id: existingOrder.id,
        zealthy_prescription_id: existingOrder.prescription_id,
        zealthy_patient_id: existingOrder.patient_id,
      });

      if (existingOrder.prescription_id) {
        await supabase
          .from('prescription')
          .update({ subscription_id: subscription.id })
          .eq('id', existingOrder.prescription_id);
      }

      await supabase
        .from('order')
        .update({
          amount_paid: existingOrder.total_price,
          total_price: existingOrder.total_price,
          order_status: 'PAYMENT_SUCCESS',
          errored: false,
          error_details: null,
        })
        .eq('id', existingOrder.id);

      if (
        existingOrder.prescription.medication ===
        'ACNE ULTRA (CLINDAMYCIN / NIACINAMIDE / TRETINOIN)'
      ) {
        const patient = await supabase
          .from('patient')
          .select('*, profiles!inner(*)')
          .eq('id', existingOrder.patient_id)
          .single()
          .then(({ data }) => data);
        const patientAddress = await supabase
          .from('address')
          .select('*')
          .eq('patient_id', existingOrder.patient_id)
          .single()
          .then(({ data }) => data);

        const response = await processHallandalePharmacyOrder(
          patient!,
          [existingOrder],
          patientAddress!
        );
        console.log(response, 'HALLANDALE RESPONSE');
      }

      res.status(200).json(existingOrder);
      return;
    }

    console.log('sub_create_failure', {
      message: `Could not create stripe subscription. Subscription status is ${subscription.status}`,
      zealthy_order_id: existingOrder.id,
      zealthy_prescription_id: existingOrder.prescription_id,
      zealthy_patient_id: existingOrder.patient_id,
    });

    await supabase
      .from('order')
      .update({
        order_status: 'PAYMENT_FAILED',
        attempted_count: 1,
        total_price: existingOrder.total_price,
      })
      .eq('id', existingOrder.id);

    res.status(200).json(existingOrder);
    return;
  } catch (err) {
    console.log('HERE IN CATCH');
    const error = getErrorMessage(err);
    console.error(error);
    return res.status(404).json(error || 'There was an unexpected error');
  }
}

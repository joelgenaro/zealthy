import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '@/pages/api/stripe/createClient';

type Patient = Database['public']['Tables']['patient']['Row'];

export const handleGLP1Eligibility = async (patient: Patient) => {
  const stripe = getStripeInstance();

  try {
    //fetch weight loss prescription
    const subscription = await supabaseAdmin
      .from('patient_subscription')
      .select('*')
      .eq('patient_id', patient.id)
      .in('price', [449, 297])
      .ilike('subscription.name', '%Weight loss%')
      .throwOnError()
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (!subscription) {
      throw new Error(
        `Could not find weight loss bundle subscription for patient: ${patient.id}`
      );
    }

    const firstMonthPrice = subscription.price === 449 ? 349 : 217;

    const invoice = await supabaseAdmin
      .from('invoice')
      .select('*')
      .eq('is_refunded', false)
      .eq('patient_id', patient.id)
      .eq('amount_paid', firstMonthPrice)
      .throwOnError()
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (!invoice || !invoice.charge) {
      throw new Error(
        `Could not find invoice for amount: ${firstMonthPrice} subscription: ${subscription.reference_id}, patient: ${patient.id}`
      );
    }

    const refund = await stripe.refunds.create({
      charge: invoice.charge,
      amount: firstMonthPrice,
    });

    if (refund.status !== 'succeeded') {
      throw new Error(
        `Something went wrong while issuing refund for ${invoice.charge} for amount: ${firstMonthPrice}`
      );
    }

    console.info({
      message: `Successfully refunded ${invoice.charge} for patient ${patient.id}`,
    });

    //refund
  } catch (err) {
    throw err;
  }
};

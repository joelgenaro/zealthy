import {
  Order,
  PaymentAddonResponseData,
} from '@/components/screens/Checkout/types';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { Database } from '@/lib/database.types';
import { Patient } from '@/types/api/checkout';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import getStripeInstance from '../../stripe/createClient';

type RequestData = {
  coaching: Order['coaching'][number];
  patient: Patient;
  // couponName?: string;
};

const mapCoachingTypeToCoupon = {
  [CoachingType.MENTAL_HEALTH]: process.env.STRIPE_MENTAL_HEALTH_COUPON,
  [CoachingType.WEIGHT_LOSS]: process.env.STRIPE_WEIGHT_LOSS_COUPON,
  [CoachingType.PERSONALIZED_PSYCHIATRY]: process.env.STRIPE_PSYCHIATRY_COUPON,
};

const mapCoachingTypeToDescription = {
  [CoachingType.MENTAL_HEALTH]: 'Mental Health Coaching Membership',
  [CoachingType.WEIGHT_LOSS]: 'Weight Loss Coaching Membership',
  [CoachingType.PERSONALIZED_PSYCHIATRY]: 'Personalized Psychiatry Membership',
};

const mapCoachingTypeToCare = {
  [CoachingType.MENTAL_HEALTH]: 'Anxiety or depression',
  [CoachingType.WEIGHT_LOSS]: 'Weight loss',
  [CoachingType.PERSONALIZED_PSYCHIATRY]: 'Anxiety or depression',
};

const mapCoachingTypeToProduct = {
  [CoachingType.MENTAL_HEALTH]: 'Mental Health Coaching',
  [CoachingType.WEIGHT_LOSS]: 'Weight Loss Coaching',
  [CoachingType.PERSONALIZED_PSYCHIATRY]: 'Personalized Psychiatry',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentAddonResponseData>
) {
  const stripe = getStripeInstance();

  const { patient, coaching } = req.body as RequestData;
  try {
    // create supabase client
    const supabase = createServerSupabaseClient<Database>(
      { req, res },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    );

    // check if paymentProfile exist
    const { data: paymentProfile } = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patient.id)
      .single();

    let customer_id = paymentProfile?.customer_id;

    if (!customer_id) {
      res.status(422).json({ message: 'Payment information not found' });
      return;
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer_id!,
      collection_method: 'charge_automatically',
      description: mapCoachingTypeToDescription[coaching.type],
      items: [
        {
          price: coaching.planId,
        },
      ],
      coupon: mapCoachingTypeToCoupon[coaching.type],
      metadata: {
        zealthy_subscription_id: coaching.id,
        resource: 'subscription',
        zealthy_patient_id: patient.id,
        zealthy_care: mapCoachingTypeToCare[coaching.type],
        zealthy_product_name: mapCoachingTypeToProduct[coaching.type],
      },
    });

    res.status(200).json({ subscription });
  } catch (err) {
    console.error(`Error in payment add on for patient ${patient?.id}: ${err}`);
    res.status(400).json({ message: (err as Error).message });
  }
}

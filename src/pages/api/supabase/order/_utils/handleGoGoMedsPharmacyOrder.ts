import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '@/pages/api/stripe/createClient';
import { calculatedSpecificCare } from '@/pages/api/utils/calculate-specific-care';
import { chargeThroughInvoice } from '@/pages/api/utils/chargeThroughInvoice';
import { daysFromNow } from '@/utils/date-fns';
import axios from 'axios';
import {
  getOrderInvoiceDescription,
  getOrderInvoiceProduct,
} from '@/utils/getOrderInvoiceDescription';
import { addDays, getUnixTime } from 'date-fns';
import Stripe from 'stripe';
import { PatientProps } from '@/components/hooks/data';
import VWOClient from '@/lib/vwo/client';

type Order = Database['public']['Tables']['order']['Row'];
type Prescription = Database['public']['Tables']['prescription']['Row'];
type MedicationQuantity = Pick<
  Database['public']['Tables']['medication_quantity']['Row'],
  'id' | 'price'
>;

const medicationNames = [
  'metformin',
  'bupropion',
  'naltrexone',
  'citalopram',
  'escitalopram',
  'fluoxetine',
  'paroxetine',
  'sertraline',
];

const calculateTotalPrice = async (patientId: number, medName: string) => {
  const subscriptions = await supabaseAdmin
    .from('patient_subscription')
    .select('*, subscription(*)')
    .eq('patient_id', patientId)
    .or('name.ilike.%weight loss%,name.ilike.%personalized psychiatry%', {
      foreignTable: 'subscription',
    })
    .then(({ data }) => data || []);

  let price = -1;

  if (subscriptions.length && medicationNames.find(m => medName.includes(m))) {
    price = 0;
  }

  console.log({
    message: `Calculated total price for ${medName} is ${price}`,
    zealthy_patient_id: patientId,
  });

  return price;
};

const handleCouldNotCalculatePrice = async ({
  orderId,
  prescriptionId,
  patientId,
}: {
  orderId: number;
  prescriptionId: number;
  patientId: number;
}) => {
  console.log({
    message: `Could not calculate price for order: ${orderId}`,
    zealthy_order_id: orderId,
    zealthy_patient_id: patientId,
    zealthy_prescription_id: prescriptionId,
  });

  return Promise.all([
    supabaseAdmin
      .from('prescription')
      .update({ status: 'CHANGE_PRODUCT' })
      .eq('id', prescriptionId),

    supabaseAdmin
      .from('order')
      .update({ order_status: 'CANCELLED' })
      .eq('id', orderId),
  ]);
};

const handleGoGoMedsPriceLookup = async (prescription: Prescription) => {
  if (!prescription.national_drug_code) {
    throw new Error(
      `handleGoGoMedsPriceLookup => Prescription ${prescription.id} does not have NDC defined`
    );
  }

  const auth = await axios.post(
    `${process.env.GOGOMEDS_BASE_URL}/token`,
    `grant_type=password&username=${process.env.GOGOMEDS_USERNAME}&password=${process.env.GOGOMEDS_PASSWORD}`
  );

  const lookupParams = {
    method: 'POST',
    url: `${process.env.GOGOMEDS_BASE_URL}/api/affiliate/SearchPrices`,
    headers: {
      Authorization: `Bearer ${auth.data?.access_token}`,
    },
    data: { NDC11: prescription.national_drug_code },
  };

  const result = await axios(lookupParams);

  const gogoPrice =
    result.data?.Value?.[0]?.Pricing?.PriceGroup?.[0]?.PricePerUnit;

  if (gogoPrice && prescription.dispense_quantity) {
    return gogoPrice * prescription.dispense_quantity;
  }

  return null;
};

const totalZealthyCharge = (price?: number | null) => {
  if (!price) return 0;
  if (price < 2.99) return price * 4;
  if (price < 9.99) return price * 3;
  if (price < 19.99) return price * 2.5;
  return Infinity;
};

type CashPricingType = {
  prescription: Prescription;
  ourPrice?: number | null;
  shippingId: number;
};

const handleCashPrice = async ({
  prescription,
  ourPrice,
  shippingId,
}: CashPricingType) => {
  if (ourPrice) {
    const cashPrice = Math.round(ourPrice) + (shippingId === 2 ? 15 : 0);

    console.log({
      message: `Cash price for prescription ${prescription.id} - ${prescription.medication} is ${cashPrice} based on our DB`,
      zealthy_prescription_id: prescription.id,
      zealthy_patient_id: prescription.patient_id,
    });

    return cashPrice;
  }

  const gogoMedPrice = await handleGoGoMedsPriceLookup(prescription);
  const cashPrice = totalZealthyCharge(gogoMedPrice);

  console.log({
    message: `Cash price for prescription ${prescription.id} - ${prescription.medication} is ${cashPrice} based on GoGoMeds pricing`,
    zealthy_prescription_id: prescription.id,
    zealthy_patient_id: prescription.patient_id,
  });

  return cashPrice;
};

const handleShipping = async (
  patientId: number,
  medicationQuantityId?: number | null
) => {
  if (!medicationQuantityId) {
    return 1;
  }

  return supabaseAdmin
    .from('prescription_request')
    .select('shipping_method')
    .match({
      patient_id: patientId,
      medication_quantity_id: medicationQuantityId,
    })
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
    .then(({ data }) => data?.shipping_method || 1);
};

export const handleGoGoMedsPharmacyOrder = async (order: Order) => {
  const stripe = getStripeInstance();
  const vwoInstance = await VWOClient.getInstance(supabaseAdmin);
  const patient = await supabaseAdmin
    .from('patient')
    .select(`*, profiles (*)`)
    .eq('id', order.patient_id!)
    .maybeSingle()
    .then(({ data }) => data as PatientProps);

  if (!!order.gogo_order_id || order.order_status === 'SENT_TO_GOGO') {
    console.log({
      message: `Order ${order.id} has already been sent to GoGo`,
    });
    return order.gogo_order_id;
  }

  if (!order.prescription_id) {
    throw new Error(`Order ${order.id} does not have prescription`);
  }

  try {
    const prescription = await supabaseAdmin
      .from('prescription')
      .select('*')
      .eq('id', order.prescription_id)
      .maybeSingle()
      .then(({ data }) => data);

    if (!prescription) {
      throw new Error(
        `Could not find prescription for id: ${order.prescription_id}`
      );
    }

    if (!prescription.patient_id || !prescription.clinician_id) {
      throw new Error(
        `Prescription ${
          prescription.id
        } does not have patient_id or clinician_id: ${JSON.stringify(
          prescription
        )}`
      );
    }

    //if it is not gogo meds pharmacy it is local pharmacy
    if (
      !prescription.pharmacy
        ?.toLowerCase()
        .includes(process.env.DEFAULT_PHARMACY || 'gogo')
    ) {
      await supabaseAdmin
        .from('order')
        .update({ order_status: 'SENT_TO_LOCAL_PHARMACY' })
        .eq('id', order.id);

      return;
    }

    const patientAddress = await supabaseAdmin
      .from('address')
      .select()
      .eq('patient_id', prescription.patient_id)
      .maybeSingle()
      .then(({ data }) => data);

    if (!patientAddress) {
      throw new Error(
        `Patient ${prescription.patient_id} does not have address`
      );
    }

    let medicationQuantity: MedicationQuantity | null = null;

    if (prescription.medication_quantity_id) {
      medicationQuantity = await supabaseAdmin
        .from('medication_quantity')
        .select('id, price')
        .eq('id', prescription.medication_quantity_id)
        .maybeSingle()
        .then(({ data }) => data);
    }

    //find shipping details
    const shippingId = await handleShipping(
      prescription.patient_id,
      medicationQuantity?.id
    );

    const cashPrice = await handleCashPrice({
      prescription,
      ourPrice: medicationQuantity?.price,
      shippingId,
    });

    //handle could not calculate price
    if (cashPrice === Infinity) {
      await handleCouldNotCalculatePrice({
        orderId: order.id,
        patientId: prescription.patient_id,
        prescriptionId: prescription.id,
      });

      return;
    }

    //handle payment
    let prescriptionCoupon = null;

    if (medicationQuantity?.id) {
      prescriptionCoupon = await supabaseAdmin
        .from('prescription_request')
        .select('discounted_price, status, total_price')
        .eq('patient_id', prescription.patient_id)
        .eq('medication_quantity_id', medicationQuantity.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => data);

      if (!prescriptionCoupon) {
        prescriptionCoupon = await supabaseAdmin
          .from('prescription_request')
          .select('discounted_price, status, total_price')
          .eq('patient_id', prescription.patient_id)
          .eq('type', 'Mental health')
          .is('medication_quantity_id', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
          .then(({ data }) => data);
      }
    }

    let unitAmount = await calculateTotalPrice(
      prescription.patient_id,
      prescription.medication?.toLowerCase() || ''
    );

    if (unitAmount < 0) {
      unitAmount =
        prescriptionCoupon?.status === 'APPROVED' &&
        prescriptionCoupon?.discounted_price
          ? Math.round(prescriptionCoupon.discounted_price)
          : Math.round(cashPrice);
    }

    const zealthyCare = await calculatedSpecificCare(
      prescription.national_drug_code || ''
    );

    const patientStripe = await supabaseAdmin
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', prescription.patient_id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data);

    if (!patientStripe?.customer_id) {
      throw new Error(
        `Patient ${prescription.patient_id} does not have stripe id`
      );
    }

    const invoiceDescription = getOrderInvoiceDescription(
      zealthyCare,
      prescription.medication || '',
      order.refill_count || 0,
      prescription.dispense_quantity || 0
    );

    const invoiceStatus = await chargeThroughInvoice(
      patientStripe.customer_id,
      {
        amount: unitAmount * 100,
        patientId: prescription.patient_id,
        currency: 'usd',
        description: invoiceDescription,
        metadata: {
          zealthy_patient_id: prescription.patient_id,
          zealthy_care: zealthyCare,
          zealthy_product_name: getOrderInvoiceProduct(
            zealthyCare,
            prescription.dispense_quantity || 0
          ),
          zealthy_gg_order_id: order.id,
        },
      }
    );

    //handle unpaid invoice
    if (invoiceStatus === 'failed') {
      console.log({
        message: `Order ${order.id} is not paid`,
        zealthy_order_id: order.id,
        zealthy_prescription_id: prescription.id,
        zealthy_patient_id: prescription.patient_id,
      });

      await supabaseAdmin
        .from('order')
        .update({
          order_status: 'PAYMENT_FAILED',
          attempted_count: 1,
          total_price: unitAmount,
        })
        .eq('id', order.id);

      return;
    }

    const medication_ids =
      process.env.VERCEL_ENV === 'production'
        ? [
            75, 77, 78, 79, 80, 82, 83, 89, 90, 91, 92, 94, 327, 503, 504, 505,
            506, 507, 125,
          ]
        : [467, 468, 469, 470, 471, 125];

    //handle paid invoice
    if (
      medicationQuantity?.id &&
      medication_ids.includes(medicationQuantity?.id)
    ) {
      await supabaseAdmin
        .from('order')
        .update({
          amount_paid: unitAmount,
          total_price: unitAmount,
          order_status: 'PAYMENT_SUCCESS',
          errored: false,
          error_details: null,
        })
        .eq('id', order.id);

      return;
    } else if (
      zealthyCare.toLowerCase() !== 'mental health' ||
      (zealthyCare.toLowerCase() === 'mental health' &&
        prescription?.dispense_quantity !== 30)
    ) {
      let subscriptionData: Stripe.SubscriptionCreateParams;
      if (zealthyCare.toLowerCase() === 'sleep') {
        const devOptions = {
          30: 'price_1QCTyNAO83GerSecN8RUcvIk',
          60: 'price_1QCTyyAO83GerSecgFiXxmMi',
          120: 'price_1QCTzOAO83GerSecQpch6vZM',
        };
        const prodOptions = {
          30: 'price_1Q3RjyAO83GerSecqtBndpCS',
          60: 'price_1Q3RkZAO83GerSecP6B8M6jN',
          120: 'price_1Q3Rl1AO83GerSecVtMjQ2NO',
        };

        const options =
          process.env.VERCEL_ENV === 'production' ? prodOptions : devOptions;
        const duration = prescription.duration_in_days ?? 30;

        subscriptionData = {
          customer: patientStripe.customer_id,
          trial_end: daysFromNow(prescription.duration_in_days || 30),
          items: [
            {
              price: options[duration as 30 | 60 | 120],
            },
          ],
          metadata: {
            zealthy_patient_id: prescription.patient_id,
            zealthy_subscription_id: 5,
            zealthy_order_id: order.id,
            zealthy_care: zealthyCare,
            zealthy_product_name: prescription.medication,
          },
        };
      } else {
        subscriptionData = {
          customer: patientStripe.customer_id,
          trial_end: daysFromNow(prescription.duration_in_days || 30),
          items: [
            {
              price_data: {
                unit_amount:
                  (prescriptionCoupon
                    ? prescriptionCoupon.total_price!
                    : order.total_price!) * 100,
                currency: 'usd',
                product:
                  process.env.VERCEL_ENV === 'production'
                    ? 'prod_NwpuVp8xHH6YNK'
                    : 'prod_NsjVtgm1CFPTJq',
                recurring: {
                  interval: 'day',
                  interval_count: prescription.duration_in_days || 30,
                },
              },
            },
          ],
          metadata: {
            zealthy_patient_id: prescription.patient_id,
            zealthy_subscription_id: 5,
            zealthy_order_id: order.id,
            zealthy_care: zealthyCare,
            zealthy_product_name: prescription.medication,
          },
        };
        console.log('subscriptionData', subscriptionData);
      }

      const subscription = await stripe.subscriptions.create(subscriptionData);

      if (['trialing', 'active'].includes(subscription.status)) {
        console.log('created_sub', {
          message: `Created stripe subscription ${subscription.id} with status ${subscription.status}`,
          zealthy_order_id: order.id,
          zealthy_prescription_id: prescription.id,
          zealthy_patient_id: prescription.patient_id,
        });

        if (order.prescription_id) {
          await supabaseAdmin
            .from('prescription')
            .update({ subscription_id: subscription.id })
            .eq('id', order.prescription_id);
        }

        await supabaseAdmin
          .from('order')
          .update({
            amount_paid: unitAmount,
            total_price: unitAmount,
            order_status: 'PAYMENT_SUCCESS',
            errored: false,
            error_details: null,
          })
          .eq('id', order.id);
        return;
      }

      console.log('sub_create_failure', {
        message: `Could not create stripe subscription. Subscription status is ${subscription.status}`,
        zealthy_order_id: order.id,
        zealthy_prescription_id: prescription.id,
        zealthy_patient_id: prescription.patient_id,
      });

      await supabaseAdmin
        .from('order')
        .update({
          order_status: 'PAYMENT_FAILED',
          attempted_count: 1,
          total_price: unitAmount,
        })
        .eq('id', order.id);
    }

    return;
  } catch (err) {
    throw err;
  }
};

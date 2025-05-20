import {
  Invoice,
  OrderPrescriptionProps,
  PatientProps,
} from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import { handleRecurringWeightLossSubscription } from './_helpers/handleRecurringWeightLossSubscription';
import { inferSubscriptionMetadata } from './_helpers/inferSubscriptionMetadata';
import { processHallandalePharmacyOrder } from '../payment/helpers/processHallandalePharmacyOrder';
import { processEmpowerPharmacyOrder } from '../payment/helpers/processEmpowerPharmacyOrder';
import { processBelmarPharmacyOrder } from '../payment/helpers/processBelmarPharmacyOrder';
import { Database } from '@/lib/database.types';
import { addDays, format } from 'date-fns';
import { prescriptionPaymentSuccess } from '../payment/helpers/paymentSuccessPrescriptionProcessed';
import { prescriptionRenewalEvent } from '@/utils/freshpaint/events';

export const payInvoice = async (invoice: Stripe.Invoice) => {
  try {
    //subscription_cycle for renewals and subscription_update if we want to manually test renewals
    if (
      !['subscription_update', 'subscription_cycle'].includes(
        invoice.billing_reason ?? ''
      )
    ) {
      console.log('This is not a subscription renewal event:', invoice.id);
      return;
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const isSubscriptionInvoice = Boolean(invoice.subscription);
    const prescription =
      invoice.subscription && isSubscriptionInvoice
        ? await supabaseAdmin
            .from('prescription')
            .select('*, order(*)')
            .eq('subscription_id', invoice.subscription)
            .limit(1)
            .maybeSingle()
        : null;

    const isOneOffInvoice = !isSubscriptionInvoice;

    const isFreeConsultMembership = invoice.amount_due === 7499;

    const mostRecentOrder = prescription?.data?.id
      ? await supabaseAdmin
          .from('order')
          .select('id')
          .eq('prescription_id', prescription?.data?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(data => data.data)
      : null;

    console.log('FOUND MOST RECENT ORDER! ORDER ID: ', mostRecentOrder?.id);
    const orderID =
      mostRecentOrder?.id ||
      invoice?.lines?.data?.slice(-1)[0]?.metadata?.zealthy_order_id;

    if (!invoice.customer) {
      throw new Error(`Missing invoice customer for invoice ${invoice.id}`);
    }

    const patientId = await supabaseAdmin
      .from('payment_profile')
      .select('patient_id')
      .eq('customer_id', invoice.customer)
      .limit(1)
      .maybeSingle()
      .throwOnError()
      .then(({ data }) => data?.patient_id);

    let nextPaymentAttempt = null;
    if (invoice.next_payment_attempt) {
      nextPaymentAttempt = new Date(
        invoice.next_payment_attempt * 1000
      ).toISOString();
    }

    if (isSubscriptionInvoice && patientId && !isFreeConsultMembership) {
      const patient = await supabaseAdmin
        .from('patient')
        .select(
          `
          *,
          profiles!inner (
            first_name,
            last_name,
            birth_date,
            gender,
            phone_number,
            email
          )
        `
        )
        .eq('id', patientId)
        .single()
        .throwOnError()
        .then(({ data }) => data as unknown as PatientProps);

      let previousOrder = null;
      if (orderID) {
        previousOrder = await supabaseAdmin
          .from('order')
          .select(`*, prescription (*)`)
          .eq('id', orderID)
          .filter('created_at', 'lt', fiveMinutesAgo)
          .limit(1)
          .throwOnError()
          .then(({ data }) => data?.[0] as OrderPrescriptionProps);
      }

      if (!previousOrder) {
        console.log(`No matching order found for invoice ${invoice.id}`);
        return;
      }

      if (previousOrder) {
        console.log('Previous order found:', previousOrder.id);
      }

      if (prescription?.data?.status === 'expired') {
        console.log('PRESCRIPTION IS EXPIRED! ID: ', prescription.data.id);
        return;
      }

      const isBundlePlan =
        !!invoice.lines?.data?.slice(-1)[0]?.metadata?.zealthy_bundled;
      if (isBundlePlan) {
        console.log('Is bundled plan, payment success will handle order.');
        return;
      }

      const amountPaid = Math.round(invoice?.amount_paid / 100);

      console.log({
        patient_id: previousOrder?.patient_id,
        prescription_id: previousOrder?.prescription_id,
        national_drug_code: previousOrder?.national_drug_code || null,
        total_price: previousOrder?.total_price,
        shipment_method_id: previousOrder?.shipment_method_id,
        refill_count: (previousOrder?.refill_count || 0) + 1,
        total_dose: previousOrder?.total_dose,
        group_id: previousOrder?.group_id,
        invoice_id: invoice?.id,
        amount_paid: amountPaid,
      });

      const { data: refillOrder, error: newOrderError } = await supabaseAdmin
        .from('order')
        .insert({
          patient_id:
            prescription?.data?.patient_id || previousOrder?.patient_id,
          prescription_id:
            prescription?.data?.id || previousOrder?.prescription_id,
          national_drug_code: previousOrder?.national_drug_code || null,
          total_price: amountPaid,
          shipment_method_id: previousOrder?.shipment_method_id,
          order_status: 'PAYMENT_SUCCESS',
          refill_count: (previousOrder?.refill_count || 0) + 1,
          total_dose: previousOrder?.total_dose,
          group_id: previousOrder?.group_id,
          invoice_id: invoice?.id,
          amount_paid: amountPaid,
          prescription_request_id: previousOrder.prescription_request_id,
          clinician_id: prescription?.data?.clinician_id,
        })
        .select(
          `*, prescription(*), clinician!order_clinician_id_fkey(*, profiles!inner(*))`
        )
        .single();

      if (newOrderError) {
        console.log(newOrderError);
      }

      if (!refillOrder?.id || newOrderError) {
        throw new Error(`Failed to create new order for invoice ${invoice.id}`);
      }

      const { data: patientAddress } = await supabaseAdmin
        .from('address')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      console.log('Sending refill order to pharmacy...');

      if (
        previousOrder?.hallandale_order_id ||
        previousOrder.prescription?.pharmacy?.toLowerCase() === 'hallandale'
      ) {
        await processHallandalePharmacyOrder(
          patient,
          [refillOrder],
          patientAddress as Database['public']['Tables']['address']['Row']
        );
      } else if (
        previousOrder?.gogo_order_id ||
        previousOrder.prescription?.pharmacy?.toLowerCase().includes('gogo') ||
        previousOrder.prescription?.pharmacy?.toLowerCase().includes('gogomeds')
      ) {
        try {
          const token = await fetch(
            'https://app.getzealthy.com/api/gogomeds/auth'
          )
            .then(res => res.json())
            .catch(e => e);

          const gogoOrder = {
            AffiliateOrderNumber: refillOrder.id.toString(),
            ShipmentMethodId: refillOrder.shipment_method_id || 1,
            Customer: {
              AffiliateCustomerNumber: refillOrder?.patient_id?.toString(),
              Email: patient.profiles?.email,
              FirstName: patient.profiles?.first_name,
              LastName: patient.profiles?.last_name,
              DOB: format(
                new Date(patient.profiles?.birth_date ?? ''),
                'MM/dd/yyyy'
              ),
              Gender:
                patient.profiles?.gender?.split('')[0].toUpperCase() || 'U',
              PhoneNumber: patient.profiles?.phone_number,
              IsPregnant: false,
              HasAllergies: false,
              HasMedicalConditions: false,
              HasCurrentMedications: false,
              Address: {
                Line1: patientAddress?.address_line_1,
                Line2: patientAddress?.address_line_2 || ', ',
                City: patientAddress?.city,
                State: patientAddress?.state,
                Zip: patientAddress?.zip_code,
              },
            },
            Payment: {
              BillAffiliate: true,
              FirstName: patient.profiles?.first_name,
              LastName: patient.profiles?.last_name,
            },
            Drugs: [
              {
                ...(refillOrder.national_drug_code === '7070016406'
                  ? { UPC: refillOrder.national_drug_code }
                  : { NDC: refillOrder.national_drug_code }),
                Quantity: refillOrder.prescription?.dispense_quantity,
                PrescriptionSourceId: 1,
                CashPrice: refillOrder.total_price,
                Prescriber: {
                  NPI: refillOrder.clinician?.npi_key
                    ? parseInt(refillOrder.clinician.npi_key, 10)
                    : 0,
                  FirstName: refillOrder.clinician?.profiles?.first_name,
                  LastName: refillOrder.clinician?.profiles?.last_name,
                  Address: {
                    Line1: '429 Lenox Ave',
                    Line2: ', ',
                    City: 'Miami Beach',
                    State: 'FL',
                    Zip: '33139',
                  },
                },
              },
            ],
          };

          console.log(
            'Sending order payload:',
            JSON.stringify(gogoOrder, null, 2)
          );

          const response = await fetch(
            'https://app.getzealthy.com/api/gogomeds/create_order',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ order: gogoOrder, token }),
            }
          );

          const data = await response.json();

          if (data.success) {
            const createOrder = data;
            const updatedParams = {
              gogo_order_id: createOrder?.Value[0]?.OrderId,
              order_contact_number: createOrder?.Value[0]?.OrderContactNumber,
              tracking_URL: createOrder?.Value[0]?.TrackingURL,
              delivery_provider: createOrder?.Value[0]?.DeliveryProvider,
              shipment_method: createOrder?.Value[0]?.ShipmentMethod,
              shipment_method_id: createOrder?.Value[0]?.ShipmentMethodId,
              order_status: 'SENT_TO_GOGOMEDS',
            };

            await supabaseAdmin
              .from('order')
              .update(updatedParams)
              .eq('id', refillOrder?.id);
          }
        } catch (error) {
          console.error('Error handling GogoMeds order:', error);
          throw error;
        }
      } else if (
        previousOrder?.empower_order_id ||
        previousOrder.prescription?.pharmacy?.toLowerCase() === 'empower'
      ) {
        await processEmpowerPharmacyOrder(
          patient,
          [refillOrder],
          patientAddress as Database['public']['Tables']['address']['Row']
        );
      } else if (
        previousOrder?.belmar_order_id ||
        previousOrder.prescription?.pharmacy?.toLowerCase() === 'belmar'
      ) {
        await processBelmarPharmacyOrder(
          patient,
          [refillOrder],
          patientAddress as Database['public']['Tables']['address']['Row']
        );
      }

      const updatedOrder = await supabaseAdmin
        .from('order')
        .select('*, prescription!inner(*)')
        .eq('id', refillOrder.id)
        .limit(1)
        .maybeSingle();
      const refillsForPrescription = refillOrder.refill_count;
      console.log('VARUN REFILLS FOR PRESCRIPTION: ', refillsForPrescription);
      if (
        (refillsForPrescription || 0) >=
          (updatedOrder?.data?.prescription.count_of_refills_allowed || 1) ||
        (updatedOrder?.data?.prescription.expires_on &&
          new Date(updatedOrder?.data?.prescription.expires_on) < new Date())
      ) {
        const care = await supabaseAdmin
          .from('medication')
          .select('*, medication_dosage!inner(*, medication_quantity!inner(*))')
          .eq(
            'medication_dosage.medication_quantity.id',
            prescription?.data?.medication_quantity_id || 0
          )
          .limit(1)
          .order('created_at', { ascending: false })
          .maybeSingle()
          .then(data => data.data?.display_name);

        const careToRenewalLink = {
          'Birth Control Medication': '/bc-prescription-renewal',
          'Hair Loss Medication': '/mhl-prescription-renewal',
          'Female Hair Loss Medication': '/fhl-prescription-renewal',
          'Sleep Support: Ramelteon': '/insomnia-prescription-renewal',
          'Enclomiphene Medication': '/enclomiphene-prescription-renewal',
          'Preworkout Medication': '/preworkout-prescription-renewal',
          'EDHL Medication': '/ed-hl-prescription-renewal',
        };

        if (care && care in careToRenewalLink) {
          let renewalLink =
            careToRenewalLink[care as keyof typeof careToRenewalLink];
          if (
            care === 'Hair Loss Medication' &&
            patient.profiles.gender === 'female'
          ) {
            renewalLink = '/fhl-prescription-renewal';
          }
          // Add action item for renewal
          await supabaseAdmin.from('patient_action_item').insert({
            patient_id: patientId,
            type: 'PRESCRIPTION_RENEWAL',
            title: `Request ${care.replace('Female ', '')} renewal`,
            body: 'To make sure you don’t have gaps in medication coverage, request your prescription renewal now.',
            path: renewalLink,
            is_required: true,
          });

          await prescriptionRenewalEvent(
            patient.profile_id,
            patient.profiles.email || '',
            care,
            prescription?.data?.medication || '',
            'https://app.getzealthy.com' + renewalLink
          );

          await supabaseAdmin
            .from('prescription')
            .update({ status: 'expired' })
            .eq(
              'id',
              prescription?.data?.id || refillOrder.prescription_id || 0
            );
        }
      }
      if (prescription?.data?.medication && refillOrder.id) {
        await prescriptionPaymentSuccess(
          invoice,
          refillOrder.id,
          prescription.data.medication
        );
      }
    }

    console.log(`Paid invoice ${invoice.id}`);

    if (!patientId) {
      throw new Error(`Could not find patientId in invoice: ${invoice.id}`);
    }

    const firstLineItem = invoice?.lines?.data?.slice(-1)[0] ?? {};
    const isEnclomipheneSubscriptionInvoice =
      typeof firstLineItem?.metadata?.zealthy_care === 'string' &&
      firstLineItem?.metadata?.zealthy_care?.includes('Enclomiphene') &&
      typeof firstLineItem?.description === 'string' &&
      firstLineItem?.description?.includes('1 × Medication Subscription');

    const description = isEnclomipheneSubscriptionInvoice
      ? `${invoice.description || firstLineItem.description} ${
          firstLineItem?.metadata?.zealthy_product_name
        }`
      : invoice.description || firstLineItem.description;

    const zealthyCare = isOneOffInvoice
      ? invoice.metadata?.zealthy_care
      : inferSubscriptionMetadata(invoice).zealthyCare;

    const zealthyProduct = isOneOffInvoice
      ? invoice?.metadata?.zealthy_product_name
      : inferSubscriptionMetadata(invoice).zealthyProduct;

    const updateObj: Partial<Invoice> & {
      amount_paid: number;
      attempted_count: number;
      auto_advance: boolean;
      collection_method: string;
      patient_id: number;
      reference_id: string;
      status: string;
    } = {
      patient_id: patientId,
      amount_due: invoice.amount_due / 100,
      amount_paid: invoice.amount_paid / 100,
      attempted_count: invoice.attempt_count,
      reference_id: invoice.id,
      billing_reason: invoice.billing_reason,
      collection_method: invoice.collection_method,
      subscription: invoice.subscription as string | null,
      charge: invoice.charge as string | null,
      next_payment_attempt: nextPaymentAttempt,
      auto_advance: invoice.auto_advance || false,
      status: invoice.status as string,
      created_at: new Date(invoice.created * 1000).toISOString(),
    };

    if (zealthyCare) updateObj.care = zealthyCare;
    if (zealthyProduct) updateObj.product = zealthyProduct;
    if (description) updateObj.description = description;

    await Promise.all([
      handleRecurringWeightLossSubscription(invoice, patientId),
      supabaseAdmin.from('invoice').upsert(updateObj).throwOnError(),
    ]);
  } catch (err: any) {
    console.error('invoice/paid-Err', {
      message: err?.message || 'Unknown error',
      stack: err?.stack || 'No stack trace',
      invoiceId: invoice?.id,
    });
    throw new Error(
      `Error in payInvoice: ${
        typeof err === 'string'
          ? err
          : JSON.stringify(err?.message || 'Unexpected error')
      }`
    );
  }
};

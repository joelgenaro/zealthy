import {
  OrderPrescriptionProps,
  PatientCareTeamProps,
  PatientProps,
} from '@/components/hooks/data';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { prescriptionWeightLossCompoundEnded } from '@/utils/freshpaint/events';
import { fireGLP1PaymentSuccessEvent } from '@/utils/glp1EventHelpers';
import axios from 'axios';
import { addDays } from 'date-fns';
import Stripe from 'stripe';
import getStripeInstance from '../../../createClient';
import { processEmpowerPharmacyOrder } from './processEmpowerPharmacyOrder';
import { processRevivePharmacyOrder } from './processRevivePharmacyOrder';
import { uuid } from 'uuidv4';
import { processHallandalePharmacyOrder } from './processHallandalePharmacyOrder';
import { processBelmarPharmacyOrder } from './processBelmarPharmacyOrder';
import { processTailorMadePharmacyOrder } from './processTailorMadePharmacyOrder';
import { Database } from '@/lib/database.types';

type OrderUpdate = Database['public']['Tables']['order']['Update'];

export const processBundledRefillOrder = async (invoice: Stripe.Invoice) => {
  const stripe = getStripeInstance();

  try {
    const orderId =
      invoice.metadata?.zealthy_order_id ||
      invoice.lines?.data?.slice(-1)[0]?.metadata?.zealthy_order_id;

    let existingOrder;

    if (!orderId) {
      const patientId =
        invoice.lines?.data?.slice(-1)[0]?.metadata?.zealthy_patient_id;

      if (patientId) {
        // Find all bundled refill orders for this patient
        const bundledRefillOrders = await supabaseAdmin
          .from('order')
          .select(`*, prescription(*)`)
          .eq('patient_id', patientId)
          .ilike('order_status', '%BUNDLED_REFILL_%')
          .order('id', { ascending: true }) // Get the most recent ones first
          .then(({ data }) => data as OrderPrescriptionProps[]);

        // If we found any bundled refill orders
        if (bundledRefillOrders && bundledRefillOrders.length > 0) {
          existingOrder = bundledRefillOrders[0];
          console.log(
            `Found existing order ${existingOrder.id} for patient ${patientId} with status ${existingOrder.order_status}`
          );
        } else {
          console.log(
            `No bundled refill orders found for patient ${patientId}`
          );
        }
      } else {
        console.log('No patient ID found in invoice metadata');
      }
    } else {
      existingOrder = await supabaseAdmin
        .from('order')
        .select(`*, prescription(*)`)
        .eq('id', orderId)
        .single()
        .then(({ data }) => data as OrderPrescriptionProps | null);
    }

    if (!existingOrder?.invoice_id) {
      await supabaseAdmin
        .from('order')
        .update({ invoice_id: invoice.id })
        .eq('id', existingOrder?.group_id ?? orderId);
    }

    if (existingOrder?.order_status === 'PAYMENT_FAILED') {
      const options: OrderUpdate = {
        order_status: 'PAYMENT_SUCCESS',
      };

      if (!existingOrder.amount_paid && invoice.amount_paid > 0) {
        options.amount_paid = invoice.amount_paid / 100;
      }

      await supabaseAdmin
        .from('order')
        .update(options)
        .eq('id', existingOrder?.id);
    }

    if (!existingOrder?.prescription?.medication_id) {
      throw new Error(
        `Could not find medication Id for order: ${existingOrder?.id}`
      );
    }

    if (!existingOrder.patient_id || !existingOrder.group_id) {
      throw new Error(
        `Missing data: ${JSON.stringify({
          patientId: existingOrder.patient_id,
          groupId: existingOrder.group_id,
        })}`
      );
    }
    const refillOrders = await supabaseAdmin
      .from('order')
      .select(`*, prescription(*)`)
      .eq('patient_id', existingOrder?.patient_id)
      .ilike('order_status', '%REFILL%')
      .order('created_at', { ascending: true })
      .then(({ data }) => data as OrderPrescriptionProps[]);

    let refillOrder: OrderPrescriptionProps[] = [
      refillOrders.reduce((lowest, order) => {
        return order.id < lowest.id ? order : lowest;
      }, refillOrders[0]),
    ];
    // if tracking number does not exist then it's a new prescription
    if (!existingOrder?.tracking_number) {
      // if not Belmar/Red Rock add all orders, else add just one
      refillOrder = !['Red Rock', 'Belmar'].includes(
        existingOrder?.prescription?.pharmacy || ''
      )
        ? refillOrder
        : [existingOrder];
    } else {
      const uniqueId = uuid();
      // existing order was delivered so check for auto-refills else recreate them to send out.
      const autoRefills = await supabaseAdmin
        .from('order')
        .select('*, prescription(*)')
        .ilike('order_status', '%BUNDLED_REFILL%')
        .eq('patient_id', existingOrder?.patient_id)
        .order('id', { ascending: true })
        .limit(1)
        .single()
        .then(({ data }) => data as OrderPrescriptionProps);

      if (autoRefills?.id) {
        refillOrder = [autoRefills];
      } else {
        const newGroupedOrders = [];
        const currentDate = new Date().toISOString();
        for (const [index, order] of refillOrder?.entries()) {
          const newOrder = await supabaseAdmin
            .from('order')
            .insert({
              ...order,
              created_at:
                index === 0
                  ? currentDate
                  : ['Red Rock', 'Belmar'].includes(
                      order?.prescription?.pharmacy || ''
                    )
                  ? addDays(new Date(), 30 * (index - 1) + 28).toISOString()
                  : currentDate,
              order_status: 'PREPAID_REFILL',
              group_id: uniqueId,
              patient_id: existingOrder?.patient_id,
              invoice_id: invoice.id,
            })
            .select(`*, prescription(*)`)
            .single()
            .then(({ data }) => data as OrderPrescriptionProps);

          newGroupedOrders.push(newOrder);
        }
        refillOrder = !['Red Rock', 'Belmar'].includes(
          existingOrder?.prescription?.pharmacy || ''
        )
          ? newGroupedOrders
          : [newGroupedOrders[0]];
      }
    }

    const isLastRefill = refillOrder[0]?.order_status === 'BUNDLED_REFILL_6';

    const patient = await supabaseAdmin
      .from('patient')
      .select('*, profiles(*)')
      .eq('id', existingOrder?.patient_id)
      .maybeSingle()
      .then(({ data }) => data as PatientProps);
    const patientAddress = await supabaseAdmin
      .from('address')
      .select()
      .eq('patient_id', existingOrder?.patient_id)
      .single()
      .then(({ data }) => data);
    const patientStripe = await supabaseAdmin
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', existingOrder?.patient_id)
      .single()
      .then(({ data }) => data);
    const allergies = await supabaseAdmin
      .from('medical_history')
      .select('allergies')
      .eq('patient_id', existingOrder?.patient_id)
      .single()
      .then(({ data }) => {
        return data?.allergies?.trim().length ? data.allergies.trim() : 'NKDA';
      });

    if (existingOrder?.prescription?.pharmacy === 'Empower') {
      if (!patientAddress)
        throw new Error('MISSING PATIENT ADDRESS IN REVIVE REFILLORDER');
      await processEmpowerPharmacyOrder(patient, refillOrder, patientAddress);
    }

    if (existingOrder?.prescription?.pharmacy === 'Hallandale') {
      if (!patientAddress)
        throw new Error('MISSING PATIENT ADDRESS IN REVIVE REFILLORDER');
      processHallandalePharmacyOrder(patient, refillOrder, patientAddress);
    }

    if (existingOrder?.prescription?.pharmacy === 'Revive') {
      if (!patientAddress)
        throw new Error('MISSING PATIENT ADDRESS IN REVIVE REFILLORDER');
      const reviveResponse = await processRevivePharmacyOrder(
        patient,
        refillOrder,
        patientAddress
      );
      console.log(reviveResponse, '---REVIVE GROUPED ORDER SUCCESS----');
    }

    if (existingOrder?.prescription?.pharmacy === 'Belmar' && patientAddress) {
      processBelmarPharmacyOrder(patient, refillOrder, patientAddress);
    }

    if (
      existingOrder?.prescription?.pharmacy === 'Tailor-Made' &&
      patientAddress
    ) {
      processTailorMadePharmacyOrder(patient, refillOrder, patientAddress);
    }

    const customer = (await stripe.customers.retrieve(
      patientStripe?.customer_id!,
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

    await fireGLP1PaymentSuccessEvent(
      patient?.profiles?.id,
      patient?.profiles?.email,
      existingOrder?.id,
      existingOrder?.created_at!,
      invoice?.amount_paid / 100,
      paymentMethod?.brand,
      paymentMethod?.last4,
      refillOrder?.reduce(
        (acc, order) => acc + (order?.prescription?.duration_in_days || 0),
        0
      ),
      refillOrder?.[0]?.prescription?.pharmacy,
      existingOrder?.prescription
    );

    if (!refillOrder?.[0]?.patient_id) {
      throw new Error('Refill order missing patient Id');
    }

    const careTeamCoordinator = await supabaseAdmin
      .from('patient_care_team')
      .select('*, clinician(*)')
      .eq('patient_id', refillOrder?.[0]?.patient_id)
      .eq('role', 'Coordinator')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data as PatientCareTeamProps);

    const groupId = await supabaseAdmin
      .from('messages_group')
      .select('id')
      .eq('profile_id', patient?.profile_id)
      .eq('name', 'Weight Loss')
      .maybeSingle()
      .then(({ data }) => data?.id);

    if (
      ['Semaglutide 2 mg vial', 'Semaglutide 2 mgs vial'].includes(
        refillOrder[0]?.prescription?.medication || ''
      )
    ) {
      const message = `<p>Hi ${patient?.profiles?.first_name}</p>
        <p>Your next order, 2 mg (to be injected inject 25 units once per week for four weeks), has been successfully ordered and will be on its way soon. If you are experiencing any side effects, please let us know so that I can make sure your provider can adjust your care plan accordingly as appropriate.</p> 
        `;
      await axios.post(`/api/message`, {
        data: {
          message,
          sender: `Practitioner/${careTeamCoordinator?.clinician?.profile_id}`,
          recipient: `Patient/${patient?.profile_id}`,
          groupId,
          notify: true,
        },
      });
    }
    if (
      ['Semaglutide 5 mg vial', 'Semaglutide 5 mgs vial'].includes(
        refillOrder[0]?.prescription?.medication || ''
      )
    ) {
      const message = `<p>Hi ${patient?.profiles?.first_name}</p>
        <p>Your next order of Semaglutide, the 5mg vial (to be inject 20 units once per week for 4 weeks) has been successfully ordered and will be on its way soon. If you are experiencing any side effects, please let us know so that I can make sure your provider can adjust your care plan accordingly as appropriate.</p> 
        `;
      await axios.post(`/api/message`, {
        data: {
          message,
          sender: `Practitioner/${careTeamCoordinator?.clinician?.profile_id}`,
          recipient: `Patient/${patient?.profile_id}`,
          groupId,
          notify: true,
        },
      });
    }
    if (
      ['Tirzepatide 20 mg vial', 'Tirzepatide 20 mgs vial'].includes(
        refillOrder[0]?.prescription?.medication || ''
      )
    ) {
      const message = `<p>Hi ${patient?.profiles?.first_name}</p>
        <p>Your next order of Tirzepatide, 20 mg (to be injected 50 units once per week for four weeks), has been successfully ordered and will be on its way soon. If you are experiencing any side effects, please let us know so that I can make sure your provider can adjust your care plan accordingly as appropriate.</p> 
        `;
      await axios.post(`/api/message`, {
        data: {
          message,
          sender: `Practitioner/${careTeamCoordinator?.clinician?.profile_id}`,
          recipient: `Patient/${patient?.profile_id}`,
          groupId,
          notify: true,
        },
      });
    }
    if (isLastRefill) {
      prescriptionWeightLossCompoundEnded(
        patient?.profiles?.id,
        patient?.profiles?.email,
        refillOrder[0].prescription?.medication || '',
        refillOrder?.reduce(
          (acc, order) => acc + (order?.prescription?.duration_in_days || 0),
          0
        )
      );
    }
  } catch (err) {
    console.error(err as any, 'GOGO_ERROR_CATCH');
  }
};

import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import { processEmpowerPharmacyOrder } from './processEmpowerPharmacyOrder';
import { processHallandalePharmacyOrder } from './processHallandalePharmacyOrder';
import { processRedRockPharmacyOrder } from './processRedRockPharmacyOrder';
import { processTailorMadePharmacyOrder } from './processTailorMadePharmacyOrder';
import sortBy from 'lodash/sortBy';
import { processBelmarPharmacyOrder } from './processBelmarPharmacyOrder';
import { processRevivePharmacyOrder } from './processRevivePharmacyOrder';
import { Database } from '@/lib/database.types';
import { sendNotification } from './sendNotification';
import { handleCancelDraftBulkInvoices } from './handleCancelDraftBulkInvoices';
import { processBoothwynPharmacyOrder } from './processBoothwynPharmacyOrder';

type OrderUpdate = Database['public']['Tables']['order']['Update'];

export const processCompoundStatusUpdate = async (invoice: Stripe.Invoice) => {
  console.log(`Inside processCompoundStatusUpdate for invoice: ${invoice.id}`);

  try {
    if (
      !invoice.metadata?.zealthy_order_id ||
      !invoice.metadata?.zealthy_prescription_request_id
    ) {
      throw new Error('Missing zealthy metadata in compound status update');
    }
    const zealthy_patient_id = invoice?.metadata?.zealthy_patient_id;
    const isBulkOrder = invoice?.description?.includes(
      '+ 2 Months Weight Loss Membership'
    );

    await supabaseAdmin
      .from('prescription_request')
      .update({
        status: 'PAYMENT_SUCCESS',
      })
      .eq('id', invoice.metadata?.zealthy_prescription_request_id)
      .eq('status', 'PAYMENT_FAILED');

    if (zealthy_patient_id && Number(zealthy_patient_id) && isBulkOrder) {
      //when processing a bulk order in create-compound-order, we extend the renewal date of patient's wl subscription ($135) by 2 months. however, if payment fails initially but retries successfully through dunning...
      // order will be processed here through stripe webhooks. We must therefore ensure that if the payment succeeds through a retry, that we still extend the membership by 2 months so it doesn't charge again 30 days later.
      const bulkUpdate = await handleCancelDraftBulkInvoices(
        Number(zealthy_patient_id),
        supabaseAdmin
      );

      console.log({ bulkUpdate });
    }

    const existingOrder = await supabaseAdmin
      .from('order')
      .select(`*, prescription(*)`)
      .eq('id', invoice.metadata?.zealthy_order_id)
      .single()
      .then(({ data }) => data as OrderPrescriptionProps | null);

    if (!existingOrder?.id) {
      throw new Error(
        `Could not find order for order id: ${invoice.metadata?.zealthy_order_id}`
      );
    }

    if (!existingOrder?.prescription?.medication_id) {
      throw new Error(
        `Could not find medication id for order ${invoice.metadata?.zealthy_order_id}`
      );
    }

    const options: OrderUpdate = {};

    if (existingOrder.order_status === 'PAYMENT_FAILED') {
      options.order_status = 'PAYMENT_SUCCESS';

      if (!existingOrder.amount_paid && invoice.amount_paid > 0) {
        options.amount_paid = invoice.amount_paid / 100;
      }

      await supabaseAdmin
        .from('order')
        .update(options)
        .eq('id', existingOrder.id);

      if (existingOrder.order_series_id) {
        const ordersInSeries = await supabaseAdmin
          .from('order')
          .select('*')
          .eq('order_series_id', existingOrder.order_series_id)
          .then(data => data.data);

        await Promise.all(
          (ordersInSeries || []).map(async o => {
            return await supabaseAdmin
              .from('order')
              .update({ order_status: o.status_if_paid })
              .eq('id', o.id);
          })
        );
      }
    }

    if (!existingOrder.patient_id || !existingOrder.group_id) {
      throw new Error(
        `Missing data in compound status update: ${JSON.stringify({
          patientId: existingOrder.patient_id,
          groupId: existingOrder.group_id,
        })}`
      );
    }
    await supabaseAdmin
      .from('order')
      .update({ invoice_id: invoice.id })
      .eq('id', existingOrder.group_id);

    const patient = await supabaseAdmin
      .from('patient')
      .select('*, profiles(*)')
      .eq('id', existingOrder?.patient_id)
      .maybeSingle()
      .then(({ data }) => data as PatientProps | null);

    if (!patient) {
      throw new Error(`Could not find patient for ${existingOrder.patient_id}`);
    }

    const patientAddress = await supabaseAdmin
      .from('address')
      .select()
      .eq('patient_id', existingOrder?.patient_id)
      .single()
      .then(({ data }) => data);

    if (!patientAddress) {
      throw new Error(`Could not find address for patient ${patient.id}`);
    }

    const additionalOrders = await supabaseAdmin
      .from('order')
      .select(`*, prescription(*)`)
      .eq('patient_id', existingOrder?.patient_id)
      .eq('group_id', existingOrder.group_id)
      .then(({ data }) => (data || []) as OrderPrescriptionProps[]);

    console.log(
      `Is about to process order: ${existingOrder.id} for pharmacy: ${existingOrder.prescription.pharmacy} and order status: ${existingOrder.order_status}`
    );

    // Check if we need to get the true duration from the matrix table
    let totalDurationInDays = 0;

    if (existingOrder.prescription?.matrix_id) {
      // If the main order has a matrix_id, get the duration from there
      const { data: matrixData } = await supabaseAdmin
        .from('compound_matrix')
        .select('duration_in_days')
        .eq('id', existingOrder.prescription.matrix_id)
        .single();

      if (matrixData?.duration_in_days) {
        totalDurationInDays = matrixData.duration_in_days;
        console.log(
          `Using compound matrix duration: ${totalDurationInDays} days from matrix_id: ${existingOrder.prescription.matrix_id}`
        );
      }
    }

    // If we couldn't get duration from matrix, fall back to summing individual order durations
    if (totalDurationInDays === 0) {
      totalDurationInDays = additionalOrders.reduce((acc, item) => {
        acc += item.prescription?.duration_in_days || 0;
        return acc;
      }, 0);
      console.log(
        `Using summed durations: ${totalDurationInDays} days from ${additionalOrders.length} orders`
      );
    }

    await sendNotification({
      order: existingOrder,
      price: invoice.amount_paid,
      invoiceDescription: invoice.description || '',
      durationInDays: totalDurationInDays,
      email: patient?.profiles.email || '',
    });

    if (existingOrder.prescription.pharmacy === 'Red Rock') {
      await processRedRockPharmacyOrder(patient, existingOrder, patientAddress);
    }

    if (existingOrder.prescription.pharmacy === 'Tailor-Made') {
      const tailorMadeOrders = sortBy(
        additionalOrders.filter(
          p => p.prescription?.pharmacy === 'Tailor-Made'
        ),
        o => o.id
      );
      await processTailorMadePharmacyOrder(
        patient,
        tailorMadeOrders,
        patientAddress
      );
    }

    if (existingOrder?.prescription?.pharmacy === 'Empower') {
      const empowerOrders = sortBy(
        additionalOrders.filter(p => p.prescription?.pharmacy === 'Empower'),
        o => o.id
      );
      await processEmpowerPharmacyOrder(patient, empowerOrders, patientAddress);
    }

    if (existingOrder?.prescription?.pharmacy === 'Hallandale') {
      const hallandaleOrders = sortBy(
        additionalOrders.filter(p => p.prescription?.pharmacy === 'Hallandale'),
        o => o.id
      );
      console.log('Hallandale called here #1');
      await processHallandalePharmacyOrder(
        patient,
        hallandaleOrders,
        patientAddress
      );
    }

    if (existingOrder?.prescription?.pharmacy === 'Belmar') {
      const belmarOrders = sortBy(
        additionalOrders.filter(p => p.prescription?.pharmacy === 'Belmar'),
        o => o.id
      )
        .filter(order => !order?.sent_to_pharmacy_at)
        .slice(0, 1);
      console.log({ belmarOrders });

      await processBelmarPharmacyOrder(patient, belmarOrders, patientAddress);
    }

    if (existingOrder?.prescription?.pharmacy === 'Revive') {
      const reviveOrders = sortBy(
        additionalOrders.filter(p => p.prescription?.pharmacy === 'Revive'),
        o => o.id
      );
      await processRevivePharmacyOrder(patient, reviveOrders, patientAddress);
    }

    // Boothwyn Pharmacy Orders (CA Only as of 11/2024)
    if (existingOrder?.prescription?.pharmacy === 'Boothwyn') {
      const boothwynOrders = sortBy(
        additionalOrders.filter(p => p.prescription?.pharmacy === 'Boothwyn'),
        o => o.id
      );
      await processBoothwynPharmacyOrder(
        patient,
        boothwynOrders,
        patientAddress
      );
    }

    return;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

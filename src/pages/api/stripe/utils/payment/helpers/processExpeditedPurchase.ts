import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getServiceSupabase } from '@/utils/supabase';
import { processEmpowerPharmacyOrder } from './processEmpowerPharmacyOrder';
import { processHallandalePharmacyOrder } from './processHallandalePharmacyOrder';
import { processTailorMadePharmacyOrder } from './processTailorMadePharmacyOrder';
import { processRevivePharmacyOrder } from './processRevivePharmacyOrder';
import { processBelmarPharmacyOrder } from './processBelmarPharmacyOrder';
import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';

/**
 *
 * @param invoice
 * @returns
 */
export const processExpeditedPurchase = async (invoice: Stripe.Invoice) => {
  console.log(`Inside processExpeditedPurchase for invoice: ${invoice.id}`);
  try {
    const supabase = getServiceSupabase();

    const existingOrder = await supabaseAdmin
      .from('order')
      .select(`*`)
      .eq('invoice_id', invoice.id)
      .single();

    if (
      !existingOrder.data?.patient_id ||
      !existingOrder.data?.prescription_id
    ) {
      throw new Error(
        `Existing order missing data: ${JSON.stringify(existingOrder)}`
      );
    }

    const existingPrescriptionOrder = await supabaseAdmin
      .from('order')
      .select(`*, prescription (*)`)
      .eq('invoice_id', invoice.id)
      .single()
      .then(({ data }) => data as OrderPrescriptionProps | null);

    console.info(
      'existingPrescriptionOrder',
      existingPrescriptionOrder,
      existingOrder?.data
    );

    const prescription = await supabaseAdmin
      .from('prescription')
      .select()
      .eq('id', existingOrder.data?.prescription_id)
      .single();

    console.log('prescription', { prescription: prescription?.data });

    const patient = await supabaseAdmin
      .from('patient')
      .select('*, profiles(*)')
      .eq('id', existingOrder.data?.patient_id)
      .maybeSingle()
      .then(({ data }) => data as PatientProps | null);

    const patientAddress = await supabaseAdmin
      .from('address')
      .select()
      .eq('patient_id', existingOrder.data?.patient_id)
      .single()
      .then(({ data }) => data);

    if (
      existingPrescriptionOrder &&
      patientAddress &&
      patient &&
      prescription?.data
    ) {
      const pharmacy = prescription?.data?.pharmacy?.toLowerCase();
      const orderToProcess = [existingPrescriptionOrder];

      if (pharmacy?.includes('empower')) {
        await processEmpowerPharmacyOrder(
          patient,
          orderToProcess,
          patientAddress
        );
      } else if (pharmacy?.includes('hallandale')) {
        await processHallandalePharmacyOrder(
          patient,
          orderToProcess,
          patientAddress
        );
      } else if (pharmacy?.includes('tailor')) {
        await processTailorMadePharmacyOrder(
          patient,
          orderToProcess,
          patientAddress
        );
      } else if (pharmacy?.includes('revive')) {
        await processRevivePharmacyOrder(
          patient,
          orderToProcess,
          patientAddress
        );
      } else if (pharmacy?.includes('belmar')) {
        await processBelmarPharmacyOrder(
          patient,
          orderToProcess,
          patientAddress
        );
      } else if (pharmacy?.includes('gogo')) {
        await supabaseAdmin
          .from('order')
          .update({ order_status: 'PAYMENT_SUCCESS' })
          .eq('invoice_id', invoice.id);

        console.info(
          `GogoMeds order marked for cron processing: ${existingOrder.data.id}`
        );
        return; // Exit early as the cron job will handle this
      } else {
        throw new Error(`Unsupported pharmacy: ${pharmacy}`);
      }

      await supabaseAdmin
        .from('order')
        .update({ order_status: `SENT_TO_${pharmacy.toUpperCase()}` })
        .eq('invoice_id', invoice.id);

      console.info(`Expedited order processed successfully`);
    } else {
      throw new Error('Missing required data for processing expedited order');
    }
  } catch (err) {
    console.error('processExpeditedPurchase_err', err as any);
    throw new Error('processExpeditedPurchase_err', err as any);
  }
};

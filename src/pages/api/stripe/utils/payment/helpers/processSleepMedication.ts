import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { uniquePaymentSuccess } from '@/utils/freshpaint/events';
import { PatientProps } from '@/components/hooks/data';

async function processSleepMedication(
  invoice: Stripe.Invoice,
  zealthy_patient_id: string | undefined
) {
  const orderID = invoice?.lines?.data?.[0]?.metadata?.zealthy_order_id;
  if (!orderID) return;

  const patient = await supabaseAdmin
    .from('patient')
    .select('*, profiles(*)')
    .eq('id', Number(zealthy_patient_id))
    .maybeSingle()
    .then(({ data }) => data as PatientProps | null);

  //handle fresh paint tracking
  uniquePaymentSuccess(
    patient?.profiles?.id || '',
    patient?.profiles?.email || '',
    'payment-successful-insomnia',
    'Ramelteon'
  );

  //return if this is subscription creation
  if (invoice.billing_reason === 'subscription_create') return;
  return;

  //RECURRING ORDER LOGIC BELOW DOES NOT WORK
  //@ALEJANDRO - ONCE GOGOMENDS AUTOMATIC ORDERS WORK COPY PASTE HERE OR LMK AND I WILL PUT IT BELOW

  // const order = await supabaseAdmin
  //   .from('order')
  //   .select('*, prescription(*)')
  //   .eq('id', orderID)
  //   .single()
  //   .then(({ data }) => data);

  // const medicationId = order?.prescription?.medication_quantity_id;

  // const medication = await supabaseAdmin
  //   .from('clinic_favorites')
  //   .select()
  //   .eq('medication_quantity_id', Number(medicationId))
  //   .maybeSingle()
  //   .then(({ data }) => data);

  // const { data: token } = await createDosespotToken();

  // const pharmacyId = process.env.VERCEL_ENV === 'production' ? 245312 : 14973;

  // const prescription = {
  //   DispensableDrugId: medication?.DispensableDrugId,
  //   Refills: medication?.Refills,
  //   DispenseUnitId: medication?.DispenseUnitTypeID,
  //   Quantity: medication?.dispense,
  //   Directions: '',
  //   Status: 1,
  //   NoSubstitutions: false,
  //   PharmacyNotes: '',
  //   DaysSupply: medication?.DaysSupply,
  //   PharmacyId: pharmacyId,
  // };

  // const options = {
  //   method: 'POST',
  //   url: `${process.env.DOSESPOT_BASE_URL!}/webapi/v2/api/patients/${
  //     patient?.dosespot_patient_id
  //   }/prescriptions/coded`,
  //   headers: {
  //     'Subscription-Key': process.env.DOSESPOT_SUBSCRIPTION_KEY,
  //     Authorization: `Bearer ${token.access_token}`,
  //   },
  //   data: prescription,
  // };

  //send order to pharmacy
  // const { data: codedPrescription } = await axios(options);

  // return

  // const { data: taskResponse, error: taskError } = await supabaseAdmin
  //   .from('task_queue')
  //   .insert({
  //     task_type: 'PRESCRIPTION_REQUEST',
  //     patient_id: Number(zealthy_patient_id),
  //     queue_type: 'Provider (QA)',
  //   })
  //   .select()
  //   .maybeSingle();

  // const { data: prescriptionReponse, error: prescriptionError } =
  //   await supabaseAdmin.from('prescription_request').insert({
  //     patient_id: Number(zealthy_patient_id),
  //     status: 'REQUESTED',
  //     region: patient?.region,
  //     shipping_method: 1,
  //     note: 'Ramelteon',
  //     total_price: order?.total_price,
  //     specific_medication: 'Ramelteon',
  //     medication_quantity_id: medicationId,
  //     queue_id: taskResponse?.id,
  //   });
}

export { processSleepMedication };

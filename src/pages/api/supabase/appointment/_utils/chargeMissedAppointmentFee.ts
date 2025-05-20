import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import getStripeInstance from '@/pages/api/stripe/createClient';

type Appointment = Database['public']['Tables']['appointment']['Row'];

export const chargeMissedAppointmentFee = async (appointment: Appointment) => {
  const stripe = getStripeInstance();

  if (appointment.encounter_type === 'Walked-in') {
    return console.log(
      `Appointment ${appointment.id} is a Walked-in appointment. Do not charge. Returning...`
    );
  }

  if (appointment.paid) {
    return console.log(
      `Appointment ${appointment.id} has been paid already. Returning...`
    );
  }

  if (appointment.appointment_type !== 'Provider') {
    return console.log(
      `Appointment ${appointment} is not Provider appointment. Returning...`
    );
  }

  const customerIds = await supabaseAdmin
    .from('payment_profile')
    .select('customer_id')
    .eq('patient_id', appointment.patient_id)
    .throwOnError()
    .then(({ data }) => data || []);

  if (customerIds?.length !== 1) {
    throw new Error(
      `Patient ${appointment.patient_id} has 0 or more than 1 stripe ids`
    );
  }

  const customerId = customerIds[0].customer_id;

  const missedApptFee = await supabaseAdmin
    .from('subscription')
    .select('price, currency')
    .eq('name', 'Missed Appointment')
    .single()
    .then(({ data }) => data);

  const missedAppointmentCharge = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
    collection_method: 'charge_automatically',
    description:
      appointment?.duration !== 15
        ? 'Missed visit fee'
        : 'Missed synchronous appointment',
    metadata: {
      resource: 'appointment',
      zealthy_patient_id: appointment.patient_id,
      zealthy_appointment_id: appointment.id,
      zealthy_care:
        appointment?.duration !== 15 ? 'Primary Care' : 'Weight Loss',
      zealthy_product_name:
        appointment?.duration !== 15
          ? 'Primary Care Visit'
          : 'Provider Sync Visit',
    },
  });

  await stripe.invoiceItems.create({
    customer: customerId,
    amount: (missedApptFee?.price ?? 0) * 100,
    currency: missedApptFee?.currency.toLowerCase() || 'usd',
    description:
      appointment?.duration !== 15
        ? 'Missed visit fee'
        : 'Missed synchronous appointment',
    invoice: missedAppointmentCharge?.id,
  });

  await stripe.invoices.finalizeInvoice(missedAppointmentCharge?.id);
  const payInvoice = await stripe.invoices.pay(missedAppointmentCharge?.id);

  console.info('MISSED_APPOINTMENT_PAID', JSON.stringify(payInvoice));

  await supabaseAdmin
    .from('appointment')
    .update({ paid: true })
    .eq('id', appointment.id);
};

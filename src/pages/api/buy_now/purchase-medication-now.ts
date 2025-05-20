import type { NextApiRequest, NextApiResponse } from 'next';
import { getServiceSupabase } from '@/utils/supabase';
import axios from 'axios';
import getStripeInstance from '@/pages/api/stripe/createClient';
import { OrderPrescriptionProps } from '@/components/hooks/data';
import { format, parseISO } from 'date-fns';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default async function PurchaseMedicationNowHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const supabase = getServiceSupabase();
    const { patient, patientAddress, medication } = req.body;

    const token = await axios.post(
      `${process.env.GOGOMEDS_BASE_URL}/token`,
      `grant_type=password&username=${process.env.GOGOMEDS_USERNAME}&password=${process.env.GOGOMEDS_PASSWORD}`
    );

    const medicationNDC = await supabase
      .from('medication_quantity')
      .select('medication_dosage(national_drug_code)')
      .eq('id', medication?.medication_quantity_id)
      .single()
      .then(({ data }) => data as any);

    const medHistory = await supabase
      .from('medical_history')
      .select()
      .eq('patient_id', patient?.id)
      .single();

    const patientStripe = await supabase
      .from('payment_profile')
      .select('customer_id')
      .eq('patient_id', patient?.id)
      .single()
      .then(({ data }) => data);

    const stripeInvoice = await stripe.invoices.create({
      customer: patientStripe?.customer_id,
      description: `${medication.name} charge`,
      metadata: req.body?.metadata,
    });

    //create invoice item
    const invoiceItems = await stripe.invoiceItems.create({
      customer: patientStripe?.customer_id,
      amount: medication.price * 100,
      currency: 'usd',
      invoice: stripeInvoice.id,
    });

    //pay invoice
    const invoice = await stripe.invoices
      .finalizeInvoice(stripeInvoice.id)
      .then(invoice => {
        if (invoice.status === 'paid') {
          console.log(
            `Invoice ${invoice.id} has been paid already for amount of $${invoice.amount_paid}`,
            { zealthy_patient_id: patient?.id }
          );
          return invoice;
        }
        return stripe.invoices.pay(stripeInvoice.id);
      })
      .catch(async err => {
        const errorMessage = getErrorMessage(err);

        //if  payment failed, void invoice
        await stripe.invoices.voidInvoice(stripeInvoice.id);
        console.error('Invoice_payment_failed', {
          message: errorMessage,
        });
        throw new Error(errorMessage);
      });

    if (invoice?.status === 'paid') {
      //create prescription
      const prescription = await supabase
        .from('prescription')
        .insert({
          patient_id: patient?.id,
          count_of_refills_allowed: 0,
          status: 'active',
          pharmacy: 'GoGo Meds',
          dispense_quantity: 1,
          medication_quantity_id: medication?.medication_quantity_id,
          medication: medication?.name,
          medication_id: medicationNDC?.medication_dosage?.national_drug_code,
          dosage_instructions: Object.values(
            medication?.instructions
          ).toString(),
        })
        .select()
        .single()
        .then(({ data }) => data);

      //create order
      const order = await supabase
        .from('order')
        .insert({
          patient_id: patient?.id,
          order_status: 'ORDER_CREATED',
          national_drug_code: prescription?.medication_id,
          prescription_id: prescription?.id,
          total_price: medication?.price,
          amount_paid: medication?.price,
          shipment_method_id: 1,
          invoice_id: invoice?.id,
        })
        .select('*, prescription!inner(*)')
        .single()
        .then(({ data }) => data as OrderPrescriptionProps);

      // create gogomeds order
      const gogoOrderParams = {
        method: 'POST',
        url: `${process.env.GOGOMEDS_BASE_URL}/api/affiliate/SubmitOrder`,
        headers: {
          Authorization: `Bearer ${token.data.access_token}`,
        },
        data: {
          AffiliateOrderNumber: order?.id.toString(),
          ShipmentMethodId: 1,

          Customer: {
            AffiliateCustomerNumber: order?.patient_id?.toString(),
            Email: patient.profiles?.email,
            FirstName: patient.profiles?.first_name,
            LastName: patient.profiles?.last_name,
            DOB: format(parseISO(patient?.profiles?.birth_date), 'MM/dd/yyyy'),
            Gender: patient.profiles?.gender?.split('')[0].toUpperCase() || 'U',
            PhoneNumber: patient.profiles?.phone_number,
            IsPregnant: false, // update later with questionnaire answers
            HasAllergies: medHistory.data?.allergies ? true : false,
            ...(medHistory.data?.allergies && {
              AllergyText: medHistory.data?.allergies,
            }),
            HasMedicalConditions: medHistory.data?.medical_conditions
              ? true
              : false,
            ...(medHistory.data?.medical_conditions && {
              MedicalConditionText: medHistory.data?.medical_conditions,
            }),
            HasCurrentMedications: medHistory.data?.current_medications
              ? true
              : false,
            ...(medHistory.data?.current_medications && {
              CurrentMedications: medHistory.data?.current_medications,
            }),

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
              UPC: order?.national_drug_code,
              Quantity: order.prescription?.dispense_quantity,
              PrescriptionSourceId: 1,
              CashPrice: medication?.price,

              Prescriber: {
                NPI: '1841216629',
                FirstName: 'Risheet',
                LastName: 'Patel',
                Address: {
                  Line1: '1501 Biscayne Boulevard',
                  Line2: ', Suite 500',
                  City: 'Miami',
                  State: 'FL',
                  Zip: '33132',
                },
              },
            },
          ],
        },
      };
      console.log('GOGO PARAMS', gogoOrderParams);
      const gogoOrder = await axios(gogoOrderParams).then(res => res.data);
      console.log('GOGO ORDER', gogoOrder);

      if (gogoOrder.success) {
        await supabase
          .from('order')
          .update({
            gogo_order_id: gogoOrder?.Value[0]?.OrderId,
            order_contact_number: gogoOrder?.Value[0]?.OrderContactNumber,
            tracking_URL: gogoOrder?.Value[0]?.TrackingURL,
            delivery_provider: gogoOrder?.Value[0]?.DeliveryProvider,
            shipment_method: gogoOrder?.Value[0]?.ShipmentMethod,
            shipment_method_id: gogoOrder?.Value[0]?.ShipmentMethodId,
            order_status: 'SENT_TO_GOGOMEDS',
          })
          .eq('id', order?.id);
      } else {
        console.error('GogoOrder Unsuccessful');
        return res
          .status(400)
          .json({ 'GoGo Meds order unsuccessful': gogoOrder });
      }
    }

    return res.status(200).json('Success');
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    console.warn(errorMessage);
    res.status(500).json({ message: errorMessage });
  }
}

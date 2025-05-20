import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { format, parseISO } from 'date-fns';

/**
 * Normalizes the pharmacy name for GoGoMeds
 * @param pharmacyName - The pharmacy name to normalize
 * @returns Normalized pharmacy name "GoGoMeds"
 */
const normalizePharmacyName = (pharmacyName: string): string => {
  if (!pharmacyName) return '';

  // edge case fix on some ggm orders
  if (pharmacyName.length > 20 && pharmacyName.toLowerCase().includes('gogo')) {
    return 'GoGoMeds';
  }

  return pharmacyName;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const signature = req.headers['supabase-signature'];
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  if (!signature || !secret || signature !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const successfulOrders = await supabaseAdmin
      .from('order')
      .select(
        `*, 
        prescription!inner(*, clinician!inner(*, profiles!inner(*))), 
        patient!inner(*, profiles!inner(*))`
      )
      .eq('order_status', 'PAYMENT_SUCCESS')
      .ilike('prescription.pharmacy', '%gogo%')
      .gte('created_at', '12/01/2024')
      .throwOnError()
      .limit(1)
      .then(({ data }) => data || []);

    console.log('Orders Found: ', successfulOrders?.length);

    // Normalize pharmacy names before processing orders
    for (const order of successfulOrders || []) {
      if (
        order.prescription?.pharmacy &&
        order.prescription.pharmacy.length > 20
      ) {
        const normalizedPharmacy = normalizePharmacyName(
          order.prescription.pharmacy
        );
        if (normalizedPharmacy !== order.prescription.pharmacy) {
          // Update the prescription pharmacy name
          await supabaseAdmin
            .from('prescription')
            .update({ pharmacy: normalizedPharmacy })
            .eq('id', order.prescription.id);

          // Also update the order object in memory
          order.prescription.pharmacy = normalizedPharmacy;
        }
      }
    }

    let gogoOrders: { [key: number]: any } = {};

    for (const order of successfulOrders || []) {
      if (!order.patient_id) return;
      const medlookup = await supabaseAdmin
        .from('medication_quantity')
        .select(
          `id, medication_dosage!inner (id, national_drug_code), quantity!inner (quantity)`
        )
        .eq(`medication_dosage.national_drug_code`, order?.national_drug_code!)
        .eq(`quantity.quantity`, order.prescription?.dispense_quantity!)
        .single();

      const medHistory = await supabaseAdmin
        .from('medical_history')
        .select()
        .eq('patient_id', order?.patient_id)
        .single();

      const shippingId = await supabaseAdmin
        .from('prescription_request')
        .select('shipping_method')
        .match({
          patient_id: order?.patient_id,
          medication_quantity_id: medlookup.data?.id,
        })
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => data?.shipping_method);

      const medPrice = await supabaseAdmin
        .from('medication_quantity')
        .select('price')
        .eq('id', medlookup.data?.id!)
        .single();

      const address = await supabaseAdmin
        .from('address')
        .select('*')
        .eq('patient_id', order.patient.id)
        .single()
        .then(({ data }) => data);

      if (!gogoOrders?.[order?.patient_id]) {
        gogoOrders[order?.patient_id] = {
          AffiliateOrderNumber: order?.id.toString(),
          ShipmentMethodId: shippingId ? shippingId : 1,

          Customer: {
            AffiliateCustomerNumber: order?.patient_id?.toString(),
            Email: order.patient.profiles?.email,
            FirstName: order.patient.profiles?.first_name,
            LastName: order.patient.profiles?.last_name,
            DOB: format(
              parseISO(order.patient.profiles?.birth_date ?? ''),
              'MM/dd/yyyy'
            ),
            Gender:
              order.patient.profiles?.gender?.split('')[0].toUpperCase() || 'U',
            PhoneNumber: order.patient.profiles?.phone_number,
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
              Line1: address?.address_line_1,
              Line2: address?.address_line_2 || ', ',
              City: address?.city,
              State: address?.state,
              Zip: address?.zip_code,
            },
          },
          Payment: {
            BillAffiliate: true,
            FirstName: order.patient.profiles?.first_name,
            LastName: order.patient.profiles?.last_name,
          },
          Drugs: [
            {
              ...(order?.national_drug_code === '7070016406' ||
              order?.prescription?.national_drug_code === '7070016406'
                ? {
                    UPC:
                      order?.national_drug_code ||
                      order?.prescription?.national_drug_code,
                  }
                : {
                    NDC:
                      order?.national_drug_code ||
                      order?.prescription?.national_drug_code,
                  }),
              Quantity: order.prescription?.dispense_quantity,
              PrescriptionSourceId: 1,
              CashPrice: medPrice.data?.price! + (shippingId === 2 ? 15 : 0),

              Prescriber: {
                NPI:
                  order.prescription.clinician?.npi_key &&
                  parseInt(order.prescription.clinician?.npi_key, 10),
                FirstName: order.prescription.clinician.profiles?.first_name,
                LastName: order.prescription.clinician.profiles?.last_name,
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
        continue;
      }
      if (gogoOrders?.[order?.patient_id]) {
        gogoOrders?.[order?.patient_id].Drugs.push({
          ...(order?.national_drug_code === '7070016406' ||
          order?.prescription?.national_drug_code === '7070016406'
            ? {
                UPC:
                  order?.national_drug_code ||
                  order?.prescription?.national_drug_code,
              }
            : {
                NDC:
                  order?.national_drug_code ||
                  order?.prescription?.national_drug_code,
              }),
          Quantity: order.prescription?.dispense_quantity,
          PrescriptionSourceId: 1,
          CashPrice: medPrice.data?.price! + (shippingId === 2 ? 15 : 0),

          Prescriber: {
            NPI:
              order.prescription.clinician?.npi_key &&
              parseInt(order.prescription.clinician?.npi_key, 10),
            FirstName: order.prescription.clinician.profiles?.first_name,
            LastName: order.prescription.clinician.profiles?.last_name,
            Address: {
              Line1: '429 Lenox Ave',
              Line2: ', ',
              City: 'Miami Beach',
              State: 'FL',
              Zip: '33139',
            },
          },
        });
      }
    }

    const token = await fetch('https://app.getzealthy.com/api/gogomeds/auth')
      .then(res => res.json())
      .catch(e => e);

    console.log('auth token: ', token);

    for (const patientId of Object.keys(gogoOrders)) {
      const o = gogoOrders[Number(patientId)];
      const gogoOrderParams = {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order: o, token }),
      };

      const createOrder = await fetch(
        'https://app.getzealthy.com/api/gogomeds/create_order',
        gogoOrderParams
      )
        .then(res => res.json())
        .catch(e => e.json());

      console.log(`Patient-${o.Customer.AffiliateCustomerNumber}`, createOrder);

      console.log(createOrder.success, createOrder.errors);
      if (!createOrder.success) {
        const allOrders = successfulOrders.filter(
          ord => ord.patient_id === Number(patientId)
        );
        console.log('ORDER FAILED! ID: ', allOrders[0].id);
        await supabaseAdmin
          .from('order')
          .update({
            order_status: 'ERRORED',
            error_details: JSON.stringify(createOrder.errors),
            errored: true,
          })
          .in(
            'id',
            allOrders.map(o => o.id)
          );
        return res.status(500).json({
          status:
            'Order could not be sent: ' + JSON.stringify(createOrder.errors),
        });
      }

      if (createOrder.success) {
        const allOrders = successfulOrders.filter(
          ord =>
            ord.patient_id ===
            parseInt(createOrder.Value[0].Customer.AffiliateCustomerNumber, 10)
        );

        for (const order of allOrders) {
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
            .eq('id', order?.id);
        }
      }
    }

    console.log('ended');
    return res.status(200).send('OK');
  } catch (err) {
    console.log('error: ', err);
    return res.status(500).json({ error: err });
  }
}

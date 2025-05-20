import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { addDays, format, getUnixTime } from 'date-fns';
import getStripeInstance from '../stripe/createClient';
import jsPDF from 'jspdf';
import {
  ClinicianProps,
  OrderPrescriptionProps,
  PatientProps,
  PatientAddress,
} from '@/components/hooks/data';
import { getServiceSupabase } from '@/utils/supabase';
import { processRedRockPharmacyOrder } from '../stripe/utils/payment/helpers/processRedRockPharmacyOrder';
import { generateBelmarSignature } from '../utils/generateBelmarSignature';
import { processRevivePharmacyOrder } from '../stripe/utils/payment/helpers/processRevivePharmacyOrder';
import { Database } from '@/lib/database.types';
import { sendNotification } from '../stripe/utils/payment/helpers/sendNotification';

type OrderUpdate = Database['public']['Tables']['order']['Update'];

export default async function CreateCompoundOrderHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = getStripeInstance();

  try {
    const { invoice } = req.body;
    const supabaseAdmin = getServiceSupabase();

    const prescriptionRequest = await supabaseAdmin
      .from('prescription_request')
      .select()
      .eq('id', invoice.metadata?.zealthy_prescription_request_id)
      .single()
      .then(({ data }) => data);
    const existingOrder = await supabaseAdmin
      .from('order')
      .select(`*, prescription(*)`)
      .eq('id', invoice.metadata?.zealthy_order_id)
      .single()
      .then(({ data }) => data as OrderPrescriptionProps);

    if (existingOrder?.id) {
      await supabaseAdmin
        .from('order')
        .update({ invoice_id: invoice.reference_id })
        .eq('id', existingOrder?.id);
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
    if (prescriptionRequest?.status === 'PAYMENT_FAILED') {
      await supabaseAdmin
        .from('prescription_request')
        .update({ status: 'PAYMENT_SUCCESS' })
        .eq('id', prescriptionRequest?.id);
    }
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
      .then(({ data }) => data as PatientAddress);
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
    const clinician = await supabaseAdmin
      .from('clinician')
      .select('*, profiles(*)')
      .eq('id', existingOrder?.clinician_id)
      .maybeSingle()
      .then(({ data }) => data as ClinicianProps);

    if (existingOrder.prescription?.pharmacy === 'Red Rock') {
      await processRedRockPharmacyOrder(patient, existingOrder, patientAddress);
    }

    if (existingOrder?.prescription?.pharmacy === 'Empower') {
      const tokenParams = {
        method: 'POST',
        url: process.env.EMPOWER_BASE_URL + '/gettoken/post',
        headers: {
          APIKey: process.env.EMPOWER_API_KEY,
          APISecret: process.env.EMPOWER_API_SECRET,
        },
      };
      const token = await axios(tokenParams);

      console.log('emp_token', token);
      if (!token.data.token) {
        return;
      }

      const orderParams = {
        method: 'POST',
        url: process.env.EMPOWER_BASE_URL + '/NewRx/EasyRx',
        headers: {
          token: token.data.token,
        },
        data: {
          ClientOrderId: existingOrder?.id,
          DeliveryService:
            existingOrder?.shipment_method_id === 2
              ? 'UPS Priority Overnight Saturday Refrigerated'
              : 'UPS Priority 2-Day',
          AllowOverrideDeliveryService: true,
          LFPracticeId: process.env.EMPOWER_PRACTICE_ID,
          NewRxs: [
            {
              Patient: {
                ClientPatientId: null,
                LastName: patient?.profiles?.last_name,
                FirstName: patient?.profiles?.first_name,
                Gender: patient?.profiles?.gender?.[0]?.toUpperCase(),
                DateOfBirth: patient?.profiles?.birth_date,
                Address: {
                  AddressLine1: patientAddress?.address_line_1,
                  AddressLine2: patientAddress?.address_line_2 || ',',
                  City: patientAddress?.city,
                  StateProvince: patientAddress?.state,
                  PostalCode: patientAddress?.zip_code,
                  CountryCode: 'US',
                },
                PhoneNumber: patient?.profiles?.phone_number?.slice(1),
              },
              Prescriber: {
                NPI: 1841216629,
                stateLicenseNumber: 1841216629,
                LastName: 'Patel',
                FirstName: 'Risheet',
                Address: {
                  AddressLine1: '429 Lenox Ave',
                  AddressLine2: null,
                  City: 'Miami Beach',
                  StateProvince: 'FL',
                  PostalCode: '33139',
                  CountryCode: 'US',
                },
                PhoneNumber: '9549038072',
              },
              Medication: {
                ItemDesignatorId: existingOrder.prescription.medication_id,
                DrugDescription:
                  existingOrder?.prescription?.medication?.split(' ')[0],
                Quantity: 1,
                Refills: 0,
                DaysSupply: 30,
                WrittenDate: new Date(),
                SigText: existingOrder?.prescription?.dosage_instructions,
                Diagnosis: {
                  ClinicalInformationQualifier: 0,
                  Primary: {
                    Code: 'Sample',
                    Qualifier: 0,
                    Description: 'Sample description.',
                    DateOfLastOfficeVisit: {
                      Date: null,
                      DateTime: new Date(),
                    },
                  },
                },
              },
            },
            {
              Patient: {
                ClientPatientId: null,
                LastName: patient?.profiles?.last_name,
                FirstName: patient?.profiles?.first_name,
                Gender: patient?.profiles?.gender?.[0]?.toUpperCase(),
                DateOfBirth: patient?.profiles?.birth_date,
                Address: {
                  AddressLine1: patientAddress?.address_line_1,
                  AddressLine2: patientAddress?.address_line_2 || ',',
                  City: patientAddress?.city,
                  StateProvince: patientAddress?.state,
                  PostalCode: patientAddress?.zip_code,
                  CountryCode: 'US',
                },
                PhoneNumber: patient?.profiles?.phone_number?.slice(1),
              },
              Prescriber: {
                NPI: 1841216629,
                stateLicenseNumber: 1841216629,
                LastName: 'Patel',
                FirstName: 'Risheet',
                Address: {
                  AddressLine1: '429 Lenox Ave',
                  AddressLine2: null,
                  City: 'Miami Beach',
                  StateProvince: 'FL',
                  PostalCode: '33139',
                  CountryCode: 'US',
                },
                PhoneNumber: '9549038072',
              },
              Medication: {
                ItemDesignatorId: '4F9E5E47E47D98A4319E231FC611B158',
                DrugDescription: "SYRINGE 31G 5/16' 0.5CC (BD)",
                Quantity: 10,
                Refills: 0,
                DaysSupply: 30,
                WrittenDate: new Date(),
                SigText: 'USE AS DIRECTED FOR SEMAGLUTIDE INJECTION',
                Diagnosis: {
                  ClinicalInformationQualifier: 0,
                  Primary: {
                    Code: 'Sample',
                    Qualifier: 0,
                    Description: 'Sample description.',
                    DateOfLastOfficeVisit: {
                      Date: null,
                      DateTime: new Date(),
                    },
                  },
                },
              },
            },
            {
              Patient: {
                ClientPatientId: null,
                LastName: patient?.profiles?.last_name,
                FirstName: patient?.profiles?.first_name,
                Gender: patient?.profiles?.gender?.[0]?.toUpperCase(),
                DateOfBirth: patient?.profiles?.birth_date,
                Address: {
                  AddressLine1: patientAddress?.address_line_1,
                  AddressLine2: patientAddress?.address_line_2 || ',',
                  City: patientAddress?.city,
                  StateProvince: patientAddress?.state,
                  PostalCode: patientAddress?.zip_code,
                  CountryCode: 'US',
                },
                PhoneNumber: patient?.profiles?.phone_number?.slice(1),
              },
              Prescriber: {
                NPI: 1841216629,
                stateLicenseNumber: 1841216629,
                LastName: 'Patel',
                FirstName: 'Risheet',
                Address: {
                  AddressLine1: '429 Lenox Ave',
                  AddressLine2: null,
                  City: 'Miami Beach',
                  StateProvince: 'FL',
                  PostalCode: '33139',
                  CountryCode: 'US',
                },
                PhoneNumber: '9549038072',
              },
              Medication: {
                ItemDesignatorId: '164E03AAC77A9C31601F4F93A294D65F',
                DrugDescription: 'ALCOHOL PREP PADS (EASY TOUCH) (100 PACK) ',
                Quantity: 10,
                Refills: 0,
                DaysSupply: 30,
                WrittenDate: new Date(),
                SigText:
                  'FOR PREPARATION OF THE SKIN AND EQUIPMENT PRIOR TO INJECTION',
                Diagnosis: {
                  ClinicalInformationQualifier: 0,
                  Primary: {
                    Code: 'Sample',
                    Qualifier: 0,
                    Description: 'Sample description.',
                    DateOfLastOfficeVisit: {
                      Date: null,
                      DateTime: new Date(),
                    },
                  },
                },
              },
            },
          ],
          ReferenceFields: null,
        },
      };

      const newOrder = await axios(orderParams).catch(e => {
        console.log('new_order_err', e, e?.response?.data);
        console.log(e.response.data);
        throw new Error();
      });
      console.log(newOrder, 'NEWORDER');
      if (newOrder?.data?.eipOrderId) {
        await supabaseAdmin
          .from('order')
          .update({
            order_status: `SENT_TO_EMPOWER`,
            empower_order_id: newOrder.data?.eipOrderId,
          })
          .eq('id', parseInt(newOrder?.data?.clientOrderId, 10));
      }
    }

    if (existingOrder?.prescription?.pharmacy === 'Hallandale') {
      const auth = Buffer.from(
        `${process.env.HALLANDALE_USERNAME}:${process.env.HALLANDALE_PASSWORD}`
      ).toString('base64');
      console.log(auth, 'auth');
      const orderParams = {
        method: 'POST',
        url: process.env.HALLANDALE_BASE_URL + '/order',
        headers: {
          'content-type': 'application/json',
          'X-Vendor-ID': process.env.HALLANDALE_VENDOR_ID,
          'X-Location-ID': process.env.HALLANDALE_LOCATION_ID,
          'X-API-Network-ID': process.env.HALLANDALE_NETWORK_ID,
          Authorization: `Basic ${auth}`,
        },
        data: {
          message: {
            id: existingOrder?.id,
          },
          order: {
            prescriber: {
              npi: '1841216629',
              firstName: 'Risheet',
              lastName: 'Patel',
            },
            patient: {
              lastName: patient?.profiles?.last_name,
              firstName: patient?.profiles?.first_name,
              gender: patient?.profiles?.gender?.[0],
              dateOfBirth: patient?.profiles?.birth_date,
            },
            practice: {
              id: process.env.HALLANDALE_PRACTICE_ID,
            },
            shipping: {
              recipientType: 'patient',
              recipientLastName: patient?.profiles?.last_name,
              recipientFirstName: patient?.profiles?.first_name,
              recipientPhone: patient?.profiles?.phone_number,
              recipientEmail: patient?.profiles?.email,
              addressLine1: patientAddress?.address_line_1,
              addressLine2: patientAddress?.address_line_2 || ',',
              city: patientAddress?.city,
              state: patientAddress?.state,
              zipCode: patientAddress?.zip_code,
              country: 'US',
              service: 6230,
            },
            rxs: [
              {
                rxType: 'new',
                lfProductID: existingOrder.prescription.medication_id,
                drugName:
                  existingOrder?.prescription?.order_name ||
                  existingOrder?.prescription?.medication,
                directions: existingOrder?.prescription?.dosage_instructions,
                daysSupply: existingOrder?.prescription?.duration_in_days,
                quantity: 1,
              },

              {
                rxType: 'new',
                lfProductID: 8129501,
                drugName: 'BRUNO HEALTH GLP-1 KIT',
                directions: existingOrder?.prescription?.dosage_instructions,
                daysSupply: existingOrder?.prescription?.duration_in_days,
                quantity:
                  existingOrder?.prescription?.duration_in_days === 90 ? 3 : 1,
              },
            ],
          },
        },
      };
      console.log('orderParamsHallandale', orderParams);
      const hallandaleOrder = await axios(orderParams);

      console.log(hallandaleOrder?.data, 'HALLANDAL_ORDER');
      if (hallandaleOrder?.data?.data?.orderId) {
        console.log('here');
        const update = await supabaseAdmin
          .from('order')
          .update({
            order_status: 'SENT_TO_HALLANDALE',
            hallandale_order_id: hallandaleOrder?.data?.data?.orderId,
          })
          .eq('id', existingOrder?.id);
        console.log('halupdate', update);
      } else {
        throw new Error();
      }
    }

    if (existingOrder?.prescription?.pharmacy === 'Revive') {
      const reviveResponse = await processRevivePharmacyOrder(
        patient,
        [existingOrder],
        patientAddress
      );
      console.log('---REVIVE GROUPED ORDER SUCCESS----', reviveResponse);
    }
    if (existingOrder?.prescription?.pharmacy === 'Belmar') {
      const auth = Buffer.from(
        `${process.env.BELMAR_USERNAME}:${process.env.BELMAR_PASSWORD}`
      ).toString('base64');

      let belmarDrugName =
        existingOrder?.prescription?.medication_id === '7974701'
          ? '(CA) CYANOCOBALAMIN/SEMAGLUTIDE (1ML)'
          : '(CA) CYANOCOBALAMIN/SEMAGLUTIDE (5ML)';

      let belmarQuantity = existingOrder?.prescription?.medication?.includes(
        '1 mg'
      )
        ? 1
        : existingOrder?.prescription?.medication?.includes('2 mg')
        ? 2
        : existingOrder?.prescription?.medication?.includes('5 mg')
        ? 5
        : existingOrder?.prescription?.medication?.includes('10 mg')
        ? 10
        : undefined;

      const belmarSig = generateBelmarSignature(
        existingOrder?.prescription?.dosage_instructions,
        belmarQuantity
      );

      const pdf = await generatePdf();

      // await supabaseAdmin.storage
      //   .from("pdfs")
      //   .upload(`sig_latest_again_sigpls`, decode(pdf), {
      //     contentType: "application/pdf",
      //     upsert: true,
      //   });
      const orderParams = {
        method: 'POST',
        url: process.env.BELMAR_BASE_URL + '/order',
        headers: {
          'content-type': 'application/json',
          'X-Vendor-ID': process.env.BELMAR_VENDOR_ID,
          'X-Location-ID': process.env.BELMAR_LOCATION_ID,
          'X-API-Network-ID': process.env.BELMAR_NETWORK_ID,
          Authorization: `Basic ${auth}`,
        },
        data: {
          message: {
            id: existingOrder?.id,
          },
          order: {
            general: {
              referenceId: String(existingOrder?.id),
              statusId: process.env.BELMAR_STATUS_ID,
            },
            document: {
              pdfBase64: pdf,
            },
            prescriber: {
              npi: '1841216629',
              firstName: 'Risheet',
              lastName: 'Patel',
            },
            patient: {
              lastName: patient?.profiles?.last_name,
              firstName: patient?.profiles?.first_name,
              gender: patient?.profiles?.gender?.[0],
              dateOfBirth: patient?.profiles?.birth_date,
              address1: patientAddress?.address_line_1,
              address2: patientAddress?.address_line_2 || ',',
              city: patientAddress?.city,
              state: patientAddress?.state,
              zip: patientAddress?.zip_code,
              country: 'US',
              email: patient?.profiles?.email,
              phoneMobile: patient?.profiles?.phone_number,
              phoneHome: '',
            },
            practice: {
              id: process.env.BELMAR_PRACTICE_ID,
            },
            shipping: {
              recipientType: 'patient',
              recipientLastName: patient?.profiles?.last_name,
              recipientFirstName: patient?.profiles?.first_name,
              recipientPhone: patient?.profiles?.phone_number,
              recipientEmail: patient?.profiles?.email,
              addressLine1: patientAddress?.address_line_1,
              addressLine2: patientAddress?.address_line_2 || ',',
              city: patientAddress?.city,
              state: patientAddress?.state,
              zipCode: patientAddress?.zip_code,
              country: 'US',
              service: 5848,
            },
            rxs: [
              {
                rxType: 'new',
                lfProductID: existingOrder?.prescription?.medication_id,
                drugName: belmarDrugName,
                drugStrength: '1/1 MG/ML',
                drugForm: 'INJECTABLE',
                directions: belmarSig,
                daysSupply: existingOrder?.prescription?.duration_in_days,
                quantity: belmarQuantity,
              },
              ...[
                {
                  rxType: 'new',
                  lfProductID: 7170318,
                  drugName: 'SYRINGE GLOBAL',
                  drugForm: 'SYRINGE',
                  drugStrength: `30G-5/16\\"-1ML`,
                  directions:
                    'USE TO ADMINISTER INJECTABLE MEDICATION AS DIRECTED',
                  daysSupply: 28,
                  quantity: 10,
                },
                {
                  rxType: 'new',
                  lfProductID: 7169919,
                  drugName: 'ALCOHOL PREP GLOBAL',
                  drugStrength: 'EACH',
                  drugForm: 'EA',
                  directions:
                    'WIPE INJECTION SITE AND TOP OF MEDICATION VIAL PRIOR TO INJECTION',
                  daysSupply: 28,
                  quantity: 13,
                },
              ],
            ],
          },
        },
      };

      const belmarOrder = await axios(orderParams);
      console.log('-------BELMAR_ORDER_RESPONSE-------', belmarOrder?.data);

      if (belmarOrder?.data?.data?.orderId) {
        const update = await supabaseAdmin
          .from('order')
          .update({
            order_status: 'SENT_TO_BELMAR',
            belmar_order_id: belmarOrder?.data?.data?.orderId,
          })
          .eq('id', existingOrder?.id);
      } else {
        throw new Error('BELMAR RESPONSE MISSING DATA');
      }

      async function generatePdf() {
        const writtenDate = format(new Date(), 'yyyy/MM/dd');
        const pdf = new jsPDF();
        let y = 15;
        pdf.setFont('Helvetica');
        pdf.setFontSize(18);
        pdf.text(`ELECTRONIC PRESCRIPTION ORDER`, 53, y);

        y += 10;
        pdf.setFontSize(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Written Date:', 10, y);
        pdf.setFont('Helvetica', 'normal');
        pdf.text(writtenDate, 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Message ID:', 10, y);
        pdf.setFont('Helvetica', 'normal');
        pdf.text(String(existingOrder?.id), 45, y);
        pdf.setFont('Helvetica', 'bold');
        y += 7;
        pdf.text('Patient:', 10, y);
        pdf.setFont('Helvetica', 'normal');
        pdf.text(
          `${patient?.profiles?.last_name}, ${patient?.profiles?.first_name}`,
          45,
          y
        );
        y += 7;
        pdf.text(`DOB: ${patient?.profiles?.birth_date}`, 45, y);
        y += 7;
        pdf.text(patientAddress?.address_line_1 || '', 45, y);

        if (!!patientAddress?.address_line_2) {
          y += 7;
          pdf.text(patientAddress?.address_line_2, 45, y);
        }
        y += 7;
        pdf.text(
          `${patientAddress?.city}, ${patientAddress?.state}, ${patientAddress?.zip_code}`,
          45,
          y
        );
        y += 7;
        pdf.text(`Gender: ${patient?.profiles?.gender?.toUpperCase()}`, 45, y);
        y += 7;
        pdf.text(`Phone: ${patient?.profiles?.phone_number}`, 45, y);
        y += 2;
        pdf.setFont('Helvetica', 'bold');
        pdf.text(
          '_______________________________________________________________________________________________________________________________________________________________________________________',
          0,
          y
        );
        y += 10;
        pdf.text('#1', 10, y);

        pdf.text(`${belmarDrugName} INJECTABLE`, 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'normal');

        pdf.text(`Strength: 1/1 MG/ML`, 45, y);

        y += 7;

        pdf.text(`Qty: ${belmarQuantity} ML`, 45, y);

        y += 7;

        pdf.text('Refills: 0  | Substitution Allowed', 45, y);

        pdf.setFont('Helvetica', 'bold');
        y += 7;

        pdf.text('Sig:', 10, y);
        pdf.setFont('Helvetica', 'normal');

        let sigFirstLine;
        let sigSecondLine;

        if (belmarSig.length > 82) {
          sigFirstLine = belmarSig.slice(0, 82).trim();
          sigSecondLine = belmarSig.slice(82).trim();

          pdf.text(sigFirstLine, 33, y);
          y += 7;
          pdf.text(sigSecondLine, 33, y);
        } else {
          pdf.text(belmarSig, 20, y);
        }
        pdf.setFont('Helvetica', 'bold');

        y += 2;
        pdf.text(
          '_______________________________________________________________________________________________________________________________________________________________________________________',
          0,
          y
        );
        y += 10;

        pdf.text('#2', 10, y);

        pdf.text(`SYRINGE GLOBAL`, 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'normal');

        pdf.text(`Strength: 30G-5/16\\-1ML`, 45, y);

        y += 7;
        pdf.text(`Qty: 10 EA (ten)`, 45, y);
        y += 7;
        pdf.text('Refills: 0', 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Sig:', 10, y);
        pdf.setFont('Helvetica', 'normal');

        const syringeSig =
          'USE TO ADMINISTER INJECTABLE MEDICATION AS DIRECTED';

        pdf.text(syringeSig, 20, y);

        pdf.setFont('Helvetica', 'bold');

        y += 2;
        pdf.text(
          '_______________________________________________________________________________________________________________________________________________________________________________________',
          0,
          y
        );
        y += 10;

        pdf.text('#3:', 10, y);

        pdf.text(`ALCOHOL PREP GLOBAL`, 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'normal');

        pdf.text(`Strength: EACH`, 45, y);

        y += 7;
        pdf.text(`Qty: 13 EA (thirteen)`, 45, y);
        y += 7;
        pdf.text('Refills: 0', 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Sig:', 10, y);
        pdf.setFont('Helvetica', 'normal');

        const alcoholSig =
          'WIPE INJECTION SITE AND TOP OF MEDICATION VIAL PRIOR TO INJECTION';

        pdf.text(alcoholSig, 20, y);

        pdf.setFont('Helvetica', 'bold');

        y += 2;
        pdf.text(
          '_______________________________________________________________________________________________________________________________________________________________________________________',
          0,
          y
        );
        y += 7;

        let allergiesFirstLine;
        let allergiesSecondLine;
        if (allergies?.length > 80) {
          allergiesFirstLine = allergies.slice(0, 80).trim();
          allergiesSecondLine = allergies.slice(80).trim();

          pdf.text(
            `Special Instructions:   ALLERGIES: ${allergiesFirstLine}`,
            4,
            y
          );
          if (!!allergiesSecondLine) {
            y += 5;
            pdf.text(allergiesSecondLine, 4, y);
          }
        } else {
          pdf.text(
            `Special Instructions:   ALLERGIES: ${
              allergies ? allergies : 'NKDA'
            }`,
            4,
            y
          );
        }

        y += 7;

        pdf.text('Prescriber:', 10, y);

        pdf.setFont('Helvetica', 'normal');
        pdf.text('Patel, Risheet', 45, y);
        y += 7;
        pdf.text('429 Lenox Ave, Miami Beach, FL 33139', 45, y);
        y += 7;
        pdf.text('Phone: (877) 870-0323', 45, y);
        y += 7;
        pdf.text(`NPI: ${1841216629}`, 45, y);
        y += 7;
        pdf.text('State License Number: CA A 118748, DEA: #FE9739573', 45, y);
        y += 10;
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Delivery Type:', 10, y);
        pdf.setFont('Helvetica', 'normal');
        pdf.text(`UPS Next Day ($35)`, 45, y);
        y += 7;
        pdf.setFont('Helvetica', 'bold');
        pdf.text('Ship To:  ', 10, y);
        pdf.setFont('Helvetica', 'normal');
        pdf.text(
          `${patient?.profiles?.last_name}, ${patient?.profiles?.first_name}`,
          45,
          y
        );
        y += 7;

        if (!!patientAddress?.address_line_2) {
          pdf.text(patientAddress?.address_line_1 || '', 45, y);
          y += 7;
          pdf.text(
            `${patientAddress?.address_line_2}, ${patientAddress?.city}, ${patientAddress?.state}, ${patientAddress?.zip_code}`,
            45,
            y
          );
        } else {
          pdf.text(
            `${patientAddress?.address_line_1},  ${patientAddress?.city}, ${patientAddress?.state}, ${patientAddress?.zip_code}`,
            45,
            y
          );
        }
        y += 8;

        pdf.setFont('Courier', 'bold');
        pdf.setFontSize(14);

        pdf.text('Signed electronically by: Risheet Patel', 40, y);

        const base64EncodedPDF = Buffer.from(pdf.output()).toString('base64');

        return base64EncodedPDF;
      }
    }
    if (existingOrder?.prescription?.pharmacy === 'Tailor-Made') {
      console.log('PHARMPARAMS', existingOrder?.prescription?.pharmacy);

      const data = new URLSearchParams();
      data.append('AuthorizationKey', `${process.env.TAILOR_MADE_AUTH_KEY}`);
      data.append(
        'Values',
        JSON.stringify({
          prescriptions: [
            {
              physician_npi: '1841216629',
              shipping_method:
                existingOrder?.shipment_method_id === 2
                  ? 'Standard Overnight'
                  : 'Second Day Air',
              shipping_address: {
                shipping_city: patientAddress?.city,
                shipping_postal_code: patientAddress?.zip_code,
                shipping_state: patientAddress?.state,
                shipping_street: patientAddress?.address_line_1 || ', ',
                shipping_address_line2: patientAddress?.address_line_2 || ', ',
                shipping_country: 'United States',
              },
              patient: {
                first_name: patient?.profiles?.first_name,
                last_name: patient?.profiles?.last_name,
                dob: patient?.profiles?.birth_date,
                gender: patient?.profiles?.gender,
                email: patient?.profiles?.email,
                phone: patient?.profiles?.phone_number?.slice(1),
                ssn: '',
                allergies: allergies || ', ',
              },
              prescription_items: [
                {
                  Id: existingOrder.prescription.medication_id,
                  Quantity:
                    existingOrder?.prescription?.dispense_quantity?.toString(),
                  Sig: existingOrder?.prescription?.dosage_instructions,
                  Day_Supply:
                    existingOrder?.prescription?.duration_in_days?.toString(),
                  Reason_for_Compounding: 'Product not available commercially',
                },
                {
                  Id: '01t36000003zHLRAA2',
                  Quantity:
                    existingOrder?.prescription?.duration_in_days === 90
                      ? '3'
                      : '1',
                  Sig: 'Use with medication',
                  Day_Supply:
                    existingOrder?.prescription?.duration_in_days?.toString(),
                  Reason_for_Compounding: 'Product not available commercially',
                },
                {
                  Id: '01t36000003SgvJAAS',
                  Quantity:
                    existingOrder?.prescription?.duration_in_days === 90
                      ? '3'
                      : '1',
                  Sig: 'Use with medication',
                  Day_Supply:
                    existingOrder?.prescription?.duration_in_days?.toString(),
                  Reason_for_Compounding: 'Product not available commercially',
                },
              ],
            },
          ],
        })
      );

      const tailorMadeParams = {
        method: 'POST',
        url: `${process.env.TAILOR_MADE_BASE_URL}/api/zealthy_integration.asmx/ReceiveOrder`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
      };

      const tailorMadeOrder = await axios(tailorMadeParams);
      console.log('ORDER_PLACED', tailorMadeOrder);
      console.log(tailorMadeOrder, 'ORDER_PLACED');

      if (tailorMadeOrder.data.request_status === 'success') {
        await supabaseAdmin
          .from('order')
          .update({
            order_status: 'SENT_TO_TAILOR_MADE',
            tmc_order_id: tailorMadeOrder?.data?.order_id,
          })
          .eq('id', existingOrder?.id);
      } else {
        throw new Error();
      }
    }

    await sendNotification({
      email: patient?.profiles?.email || '',
      order: existingOrder,
      invoiceDescription: invoice.description || '',
      price: invoice.amount_paid,
      durationInDays: existingOrder.prescription?.duration_in_days || 0,
    });

    const subscription = await stripe.subscriptions.create({
      customer: patientStripe?.customer_id || '',
      cancel_at: getUnixTime(
        addDays(
          new Date(),
          invoice.metadata?.zealthy_bundled
            ? (existingOrder?.prescription?.duration_in_days ?? 0) * 3
            : existingOrder?.prescription?.duration_in_days || 0
        )
      ),
      trial_end: getUnixTime(
        addDays(new Date(), existingOrder.prescription?.duration_in_days || 0)
      ),
      items: [
        {
          price_data: {
            unit_amount: (existingOrder?.total_price ?? 0) * 100,
            currency: 'usd',
            product:
              process.env.VERCEL_ENV === 'production'
                ? 'prod_NwpuVp8xHH6YNK'
                : 'prod_NsjVtgm1CFPTJq',
            recurring: {
              interval: 'day',
              interval_count:
                existingOrder?.prescription?.duration_in_days || 0,
            },
          },
        },
      ],
      metadata: {
        zealthy_care: 'Weight loss',
        zealthy_patient_id: patient?.id || null,
        zealthy_subscription_id: 5,
        zealthy_order_id: existingOrder?.id || null,
        zealthy_prescription_request_id:
          invoice.metadata?.zealthy_prescription_request_id || '',
        ...(invoice.metadata?.zealthy_bundled && {
          zealthy_bundled: 'true',
        }),
      },
    });

    console.log('updatePrescriptionRequest', existingOrder);

    res.status(200).json(existingOrder);
  } catch {
    res.status(500).json('There was an error creating order');
  }
}

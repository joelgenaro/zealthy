import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateBelmarSignature } from '@/pages/api/utils/generateBelmarSignature';
import axios, { isAxiosError, AxiosError } from 'axios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

export const processBelmarPharmacyOrder = async (
  patient: PatientProps,
  orders: OrderPrescriptionProps[],
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  console.log('BELMAR_PHARMACY_START', {
    orderId: orders[0]?.id,
    prescription: {
      id: orders[0]?.prescription?.id,
      pharmacy: orders[0]?.prescription?.pharmacy,
      medication: orders[0]?.prescription?.medication,
    },
  });

  if (
    !orders[0]?.prescription?.medication_id ||
    !orders[0]?.prescription?.pharmacy
  ) {
    console.log('BELMAR_INVALID_PRESCRIPTION', {
      orderId: orders[0]?.id,
      prescriptionId: orders[0]?.prescription?.id,
    });
    throw new Error('Invalid prescription data for Belmar order');
  }

  console.log({ starting_belmar: '====================================' });
  if (orders.length === 0) {
    console.log(`Orders array is empty for Belmar pharmacy`);
    return;
  }
  const filteredOrders = orders.filter(
    o => !o.belmar_order_id && o.order_status !== 'SENT_TO_BELMAR'
  );

  console.log({ insideProcessBelmar: filteredOrders });

  if (orders.length === 0) {
    console?.log('belmar_created', {
      message: `All orders have already been sent to Belmar`,
    });
    return;
  }

  console?.log(`${new Date().toISOString()} start processing_Belmar`, {
    message: `Starting processing Belmar orders: ${filteredOrders
      .map(o => o.id)
      .join(',')}`,
  });

  try {
    const auth = Buffer.from(
      `${process.env.BELMAR_USERNAME}:${process.env.BELMAR_PASSWORD}`
    ).toString('base64');

    if (!Array.isArray(orders) || !orders?.[0]?.patient_id) {
      throw new Error(
        `Missing or malformed data for Belmar patient: ${
          orders?.[0]?.patient_id ?? 'Missing patient id'
        }`
      );
    }
    const allergies = await supabaseAdmin
      .from('medical_history')
      .select('allergies')
      .eq('patient_id', orders[0]?.patient_id)
      .single()
      .then(({ data }) => {
        return data?.allergies?.trim().length ? data.allergies.trim() : 'NKDA';
      });

    let belmarDrugName =
      filteredOrders[0]?.prescription?.medication_id === '7974701'
        ? '(CA) CYANOCOBALAMIN/SEMAGLUTIDE (1ML)'
        : '(CA) CYANOCOBALAMIN/SEMAGLUTIDE (5ML)';

    let belmarQuantity = filteredOrders[0]?.prescription?.medication?.includes(
      '1 mg'
    )
      ? 1
      : filteredOrders[0]?.prescription?.medication?.includes('2 mg')
      ? 2
      : filteredOrders[0]?.prescription?.medication?.includes('5 mg')
      ? 5
      : filteredOrders[0]?.prescription?.medication?.includes('10 mg')
      ? 10
      : undefined;

    console.log({ insideProcessBelmar: 'still here' });

    const belmarSig = generateBelmarSignature(
      filteredOrders[0]?.prescription?.dosage_instructions,
      belmarQuantity
    );

    console.log({ insideProcessBelmar: belmarSig });

    const pdf = await generatePdf();
    if (!pdf) {
      console.log('error creating pdf');
    }

    const headers = {
      'content-type': 'application/json',
      'X-Vendor-ID': process.env.BELMAR_VENDOR_ID,
      'X-Location-ID': process.env.BELMAR_LOCATION_ID,
      'X-API-Network-ID': process.env.BELMAR_NETWORK_ID,
      Authorization: `Basic ${auth}`,
    };

    const orderParams = {
      method: 'POST',
      url: process.env.BELMAR_BASE_URL + '/order',
      headers,
      data: {
        message: {
          id: filteredOrders[0]?.id,
        },
        order: {
          general: {
            referenceId: String(filteredOrders[0]?.id),
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
            gender: patient?.profiles?.gender?.[0] ?? 'F',
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
              lfProductID: filteredOrders[0]?.prescription?.medication_id,
              drugName: belmarDrugName,
              drugStrength: '1/1 MG/ML',
              drugForm: 'INJECTABLE',
              directions: belmarSig,
              daysSupply: filteredOrders[0]?.prescription?.duration_in_days,
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

    let belmarOrder: any;

    try {
      console.log('BELMAR_MAKING_API_CALL_START');
      belmarOrder = await axios(orderParams);
      console.log('BELMAR_API_CALL_COMPLETE', {
        status: belmarOrder?.status,
        hasData: !!belmarOrder?.data,
      });
    } catch (axiosError) {
      console.log('BELMAR_API_CALL_FAILED', {
        error:
          axiosError instanceof Error ? axiosError.message : 'Unknown error',
        response: isAxiosError(axiosError) ? axiosError.response?.data : null,
        status: isAxiosError(axiosError) ? axiosError.response?.status : null,
        headers: headers,
      });
      throw axiosError;
    }

    // Add check to ensure we have belmarOrder
    if (!belmarOrder) {
      console.log('BELMAR_ORDER_UNDEFINED');
      throw new Error('Belmar order undefined after API call');
    }

    console.log('BELMAR_ORDER_RESPONSE', {
      orderId: belmarOrder?.data?.data?.orderId,
      fullResponse: belmarOrder?.data,
    });

    if (!belmarOrder?.data?.data?.orderId) {
      console.log('BELMAR_MISSING_ORDER_ID', {
        response: belmarOrder?.data,
      });
      throw new Error(
        `Could not find belmar order in ${JSON.stringify(belmarOrder?.data)}`
      );
    }

    if (!belmarOrder?.data?.data?.orderId) {
      throw new Error(
        `Could not find belmar order in ${JSON.stringify(belmarOrder?.data)}`
      );
    }

    if (belmarOrder?.data?.data?.orderId) {
      const update = await supabaseAdmin
        .from('order')
        .update({
          order_status: 'SENT_TO_BELMAR',
          belmar_order_id: belmarOrder?.data?.data?.orderId,
        })
        .eq('id', orders[0]?.id);
    } else {
      throw new Error('BELMAR RESPONSE MISSING DATA');
    }

    async function generatePdf() {
      console.log(
        `${new Date().toISOString()} processing_Belmar: start creating pdf`
      );
      // const downloadFile = async (filePath: string) =>
      //   supabaseAdmin.storage
      //     .from("provider_avatars")
      //     .download(filePath)
      //     .then(({ data }) => data && URL.createObjectURL(data));

      // const signatureBlobURL = (await downloadFile(
      //   "Dr_E_signature.png"
      // )) as any;
      // console.log(signatureBlobURL, "did we get it?");

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
      pdf.text(String(orders[0]?.id), 45, y);
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

      const syringeSig = 'USE TO ADMINISTER INJECTABLE MEDICATION AS DIRECTED';

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

      console.log(
        `${new Date().toISOString()} processing_Belmar: finished creating pdf`
      );
      return base64EncodedPDF;
    }

    //none of the orders were sent to Belmar
    console.log(`${new Date().toISOString()} finish processing_Belmar`, {
      message: `Finish processing Belmar orders: ${orders
        .map(o => o.id)
        .join(',')}`,
    });

    return belmarOrder?.data?.data?.orderId;
  } catch (err) {
    let message = (err as Error)?.message ?? 'process Belmar Err';

    if (isAxiosError(err)) {
      message =
        `BELMAR ERROR: ${JSON.stringify(
          (err as AxiosError)?.response?.data
        )}` || message;
    }

    throw new Error(message);
  }
};

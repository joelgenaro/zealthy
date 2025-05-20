import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios, { isAxiosError, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { addAndSendCompoundPrescription } from './addAndSendCompoundPrescription';

type BoothwynOrderResponse = {
  Results: Array<{ CaseId: string; TimeStamp: string }>;
  TotalCount: 1;
  Message: string;
  Success: boolean;
};

export const processBoothwynPharmacyOrder = async (
  patient: PatientProps,
  orders: OrderPrescriptionProps[],
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  orders = orders.filter(
    o =>
      !o.boothwyn_case_id &&
      !['SENT_TO_BOOTHWYN', 'Received'].includes(o.order_status || '')
  );

  console.log('filtered orders: ', orders);
  console.log('filtered orders length: ', orders.length);

  const prescriptions = orders.map(o => o.prescription);

  if (prescriptions.length !== orders.length) {
    throw new Error(
      `Some orders do not have prescription associated with them. Orders: ${orders
        .map(o => o.id)
        .join(',')}`
    );
  }

  const caseId = uuidv4();

  console.log(caseId);

  const medHistory = await supabaseAdmin
    .from('medical_history')
    .select()
    .eq('patient_id', patient?.id)
    .maybeSingle();

  try {
    if (process.env.VERCEL_ENV === 'production') {
      const response = await addAndSendCompoundPrescription({
        orders,
        patient,
        caseId,
      });
      console.log(response, 'RESPONSE');
      console.log(process.env.VERCEL_ENV, 'VERCEL_ENV');
    } else {
      console.log('Not in production');
    }
    let data: any;

    data = {
      caseId: caseId,
      orderType: 1,
      shippingMethod: 43,
      patient: {
        firstName: patient?.profiles?.first_name,
        lastName: patient?.profiles?.last_name,
        email: patient?.profiles?.email,
        phoneNumber: patient?.profiles?.phone_number,
        dateOfBirth: patient?.profiles?.birth_date,
        gender: patient?.profiles?.gender,
        address: {
          address1: patientAddress.address_line_1,
          address2: patientAddress.address_line_2 || '',
          city: patientAddress.city,
          state: patientAddress.state,
          zipCode: patientAddress.zip_code,
        },
        allergies: medHistory?.data?.allergies
          ? [medHistory?.data?.allergies]
          : [],
        medications: [] as string[],
        conditions: medHistory?.data?.medical_conditions
          ? [medHistory?.data?.medical_conditions]
          : [],
      },
      clinician: {
        fullName: 'Risheet Patel',
        licenses: [
          {
            type: 'npi',
            value: String(
              process.env.VERCEL_ENV === 'production' ? 1841216629 : 1053541581
            ),
          },
        ],
      },
      prescriptions: [] as any[],
    };

    if (orders.length > 1) {
      data = { ...data, program: 'Quarterly Bulk' };
    }

    orders.forEach((order, idx) => {
      const prescription = order.prescription;

      data?.patient?.medications.push(prescription?.order_name!);

      let prescriptionPayload: any;
      prescriptionPayload = {
        sku: prescription?.medication_id,
        amount: 1,
        unit: 'vial',
        daysSupply: prescription?.duration_in_days || 30,
        notes: `Zealthy order ${order.id}`,
        instructions: `Month ${idx + 1} Vial: ${
          prescription?.dosage_instructions
        }`,
      };

      if (orders.length > 1) {
        prescriptionPayload = { ...prescriptionPayload, mod: idx + 1 };
      }

      data?.prescriptions?.push(prescriptionPayload);
    });

    console.log('BOOTHWYN ORDER PAYLOAD: ', JSON.stringify(data));

    const orderParams = {
      method: 'POST',
      url: process.env.BOOTHWYN_BASE_URL + `api/Prescriptions/B2B`,
      headers: {
        'content-type': 'application/json',
        'x-functions-key': process.env.BOOTHWYN_API_KEY,
      },
      data: data,
    };

    const boothwynResponse = await axios<BoothwynOrderResponse>(orderParams);
    console.log(boothwynResponse.data);

    await supabaseAdmin
      .from('order')
      .update({
        order_status: `SENT_TO_BOOTHWYN`,
        boothwyn_case_id: caseId,
      })
      .in(
        'id',
        orders.map(o => o.id)
      );

    return boothwynResponse;
  } catch (err) {
    let message = (err as Error)?.message;

    if (isAxiosError(err)) {
      message = `BOOTHWYN ERROR: ${JSON.stringify(
        (err as AxiosError)?.response?.data ?? message
      )}`;
    }

    console.log(message);
    throw new Error(message);
  }
};

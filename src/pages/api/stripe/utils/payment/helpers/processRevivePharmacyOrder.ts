import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notEmpty } from '@/types/utils/notEmpty';
import {
  buildRevivePrescriptions,
  RevivePrescriptionItem,
} from '@/utils/Revive/buildRevivePrescriptions';
import axios, { isAxiosError, AxiosError } from 'axios';
import { createRevivePatient } from '@/utils/Revive/createRevivePatient';
import { uuid } from 'uuidv4';
import { phoneDigitsOnly } from '@/utils/phoneDigitsOnly';

type ReviveOrderResponse = {
  messages: { message: string; type: string }[];
  success: number | string | boolean;
}; // revive just changed success response from 1 to True (in the logs). not sure if string 'True' or true bool

export const processRevivePharmacyOrder = async (
  patient: PatientProps,
  orders: OrderPrescriptionProps[],
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  if (orders.length === 0) {
    return console.log(`Orders array is empty for Revive pharmacy`);
  }

  orders = orders.filter(
    o =>
      !o.revive_order_id &&
      !['SENT_TO_REVIVE', 'Received'].includes(o.order_status || '')
  );

  if (orders.length === 0) {
    console.log('revive_already_created', {
      message: `All orders have already been sent to Revive`,
    });
    return;
  }

  const prescriptions = orders.map(o => o.prescription).filter(notEmpty);

  if (prescriptions.length !== orders.length) {
    throw new Error(
      `Some orders do not have prescription associated with them. Orders: ${orders
        .map(o => o.id)
        .join(',')}`
    );
  }

  const medicationOrderIdentifier = uuid();

  try {
    let revivePatientId = patient?.revive_id;
    console.log('----REVIVE PATIENT ID----', revivePatientId);
    if (!revivePatientId) {
      revivePatientId = await createRevivePatient(patient, patientAddress);
      console.log('----REVIVE PATIENT ID POST----', revivePatientId);
      await supabaseAdmin
        .from('patient')
        .update({ revive_id: revivePatientId })
        .eq('id', patient?.id)
        .throwOnError();
    }

    const prescriptionItems = buildRevivePrescriptions({
      prescriptions,
    });

    const orderParams = {
      method: 'PUT',
      url:
        process.env.REVIVE_BASE_URL +
        `/api/v5/provider_portal/medication_order/id/${medicationOrderIdentifier}/submit`,
      headers: {
        'content-type': 'application/json',
        'x-pmk-authentication-token': process.env.REVIVE_API_KEY,
      },
      data: {
        clinic_identifier: process.env.REVIVE_CLINIC_IDENTIFIER,
        medication_order_identifier: medicationOrderIdentifier,
        medication_requests: prescriptionItems,
        patient: {
          DOB: patient?.profiles?.birth_date,
          address: {
            line_1: patientAddress?.address_line_1,
            line_2: patientAddress?.address_line_2 ?? null,
            city: patientAddress?.city,
            state: patientAddress?.state,
            postal_code: patientAddress?.zip_code,
          },
          email: patient?.profiles?.email,
          gender: (patient?.profiles?.gender ?? 'O')[0].toUpperCase(),
          identification: {
            patient_id: revivePatientId,
          },
          name: {
            last_name: patient?.profiles?.last_name,
            first_name: patient?.profiles?.first_name,
            suffix: null,
          },
          species: 'human',
          phone_primary: phoneDigitsOnly(patient?.profiles?.phone_number ?? ''),
        },
      },
    };

    const { data: newOrder } = await axios<ReviveOrderResponse>(orderParams);

    if (
      newOrder.success !== 1 &&
      newOrder.success !== true &&
      newOrder.success !== 'True'
    ) {
      console.log(orderParams);
      console.log(newOrder);
      throw new Error(`Unable to create revive order`);
    }

    const updateOrder = async (
      prescriptionItem: RevivePrescriptionItem,
      i: number
    ) => {
      const newOrder = await supabaseAdmin
        .from('order')
        .update({
          order_status: `SENT_TO_REVIVE`,
          revive_order_id: medicationOrderIdentifier,
          revive_entry_id: prescriptionItem.medication_order_entry_identifier,
        })
        .eq('id', orders[i].id)
        .select();

      console.log('reviveUpdateOrder', newOrder);
    };
    await Promise.all(prescriptionItems.map(updateOrder));
    return newOrder;
  } catch (err) {
    let message = (err as Error)?.message;

    if (isAxiosError(err)) {
      message = `REVIVE ERROR: ${JSON.stringify(
        (err as AxiosError)?.response?.data ?? message
      )}`;
    }

    throw new Error(message);
  }
};

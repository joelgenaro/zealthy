import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { createDosespotToken } from '@/pages/api/dosespot/_utils/createDosespotToken';
import axios, { AxiosRequestConfig } from 'axios';

export type DosespotResult = {
  ResultCode: string;
  ResultDescription: string;
};

export type DosespotSendPrescriptionsResponse = {
  Id: number;
  Result: DosespotResult;
}[];

export type DosespotAddCompoundPrescriptionResponse = {
  Id: number;
  Result: DosespotResult;
};

type PrescriptionOptions = {
  PrescriptionId: number;
  dosespotPatientId: number;
};

export const sendPrescription = async (
  token: string,
  options: PrescriptionOptions
) => {
  console.log('Token:', token);
  console.log('Prescription Options:', options);
  const sendOptions: AxiosRequestConfig = {
    method: 'POST',
    url: `${process.env.DOSESPOT_BASE_URL!}/webapi/v2/api/patients/${
      options.dosespotPatientId
    }/prescriptions/send`,
    headers: {
      'Subscription-Key': process.env.DOSESPOT_SUBSCRIPTION_KEY,
      Authorization: `Bearer ${token}`,
    },
    data: { PrescriptionIds: [options.PrescriptionId] },
  };

  console.log('Send Options:', sendOptions);

  try {
    const { data: sentPrescription } =
      await axios<DosespotSendPrescriptionsResponse>(sendOptions);

    console.log('Sent Prescription Response:', sentPrescription);

    if (sentPrescription[0].Result.ResultCode === 'ERROR') {
      const details = `Details: {Resource: SendPrescription, PrescriptionId: ${options.PrescriptionId}}`;
      console.error(
        'Error sending prescription:',
        sentPrescription[0].Result.ResultDescription
      );
      throw new Error(
        sentPrescription[0].Result.ResultDescription + `. ${details}`
      );
    }

    console.log('Prescription sent successfully, ID:', sentPrescription[0].Id);
    return sentPrescription[0].Id;
  } catch (error) {
    console.error('Error in sendPrescription:', error);
    throw error;
  }
};

export const addAndSendCompoundPrescription = async ({
  orders,
  patient,
  caseId,
}: {
  orders: OrderPrescriptionProps[];
  patient: PatientProps;
  caseId: string;
}) => {
  const { data: token } = await createDosespotToken();

  // Add prescription
  const prescriptionResponses = await Promise.all(
    orders.map(async (order, idx) => {
      const addCompoundPrescriptionParams: AxiosRequestConfig = {
        method: 'POST',
        url:
          `${process.env.DOSESPOT_BASE_URL!}` +
          `/webapi/v2/api/patients/${patient.dosespot_patient_id}/prescriptions/compiledcompound`,
        headers: {
          'Subscription-Key': process.env.DOSESPOT_SUBSCRIPTION_KEY,
          Authorization: `Bearer ${token.access_token}`,
        },
        data: {
          CompoundDescription: order.prescription?.order_name,
          CompoundIngredients: [
            {
              FreeText: order.prescription?.order_name?.replace(
                'with Admin Kit',
                ''
              ),
              Quantity: 1,
              IsFreeTextEPCS: false,
              DispenseUnitId: 15,
            },
          ],
          DispenseUnitId: 15,
          Status: 1,
          Quantity: 1,
          Directions: `Month ${idx + 1} Vial: ${
            order.prescription?.dosage_instructions
          }`,
          Refills: 1,
          PharmacyNotes: `Case ID: ${caseId} Zealthy128568 SKU: ${
            order.prescription?.medication_id
          }${orders.length > 1 ? ' MOD: ' + (idx + 1) : ''}`,
          // Boothwyn pharmacy is not set up in DoseSpot staging so using 'Brooklyn @ Gates Pharmacy' instead
          PharmacyId: process.env.VERCEL_ENV === 'production' ? 41717 : 15380,
        },
      };
      console.log(
        'compoundPrescriptionParams =',
        JSON.stringify(addCompoundPrescriptionParams)
      );
      try {
        const dosespotResponse =
          await axios<DosespotAddCompoundPrescriptionResponse>(
            addCompoundPrescriptionParams
          );
        console.log('Dosespot Response =', dosespotResponse.data);
        return dosespotResponse;
      } catch (e) {
        console.error('Error adding compound prescription for order:', order);
        console.error('Error details:', e);
        throw e;
      }
    })
  );
  const sentIds = Promise.all(
    prescriptionResponses.map(async response => {
      return await sendPrescription(token.access_token, {
        dosespotPatientId: patient.dosespot_patient_id!,
        PrescriptionId: response.data.Id,
      });
    })
  );
  return sentIds;
};

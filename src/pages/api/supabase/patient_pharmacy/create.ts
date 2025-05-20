import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseWebhookHandlerWrapper } from '../../wrappers/supabaseWebhookWrapper';
import { addPatientPreferredPharmacyToDosespot } from '../patient/_utils/addPatientPreferredPharmacyToDosespot';

type PatientPharmacy = Database['public']['Tables']['patient_pharmacy']['Row'];

type InsertPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: PatientPharmacy;
  old_record: null;
};

const handlePatientPharmacyCreation = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const { record } = req.body as InsertPayload;

    //check if patient has dosespot id
    const patient = await supabaseAdmin
      .from('patient')
      .select('id, dosespot_patient_id')
      .eq('id', record.patient_id)
      .maybeSingle()
      .then(({ data }) => data);

    if (!patient) {
      throw new Error(
        `Could not find patient for patient id: ${record.patient_id}`
      );
    }

    //check if patient does not have dosespot id
    if (patient.dosespot_patient_id) {
      console.log({
        message: `Create => Adding Preferred Pharmacy to dosespot for patient ${record.patient_id}`,
      });

      await addPatientPreferredPharmacyToDosespot(
        patient.id,
        patient.dosespot_patient_id
      );
    } else {
      console.log({
        message: `Could not find dosespot_patient_id for patient ${patient.id}`,
      });
    }

    res.status(200).json({
      message: 'OK',
    });
  } catch (err: any) {
    console.error(err);
    res.status(422).json(err?.message || 'There was an unexpected error');
  }
};

export default async function UpdateOrder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return supabaseWebhookHandlerWrapper(req, res, handlePatientPharmacyCreation);
}

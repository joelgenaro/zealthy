import { PatientProps } from '@/components/hooks/data';
import axios from 'axios';

export const createDraftInvoicePayment = async (
  patient: PatientProps,
  hasCalledApi: any
) => {
  if (hasCalledApi.current) return;
  hasCalledApi.current = true;
  try {
    const metaData = {
      zealthy_care: 'Weight loss',
      zealthy_subscription_id: 4,
      reason: `weight-loss-membership`,
      zealthy_patient_id: patient?.id,
    };
    const response = await axios.post(
      '/api/service/payment/create-invoice-payment',
      {
        patientId: patient?.id,
        amount: Math.round(39.0 * 100),
        metadata: metaData,
        description: 'First month membership',
        doNotCharge: true,
        idempotencyKey: null,
      }
    );
    console.log({ response });
  } catch (err) {
    console.error('there was an error');
  }
};

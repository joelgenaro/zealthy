import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notEmpty } from '@/types/utils/notEmpty';
import axios, { isAxiosError, AxiosError } from 'axios';
import { buildEmpowerPrescriptions } from '@/utils/Empower/buildEmpowerPrescriptions';

type EmpowerOrderResponse = {
  eipOrderId: number;
  clientOrderId: string;
  note: string;
};

const empowerToken = async () => {
  const tokenParams = {
    method: 'POST',
    url: process.env.EMPOWER_BASE_URL + '/gettoken/post',
    headers: {
      APIKey: process.env.EMPOWER_API_KEY,
      APISecret: process.env.EMPOWER_API_SECRET,
    },
  };

  return axios(tokenParams);
};

export const processEmpowerPharmacyOrder = async (
  patient: PatientProps,
  orders: OrderPrescriptionProps[],
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  if (orders.length === 0) {
    console.log({
      message: `Orders array is empty for Empower pharmacy`,
    });
    return;
  }
  orders = orders.filter(
    o =>
      !o.empower_order_id &&
      !['SENT_TO_EMPOWER', 'Received'].includes(o.order_status || '')
  );

  if (orders.length === 0) {
    console.log({
      message: `All orders have already been sent to Empower`,
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

  try {
    const { data: token } = await empowerToken();

    if (!token.token) {
      throw new Error(
        `Could not find access_token for Empower pharmacy. Here are details: ${JSON.stringify(
          token
        )}`
      );
    }

    const prescriptionItems = buildEmpowerPrescriptions({
      prescriptions,
      patientProfile: patient.profiles,
      patientAddress,
      patientRegion: patient?.region!,
    });

    const orderParams = {
      method: 'POST',
      url: process.env.EMPOWER_BASE_URL + '/NewRx/EasyRx',
      headers: {
        token: token.token,
      },
      data: {
        ClientOrderId: orders[0].id,
        DeliveryService:
          orders[0].shipment_method_id === 2
            ? 'UPS Priority Overnight Saturday Refrigerated'
            : 'UPS Priority 2-Day',
        AllowOverrideDeliveryService: true,
        LFPracticeId: process.env.EMPOWER_PRACTICE_ID,
        NewRxs: prescriptionItems,
        ReferenceFields: null,
      },
    };
    const { data: newOrder } = await axios<EmpowerOrderResponse>(orderParams);

    if (!newOrder.eipOrderId) {
      throw new Error(
        `Could not find Empower order Id in ${JSON.stringify(newOrder)}`
      );
    }

    if (newOrder.eipOrderId) {
      await supabaseAdmin
        .from('order')
        .update({
          order_status: `SENT_TO_EMPOWER`,
          empower_order_id: String(newOrder.eipOrderId),
        })
        .in(
          'id',
          orders.map(o => o.id)
        );
    }

    return newOrder.eipOrderId;
  } catch (err) {
    let message = (err as Error).message;

    if (isAxiosError(err)) {
      message =
        `EMPOWER ERROR: ${JSON.stringify(
          (err as AxiosError)?.response?.data
        )}` || message;
    }

    throw new Error(message);
  }
};

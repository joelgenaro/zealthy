import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notEmpty } from '@/types/utils/notEmpty';
import axios, { AxiosError, isAxiosError } from 'axios';

type Prescription = Database['public']['Tables']['prescription']['Row'];

type TailorMadeOrderResponse = {
  request_status: string;
  order_id: string;
};

type TailorMadePrescriptionItem = {
  Id: string;
  Quantity: string;
  Sig: string;
  Day_Supply: string;
  Reason_for_Compounding: string;
};

type PrescriptionBuilderType = {
  prescription: Prescription;
};

const buildSupplies = ({
  prescription,
}: {
  prescription: PrescriptionBuilderType['prescription'];
}) => {
  return [
    {
      Id: '01t36000003zHLRAA2',
      Quantity: prescription.duration_in_days === 90 ? '3' : '1',
      Sig: 'Use with medication',
      Day_Supply: prescription?.duration_in_days!.toString(),
      Reason_for_Compounding: 'Product not available commercially',
    },
    {
      Id: '01t36000003SgvJAAS',
      Quantity: prescription.duration_in_days === 90 ? '3' : '1',
      Sig: 'Use with medication',
      Day_Supply: prescription.duration_in_days!.toString(),
      Reason_for_Compounding: 'Product not available commercially',
    },
  ];
};

const buildPrescription = ({ prescription }: PrescriptionBuilderType) => {
  return {
    Id: prescription.medication_id!,
    Quantity: prescription.dispense_quantity!.toString()!,
    Sig: prescription.dosage_instructions!,
    Day_Supply: prescription.duration_in_days!.toString()!,
    Reason_for_Compounding: 'Product not available commercially',
  };
};

export const processTailorMadePharmacyOrder = async (
  patient: PatientProps,
  orders: OrderPrescriptionProps[],
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  if (orders.length === 0) {
    console.log({
      message: `Orders array is empty for Tailor-Made pharmacy`,
    });

    return;
  }

  //check if all orders were sent to empower already
  const sentToTailorMade = orders.filter(
    o =>
      !!o.tmc_order_id ||
      ['SENT_TO_TAILOR_MADE', 'Order Received'].includes(o.order_status || '')
  );

  if (sentToTailorMade.length === orders.length) {
    console.log({
      message: `Looks like orders ${orders
        .map(o => o.id)
        .join(',')} have already been created. Returning...`,
    });

    return orders.map(o => o.tmc_order_id).join(',');
  }

  //check if some orders were send to empower
  if (
    orders.length !== sentToTailorMade.length &&
    sentToTailorMade.length > 0
  ) {
    throw new Error(
      `Looks like some of the following orders ${orders
        .map(o => o.id)
        .join(',')} were sent to Tailor-Made already.`
    );
  }

  const prescriptions = orders.map(o => o.prescription).filter(notEmpty);

  if (prescriptions.length !== orders.length) {
    throw new Error(
      `Some orders do not have prescription associated with them. Orders: ${orders
        .map(o => o.id)
        .join(',')}`
    );
  }

  //none of the orders were sent to Empower
  console.log({
    message: `Starting processing Tailor-Made orders: ${orders
      .map(o => o.id)
      .join(',')}`,
  });

  try {
    if (!Array.isArray(orders) || !orders.length || !orders[0]?.patient_id) {
      throw new Error(
        `Missing or malformed data for Tailor-made patient: ${
          orders?.[0]?.patient_id ?? 'Missing patient id'
        }`
      );
    }
    const allergies = await supabaseAdmin
      .from('medical_history')
      .select('allergies')
      .eq('patient_id', orders[0].patient_id)
      .single()
      .then(({ data }) => data?.allergies);

    const prescriptionItems: TailorMadePrescriptionItem[] = prescriptions
      .map(p =>
        buildPrescription({
          prescription: p!,
        })
      )
      .concat(
        buildSupplies({
          prescription: prescriptions[0]!,
        })
      );

    const data = new URLSearchParams();
    data.append('AuthorizationKey', `${process.env.TAILOR_MADE_AUTH_KEY}`);
    data.append(
      'Values',
      JSON.stringify({
        prescriptions: [
          {
            physician_npi: '1841216629',
            shipping_method:
              orders[0].shipment_method_id === 2
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
            prescription_items: prescriptionItems,
          },
        ],
      })
    );

    console.log({
      message: `Params for Tailor-Made ${data.toString()}`,
    });

    const tailorMadeParams = {
      method: 'POST',
      url: `${process.env.TAILOR_MADE_BASE_URL}/api/zealthy_integration.asmx/ReceiveOrder`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };

    const { data: tailorMadeOrder } = await axios<TailorMadeOrderResponse>(
      tailorMadeParams
    );

    console.log(tailorMadeOrder, 'ORDER_PLACED');

    if (tailorMadeOrder.request_status !== 'success') {
      throw new Error(
        `Tailor-Made order creation was not successful. Here are the details: ${JSON.stringify(
          tailorMadeOrder
        )}`
      );
    }

    await supabaseAdmin
      .from('order')
      .update({
        order_status: 'SENT_TO_TAILOR_MADE',
        tmc_order_id: tailorMadeOrder.order_id,
      })
      .in(
        'id',
        orders.map(o => o.id)
      );
    return tailorMadeOrder.order_id;
  } catch (err) {
    let message = (err as Error).message;

    if (isAxiosError(err)) {
      message = `TAILOR-MADE ERROR: ${JSON.stringify(
        (err as AxiosError)?.response?.data || message
      )}`;
    }

    throw new Error(message);
  }
};

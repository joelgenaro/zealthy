import { OrderPrescriptionProps, PatientProps } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { notEmpty } from '@/types/utils/notEmpty';
import axios, { isAxiosError, AxiosError } from 'axios';

type Prescription = Database['public']['Tables']['prescription']['Row'];

type HallandaleOrderResponse = {
  type: string;
  message: string;
  data: {
    orderId: number;
  };
};

type PrescriptionBuilderType = {
  prescription: Prescription;
};

const hardiesNameWithConcentration = (name: string) => {
  const trimmedName = name?.trim();

  switch (trimmedName) {
    case 'Sildenafil + Tadalafil Zealthy Hardies':
      return 'Sildenafil (45mg) + Tadalafil (15mg) Zealthy Troches';
    case 'Tadalafil + Vardenafil Zealthy Hardies':
      return 'Tadalafil (75mg) + Vardenafil (25mg) Zealthy Troches';
    case 'Sildenafil + Oxytocin Zealthy Hardies':
      return 'Sildenafil (100mg) + Oxytocin (100IU) Zealthy Troches';
    case 'Tadalafil + Oxytocin Zealthy Hardies':
      return 'Tadalafil (25mg) + Oxytocin (50IU) Zealthy Troches';
    default:
      console.log('No matching medication name found for:', trimmedName);
      return name;
  }
};

const buildSupplies = ({
  prescription,
  numberOfOrders,
}: {
  prescription: PrescriptionBuilderType['prescription'];
  numberOfOrders: number;
}) => {
  return {
    rxType: 'new',
    lfProductID: 8129501,
    drugName: 'BRUNO HEALTH GLP-1 KIT',
    directions: prescription.dosage_instructions,
    daysSupply: prescription.duration_in_days,
    quantity: numberOfOrders === 2 ? 3 : 1,
  };
};

const getQuantity = (prescription: Prescription) => {
  if (
    ['hardies', 'tadalafil', 'vardenafil']?.some(p =>
      prescription?.medication?.toLowerCase()?.includes(p)
    ) ||
    Number(prescription.medication_id) === 7947219 // Acne Ultra
  ) {
    return prescription?.dispense_quantity;
  }
  return 1;
};

const buildPrescription = ({ prescription }: PrescriptionBuilderType) => {
  const isHardies = ['hardies'].some(p =>
    prescription?.medication?.toLowerCase()?.includes(p)
  );
  return {
    rxType: 'new',
    lfProductID: Number(prescription.medication_id),
    drugName: isHardies
      ? hardiesNameWithConcentration(prescription?.medication!)
      : prescription?.order_name || prescription?.medication,
    directions: prescription.dosage_instructions,
    daysSupply: prescription.duration_in_days,
    quantity: getQuantity(prescription),
  };
};

export const processHallandalePharmacyOrder = async (
  patient: PatientProps,
  orders: OrderPrescriptionProps[],
  patientAddress: Database['public']['Tables']['address']['Row']
) => {
  if (orders.length === 0) {
    console.log({
      message: `Orders array is empty for Hallandale pharmacy`,
    });
    return;
  }

  orders = orders.filter(
    o => !o.hallandale_order_id && o.order_status !== 'SENT_TO_HALLANDALE'
  );
  console.log({ orders });

  if (orders.length === 0) {
    console.log({
      message: `All orders have already been sent to Hallandale`,
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
    await new Promise(resolve => setTimeout(resolve, 5000));

    const { data: justProcessedOrders } = await supabaseAdmin
      .from('order')
      .select('hallandale_order_id')
      .in(
        'id',
        orders.map(o => o.id)
      )
      .not('hallandale_order_id', 'is', null)
      .single();

    if (justProcessedOrders?.hallandale_order_id != null) {
      console.log(
        'order was just processed by another request:',
        justProcessedOrders
      );
      return;
    }

    const { data: duplicateOrders } = await supabaseAdmin
      .from('order')
      .select('*')
      .eq('patient_id', patient.id)
      .eq(
        'prescription_id',
        orders.map(o => o.prescription_id)
      )
      .eq(
        'amount_paid',
        orders.map(o => o.amount_paid)
      )
      .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .or('order_status.eq.SENT_TO_HALLANDALE, hallandale_order_id.not.is.null')
      .not(
        'id',
        'in',
        orders.map(o => o.id)
      );

    if (duplicateOrders && duplicateOrders.length > 0) {
      console.log(
        'Found duplicate order processed in last 5 minutes:',
        duplicateOrders
      );
      return;
    }

    const shouldAddSupplies = () => {
      if (
        ['hardies', 'tadalafil', 'vardenafil']?.some(p =>
          prescriptions?.[0]?.medication?.toLowerCase()?.includes(p)
        )
      ) {
        return false;
      }

      if (
        prescriptions.some(
          p =>
            p.medication ===
            'ACNE ULTRA (CLINDAMYCIN / NIACINAMIDE / TRETINOIN)'
        )
      ) {
        return false;
      }

      return true;
    };

    const prescriptionItems = !shouldAddSupplies()
      ? prescriptions.map(p =>
          buildPrescription({
            prescription: p!,
          })
        )
      : prescriptions
          .map(p =>
            buildPrescription({
              prescription: p!,
            })
          )
          .concat(
            buildSupplies({
              prescription: prescriptions[0]!,
              numberOfOrders: orders.slice(1).length,
            })
          );
    const auth = Buffer.from(
      `${process.env.HALLANDALE_USERNAME}:${process.env.HALLANDALE_PASSWORD}`
    ).toString('base64');

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
          id: orders[0].id,
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
          rxs: prescriptionItems,
        },
      },
    };
    console.log({ prescriptionItems });
    console.log({ orderParams });

    const { data: hallandaleOrder } = await axios<HallandaleOrderResponse>(
      orderParams
    );
    console.log({ hallandaleOrder });

    if (!hallandaleOrder.data.orderId) {
      throw new Error(
        `Could not find hallandale order in ${JSON.stringify(
          hallandaleOrder.data
        )}`
      );
    }

    await supabaseAdmin
      .from('order')
      .update({
        order_status: 'SENT_TO_HALLANDALE',
        hallandale_order_id: String(hallandaleOrder.data.orderId),
      })
      .in(
        'id',
        orders.map(o => o.id)
      );

    return hallandaleOrder.data.orderId;
  } catch (err) {
    let message = (err as Error).message;

    if (isAxiosError(err)) {
      message =
        `HALLANDALE ERROR: ${JSON.stringify(
          (err as AxiosError)?.response?.data
        )}` || message;
    }

    throw new Error(message);
  }
};

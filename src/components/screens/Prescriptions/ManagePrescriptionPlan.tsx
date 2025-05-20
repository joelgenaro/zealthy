import Router from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItemButton,
  Box,
  Skeleton,
} from '@mui/material';
import { User } from '@supabase/supabase-js';
import { SubProps } from './SubscriptionContent';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import Link from 'next/link';
import {
  hairLossMedication,
  hairLossMedication6month,
} from '@/constants/hairLossMedicationMapping';
import ExistingPaymentMethod from '../Checkout/components/ExistingPaymentMethod';
import {
  PrescriptionRequestProps,
  usePatientDefaultPayment,
} from '@/components/hooks/data';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { toast } from 'react-hot-toast';
import { Pathnames } from '@/types/pathnames';

type Patient = Database['public']['Tables']['patient']['Row'];
type Address = Database['public']['Tables']['address']['Row'];

type Option = {
  name: string;
  bestDeal?: string;
  price: number;
  discountedPrice: number;
  isMostPopular?: boolean;
  recurring: {
    interval: string;
    interval_count: number;
  };
};

const bcMedication = [
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 85,
    dosage: 'Standard Dose',
    quantity: 180,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
    medication_quantity_id: 285,
  },
  {
    name: 'Birth Control Medication',
    type: MedicationType.BIRTH_CONTROL,
    price: 160,
    dosage: 'Standard Dose',
    quantity: 360,
    recurring: {
      interval: '',
      interval_count: 12,
    },
    medication_quantity_id: 286,
  },
];

const bcOptions = [
  {
    name: 'Birth Control Medication',
    price: 85,
    discountedPrice: 80,
    isMostPopular: true,
    bestDeal: 'Save 5%',
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
  },
  {
    name: 'Birth Control Medication',
    bestDeal: 'Save 11%',
    price: 160,
    discountedPrice: 160,
    isMostPopular: false,
    recurring: {
      interval: 'month',
      interval_count: 12,
    },
  },
];

const hlOptions = [
  {
    name: 'Oral Finasteride',
    price: 80,
    discountedPrice: 53.33,
    isMostPopular: false,
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
  },
  {
    name: 'Oral Finasteride',
    bestDeal: 'Save 11%',
    price: 138.33,
    discountedPrice: 123,
    isMostPopular: false,
    recurring: {
      interval: 'month',
      interval_count: 6,
    },
  },
];

function getTypeByDisplay(medDisplayName: string) {
  switch (medDisplayName) {
    case 'Birth Control Medication':
      return 'Zealthy Birth Control';
    case 'ED Medication':
      return 'Zealthy ED';
    case 'Hair Loss Medication':
      return 'Zealthy Hair Treatment';
    case 'Enclomiphene Medication':
      return 'Zealthy Enclomiphene';
    case 'EDHL Medication':
      return 'Zealthy Sex + Hair';
    case 'Menopause Medication':
      return 'Zealthy Menopause';
    default:
      return 'Zealthy Prescription';
  }
}

function getMedicationType(type: string) {
  switch (type) {
    case 'Zealthy Birth Control':
      return MedicationType.BIRTH_CONTROL;
    case 'Zealthy ED':
      return MedicationType.ED;
    case 'Zealthy Sex + Hair':
      return MedicationType.SEX_PLUS_HAIR;
    case 'Zealthy Hair Treatment':
      return MedicationType.HAIR_LOSS;
    case 'Zealthy Enclomiphene':
      return MedicationType.ENCLOMIPHENE;
    case 'Zealthy Menopause':
      return MedicationType.MENOPAUSE;
    default:
      return MedicationType.BIRTH_CONTROL;
  }
}

const medicationMapping = (type: number, key: string, care: MedicationType) => {
  if (care === MedicationType.BIRTH_CONTROL) {
    if (type === 6) {
      return bcMedication[0];
    } else {
      return bcMedication[1];
    }
  }

  if (type === 6) {
    return hairLossMedication6month[key];
  } else {
    return hairLossMedication[key];
  }
};

interface SessionUserProps {
  sessionUser: User;
}

export default function ManagePrescriptionPlan({
  sessionUser,
}: SessionUserProps) {
  const { id: subID } = Router.query;
  const supabase = useSupabaseClient<Database>();
  const { addMedication, updateMedication } = useVisitActions();

  const [page, setPage] = useState<'subscriptions' | 'upgrade' | 'cancel'>(
    'subscriptions'
  );
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [subData, setSubData] = useState<SubProps | null>(null);
  const { data: paymentMethod } = usePatientDefaultPayment();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [patientAddress, setPatientAddress] = useState<Address | null>(null);
  const [patientPayment, setPatientPayment] = useState('•••• •••• •••• ••••');
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubProps | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<
    string | null | undefined
  >(null);

  const medName = `${subData?.order_id?.prescription_id?.medication
    ?.split(' ')[0]
    .charAt(0)
    .toUpperCase()}${subData?.order_id?.prescription_id?.medication
    ?.split(' ')[0]
    .slice(1)}`;

  const medDisplayName =
    subData?.order_id?.prescription_id?.medication_quantity_id
      ?.medication_dosage_id?.medication?.display_name;

  const prescriptionType = getTypeByDisplay(medDisplayName || '');

  const medType = getMedicationType(prescriptionType);

  const options =
    medType === MedicationType.BIRTH_CONTROL ? bcOptions : hlOptions;

  const medication = useVisitSelect(v =>
    v.medications.find(m => m.type === medType)
  );
  const [isBundled, setIsBundled] = useState(false);

  async function fetchPatientData() {
    const patient = await supabase
      .from('patient')
      .select()
      .eq('profile_id', sessionUser?.id)
      .single();

    setPatientInfo(patient.data as Patient);
    if (!patient?.data?.id) {
      return;
    }

    const bundled = await supabase
      .from('patient_subscription')
      .select('patient_id')
      .eq('patient_id', patientInfo!.id)
      .in('price', [297, 217, 446, 349, 449, 718, 891])
      .then(({ data }) => !!(data || []).length);

    setIsBundled(bundled);
    const patientAddress = await supabase
      .from('address')
      .select()
      .eq('patient_id', patient.data?.id)
      .single();
    setPatientAddress(patientAddress.data);
    const patientPayment = await supabase
      .from('payment_profile')
      .select('customer_id,last4')
      .eq('patient_id', patient.data?.id)
      .single();
    setPatientPayment(`•••• •••• •••• ${patientPayment.data?.last4}`);
    setStripeCustomerId(patientPayment.data?.customer_id);
  }

  async function fetchOrderData() {
    const prescription = await supabase
      .from('patient_prescription')
      .select(
        '*, order_id:order (*, prescription_id (*, medication_quantity_id(medication_dosage_id(medication(*)))))'
      )
      .match({ patient_id: patientInfo?.id, id: subID })
      .limit(1)
      .single()
      .then(({ data }) => data as SubProps);

    setSubData(prescription as SubProps);
  }

  useEffect(() => {
    if (patientInfo === null) {
      fetchPatientData();
    }
  }, [patientInfo]);

  useEffect(() => {
    if (patientInfo !== null) {
      fetchOrderData();
    }
  }, [patientInfo]);

  useEffect(() => {
    switch (medDisplayName) {
      case 'Hair Loss Medication':
        if (medName.includes('Finasteride')) {
          addMedication(hairLossMedication['Oral Finasteride']);
        } else {
          addMedication(hairLossMedication['Oral Minoxidil']);
        }
        break;
      case 'Birth Control Medication':
        addMedication(bcMedication[0]);
        break;
      default:
        break;
    }
  }, [medDisplayName, medName, addMedication]);

  const handleChange = useCallback(
    (item: Option) => {
      if (medication) {
        const { type, ...medicationMain } = medicationMapping(
          item.recurring.interval_count,
          medication.name,
          medType
        );

        updateMedication({
          type: medType,
          update: medicationMain,
        });

        setPage('upgrade');
      }
    },
    [medication, updateMedication]
  );

  async function onSubmit() {
    setLoading(true);
    await supabase
      .from('prescription_request')
      .insert({
        medication_quantity_id: medication?.medication_quantity_id,
        patient_id: subData?.patient_id,
        status: 'REQUESTED',
        region: patientInfo?.region,
        specific_medication: medication?.name,
        is_adjustment: true,
        discounted_price: medication?.discounted_price,
        total_price: medication?.price,
      })
      .select()
      .then(({ data }) => (data || []) as PrescriptionRequestProps[])
      .then(req => {
        req.map(async r => {
          const addToQueue = await supabase
            .from('task_queue')
            .insert({
              task_type: 'PRESCRIPTION_REQUEST',
              patient_id: subData?.patient_id,
              queue_type: 'Provider (QA)',
              created_at: subData?.current_period_end || undefined,
            })
            .select()
            .maybeSingle()
            .then(({ data }) => data);

          await supabase
            .from('prescription_request')
            .update({ queue_id: addToQueue?.id })
            .eq('id', r?.id);
        });
      });

    toast.success(
      'You have successfully requested a prescription plan upgrade.'
    );
    Router.push(Pathnames.PATIENT_PORTAL);
  }

  return (
    <Container style={{ maxWidth: '550px' }}>
      {page === 'subscriptions' && (
        <Stack gap={4}>
          <Typography component="h2" variant="h2">
            Manage Your Plan
          </Typography>
          <Stack gap={1}>
            <Typography fontWeight={600}>Save when you pre-pay!</Typography>
            <Typography variant="h6">
              Commit to a long-term change and save when you purchase up to one
              year of {prescriptionType} plan today. Your upgrade will start
              after your current billing period.
            </Typography>
          </Stack>
          <List component={Stack} gap="24px" width="100%">
            {options.map(item => {
              const isSelected = [
                medication?.recurring.interval_count,
              ].includes(item.recurring.interval_count);

              return (
                <ListItemButton
                  selected={isSelected}
                  key={item.recurring.interval_count}
                  onClick={() => handleChange(item)}
                  sx={{
                    width: '100%',
                    position: 'relative',
                    borderRadius: '24px',
                  }}
                >
                  <Stack direction="row" alignItems="center" gap="16px">
                    <Stack direction="column" gap="5px" color="#000">
                      {item?.isMostPopular && (
                        <Box
                          style={{
                            backgroundColor: '#FDFFA2',
                            width: 'fit-content',
                            padding: '1px 10px',
                            borderRadius: '10px',
                            marginBottom: '5px',
                          }}
                        >
                          <Typography fontSize="12px !important" color="#000">
                            Most Popular
                          </Typography>
                        </Box>
                      )}
                      <Typography fontWeight={600}>
                        {`${prescriptionType} ${item.recurring.interval_count}-Month Plan`}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap="8px">
                        <Typography>
                          {`$${item.price.toFixed(2)} billed every ${
                            item.recurring.interval_count
                          } months`}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  {item.bestDeal && (
                    <Typography
                      variant="h3"
                      style={{
                        position: 'absolute',
                        right: 18,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {item.bestDeal}
                    </Typography>
                  )}
                </ListItemButton>
              );
            })}
          </List>
          <Link
            href={`/manage-prescriptions/cancel/${subID}`}
            style={{
              textAlign: 'center',
              color: '#A8A8A8',
              fontSize: '15px',
            }}
          >
            Cancel {prescriptionType} plan
          </Link>
        </Stack>
      )}
      {page === 'upgrade' && (
        <Stack gap={4}>
          <Typography component="h2" variant="h2">
            Confirm Upgrade
          </Typography>
          {paymentMethod ? (
            <ExistingPaymentMethod
              paymentMethod={paymentMethod}
              onError={setError}
            />
          ) : (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={167}
              sx={{ borderRadius: '16px' }}
            />
          )}
          <WhiteBox gap="16px" padding="24px">
            <Stack gap="16px">
              <Typography>You will only be charged if prescribed</Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography>Plan Cost</Typography>
                <Typography>${medication?.price}.00</Typography>
              </Stack>
              <Typography color="#777777" textAlign="center" fontStyle="italic">
                {"You won't be charged until you're prescribed"}
              </Typography>
            </Stack>
          </WhiteBox>
          <WhiteBox gap="16px" padding="24px">
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h3">Amount Due</Typography>
              <Typography variant="h3">${medication?.price}.00</Typography>
            </Stack>
          </WhiteBox>
          <LoadingButton
            fullWidth
            loading={loading}
            disabled={loading}
            onClick={onSubmit}
          >
            Upgrade
          </LoadingButton>
        </Stack>
      )}
    </Container>
  );
}

import axios from 'axios';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Modal,
  Divider,
  Checkbox,
} from '@mui/material';
import { User } from '@supabase/supabase-js';
import { Pathnames } from '@/types/pathnames';
import { ChangeRefillDate } from './components/ChangeRefillDate';
import {
  UpdatePayment,
  EditDeliveryAddress,
} from '@/components/shared/UpdatePatientInfo';
import ArrowActionCard from '@/components/shared/ArrowActionCard';
import SubscriptionCard from './components/SubscriptionCard';
import { SubProps } from './SubscriptionContent';

type Patient = Database['public']['Tables']['patient']['Row'];
type Address = Database['public']['Tables']['address']['Row'];

interface SessionUserProps {
  sessionUser: User;
}

export default function SubscriptionDetails({ sessionUser }: SessionUserProps) {
  const { id: subID } = Router.query;
  const supabase = useSupabaseClient<Database>();
  const [page, setPage] = useState('subscriptions');
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [subData, setSubData] = useState<SubProps | null>(null);
  const [patientAddress, setPatientAddress] = useState<Address | null>(null);
  const [patientPayment, setPatientPayment] = useState('•••• •••• •••• ••••');
  const [refillNow, setRefillNow] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [medChecked, setMedChecked] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubProps | null>(null);
  const [stripeCustomerId, setStripeCustomerId] = useState<
    string | null | undefined
  >(null);

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

  async function handleRefillChange(
    referenceId: string | null,
    newDate: number | null,
    isGetNow: boolean
  ) {
    await axios.post(`/api/stripe/utils/subscription/change-date`, {
      referenceId,
      newDate,
      isGetNow,
    });
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

  const medName = subData?.order_id?.prescription_id?.medication
    ?.toLowerCase()
    ?.includes('tadalafil + finasteride + minoxidil')
    ? 'Tadalafil + Finasteride + Minoxidil'
    : `${subData?.order_id?.prescription_id?.medication
        ?.split(' ')[0]
        .charAt(0)
        .toUpperCase()}${subData?.order_id?.prescription_id?.medication
        ?.split(' ')[0]
        .slice(1)}`;

  const medDisplayName =
    subData?.order_id?.prescription_id?.medication_quantity_id
      ?.medication_dosage_id?.medication?.display_name;

  const isBirthControl = medDisplayName?.includes('Birth Control');
  const isEd = medDisplayName?.includes('ED');

  function handleCancel() {
    if (isBirthControl) {
      Router.push(`${Pathnames.UPGRADE_PRESCRIPTION}/${subData?.id}`);
    } else if (isEd) {
      Router.push(`${Pathnames.CANCEL_SUBSCRIPTION}/${subData?.reference_id}`);
    } else {
      Router.push(
        `${Pathnames.CANCEL_SUBSCRIPTION}/${subData?.reference_id}?page=cancelation`
      );
    }
  }

  return (
    <Container sx={{ maxWidth: '550px' }}>
      {page === 'subscriptions' && (
        <>
          <Typography component="h2" variant="h2" sx={{ marginBottom: '48px' }}>
            Subscription Details
          </Typography>
          <Box sx={{ marginBottom: '44px' }}>
            {!subData ? (
              <>
                <Typography
                  component="p"
                  variant="body1"
                  sx={{ fontSize: '12px !important' }}
                >
                  {"We couldn't find this subscription for you. "}
                  <a href={Pathnames.VIEW_SUBSCRIPTIONS}>
                    Click here to go back.
                  </a>
                </Typography>
              </>
            ) : (
              <Stack gap={5}>
                <SubscriptionCard
                  sub={subData}
                  refetch={fetchOrderData}
                  patientAddress={patientAddress}
                  patientPayment={patientPayment}
                  setRefillNow={setRefillNow}
                  setSelectedSubscription={setSelectedSubscription}
                  setPage={setPage}
                  isDetails={true}
                />
                <Stack gap={2}>
                  <Typography variant="h3">Need help?</Typography>
                  <ArrowActionCard
                    text="Message your provider"
                    subText="Medical questions"
                    onClick={() => Router.push(Pathnames.MESSAGES)}
                  />
                  <ArrowActionCard
                    text="Add/remove items from your plan"
                    subText="Manage subscription"
                    onClick={() => setOpenModal(true)}
                  />
                </Stack>
              </Stack>
            )}
          </Box>
        </>
      )}
      {page === 'edit-address' && (
        <EditDeliveryAddress goHome={() => setPage('subscriptions')} />
      )}
      {page === 'payment' && (
        <UpdatePayment
          stripeCustomerId={stripeCustomerId}
          patientId={patientInfo?.id}
          goHome={() => setPage('subscriptions')}
        />
      )}
      {page === 'change-refill' && (
        <ChangeRefillDate
          getItNow={refillNow}
          selectedSubscription={selectedSubscription}
          changeRefillDate={handleRefillChange}
          patientAddress={patientAddress}
          patientPayment={patientPayment}
        />
      )}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            backgroundColor: '#FFFAF2',
            px: 4,
            py: 4,
            borderRadius: 2,
            maxWidth: '476px',
            width: 'calc(100% - 2rem)',
          }}
        >
          <Stack gap={1} mb={3}>
            <Typography variant="h2">Add or remove items</Typography>
            <Typography variant="body1">
              Any changes will apply to your plan moving forward.
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '0.5px solid #CCCCCC',
              borderRadius: '16px',
              padding: '14px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => setMedChecked(!medChecked)}
          >
            <Checkbox checked={medChecked} />
            {medName}
          </Box>
          <Divider style={{ margin: '1rem 0' }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h3">Total</Typography>
            <Typography variant="h3">{`$${
              medChecked ? subData?.price || '0' : '0'
            }`}</Typography>
          </Stack>
          <Stack direction="row" gap={2} mt={3}>
            <Button fullWidth onClick={() => setOpenModal(false)}>
              <Typography fontSize="12px" variant="h3">
                Cancel
              </Typography>
            </Button>
            <Button
              fullWidth
              onClick={() =>
                medChecked ? setOpenModal(false) : handleCancel()
              }
            >
              <Typography fontSize="12px" variant="h3">
                {medChecked ? 'Save Changes' : 'Cancel Plan'}
              </Typography>
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
}

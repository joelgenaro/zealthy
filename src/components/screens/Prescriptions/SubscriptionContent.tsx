import axios from 'axios';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { Box, Container, Typography } from '@mui/material';
import { User } from '@supabase/supabase-js';
import {
  UpdatePayment,
  EditDeliveryAddress,
} from '@/components/shared/UpdatePatientInfo';
import { ChangeRefillDate } from './components/ChangeRefillDate';
import SubscriptionCard from './components/SubscriptionCard';
import ChangeFrequency from './components/ChangeFrequency';
import { MedicationAddOn } from '@/components/shared/AddOnPayment';
import RequestMedication from './components/RequestMedication';
import ChangeDosage from './components/ChangeDosage';
import ChangeInterval from './components/ChangeInterval';
import Router from 'next/router';
import SubscriptionCardV2 from './components/SubscriptionCardV2';

type Patient = Database['public']['Tables']['patient']['Row'];
type Medication = Database['public']['Tables']['medication']['Row'];
type Address = Database['public']['Tables']['address']['Row'];
interface SessionUserProps {
  sessionUser: User;
}

interface PrescriptionProps {
  clinician_id: number | null;
  count_of_refills_allowed: number | null;
  created_at: string | null;
  dispense_quantity: number | null;
  dosage_instructions: string | null;
  duration_in_days: number | null;
  external_canvas_id: string | null;
  generic_substitutions_allowed: boolean | null;
  id: number;
  medication: string | null;
  medication_dosage_id: number | null;
  medication_id: number | null;
  medication_quantity_id: {
    medication_dosage_id: {
      medication: Medication;
    };
  };
  national_drug_code: string | null;
  note: string | null;
  patient_id: number | null;
  pharmacy: string | null;
  requester_canvas_id: string | null;
  status: string | null;
  unit: string | null;
  updated_at: string | null;
}
interface OrderProps {
  id: number | null;
  created_at: string | null;
  order_status: string | null;
  total_price: number | null;
  amount_paid: number | null;
  tracking_URL: string | null;
  shipment_details: string | null;
  prescription_id: PrescriptionProps | null;
  refill_count: number | null;
  clinician_id: number | null;
  national_drug_code: string | null;
}
export interface SubProps {
  id: number | null;
  price: number;
  cancel_at: string | null;
  created_at: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  order_id: OrderProps | null;
  patient_id: number | null;
  reference_id: string | null;
  status: string | null;
  subscription_id: number | null;
  updated_at: string | null;
  interval_count: number | null;
  interval: string | null;
  care: string | null;
  product?: string | null;
}

export default function SubscriptionContent({ sessionUser }: SessionUserProps) {
  const supabase = useSupabaseClient<Database>();
  const { page } = Router.query;
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubProps[]>([]);
  const [patientAddress, setPatientAddress] = useState<Address | null>(null);
  const [patientPayment, setPatientPayment] = useState('•••• •••• •••• ••••');

  const [refillNow, setRefillNow] = useState(false);
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

    if (!patient?.data?.id) {
      return;
    }
    setPatientInfo(patient.data as Patient);
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

  async function fetchPrescriptions() {
    const prescriptions = await supabase
      .from('patient_prescription')
      .select(
        '*, order_id:order (*, prescription_id (*, medication_quantity_id (medication_dosage_id (medication(*)))))'
      )
      .match({
        patient_id: patientInfo?.id,
        subscription_id: 5,
        visible: true,
      })
      .then(({ data }) => data as SubProps[]);

    setSubscriptionData(prescriptions as SubProps[]);
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
      fetchPrescriptions();
    }
  }, [patientInfo]);

  const setPage = useCallback((page: string) => {
    Router.push({
      pathname: Router.pathname,
      query: {
        page,
      },
    });
  }, []);

  const care = useMemo(() => {
    const careOptions = subscriptionData.map((sub, i) => sub.care);
    return careOptions;
  }, [subscriptionData]);

  return (
    <Container sx={{ maxWidth: '550px' }}>
      {!page && (
        <>
          <Typography component="h2" variant="h2" sx={{ marginBottom: '48px' }}>
            Your medication subscriptions.
          </Typography>
          <Box sx={{ marginBottom: '44px' }}>
            {subscriptionData.length === 0 ? (
              <Typography
                component="p"
                variant="body1"
                sx={{ fontSize: '12px !important' }}
              >
                You do not have any medication subscriptions within the Zealthy
                system at this time.
              </Typography>
            ) : care[0] === 'Erectile dysfunction' || care[0] === 'ED' ? (
              subscriptionData.map((sub, i) => (
                <SubscriptionCardV2
                  key={i}
                  sub={sub}
                  refetch={fetchPrescriptions}
                  patientAddress={patientAddress}
                  patientPayment={patientPayment}
                  setRefillNow={setRefillNow}
                  setSelectedSubscription={setSelectedSubscription}
                  setPage={setPage}
                />
              ))
            ) : care[0] === 'Enclomiphene' ? (
              subscriptionData.map((sub, i) => (
                <SubscriptionCardV2
                  key={i}
                  sub={sub}
                  refetch={fetchPrescriptions}
                  patientAddress={patientAddress}
                  patientPayment={patientPayment}
                  setRefillNow={setRefillNow}
                  setSelectedSubscription={setSelectedSubscription}
                  setPage={setPage}
                />
              ))
            ) : (
              subscriptionData.map((sub, i) => (
                <SubscriptionCard
                  key={i}
                  sub={sub}
                  refetch={fetchPrescriptions}
                  patientAddress={patientAddress}
                  patientPayment={patientPayment}
                  setRefillNow={setRefillNow}
                  setSelectedSubscription={setSelectedSubscription}
                  setPage={setPage}
                />
              ))
            )}
          </Box>
        </>
      )}
      {page === 'request-medication' && (
        <RequestMedication
          subscription={selectedSubscription}
          setPage={setPage}
        />
      )}

      {page === 'change-dosage' && <ChangeDosage setPage={setPage} />}

      {page === 'change-interval' && <ChangeInterval setPage={setPage} />}

      {page === 'change-frequency' && <ChangeFrequency setPage={setPage} />}

      {page === 'confirm-changes' && <MedicationAddOn isAdjustment />}

      {page === 'edit-address' && (
        <EditDeliveryAddress
          goHome={() => Router.push('/manage-prescriptions/subscriptions')}
        />
      )}
      {page === 'payment' && (
        <UpdatePayment
          stripeCustomerId={stripeCustomerId}
          patientId={patientInfo?.id}
          goHome={() => Router.push('/manage-prescriptions/subscriptions')}
        />
      )}
      {page === 'change-refill' && (
        <ChangeRefillDate
          selectedSubscription={selectedSubscription}
          getItNow={refillNow}
          changeRefillDate={handleRefillChange}
          patientAddress={patientAddress}
          patientPayment={patientPayment}
        />
      )}
    </Container>
  );
}

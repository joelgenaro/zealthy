import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { Box, Container, Typography, Link } from '@mui/material';
import { User } from '@supabase/supabase-js';
import { EditDeliveryAddress } from '@/components/shared/UpdatePatientInfo';
import router from 'next/router';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { PharmacySelection } from './components/PharmacySelect';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { useUpdatePatient } from '@/components/hooks/mutations';

type Patient = Database['public']['Tables']['patient']['Row'];
type Address = Database['public']['Tables']['address']['Row'];

interface SessionUserProps {
  sessionUser: User;
  patient: Patient;
  profile: Database['public']['Tables']['profiles']['Row'];
}

interface OrderProps {
  prescription_id: {
    id: number;
    status: string;
    pharmacy: string;
    dosage_instructions: string;
    medication_quantity_id: {
      medication_dosage: {
        medication: {
          name: string;
          display_name: string;
        };
      };
    };
  };
}
interface SubProps {
  cancel_at: string | null;
  created_at: string | null;
  current_period_end: string | null;
  current_period_start: string | null;
  order_id: OrderProps;
  patient_id: number | null;
  reference_id: string | null;
  subscription_id: number | null;
  status: string | null;
  updated_at: string | null;
}

const mapDisplayNameToCareSelection: { [key: string]: SpecificCareOption } = {
  'Hair Loss Medication': SpecificCareOption.HAIR_LOSS,
  'Birth Control Medication': SpecificCareOption.BIRTH_CONTROL,
  'ED Medication': SpecificCareOption.ERECTILE_DYSFUNCTION,
  'EDHL Medication': SpecificCareOption.SEX_PLUS_HAIR,
  'Menopause Medication': SpecificCareOption.MENOPAUSE,
  'Mental Health Medication': SpecificCareOption.ASYNC_MENTAL_HEALTH,
  'Acne Medication': SpecificCareOption.SKINCARE,
  'Weight Loss Medication': SpecificCareOption.WEIGHT_LOSS,
};

type PharmacyProp = {
  pharmacy: string | null;
  name: string | null;
};

export default function RenewPrescription({ patient }: SessionUserProps) {
  const supabase = useSupabaseClient<Database>();
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState('subscriptions');
  const { id } = router.query;
  const [subscriptionData, setSubscriptionData] = useState<SubProps | null>(
    null
  );
  const [patientAddress, setPatientAddress] = useState<Address | null>(null);
  const [patientPharmacy, setPatientPharmacy] = useState<PharmacyProp | null>(
    null
  );
  const updatePatient = useUpdatePatient();

  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient.id
  );

  const [loading, setLoading] = useState(false);

  async function handleRequestRenewal() {
    const specificCare =
      mapDisplayNameToCareSelection[
        subscriptionData?.order_id?.prescription_id?.medication_quantity_id
          ?.medication_dosage?.medication?.display_name || ''
      ];

    if (specificCare) {
      setSubmitting(true);
      createVisitAndNavigateAway([specificCare]);
    }
  }

  async function fetchPatientData() {
    const patientAddress = await supabase
      .from('address')
      .select()
      .eq('patient_id', patient.id)
      .single();
    setPatientAddress(patientAddress.data);
  }

  async function fetchOrderData() {
    if (!id) {
      return;
    }
    const medExpired = await supabase
      .from('patient_prescription')
      .select(
        'order_id!inner(prescription_id!inner(id, status, pharmacy, dosage_instructions, medication_quantity_id!inner(medication_dosage!inner(medication!inner(name, display_name)))))'
      )
      .eq('order_id.prescription_id.id', id)
      .eq('patient_id', patient.id!)
      .eq('visible', true)
      .eq('status', 'active')
      .eq('order_id.prescription_id.status', 'ended')
      .limit(1)
      .single();

    setSubscriptionData(medExpired?.data as unknown as SubProps);
  }

  async function updateAddress(address: any) {
    setLoading(true);
    const updatedAddress = await supabase
      .from('address')
      .update(address)
      .eq('patient_id', patient.id);

    if (address.state !== patient?.region) {
      await updatePatient.mutateAsync({
        region: address.state,
      });
    }

    if (updatedAddress.status === 204) {
      setPage('subscriptions');
      fetchOrderData();
    } else {
      alert('There was an error updating address');
    }
    setLoading(false);
  }

  async function fetchPatientPharmacy() {
    const pharmacy = await supabase
      .from('patient_pharmacy')
      .select('pharmacy, name')
      .eq('patient_id', patient.id)
      .single();

    setPatientPharmacy(pharmacy.data as PharmacyProp);
  }

  useEffect(() => {
    if (patient.id) {
      fetchPatientData();
      fetchPatientPharmacy();
    }
  }, [patient.id]);

  useEffect(() => {
    if (id !== null && patient.id) {
      fetchOrderData();
    }
  }, [patient.id]);

  return (
    <Container sx={{ maxWidth: '500px' }}>
      {page === 'subscriptions' && (
        <>
          {subscriptionData?.order_id?.prescription_id?.pharmacy
            ?.toLowerCase()
            ?.includes('gogomeds') ? (
            <>
              <Typography
                component="h2"
                variant="h2"
                sx={{ fontWeight: '400', marginBottom: '48px' }}
              >
                {'Your delivery address.'}
              </Typography>
              <Box sx={{ marginBottom: '44px' }}>
                <Typography variant="h3" sx={{ marginBottom: '16px' }}>
                  {'Preferred delivery'}
                </Typography>
                <Box
                  sx={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #D8D8D8',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box>
                    <Typography>
                      <Typography>{patientAddress?.address_line_1}</Typography>
                      <Typography>{patientAddress?.address_line_2}</Typography>
                      <Typography>
                        {patientAddress?.city}, {patientAddress?.state}
                      </Typography>
                      <Typography>{patientAddress?.zip_code}</Typography>
                      <Typography>United States</Typography>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Link
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setPage('edit-address')}
                    >
                      {'Change'}
                    </Link>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography
                component="h2"
                variant="h2"
                sx={{ fontWeight: '400', marginBottom: '48px' }}
              >
                {'Pharmacy pickup.'}
              </Typography>
              <Box sx={{ marginBottom: '44px' }}>
                <Typography variant="h3" sx={{ marginBottom: '16px' }}>
                  {'Preferred pharmacy'}
                </Typography>
                <Box
                  sx={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #D8D8D8',
                    padding: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box>
                    {patientPharmacy?.name && (
                      <Typography variant="subtitle1">
                        {patientPharmacy?.name}
                      </Typography>
                    )}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        marginBottom: '16px',
                        textAlign: 'start',
                      }}
                    >
                      {patientPharmacy?.pharmacy
                        ? patientPharmacy?.pharmacy
                        : 'No default pharmacy!'}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Link
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setPage('pharmacy')}
                    >
                      {'Change'}
                    </Link>
                  </Box>
                </Box>
              </Box>
            </>
          )}
          <Typography variant="h3" sx={{ marginBottom: '16px' }}>
            {'Prescription renewal'}
          </Typography>
          <Box
            component="div"
            sx={{
              marginBottom: '48px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h3">
              {
                subscriptionData?.order_id?.prescription_id
                  ?.medication_quantity_id?.medication_dosage?.medication?.name
              }
            </Typography>
            <Typography variant="body1">
              {subscriptionData?.order_id?.prescription_id?.dosage_instructions}
            </Typography>
          </Box>
          <LoadingButton
            fullWidth
            loading={submitting}
            disabled={submitting}
            onClick={handleRequestRenewal}
          >
            Request prescription renewal
          </LoadingButton>
        </>
      )}
      {page === 'edit-address' && (
        <>
          <EditDeliveryAddress goHome={() => setPage('subscriptions')} />
        </>
      )}
      {page === 'pharmacy' && (
        <>
          <PharmacySelection
            patientId={patient.id}
            onCancel={() => {
              fetchPatientPharmacy();
              setPage('subscription');
            }}
          />
        </>
      )}
    </Container>
  );
}

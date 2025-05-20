import {
  Box,
  Container,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Link,
  Stack,
} from '@mui/material';
import Router from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import ArrowRight from '@/components/shared/icons/ArrowRight';
import CalendarGreen from '@/components/shared/icons/CalendarGreen';
import { ChangeEvent, useEffect, useState } from 'react';
import { Pathnames } from '@/types/pathnames';
import {
  PrescriptionRequestProps,
  useAllVisiblePatientSubscription,
} from '@/components/hooks/data';

interface Subscription {
  status: string;
  order: {
    id: number;
    prescription: {
      id: number;
      dosage_instructions: string;
      status: string;
      medication_quantity_id: {
        medication_dosage: {
          medication: {
            name: string;
            display_name: string;
          };
        };
      };
    };
  };
}
interface Props {
  patient: Database['public']['Tables']['patient']['Row'];
}

export default function ManagePrescription({ patient }: Props) {
  const supabase = useSupabaseClient<Database>();
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();

  const [activePrescriptions, setActivePrescriptions] = useState<
    Subscription[] | null
  >(null);
  const [expiredPrescriptions, setExpiredPrescriptions] = useState<
    Subscription[] | null
  >(null);
  const [selectedPrescription, setSelectedPrescription] = useState<
    string | null
  >(null);
  const [hasOrderFromIntegratedPharmacy, setHasOrderFromIntegratedPharmacy] =
    useState<boolean>(true);

  async function fetchPrescriptions() {
    const meds = await supabase
      .from('patient_prescription')
      .select(
        `id, status, order!inner(id, prescription!inner(*, medication_quantity_id!inner(medication_dosage!inner(medication!inner(display_name, name)))))`
      )
      .eq('patient_id', patient?.id)
      .eq('subscription_id', 5)
      .eq('visible', true)
      .eq('status', 'active')
      .then(({ data }) => data as unknown as Subscription[]);

    // meds[0].order.prescription.medication_quantity_id.medication_dosage.medication.display_name.

    const requests = await supabase
      .from('prescription_request')
      .select(
        `*, medication_quantity ( id, medication_dosage ( medication (*) ) )`
      )
      .eq('patient_id', patient?.id)
      .eq('status', 'REQUESTED')
      .order('created_at', { ascending: false })
      .then(({ data }) => data as PrescriptionRequestProps[]);

    setActivePrescriptions(
      meds.filter(m => m.status === 'active') as Subscription[]
    );

    const expired = meds.filter(m => {
      const isEnded = m.order?.prescription?.status === 'ended';
      const isRequested = requests.some(
        r =>
          r?.medication_quantity?.medication_dosage?.medication.display_name ===
          m?.order?.prescription?.medication_quantity_id?.medication_dosage
            ?.medication?.display_name
      );
      return isEnded && !isRequested;
    }) as Subscription[];

    setExpiredPrescriptions(expired);
  }

  async function fetchOrders() {
    const orders = await supabase
      .from('order')
      .select(`*, prescription ( * )`)
      .eq('patient_id', patient?.id)
      .then(({ data }) => data || []);
  }

  useEffect(() => {
    if (patient?.id) {
      fetchPrescriptions();
      fetchOrders();
    }
  }, [patient?.id]);

  async function handleRequestRenewal() {
    if (selectedPrescription) {
      Router.push(`${Pathnames.RENEW_PRESCRIPTION}/${selectedPrescription}`);
    } else {
      alert('You must select a prescription to renew');
    }
  }

  const hasActivePsychiatry = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.id === 7 &&
      ['active', 'trialing'].includes(sub?.status)
  );

  return (
    <Container sx={{ maxWidth: '448px' }}>
      <Box>
        <Typography
          fontWeight="700"
          component="h2"
          variant="h2"
          sx={{
            color: '#1b1b1b',
            marginBottom: '1rem',
          }}
        >
          Manage your Zealthy prescriptions.
        </Typography>
      </Box>
      {!hasOrderFromIntegratedPharmacy ? (
        <Stack gap={2} mb={4}>
          <Typography>
            Your GLP-1 Rx order has been successfully ordered. However, the
            pharmacy that is shipping your GLP-1 Rx does not allow you to track
            your order through our portal.
          </Typography>
          <Typography>We apologize for the inconvenience.</Typography>
          <Typography>
            {`If you want to inquire on the status of your order and when you will receive it, `}
            <Link
              style={{ fontWeight: '600' }}
              href={`${Pathnames.MESSAGES}?complete=weight-loss`}
            >
              {'message your care team.'}
            </Link>
          </Typography>
        </Stack>
      ) : (
        <>
          {activePrescriptions &&
            activePrescriptions?.length <= 0 &&
            !hasActivePsychiatry && (
              <>
                <Typography sx={{ marginBottom: '1rem' }}>
                  {
                    'Your provider has not yet reviewed the responses from your medical intake.'
                  }
                </Typography>
                <Typography sx={{ marginBottom: '3rem' }}>
                  <Link href={`${Pathnames.MESSAGES}?complete=weight-loss`}>
                    {'Message your care team '}
                  </Link>
                  {
                    'if you have questions while you wait for your provider review.'
                  }
                </Typography>
              </>
            )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: !hasActivePsychiatry ? '48px' : '55px',
            }}
          >
            <Box
              component="button"
              sx={{
                background: '#ffffff',
                border: '1px solid #cccccc',
                height: '96px',
                borderRadius: '1rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                cursor: 'pointer',
              }}
              onClick={() => Router.push('/manage-prescriptions/order-history')}
            >
              <Box
                component="div"
                sx={{
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'center',
                }}
              >
                <CalendarGreen
                  style={{
                    display: 'flex',
                    alignSelf: 'flex-start',
                  }}
                />
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  Your order history.
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
            <Box
              component="button"
              sx={{
                background: '#ffffff',
                border: '1px solid #cccccc',
                height: '96px',
                borderRadius: '1rem',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                cursor: 'pointer',
              }}
              onClick={() => Router.push('/manage-prescriptions/subscriptions')}
            >
              <Box
                component="div"
                sx={{
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'center',
                }}
              >
                <CalendarGreen
                  style={{
                    display: 'flex',
                    alignSelf: 'flex-start',
                  }}
                />
                <Typography
                  component="p"
                  variant="body1"
                  sx={{
                    fontWeight: '500',
                    lineHeight: '24px',
                    lineSpacing: '0.3px',
                    color: '#1B1B1B',
                  }}
                >
                  View all subscriptions.
                </Typography>
              </Box>
              <ArrowRight
                style={{
                  display: 'flex',
                  justifySelf: 'flex-end',
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {(expiredPrescriptions?.length ?? 0) > 0 && (
        <>
          <Typography
            fontWeight="700"
            variant="h3"
            sx={{
              marginBottom: '1rem',
              fontSize: '28px',
              lineHeight: '40px',
              letterSpacing: '0.0025em',
              color: '#1b1b1b',
            }}
          >
            Select medication for renewal
          </Typography>
          <FormControl
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RadioGroup
              aria-labelledby="delivery-options"
              defaultValue="standard"
              name="radio-buttons-group"
              value={selectedPrescription}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSelectedPrescription((e.target as HTMLInputElement).value)
              }
            >
              {expiredPrescriptions?.map(sub => (
                <Box
                  component="div"
                  key={sub?.order?.prescription?.id}
                  sx={{
                    marginBottom: '16px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                    padding: '24px',
                    textAlign: 'start',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <FormControlLabel
                    value={sub?.order?.prescription?.id}
                    control={<Radio />}
                    sx={{
                      marginBottom: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                    labelPlacement="start"
                    label={
                      <>
                        <Typography variant="h3">
                          {
                            sub?.order.prescription.medication_quantity_id
                              ?.medication_dosage?.medication?.name
                          }
                        </Typography>
                        <Typography variant="body1">
                          {sub?.order.prescription.dosage_instructions}
                        </Typography>
                      </>
                    }
                  />
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
          <Button
            type="button"
            sx={{ width: '100%' }}
            onClick={handleRequestRenewal}
          >
            Request renewal
          </Button>
        </>
      )}
    </Container>
  );
}

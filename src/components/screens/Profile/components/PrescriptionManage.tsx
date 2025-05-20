import axios from 'axios';
import Router from 'next/router';
import toast from 'react-hot-toast';
import { addDays, format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import {
  useActivePatientSubscription,
  usePatient,
  usePatientSubscription,
} from '@/components/hooks/data';
import { membershipEvent } from '@/utils/freshpaint/events';
import { usePayment } from '@/components/hooks/usePayment';
import { Pathnames } from '@/types/pathnames';
import CheckMark from '@/components/shared/icons/CheckMark';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useQueryClient } from 'react-query';
import ArrowActionCard from '@/components/shared/ArrowActionCard';
import ConfirmPrescriptionUpgrade from './ConfirmPrescriptionUpgrade';
import PreCancelation from './PreCancelation';
import { useVWO } from '@/context/VWOContext';

type PatientPrescription =
  Database['public']['Tables']['patient_prescription']['Row'] & {
    order: Database['public']['Tables']['order']['Row'] & {
      prescription: Database['public']['Tables']['prescription']['Row'] & {
        medication_quantity: Database['public']['Tables']['medication_quantity']['Row'] & {
          medication_dosage: Database['public']['Tables']['medication_dosage']['Row'] & {
            medication: Database['public']['Tables']['medication']['Row'];
          };
        };
      };
    };
  };

const useDetails = () => {
  const supabase = useSupabaseClient<Database>();

  return useCallback(
    async (id: string) => {
      const { data: prescriptionData, error } = await supabase
        .from('patient_prescription')
        .select('reference_id')
        .eq('id', id)
        .maybeSingle();

      if (error || !prescriptionData?.reference_id) {
        throw new Error('Reference ID not found for patient prescription.');
      }

      return prescriptionData.reference_id;
    },
    [supabase]
  );
};

export function PrescriptionManage() {
  const vwoClientInstance = useVWO();
  const { id } = Router.query as { id: string };
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const { data: patient } = usePatient();
  const { data: subscriptionData, refetch: refetchSubscription } =
    usePatientSubscription(id);

  const { data: patientSubscriptions, refetch: refetchSubscriptions } =
    useActivePatientSubscription();

  const [loading, setLoading] = useState(false);
  const { scheduleForCancelation } = usePayment();
  const [reasonSelections, setReasonSelections] = useState<string[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] =
    useState<PatientPrescription | null>(null);

  const [otherValue, setOtherValue] = useState<string>('');
  const [loadingItem, setLoadingItem] = useState<number | null>(null);
  const prescriptionDetails = useDetails();

  const fetchSubscriptionDetails = useCallback(async () => {
    if (!subscriptionData) {
      try {
        const { data, error } = await supabase
          .from('patient_prescription')
          .select(
            `*, 
            order!inner(
              *,
              prescription!inner(
                *,
                medication_quantity!inner(
                  *,
                  medication_dosage!inner(
                    *,
                    medication!inner(*)
                  )
                )
              )
            ),
            reference_id`
          )
          .eq('id', id)
          .maybeSingle();

        if (error || !data) {
          throw new Error('Failed to fetch subscription details.');
        }

        const subscriptionDetails = {
          ...data,
          subscription: {
            ...data.order.prescription,
            reference_id: data.reference_id,
          },
        };

        setSubscriptionDetails(subscriptionDetails as PatientPrescription);
      } catch (error) {
        console.error('Failed to fetch subscription details.', {
          error,
        });
      }
    }
  }, [id, subscriptionData, supabase]);

  useEffect(() => {
    if (!subscriptionData) {
      fetchSubscriptionDetails();
    }
  }, [subscriptionData, fetchSubscriptionDetails]);
  const handleCancelSubscription = useCallback(async () => {
    try {
      setLoading(true);

      const referenceId =
        subscriptionData?.reference_id ||
        subscriptionDetails?.reference_id ||
        (await fetchSubscriptionDetails());

      if (!referenceId) {
        throw new Error('Failed to find reference ID for cancellation.');
      }

      await scheduleForCancelation(
        referenceId,
        [...reasonSelections, otherValue].join(' // ')
      );

      if (patient) {
        await Promise.allSettled([
          vwoClientInstance?.track(
            '5483',
            'medSubscriptionScheduledForCancel',
            patient
          ),
          vwoClientInstance?.track(
            '8552',
            'medSubscriptionScheduledForCancel',
            patient
          ),
          vwoClientInstance?.track(
            '8552_2',
            'medSubscriptionScheduledForCancel',
            patient
          ),
        ]);
      }

      await supabase.from('patient_action_item').insert({
        patient_id: patient?.id!,
        type: 'CANCELLED_PRESCRIPTION',
        title: 'Resubscribe to continue getting Rx',
        body: 'One or more of your prescriptions was cancelled. Use this to resubscribe and continue getting your Rx filled including free shipping.',
        path: Pathnames.PRESCRIPTION_ORDERS,
      });

      membershipEvent(
        patient?.profiles?.first_name || 'Patient',
        patient?.profiles?.email || '',
        patientSubscriptions?.find(sub => sub.reference_id === referenceId)
          ?.subscription?.name || 'Prescription',
        subscriptionData?.current_period_end,
        []
      );

      toast.success('Membership scheduled for cancellation');
      refetchSubscriptions();
      Router.push(`/manage-prescriptions/cancel/${id}?page=cancelled`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to cancel subscription.');
    } finally {
      setLoading(false);
    }
  }, [
    id,
    reasonSelections,
    otherValue,
    patient,
    scheduleForCancelation,
    prescriptionDetails,
    subscriptionData,
    patientSubscriptions,
    supabase,
    refetchSubscriptions,
  ]);

  const handleApplyGift = useCallback(async () => {
    try {
      const referenceId =
        subscriptionData?.reference_id ||
        subscriptionDetails?.reference_id ||
        (await fetchSubscriptionDetails());

      if (!referenceId) {
        throw new Error('Failed to find reference ID for gift application.');
      }

      const couponApplied = await axios.post(
        '/api/service/payment/apply-coupon-subscription',
        {
          subscriptionId: referenceId,
          couponId: process.env.NEXT_PUBLIC_TWENTY_DOLLARS_OFF,
        }
      );

      if (couponApplied.status === 200) {
        Router.push(
          {
            pathname: `/manage-prescriptions/cancel/${id}`,
            query: { page: 'gift-applied' },
          },
          undefined,
          { shallow: true }
        );
      }
    } catch (err) {
      toast.error('Failed to apply gift.');
    }
  }, [id, subscriptionData?.reference_id, fetchSubscriptionDetails]);

  const handleClick = () => {
    if (!otherValue) {
      toast.error('You must choose an option.');
      return;
    }
    handleCancelSubscription();
  };

  const parseSubName = (sub: string) => {
    const names: { [key: string]: string } = {
      'Zealthy Subscription': 'Membership',
      'Mental Health Coaching': 'Mental Health Coaching Plan',
      'Zealthy Weight Loss': 'Weight Loss Plan',
      'Zealthy Weight Loss Access': 'Weight Loss Access Plan',
      'Medication Subscription': 'Medication Membership',
      'Zealthy Personalized Psychiatry': 'Personalized Psychiatry Plan',
    };
    return names[sub] || 'Subscription';
  };

  const selectItems: string[] = [
    'The medication fee is too high',
    'I’m not seeing any results',
    'I don’t need the products or services I was previously using',
    "I didn't like the products I purchased",
    'Zealthy is too expensive for me',
    'I have product leftover from another order',
    'I require products or services not offered',
    'I had a negative experience',
    'I’m moving outside of the state or country',
    'Other',
  ];

  const selectItem = (item: string) => {
    setReasonSelections(items =>
      items.includes(item) ? items.filter(i => i !== item) : [...items, item]
    );
  };

  async function changeRefillDate(days: number) {
    setLoadingItem(days);
    try {
      const delayMed = await axios.post(
        '/api/service/payment/delay-subscription',
        {
          subscriptionId: subscriptionData?.reference_id,
          resumeDate: addDays(
            new Date(
              subscriptionData?.current_period_end
                ? subscriptionData?.current_period_end
                : ''
            ),
            days
          ),
          cancel_at: addDays(new Date(subscriptionData?.cancel_at || ''), days),
        }
      );

      if (delayMed.status === 200) {
        Router.push(
          {
            pathname: `/manage-prescriptions/cancel/${id}`,
            query: { page: 'delay-applied' },
          },
          undefined,
          { shallow: true }
        );
      }
      refetchSubscription();
      setLoadingItem(null);
    } catch (error: any) {
      console.log('ERROR ON', error);
    }
  }

  useEffect(() => {
    const isBirthControl = subscriptionDetails?.care?.includes('Birth Control');

    if (!page && isBirthControl) {
      Router.replace(`/manage-prescriptions/cancel/${id}?page=cancel-reason`);
    }
  }, [page, id, subscriptionData]);

  return (
    <>
      {!page && !subscriptionDetails?.care?.includes('Birth Control') && (
        <PreCancelation subscription={subscriptionData} />
      )}
      {page === 'confirm-upgrade' && <ConfirmPrescriptionUpgrade />}
      {page === 'cancelation' && (
        <Box maxWidth="475px" margin="0 auto">
          <Stack gap={2}>
            <Typography variant="h2">
              Would you like to pause your subscription?
            </Typography>
            <Typography variant="body1">
              You can re-activate at any time before or select your ideal date
              to receive future refills on your prescription.
            </Typography>
          </Stack>
          <Stack gap={2} mt={5}>
            {[30, 60, 90, 180].map(item => (
              <ArrowActionCard
                key={item}
                text={`Pause for ${item} days`}
                subText={
                  subscriptionData?.current_period_end
                    ? `Refill on ${format(
                        addDays(
                          new Date(subscriptionData?.current_period_end || ''),
                          item
                        ),
                        'MMMM do, yyyy'
                      )}`
                    : ''
                }
                onClick={() => changeRefillDate(item)}
                loading={loadingItem === item}
              />
            ))}
            <ArrowActionCard
              text="No thanks"
              onClick={() =>
                Router.push(
                  {
                    pathname: `/manage-prescriptions/cancel/${id}`,
                    query: { page: 'effective' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            />
          </Stack>
        </Box>
      )}
      {page === 'cancel-reason' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'column',
            textAlign: 'start',
          }}
        >
          <Typography variant="h2" sx={{ marginBottom: '48px' }}>
            {`Why do you want to cancel your Zealthy ${
              subscriptionData?.subscription?.name
                ? parseSubName(subscriptionData?.subscription?.name)
                : subscriptionDetails?.care === 'Birth control'
                ? 'Birth Control Plan'
                : 'Subscription'
            }?`}
          </Typography>

          <FormControl
            sx={{
              marginBottom: '48px',
              width: '100%',
              gap: '1rem',
            }}
          >
            {selectItems.map(item => {
              const isSelected = reasonSelections.includes(item);

              return (
                <ListItemButton
                  selected={isSelected}
                  key={item}
                  onClick={() => selectItem(item)}
                >
                  {item}
                  {isSelected ? (
                    <CheckMark style={{ marginLeft: 'auto' }} />
                  ) : null}
                </ListItemButton>
              );
            })}
            {!!reasonSelections.length && (
              <>
                <FilledInput
                  sx={{
                    background: '#EEEEEE',
                    '&:hover': {
                      background: '#EEEEEE',
                    },
                  }}
                  onChange={e => setOtherValue(e.target.value)}
                  fullWidth
                  placeholder="Please share more details here (required)"
                  multiline
                  disableUnderline={true}
                  rows={8}
                />
              </>
            )}
          </FormControl>

          <LoadingButton
            type="button"
            loading={loading}
            disabled={loading}
            onClick={handleClick}
            sx={{ width: '100%' }}
          >
            {'Continue'}
          </LoadingButton>
        </Box>
      )}
      {page === 'provider' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            maxWidth: '475px',
            margin: '0 auto',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Unsure what to do or expect? Talk to your provider?'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Let your care team know how you’re doing. They can make changes to your treatment plan, if needed, to help you achieve your goals.'
            }
          </Typography>

          <Box
            sx={{
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              margin: 'auto',
              marginBottom: '3rem',
              border: '1px solid #00000033',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              gap: '1rem',
            }}
          >
            <Typography variant="h3">Get Assistance</Typography>
            <Avatar
              alt={''}
              src="/doctor-images/male-doctor-1.png"
              sx={{
                width: '3.5rem',
                height: '3.5rem',
                margin: 'auto',
              }}
            />
            <Button
              fullWidth
              size="small"
              onClick={() => Router.push('/messages')}
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              {'Message Care Team'}
            </Button>
          </Box>

          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.push(
                {
                  pathname: `/manage-prescriptions/cancel/${id}`,
                  query: { page: 'gift' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue to cancel'}
          </Button>
        </Box>
      )}
      {page === 'gift' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            maxWidth: '475px',
            margin: '0 auto',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Continue your treatment with a little gift - on us!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`You don’t have to stop treatment altogether. Take $20 off your next order, and continue your treatment with Zealthy.`}
          </Typography>

          <Button
            size="small"
            fullWidth
            onClick={handleApplyGift}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {`Get $20 on us`}
          </Button>
          <Button
            size="small"
            fullWidth
            color="grey"
            onClick={() =>
              Router.replace(
                {
                  pathname: `/manage-prescriptions/cancel/${id}`,
                  query: { page: 'cancel-reason' },
                },
                undefined,
                { shallow: true }
              )
            }
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {'Continue to cancel'}
          </Button>
        </Box>
      )}
      {page === 'gift-applied' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {`Membership discount applied!`}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {`This will apply to your next billing cycle.`}
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Done'}
          </Button>
        </Box>
      )}
      {page === 'delay-applied' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'You’re good to go!'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {subscriptionData?.current_period_end
              ? `We’ve paused your subscription until ${format(
                  new Date(subscriptionData?.current_period_end),
                  'iiii, MMMM d, yyyy'
                )}`
              : ''}
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'Done'}
          </Button>
        </Box>
      )}
      {page === 'effective' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            maxWidth: '475px',
            margin: '0 auto',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Has your treatment been effective?'}
          </Typography>
          <Stack mt={4} width="100%">
            <Button
              size="small"
              fullWidth
              onClick={() =>
                Router.push(
                  {
                    pathname: `/manage-prescriptions/cancel/${id}`,
                    query: { page: 'gift' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              {'Yes, it has been effective'}
            </Button>
            <Button
              size="small"
              color="grey"
              fullWidth
              onClick={() =>
                Router.push(
                  {
                    pathname: `/manage-prescriptions/cancel/${id}`,
                    query: { page: 'provider' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
              sx={{
                fontWeight: '600',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              {'No, it has not been effective'}
            </Button>
          </Stack>
        </Box>
      )}
      {page === 'cancelled' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              marginBottom: '1rem',
            }}
          >
            {'Your subscription has been scheduled for cancellation.'}
          </Typography>
          <Typography variant="subtitle1" sx={{ marginBottom: '3rem' }}>
            {
              'Good luck with your journey to a healthier you! If we can support in any way in the future, check out our other offerings here.'
            }
          </Typography>

          <Button
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
            sx={{
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {'View Zealthy treatments'}
          </Button>
        </Box>
      )}
    </>
  );
}

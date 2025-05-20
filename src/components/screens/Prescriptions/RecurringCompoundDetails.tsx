import { usePatientSubscription } from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { StandardModal } from '@/components/shared/modals';
import { Box, Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { addMonths, differenceInDays, format } from 'date-fns';
import Router from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const RecurringCompoundDetails = () => {
  const { id: subID } = Router.query;
  const { data: patientPrescription, refetch } = usePatientSubscription(subID);
  const [openDelayModal, setOpenDelayModal] = useState(false);
  const [delayDuration, setDelayDuration] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const medName = patientPrescription?.order?.total_dose?.split(' ')[0];

  const isSubDelayedDouble =
    differenceInDays(
      new Date(patientPrescription?.current_period_end || ''),
      new Date(patientPrescription?.current_period_start || '')
    ) -
      (patientPrescription?.interval_count || 30) >
    59;

  async function handleDelayMedication(time: number) {
    setLoading(true);
    const delayMed = await axios.post(
      '/api/service/payment/delay-subscription',
      {
        subscriptionId: subID,
        resumeDate: addMonths(
          new Date(
            patientPrescription?.current_period_end
              ? patientPrescription?.current_period_end
              : ''
          ),
          time
        ),
      }
    );

    if (delayMed?.status === 200) {
      toast.success('Your shipment has been successfully delayed');
      return Router.push('/patient-portal');
    } else {
      toast.error('There was a problem delaying your shipment');
    }
    refetch();
    setOpenDelayModal(false);
    setLoading(false);
  }

  return (
    <>
      <Stack gap={3}>
        <Typography variant="h3" mb="3rem">
          {'Manage your Zealthy weight loss medication subscription.'}
        </Typography>
        <Stack gap="1rem">
          <Typography variant="body1">Select an option</Typography>
          <Box
            sx={{
              padding: '24px',
              background: '#FFFFFF',
              border: '1px solid #D8D8D8',
              borderRadius: '16px',
            }}
          >
            <Typography fontWeight={700} mb={'0.5rem'}>
              Need more medication?
            </Typography>
            <Typography variant="subtitle1" mb="1.5rem" color="#989898">
              Running lower than expected?
            </Typography>
            <Button
              fullWidth
              onClick={() =>
                Router.push('/patient-portal/visit/weight-loss-refill')
              }
            >
              Place an order
            </Button>
          </Box>
          {!isSubDelayedDouble ? (
            <>
              <Box
                sx={{
                  padding: '24px',
                  background: '#FFFFFF',
                  border: '1px solid #D8D8D8',
                  borderRadius: '16px',
                }}
              >
                <Typography fontWeight={700} mb={'0.5rem'}>
                  Have more medication than you need?
                </Typography>
                <Typography variant="subtitle1" mb="1.5rem" color="#989898">
                  Delay your next few refills
                </Typography>
                <Button
                  fullWidth
                  onClick={() => {
                    setDelayDuration(3);
                    setOpenDelayModal(true);
                  }}
                >
                  Delay refill for 3 months
                </Button>
              </Box>
              <Box
                sx={{
                  padding: '24px',
                  background: '#FFFFFF',
                  border: '1px solid #D8D8D8',
                  borderRadius: '16px',
                }}
              >
                <Typography fontWeight={700} mb={'0.5rem'}>
                  Are you traveling or have lifestyle changes?
                </Typography>
                <Typography variant="subtitle1" mb="1.5rem" color="#989898">
                  Delay your next refill
                </Typography>
                <Button
                  fullWidth
                  onClick={() => {
                    setDelayDuration(1);
                    setOpenDelayModal(true);
                  }}
                >
                  Delay refill for 1 month
                </Button>
              </Box>
            </>
          ) : null}
        </Stack>
      </Stack>
      <StandardModal
        modalOpen={openDelayModal}
        setModalOpen={() => setOpenDelayModal(o => !o)}
      >
        <Stack padding="12px" paddingTop="24px">
          <Typography
            variant="h3"
            mb="1rem"
          >{`Are you sure you want to delay your next shipment by ${delayDuration} months?`}</Typography>
          <Typography mb="3rem">{`Your next shipment of ${medName} will not be shipped until ${
            patientPrescription?.current_period_end
              ? format(
                  addMonths(
                    new Date(patientPrescription?.current_period_end || ''),
                    delayDuration
                  ),
                  'eee MMM d, yyyy'
                )
              : new Date()
          } if you delay your shipment.
          `}</Typography>
          <LoadingButton
            fullWidth
            disabled={loading}
            sx={{ marginBottom: '1rem' }}
            onClick={() => handleDelayMedication(delayDuration)}
          >
            {'Yes, delay shipment '}
          </LoadingButton>
          <Button
            fullWidth
            color="grey"
            size="small"
            onClick={() => setOpenDelayModal(false)}
          >
            {'Cancel'}
          </Button>
        </Stack>
      </StandardModal>
    </>
  );
};
export default RecurringCompoundDetails;

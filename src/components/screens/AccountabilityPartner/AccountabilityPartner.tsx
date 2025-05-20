import { Box, Button, Container, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useCreateWeightLossReferral } from '@/components/hooks/mutations';
import {
  usePatient,
  usePatientWeightLossReferrals,
} from '@/components/hooks/data';
import { handleCopy } from '@/utils/copyToClipboard';

const AccountabilityPartner = () => {
  const { data: patient } = usePatient();
  const { isLoading, data: patientReferrals } = usePatientWeightLossReferrals();
  const createReferralCode = useCreateWeightLossReferral();

  async function handleCreateReferralCode() {
    const referral = await createReferralCode.mutateAsync({
      patientId: patient?.id,
    });
  }
  useEffect(() => {
    if (!isLoading && !patientReferrals?.referral?.code && patient?.id) {
      handleCreateReferralCode();
    }
  }, [patientReferrals, patient?.id]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h2" sx={{ marginBottom: '3rem' }}>
        {'Invite an accountability buddy!'}
      </Typography>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          fontWeight={600}
          sx={{ fontSize: '2rem !important', marginBottom: '1rem' }}
        >
          {patientReferrals?.redeemedThisMonth?.length ?? 0}
        </Typography>
        <Typography
          fontWeight={400}
          sx={{ fontSize: '1rem !important', marginBottom: '3rem' }}
        >
          {'friends invited this month'}
        </Typography>
      </Box>
      <Typography variant="h3" fontWeight={600} sx={{ marginBottom: '1rem' }}>
        {'Your Referral Code'}
      </Typography>
      <Box
        sx={{
          background: '#FFFFFF',
          borderRadius: '1rem',
          border: '1px solid #D8D8D8',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          maxWidth: '320px',
          marginBottom: '3rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <Typography variant="h2" fontWeight={600}>
          {`${patientReferrals?.referral?.code || ''} `}
        </Typography>
        <Button
          onClick={() =>
            handleCopy(
              `${window.location.origin}/signup/${patientReferrals?.referral?.code}`
            )
          }
        >
          Copy link
        </Button>
      </Box>
      <Typography sx={{ marginBottom: '1rem' }}>
        <b>{'You get: '}</b>
        {
          '$10 towards your subscription for each friend that uses your invitation link to sign up for the Zealthy Weight Loss program, for up to 5 friends per month.'
        }
      </Typography>
      <Typography>
        <b>{'Your friends get: '}</b>
        {
          '$10 towards their subscription to the Zealthy Weight Loss program once they confirm they are eligible through your link.'
        }
      </Typography>
    </Container>
  );
};

export default AccountabilityPartner;

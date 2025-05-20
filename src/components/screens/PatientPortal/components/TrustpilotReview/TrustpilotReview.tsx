import { usePatient } from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { Pathnames } from '@/types/pathnames';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';

const TrustpilotReview = () => {
  const router = useRouter();
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState<boolean>(false);
  const patientName = `${patient?.profiles?.first_name} ${patient?.profiles?.last_name}`;

  const handleInvitationLink = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        '/api/trustpilot/invitation-link',
        {
          patientName,
          email: patient?.profiles?.email,
          referenceId: patient?.profile_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      window.open(response?.data?.url, '_blank');
      setLoading(false);
      return router.push(Pathnames.PATIENT_PORTAL);
    } catch (error) {
      console.error('Error creating invitation link:', error);
    }
  }, [patient?.profiles?.email, patient?.profile_id, patientName]);
  return (
    <Stack gap={1} textAlign="center">
      <Typography variant="h2">Please help with a public review</Typography>
      <Typography>
        Would you please share your experience with Zealthy online? Your review
        or rating will help people learn more about us. That means we can spend
        less on advertising and keep service costs low.
      </Typography>
      <br></br>
      <Typography>It just takes 2 minutes and it helps a lot.</Typography>
      <br></br>
      <Stack gap={2}>
        <LoadingButton
          loading={loading}
          onClick={() => {
            window.freshpaint?.track('click-rate-on-trustpilot'),
              {
                tp_review_modal_source: 'coach',
                tp_review_click_source: 'Web App',
              };
            handleInvitationLink();
          }}
        >
          Rate us on Trustpilot
        </LoadingButton>
        <Button
          color="grey"
          onClick={() => router.push(Pathnames.PATIENT_PORTAL)}
        >
          Go back to your Zealthy portal
        </Button>
      </Stack>
    </Stack>
  );
};

export default TrustpilotReview;

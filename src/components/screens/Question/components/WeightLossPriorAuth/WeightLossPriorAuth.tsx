import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { Container, Typography, Button } from '@mui/material';
import Router from 'next/router';
import { useEffect, useState } from 'react';

interface WeightLossMedicalProps {
  nextPage: (nextPage?: string) => void;
}

const WeightLossPriorAuth = ({ nextPage }: WeightLossMedicalProps) => {
  const [loading, setLoading] = useState(true);
  const { data: patient } = usePatient();
  const { potentialInsurance } = useIntakeState();
  useEffect(() => {
    if (
      ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        potentialInsurance || ''
      )
    ) {
      nextPage();
    } else {
      setLoading(false);
    }
  }, [potentialInsurance]);

  function handleContinue() {
    window.freshpaint?.track('weight-loss-post-checkout-skip-pa');
    nextPage();
  }
  return loading ? null : (
    <Container maxWidth="xs">
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        Let us know if you’d like to skip the prior authorization process.
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
        For most of our patients, our insurance coordination team helps get a
        prior authorization from their insurance so that the medication is
        covered.
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
        To move forward with that process and begin with initiating a prior
        authorization with insurance, select Continue. This typically will
        enable you to pay about $25 a month for your Rx.
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
        {`However, for those without insurance or who prefer not to wait for a
        prior authorization (which may take up to 2 weeks) for insurance to
        cover GLP-1 medication, we have an option to ship you compound
        medication for ${
          patient?.region === 'CA'
            ? 'as little as $151/month'
            : 'approximately $151 per 1-month supply'
        }. If you’d like to
        move forward with this out of pocket option immediately and skip the
        prior authorization process, select Skip insurance & request compound Rx
        below.`}
      </Typography>
      <Button
        type="button"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={handleContinue}
      >
        Continue
      </Button>
      <Button
        color="grey"
        fullWidth
        onClick={() =>
          Router.push(
            '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1?id=compound'
          )
        }
      >
        Skip insurance & request compound Rx
      </Button>
    </Container>
  );
};

export default WeightLossPriorAuth;

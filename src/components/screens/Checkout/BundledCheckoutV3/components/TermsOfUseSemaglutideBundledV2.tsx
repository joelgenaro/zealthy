import { Stack, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

const TermsOfUseSemaglutideBundledV2 = () => {
  const theme = useTheme();

  return (
    <Stack gap="16px">
      <Typography textAlign="center" letterSpacing="-0.084px">
        Prescription products require an evaluation with a licensed medical
        professional who will determine if a prescription is appropriate.{' '}
      </Typography>
      <Typography textAlign="center" letterSpacing="-0.084px">
        By clicking $0 Due Today, you agree to the{' '}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/terms-of-use/"
          target="_blank"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/consent-to-telehealth"
          target="_blank"
        >
          Consent to Telehealth
        </Link>
        . You also agree that, if prescribed, you will be charged $217.00 for
        your first 30 days supply and $297.00 every 30 days thereafter until you
        cancel. Ongoing shipments may be charged and shipped up to 2 days early
        to accommodate holidays or other operational reasons to support
        treatment continuity.{' '}
      </Typography>
      <Typography textAlign="center" letterSpacing="-0.084px">
        Your subscription will renew unless you cancel at least 2 days before
        the next processing date. You can view your processing date and cancel
        your subscription(s) through your online account or by contacting
        customer support at{' '}
        <Link
          href="mailto:support@getzealthy.com"
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
        >
          support@getzealthy.com
        </Link>
        .{' '}
      </Typography>
      <Typography textAlign="center" letterSpacing="-0.084px">
        *This is based on data from a 2022 study published in the American
        Medical Association titled &quot;Weight Loss Outcomes Associated With
        Semaglutide Treatment for Patients With Overweight or Obesity.&quot;
      </Typography>
    </Stack>
  );
};

export default TermsOfUseSemaglutideBundledV2;

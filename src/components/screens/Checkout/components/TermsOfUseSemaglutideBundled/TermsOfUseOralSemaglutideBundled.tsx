import { Stack, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

const TermsOfUseOralSemaglutideBundled = () => {
  const theme = useTheme();

  return (
    <Stack gap="16px">
      <Typography textAlign="center" letterSpacing="-0.084px">
        By clicking “Confirm” you agree to having reviewed and agreed to
        Zealthy’s{' '}
        <Link
          style={{
            textDecoration: 'none',
            color: theme.palette.primary.light,
          }}
          href="https://www.getzealthy.com/terms-of-use/"
          target="_blank"
        >
          Terms of Use.
        </Link>{' '}
      </Typography>
      <Typography textAlign="center" letterSpacing="-0.084px">
        By providing your card information, you allow Zealthy to charge $149 for
        your first month and $249 for every month after unless you cancel your
        membership. You can cancel your membership by logging into your Zealthy
        account and clicking “Profile” in the top right corner and selecting
        “Manage Membership” in the program details section. Your monthly
        membership fees are non-refundable and you can cancel up to 36 hours
        before any future billing period.{' '}
      </Typography>
    </Stack>
  );
};

export default TermsOfUseOralSemaglutideBundled;

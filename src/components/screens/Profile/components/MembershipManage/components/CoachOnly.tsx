import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Router from 'next/router';
import { useCallback } from 'react';

interface PrePaidProps {
  basePath: string;
}

const CoachOnly = ({ basePath }: PrePaidProps) => {
  const handleNextPage = useCallback(() => {
    return Router.push({
      pathname: `${Pathnames.PATIENT_PORTAL_MANAGE_MEMBERSHIPS}/downgrade`,
      query: {
        plan: 'Weight Loss Coaching Only Plan',
      },
    });
  }, []);

  return (
    <Stack
      gap="25px"
      sx={{
        borderRadius: '16px',
      }}
    >
      <Stack gap="1rem">
        <Typography variant="h2">{'Manage Your Plan'}</Typography>
      </Stack>
      <ListItemButton
        sx={{
          background: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(0, 0, 0, 0.19)',
        }}
        onClick={handleNextPage}
      >
        <Stack gap="8px" width="100%">
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight="600">
              Zealthy Weight Loss Coaching Only Plan
            </Typography>
          </Stack>
          <Typography>$49.00 every month</Typography>
        </Stack>
      </ListItemButton>

      <Link
        href={`${basePath}?page=weight-loss`}
        style={{ alignSelf: 'center', color: '#777' }}
      >
        Cancel weight loss plan
      </Link>

      <Button
        variant="contained"
        fullWidth
        color="grey"
        onClick={() =>
          Router.push(`${Pathnames.PATIENT_PORTAL}/profile?page=home`)
        }
      >
        {'Back to profile'}
      </Button>
    </Stack>
  );
};

export default CoachOnly;

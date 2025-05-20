import { Pathnames } from '@/types/pathnames';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import { useCallback } from 'react';

const ResetPasswordSent = () => {
  const handleNext = useCallback(() => Router.push(Pathnames.LOG_IN), []);

  return (
    <Stack gap="16px">
      <Typography variant="h2">Check your email.</Typography>
      <Typography paragraph>
        We have sent you an e-mail with a link to reset your password. When you
        receive it, click the link and create a new password
      </Typography>
      <Button fullWidth onClick={handleNext}>
        Back to Login
      </Button>
    </Stack>
  );
};

export default ResetPasswordSent;

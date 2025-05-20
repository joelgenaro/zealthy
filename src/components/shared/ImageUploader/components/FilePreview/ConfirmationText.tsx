import { Stack, Typography } from '@mui/material';

const ConfirmationText = () => {
  return (
    <Stack gap="16px" marginBottom="48px">
      <Typography variant="h2">{'Review and confirm the photo.'}</Typography>
      <Typography>
        {"Ensure that your photo isn't blurry, dark, or cut off."}
      </Typography>
    </Stack>
  );
};

export default ConfirmationText;

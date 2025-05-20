import { Box, Button, Typography } from '@mui/material';

const refreshPage = () => {
  console.warn(
    "make sure to allow access to your microphone and camera in your browser's permissions"
  );
  window.location.reload();
};

export default function UserMediaError() {
  return (
    <Box
      padding="20px"
      display="flex"
      flexDirection="column"
      textAlign="center"
      alignItems="center"
      gap="20px"
    >
      <Typography variant="h3">Camera or mic blocked!</Typography>
      <Typography variant="body1">
        Please check your browser permissions and try again.
      </Typography>
      <Button size="small" onClick={refreshPage}>
        Try again
      </Button>
    </Box>
  );
}

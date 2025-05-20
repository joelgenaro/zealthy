import { Box, Skeleton, Container, Stack } from '@mui/material';

const LoadingState = () => {
  return (
    <Container maxWidth="xs">
      <Stack spacing={2} sx={{ pt: 2 }}>
        <Skeleton variant="rectangular" height={155} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" height={40} width="80%" />
        <Skeleton variant="text" height={20} width="90%" />
        <Skeleton variant="text" height={20} width="85%" />
        <Box sx={{ mt: 2 }}>
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 1 }}
          />
          <Box sx={{ mt: 2 }}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
};

export default LoadingState;

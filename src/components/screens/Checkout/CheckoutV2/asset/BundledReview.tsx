import FiveStarsGold from '@/components/shared/icons/FiveStarsGold';
import GreenExclmationPoint from '@/components/shared/icons/GreenExclamationMark';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const BundledReview = () => {
  return (
    <Stack gap={2} sx={{ paddingTop: '10px' }}>
      <Box
        display="flex"
        alignItems="center"
        sx={{ gap: '1rem', position: 'relative', left: '4%' }}
      >
        <FiveStarsGold />
        <Typography variant="h4">Over 20k members served</Typography>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        sx={{ gap: '0.2rem', position: 'relative', left: '4%' }}
      >
        <GreenExclmationPoint />
        <Typography variant="h4">In stock. Selling fast!</Typography>
      </Box>
    </Stack>
  );
};

export default BundledReview;

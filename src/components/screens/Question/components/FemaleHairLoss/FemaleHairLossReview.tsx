import FiveStarsGreen from '@/components/shared/icons/FiveStarsGreen';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

const FemaleHairLossReview = () => {
  return (
    <Stack
      gap={4}
      sx={{
        backgroundColor: '#E8FFF0',
        border: '0.5px solid #005315',
        borderRadius: '12px',
        padding: '16px 17px',
      }}
    >
      <Box>
        <FiveStarsGreen />
      </Box>
      <Typography>
        {
          '“I started noticing my hair wasn’t feeling as healthy or full as it had been before. I was feeling self-conscious about it and didn’t know who to go or what products to use. When I finally found Zealthy I was so happy to find products that worked. I love my hair now, it feels so much more thicker and healthier than it’s ever been!”'
        }
      </Typography>
      <Box>
        <Typography variant="h3" fontWeight={400}>
          {'Ashley S.'}
        </Typography>
        <Typography variant="h3" fontWeight={300} sx={{ fontStyle: 'italic' }}>
          {'Verified Review'}
        </Typography>
      </Box>
    </Stack>
  );
};

export default FemaleHairLossReview;

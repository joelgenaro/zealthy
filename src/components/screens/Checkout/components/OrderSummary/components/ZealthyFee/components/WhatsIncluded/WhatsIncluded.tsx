import CheckMark from '@/components/shared/icons/CheckMark';
import CustomText from '@/components/shared/Text/CustomText';
import { Box, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

const listItems = [
  'On-demand care with video, phone, and messaging',
  'Booking of same/next-day appointments',
  'Prescription requests/renewals plus seamless doorstep delivery',
  'Access to top-notch medical providers and specialists',
  'Health summaries and personalized treatment plans',
];

const WhatsIncluded = () => {
  return (
    <Box>
      <CustomText lineHeight="24px" fontWeight="500">
        What’s included:
      </CustomText>
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '0',
          margin: '0.3rem 0 0 0.3rem',
        }}
      >
        {listItems.map(item => (
          <ListItem key={item} sx={{ padding: '0', gap: '16px' }}>
            <Typography>
              <CheckMark height={16} width={16} strokeWidth={1} />
            </Typography>
            <Typography>{item}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default WhatsIncluded;

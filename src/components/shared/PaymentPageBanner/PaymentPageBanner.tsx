import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

interface BannerProps {
  is3Month?: boolean;
}

const PaymentPageBanner = ({ is3Month }: BannerProps) => {
  return (
    <Box
      sx={{
        padding: '19px 9px',
        borderRadius: '12px',
        background: 'linear-gradient(91deg, #DAF6E0 0.15%, #A9DDBA 100%)',
      }}
    >
      <Typography variant="h4" sx={{ color: '#000000' }}>
        {is3Month
          ? 'These prices will never increase, even if your dose does.'
          : 'This price will never increase, even if your dose does.'}
      </Typography>
    </Box>
  );
};

export default PaymentPageBanner;

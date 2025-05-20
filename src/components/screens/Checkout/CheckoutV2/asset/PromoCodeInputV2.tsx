import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, keyframes } from '@mui/material';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVWOVariationName } from '@/components/hooks/data';

interface PromoCodeInputProps {
  setIsPromoApplied: (applied: boolean) => void | undefined;
  promotionCode?: string;
}
const slideDown = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
`;

const PromoCodeInputV2 = ({
  setIsPromoApplied,
  promotionCode,
}: PromoCodeInputProps) => {
  const isMobile = useIsMobile();
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeMessage, setPromoCodeMessage] = useState(false);
  const { data: var6399 } = useVWOVariationName('6399');
  const isVar2 = var6399?.variation_name === 'Variation-2';

  useEffect(() => {
    if (promotionCode) {
      setPromoCode(promotionCode);
      setIsPromoApplied && setIsPromoApplied(true);
    }
  }, [promotionCode]);

  const handlePromoChange = (e: { target: { value: string } }) => {
    const code = e.target.value.toUpperCase();
    setPromoCode(code);
  };

  const handleApplyCode = async () => {
    if (promoCode === 'ZEALTHY20' && setIsPromoApplied) {
      setIsPromoApplied && setIsPromoApplied(true);
      setPromoCodeMessage(true);
    } else if (setIsPromoApplied && promoCode !== 'ZEALTHY20') {
      setIsPromoApplied(false);
      setPromoCodeMessage(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          width: '100%',
          height: '100%',
        }}
      >
        <TextField
          value={promotionCode || promoCode}
          onChange={handlePromoChange}
          placeholder="Enter promo code"
          disabled={!!promotionCode}
          sx={{
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '1rem',
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#e0e0e0',
                borderWidth: '2px',
              },
              '&:hover fieldset': {
                borderColor: '#00a650',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00a650',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#666666',
              opacity: 1,
            },
          }}
        />
        <Button
          onClick={handleApplyCode}
          sx={{
            height: '100%',
            backgroundColor: '#1B5E20',
            color: 'white',
            borderRadius: '1rem',
            padding: isMobile ? '.25rem 1rem' : '0.75rem 2rem',
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#2E7D32',
            },
          }}
        >
          Enter code
        </Button>
      </Box>
      {promoCodeMessage && isVar2 ? (
        <Box
          sx={{
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            alignSelf: 'center',
            marginLeft: '1%',
            mt: 1,
            overflow: 'hidden',
            animation: `${slideDown} 5s ease-in-out forwards`,
          }}
        >
          <Typography
            sx={{
              color: '#2E7D32',
              backgroundColor: '#E8F5E9',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Promo code applied!
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};

export default PromoCodeInputV2;

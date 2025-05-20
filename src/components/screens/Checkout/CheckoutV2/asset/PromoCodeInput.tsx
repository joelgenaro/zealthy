import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import CouponTag from './CouponTag';

interface PromoCodeInputProps {
  setIsPromoApplied: ((applied: boolean) => void | undefined) | undefined;
  promotionCode?: string;
}

const PromoCodeInput = ({
  setIsPromoApplied,
  promotionCode,
}: PromoCodeInputProps) => {
  const [promoCode, setPromoCode] = useState('');
  const [showPromoMessage, setShowPromoMessage] = useState(false);

  useEffect(() => {
    if (promotionCode) {
      setPromoCode(promotionCode);
    }

    if (promotionCode) {
      setIsPromoApplied && setIsPromoApplied(true);
      setShowPromoMessage(true);
    } else if (setIsPromoApplied) {
      setIsPromoApplied(false);
      setShowPromoMessage(false);
    } else {
      return;
    }
  }, [promotionCode]);

  const handlePromoChange = (e: { target: { value: string } }) => {
    const code = e.target.value.toUpperCase();

    setPromoCode(code);
    if (code === 'ZEALTHY96' && setIsPromoApplied) {
      setIsPromoApplied && setIsPromoApplied(true);
      setShowPromoMessage(true);
    } else if (setIsPromoApplied) {
      setIsPromoApplied(false);
      setShowPromoMessage(false);
    } else {
      return;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',

        borderRadius: '.5rem',
      }}
    >
      {promotionCode ? (
        <TextField
          value={promotionCode}
          placeholder="Enter discount code"
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',

              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#00a650',
                borderWidth: '.2rem',
              },
              '&:hover fieldset': {
                borderColor: '#00a650',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00a650',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#2e562e',
              opacity: 1,
            },
          }}
        />
      ) : (
        <TextField
          value={promoCode}
          onChange={handlePromoChange}
          placeholder="Enter discount code"
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',

              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#00a650',
                borderWidth: '.2rem',
              },
              '&:hover fieldset': {
                borderColor: '#00a650',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00a650',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: '#2e562e',
              opacity: 1,
            },
          }}
        />
      )}
      {showPromoMessage && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            padding: '1rem',
            marginTop: '1rem',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '.2rem',
            border: '1px solid #00a650',

            alignItems: 'center',
          }}
        >
          <CouponTag />
          <Box
            sx={{
              width: '100%',
              paddingLeft: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'start',
            }}
          >
            <Typography
              fontWeight={800}
              sx={{
                color: '#00531B',
                width: '100%',
                fontSize: '1.1rem',
              }}
            >
              Promo applied! You got $96 off
            </Typography>
            <Typography
              sx={{
                width: '100%',
                color: '#00a650',
                fontWeight: 600,
              }}
            >
              Then $135 after promo expires
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PromoCodeInput;

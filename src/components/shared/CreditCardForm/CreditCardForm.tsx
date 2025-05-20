import { useLanguage } from '@/components/hooks/data';
import CustomText from '@/components/shared/Text/CustomText';
import { IPaymentObject } from '@/types/payment';
import { TextField, Box } from '@mui/material';
import DOMPurify from 'dompurify';
import { ChangeEventHandler, memo } from 'react';

export const paymentVerify = (paymentInfo: IPaymentObject | null) => {
  if (!paymentInfo) {
    return false;
  }

  if (
    !paymentInfo.cardHolderName ||
    !paymentInfo.cardNumber ||
    !paymentInfo.cvv ||
    !paymentInfo.expiration
  ) {
    return false;
  }

  return true;
};

export const defaultPaymentObject: IPaymentObject = {
  cardHolderName: '',
  cardNumber: '',
  cvv: '',
  expiration: '',
  zip: '',
};

interface CreditCardFormProps {
  error?: string;
  paymentInfo: IPaymentObject;
  setPaymentInfo: (paymentInfo: IPaymentObject) => void;
}

const CreditCardForm = ({
  error,
  paymentInfo,
  setPaymentInfo,
}: CreditCardFormProps) => {
  const { cardHolderName, cardNumber, cvv, expiration, zip } = paymentInfo;
  const handleCardHolderName: ChangeEventHandler<HTMLInputElement> = e => {
    setPaymentInfo({
      ...paymentInfo,
      cardHolderName: DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      }),
    });
  };

  const handleCardNumber: ChangeEventHandler<HTMLInputElement> = e => {
    setPaymentInfo({
      ...paymentInfo,
      cardNumber: e.target.value,
    });
  };

  const handleExpiration: ChangeEventHandler<HTMLInputElement> = e => {
    const value = e.target.value;

    const cleanedValue = value.replace(/\D/g, '');

    let formattedValue = '';
    for (let i = 0; i < cleanedValue.length; i++) {
      if (i === 2 || i === 4) {
        formattedValue += '/';
      }
      formattedValue += cleanedValue.charAt(i);
    }

    if (parseInt(cleanedValue.substring(0, 2)) > 12) {
      formattedValue = `0${
        +formattedValue.substring(1, 2) > 0 ? formattedValue.substring(1, 2) : 1
      }`;
    }

    setPaymentInfo({
      ...paymentInfo,
      expiration: formattedValue,
    });
  };

  const handleCVV: ChangeEventHandler<HTMLInputElement> = e => {
    setPaymentInfo({
      ...paymentInfo,
      cvv: e.target.value,
    });
  };

  const handleZIP: ChangeEventHandler<HTMLInputElement> = e => {
    setPaymentInfo({
      ...paymentInfo,
      zip: e.target.value,
    });
  };

  const language = useLanguage();
  let cardNumberLabel = 'Card number';

  if (language === 'esp') {
    cardNumberLabel = 'Número de tarjeta';
  }

  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      <Box display="flex" flexDirection="column" gap="16px">
        <TextField
          placeholder="Name on card"
          variant="outlined"
          value={cardHolderName}
          onChange={handleCardHolderName}
          required
        />
        <TextField
          placeholder={cardNumberLabel}
          variant="outlined"
          value={cardNumber}
          onChange={handleCardNumber}
          required
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 16,
          }}
        />
        <Box
          display="grid"
          gridTemplateColumns={{
            sm: 'repeat(3,1fr)',
            xs: 'repeat(2,1fr)',
          }}
          gap="16px"
        >
          <TextField
            value={expiration}
            onChange={handleExpiration}
            required
            fullWidth
            placeholder="MM/YY"
            variant="outlined"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 5,
            }}
          />
          <TextField
            value={cvv}
            onChange={handleCVV}
            required
            fullWidth
            placeholder="CVV"
            variant="outlined"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 4,
            }}
          />
          <TextField
            sx={{ gridColumn: { xs: 'span 2', sm: 'span 1' } }}
            value={zip}
            onChange={handleZIP}
            required
            fullWidth
            placeholder="ZIP"
            variant="outlined"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 5,
            }}
          />
        </Box>
        {error ? (
          <CustomText textAlign="center" color="red">
            {error}
          </CustomText>
        ) : null}
      </Box>
    </form>
  );
};

export default memo(CreditCardForm);

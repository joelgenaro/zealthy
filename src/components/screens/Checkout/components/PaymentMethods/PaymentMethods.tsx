import WhiteBox from '@/components/shared/layout/WhiteBox';
import { PaymentMethod } from '@/types/api/default-payment-method';
import { Stack, Typography } from '@mui/material';
import { CardElement, useStripe } from '@stripe/react-stripe-js';
import { PaymentRequest } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import ExistingPaymentMethod from '../ExistingPaymentMethod';
import ApplePay from './components/ApplePay';
import { useVariant } from '@/context/ABTestContext';
import { useLanguage } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface PaymentMethodsProps {
  totalAmount: number;
  defaultPaymentMethod: PaymentMethod | null;
  onError: (error: string) => void;
  onSuccess: (transaction_id: string) => Promise<void>;
}

const PaymentMethods = ({
  totalAmount,
  defaultPaymentMethod,
  onError,
  onSuccess,
}: PaymentMethodsProps) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null
  );
  const { isVariation1 } = useVariant();
  const language = useLanguage();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!stripe || totalAmount === 0) return;
    const pr = stripe.paymentRequest({
      currency: 'usd',
      country: 'US',
      requestPayerName: true,
      total: {
        label: language === 'esp' ? 'Total a pagar hoy' : 'Total due today',
        amount: Math.round(totalAmount * 100),
      },
    });
    console.log('PR', pr);
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, totalAmount, language]);

  const translations = {
    en: {
      savePaymentDetails: 'Save payment details',
      selectPaymentMethod: 'Select Payment Method',
    },
    esp: {
      savePaymentDetails: 'Guardar detalles de pago',
      selectPaymentMethod: 'Metodo de pago:',
    },
  };

  const t = translations[language === 'esp' ? 'esp' : 'en'];

  return (
    <Stack flexDirection="column" gap="16px">
      <Typography
        variant={!isMobile ? 'h3' : undefined}
        sx={{
          fontSize: isMobile ? '1.2rem' : undefined,
          fontWeight: isMobile ? 600 : undefined,
        }}
      >
        {t.selectPaymentMethod}
      </Typography>
      {defaultPaymentMethod ? (
        <ExistingPaymentMethod
          paymentMethod={defaultPaymentMethod}
          onError={onError}
        />
      ) : (
        <WhiteBox padding="24px">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  '::placeholder': {
                    color: '#1B1B1B',
                  },
                },
              },
            }}
          />
        </WhiteBox>
      )}

      {paymentRequest ? (
        <ApplePay
          amount={totalAmount}
          paymentRequest={paymentRequest}
          onSuccess={onSuccess}
          onError={onError}
        />
      ) : null}
    </Stack>
  );
};

export default PaymentMethods;

import { PaymentMethod } from '@/types/api/default-payment-method';
import { mapCardBrandToIcon } from '@/utils/mapCardBrandToIcon';
import CreditCartIcon from '@/components/shared/icons/CreditCardIcon';
import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface PatientPaymentMethodProps {
  paymentMethod: PaymentMethod;
}

const PatientPaymentMethod = ({ paymentMethod }: PatientPaymentMethodProps) => {
  const BrandIcon = useMemo(() => {
    if (paymentMethod.brand) {
      return mapCardBrandToIcon[paymentMethod.brand] || CreditCartIcon;
    }
    return CreditCartIcon;
  }, [paymentMethod.brand]);

  return (
    <Stack>
      <Stack direction="row" gap="12px" alignItems="center">
        <BrandIcon />
        <Typography>
          &#8226; &#8226; &#8226; &#8226; {paymentMethod.last4}
        </Typography>
      </Stack>
      <Typography>{`Expires ${paymentMethod.exp_month}/${paymentMethod.exp_year}`}</Typography>
    </Stack>
  );
};

export default PatientPaymentMethod;

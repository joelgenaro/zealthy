import { useLanguage, usePatientDefaultPayment } from '@/components/hooks/data';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PatientPaymentMethod from '../../PatientPaymentMethod';

interface PaymentMethodProps {
  onChange: () => void;
}

const PaymentMethod = ({ onChange }: PaymentMethodProps) => {
  const { data: paymentMethod } = usePatientDefaultPayment();
  const lang = useLanguage();

  let edit = 'Edit';
  let payment = 'Payment:';

  if (lang === 'esp') {
    edit = 'Editar';
    payment = 'Pago:';
  }

  return (
    <Stack direction="row" justifyContent="space-between" width="100%">
      <Stack direction="row" gap="8px" width="100%">
        <Typography
          width="75px"
          fontWeight={600}
          sx={{
            lineHeight: '24px !important',
          }}
        >
          {payment}
        </Typography>

        {paymentMethod ? (
          <PatientPaymentMethod paymentMethod={paymentMethod} />
        ) : (
          <Skeleton height={50} width="100%" />
        )}
      </Stack>
      <Link
        onClick={onChange}
        sx={{
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        {edit}
      </Link>
    </Stack>
  );
};

export default PaymentMethod;

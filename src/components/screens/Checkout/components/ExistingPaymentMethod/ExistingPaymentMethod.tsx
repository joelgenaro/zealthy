import { useLanguage } from '@/components/hooks/data';
import CreditCartIcon from '@/components/shared/icons/CreditCardIcon';
import LockIcon from '@/components/shared/icons/LockIcon';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import PatientPaymentMethod from '@/components/shared/PatientPaymentMethod';
import PaymentEditModal from '@/components/shared/PaymentEditModal';
import { PaymentMethod } from '@/types/api/default-payment-method';
import { useTheme } from '@mui/material';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';

interface ExistingPaymentMethodProps {
  paymentMethod: PaymentMethod;
  onError: (error: string) => void;
}

const ExistingPaymentMethod = ({
  paymentMethod,
  onError,
}: ExistingPaymentMethodProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    onError('');
    setOpen(false);
  }, [onError]);

  const lan = useLanguage();
  let edit = 'Edit';
  if (lan === 'esp') {
    edit = 'Editar';
  }

  return (
    <>
      <WhiteBox gap="16px" padding="16px 24px">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack gap="16px" direction="row" alignItems="center">
            <CreditCartIcon />
            <Typography>Credit or Debit Card</Typography>
          </Stack>
          <LockIcon />
        </Stack>
        <Divider
          sx={{
            margin: '0px -24px',
          }}
        />
        <Stack direction="row" justifyContent="space-between">
          <Stack gap="8px">
            <Typography color="#777">Saved Card</Typography>
            <PatientPaymentMethod paymentMethod={paymentMethod} />
          </Stack>
          <Link
            onClick={handleOpen}
            color={theme.palette.text.primary}
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {edit}
          </Link>
        </Stack>
      </WhiteBox>
      <PaymentEditModal
        open={open}
        title="Update your card to get your care or prescription"
        onClose={handleClose}
      />
    </>
  );
};

export default ExistingPaymentMethod;

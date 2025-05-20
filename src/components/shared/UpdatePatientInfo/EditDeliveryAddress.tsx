import { useLanguage, usePatient } from '@/components/hooks/data';
import { Button, Container, Stack, Typography } from '@mui/material';
import { DeliveryAddressForm } from '../DeliveryAddress';

interface DeliveryProps {
  goHome: () => void;
}
export function EditDeliveryAddress({ goHome }: DeliveryProps) {
  const { data: patient } = usePatient();
  const language = useLanguage();

  let tellUs = 'Tell us your preferred delivery address.';
  let back = 'Back';
  if (language === 'esp') {
    tellUs = 'Cual es tu direccion preferida para envios';
    back = 'Regresar';
  }

  return (
    <Container sx={{ maxWidth: '448px' }}>
      <Stack gap="24px">
        <Typography component="h2" variant="h2">
          {tellUs}
        </Typography>
        {patient ? (
          <DeliveryAddressForm onSuccess={goHome} patient={patient} />
        ) : null}
        <Button
          type="button"
          sx={{
            background: '#EEEEEE',
            color: '#1b1b1b',
            '&:hover': { background: '#CCCCCC' },
          }}
          onClick={goHome}
        >
          {back}
        </Button>
      </Stack>
    </Container>
  );
}

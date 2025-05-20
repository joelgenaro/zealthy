import { ChangeEvent, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  FormControl,
  InputLabel,
  FilledInput,
} from '@mui/material';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import axios from 'axios';
import CheckMarkCircleGreen from '../icons/CheckMarkCircleGreen';
import { useLanguage } from '@/components/hooks/data';

interface PaymentProps {
  patientId: number | undefined | null;
  stripeCustomerId: string | undefined | null;
  goHome: () => void;
}

export function UpdatePayment({
  patientId,
  stripeCustomerId,
  goHome,
}: PaymentProps) {
  const [page, setPage] = useState('edit-payment');
  const [loading, setLoading] = useState(false);
  const language = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    cvc: '',
    zipCode: '',
    expiration: '',
  });

  async function updatePayment() {
    if (
      !formData.name ||
      !formData.number ||
      !formData.cvc ||
      !formData.zipCode ||
      !formData.expiration
    )
      return alert('All fields must be filled out,');
    setLoading(true);
    const result = await axios
      .post(`/api/stripe/utils/customer/change-card`, {
        customerId: stripeCustomerId,
        patient_id: patientId,
        cardDetails: formData,
      })
      .then(() => {
        setLoading(false);
        setPage('success');
      })
      .catch(e => {
        setPage('failed');
        setLoading(false);
      });
  }
  const handleOnChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name!]: value,
    }));
  };

  let updatePaymentInfo = 'Update your payment information.';
  let nameLabel = 'Name';
  let cardNumberLabel = 'Card Number';
  let expirationLabel = 'MM/YY';
  let cvcLabel = 'CVC';
  let zipLabel = 'ZIP';
  let saveButton = 'Save';
  let backButton = 'Back';
  let successMessage = 'We updated your payment information!';
  let goHomeButton = 'Go back home';
  let errorTitle = "We're sorry!";
  let errorMessage =
    'Your new payment information seems to be invalid. To ensure you continue care at Zealthy, please try again or a different payment method.';
  let tryAgainButton = 'Try again';

  if (language === 'esp') {
    updatePaymentInfo = 'Actualizar información de pago';
    nameLabel = 'Nombre';
    cardNumberLabel = 'Número de tarjeta';
    expirationLabel = 'MM/AA';
    cvcLabel = 'CVC';
    zipLabel = 'Código postal';
    saveButton = 'Guardar';
    backButton = 'Volver';
    successMessage = '¡Hemos actualizado su información de pago!';
    goHomeButton = 'Volver al inicio';
    errorTitle = '¡Lo sentimos!';
    errorMessage =
      'Su nueva información de pago parece ser inválida. Para asegurar que continúe recibiendo atención en Zealthy, por favor intente nuevamente o use un método de pago diferente.';
    tryAgainButton = 'Intentar de nuevo';
  }

  return (
    <Container sx={{ maxWidth: '448px' }}>
      {page == 'edit-payment' && (
        <>
          <Typography component="h2" variant="h2" sx={{ marginBottom: '48px' }}>
            {updatePaymentInfo}
          </Typography>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '48px',
            }}
          >
            <FormControl variant="filled" fullWidth required>
              <InputLabel htmlFor="street-address">{nameLabel}</InputLabel>
              <FilledInput
                fullWidth
                disableUnderline={true}
                name="name"
                value={formData.name}
                id="name"
                onChange={handleOnChange}
                required
              />
            </FormControl>
            <FormControl variant="filled" fullWidth required>
              <InputLabel htmlFor="card-number">
                {language === 'esp' ? 'Numero de tarjeta' : 'Card Number'}
              </InputLabel>
              <FilledInput
                fullWidth
                disableUnderline={true}
                name="number"
                value={formData.number}
                id="card-number"
                onChange={handleOnChange}
                required
              />
            </FormControl>

            <Box
              sx={{
                display: 'flex',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              <FormControl variant="filled" fullWidth required>
                <InputLabel htmlFor="expiration">{expirationLabel}</InputLabel>
                <FilledInput
                  fullWidth
                  disableUnderline={true}
                  name="expiration"
                  value={formData.expiration}
                  id="expiration"
                  onChange={handleOnChange}
                  required
                />
              </FormControl>
              <FormControl variant="filled" fullWidth required>
                <InputLabel htmlFor="street-address">{cvcLabel}</InputLabel>
                <FilledInput
                  fullWidth
                  disableUnderline={true}
                  name="cvc"
                  value={formData.cvc}
                  id="cvc"
                  onChange={handleOnChange}
                  required
                />
              </FormControl>
              <FormControl variant="filled" fullWidth required>
                <InputLabel htmlFor="zip">{zipLabel}</InputLabel>
                <FilledInput
                  fullWidth
                  disableUnderline={true}
                  name="zipCode"
                  value={formData.zipCode}
                  id="zip"
                  onChange={handleOnChange}
                  required
                />
              </FormControl>
            </Box>
            <LoadingButton
              type="button"
              loading={loading}
              onClick={updatePayment}
            >
              {saveButton}
            </LoadingButton>
            <Button
              type="button"
              sx={{
                background: '#EEEEEE',
                color: '#1b1b1b',
                '&:hover': { background: '#CCCCCC' },
              }}
              onClick={goHome}
            >
              {backButton}
            </Button>
          </Box>
        </>
      )}
      {page === 'success' && (
        <>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ marginBottom: '14px' }}>
              <CheckMarkCircleGreen />
            </Box>
            <Typography
              component="h2"
              variant="h2"
              sx={{ marginBottom: '32px' }}
            >
              {successMessage}
            </Typography>
            <Button type="button" sx={{ width: '100%' }} onClick={goHome}>
              {goHomeButton}
            </Button>
          </Box>
        </>
      )}
      {page === 'failed' && (
        <>
          <Typography component="h2" variant="h2" sx={{ marginBottom: '16px' }}>
            {errorTitle}
          </Typography>
          <Typography
            component="p"
            variant="body1"
            sx={{ marginBottom: '48px' }}
          >
            {errorMessage}
          </Typography>
          <Button
            type="button"
            sx={{ width: '100%' }}
            onClick={() => setPage('edit-payment')}
          >
            {tryAgainButton}
          </Button>
        </>
      )}
    </Container>
  );
}

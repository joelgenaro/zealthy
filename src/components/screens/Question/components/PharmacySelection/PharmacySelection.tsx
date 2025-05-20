import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import PharmacySearchForm from '@/components/shared/PharmacySelectForm/PharmacySelectForm';
import getConfig from '../../../../../../config';

interface PharmacySelectionProps {
  nextPage: (page?: string) => void;
}

const PharmacySelection = ({ nextPage }: PharmacySelectionProps) => {
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();
  const language = useLanguage();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (specificCare && specificCare == 'Weight loss') {
      window.freshpaint?.track('weight-loss-post-checkout-pharmacy');
    }
  }, [specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-pharmacy');
  }, []);

  let choosePharmacy = 'Choose Pharmacy.';
  let afterComplete = `After you complete your visit, your ${siteName} provider may prescribe medication, if appropriate.`;
  let pleaseShareText =
    'Please share the most convenient place to pick up or receive your medication, in case delivery isn’t an option for you.';

  if (language === 'esp') {
    choosePharmacy = 'Escoje tu farmacia.';
    afterComplete = `Después de completar su consulta, su proveedor de ${siteName} puede recetarle medicamentos, si es apropiado.`;
    pleaseShareText =
      'Por favor, indique el lugar más conveniente para recoger o recibir su medicamento, en caso de que la entrega no sea una opción para usted.';
  }

  return (
    <Container maxWidth="sm">
      <Grid container direction="column" gap="48px">
        <Stack direction="column" gap="16px">
          <Typography variant="h2">{choosePharmacy}</Typography>
          <Typography>{afterComplete}</Typography>
          <Typography>{pleaseShareText}</Typography>
        </Stack>
        {patient ? (
          <PharmacySearchForm patientId={patient.id} onSuccess={nextPage} />
        ) : null}
      </Grid>
    </Container>
  );
};

export default PharmacySelection;

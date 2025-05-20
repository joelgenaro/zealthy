import {
  useLanguage,
  usePatient,
  useVWOVariationName,
} from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import Spinner from '@/components/shared/Loading/Spinner';
import { Container, Typography, Button } from '@mui/material';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import getConfig from '../../../../../../config';

interface WeightLossMedicalProps {
  nextPage: (nextPage?: string) => void;
}

const WeightLossPay = ({ nextPage }: WeightLossMedicalProps) => {
  const { data: patient } = usePatient();
  const { data: variant8288 } = useVWOVariationName('8288');
  const { variant } = useIntakeState();
  const [loading, setLoading] = useState(true);
  const language = useLanguage();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (patient?.id && !patient?.glp1_ineligible) {
      setLoading(false);
    } else {
      nextPage();
    }
  }, [patient]);

  let titleText =
    'We make GLP-1 medication affordable for you & ship to your door.';
  let insuranceSkipText1 = `As a ${siteName} Weight Loss member, you can get affordable out of pocket medications shipped to your door.`;
  let insuranceSkipText2 =
    'Medication prices may vary based on quantity and dosing.';
  let insuranceText1 = `Your ${siteName} care team will help you minimize out of pocket costs. This includes filing paperwork - like prior authorizations - with your insurance so that your insurance covers your medication.`;
  let insuranceText2 =
    'If a prior authorization is approved, your medication will cost as little as $0/month.';
  let insuranceText3 = `As a ${siteName} Weight Loss member, you can also get affordable out of pocket medications shipped to your door, which typically will make sense for those who would like to get started right away and may continue to make sense if your prior authorization is not approved.`;
  let insuranceText4 =
    'Medication prices may vary based on insurance coverage, quantity, and dosing.';
  let buttonText = 'Continue to specify requested medication';

  if (language === 'esp') {
    titleText =
      'Hacemos que la medicación GLP-1 sea asequible para usted y la enviamos a su puerta.';
    insuranceSkipText1 = `Como miembro de ${siteName} Weight Loss, puede obtener medicamentos asequibles sin cobertura enviados a su puerta.`;
    insuranceSkipText2 =
      'Los precios de los medicamentos pueden variar según la cantidad y la dosis.';
    insuranceText1 = `Su equipo de atención de ${siteName} le ayudará a minimizar los costos de bolsillo. Esto incluye presentar documentación, como autorizaciones previas, con su seguro para que su seguro cubra su medicamento.`;
    insuranceText2 =
      'Si se aprueba una autorización previa, su medicamento costará tan poco como $0/mes.';
    insuranceText3 = `Como miembro de ${siteName} Weight Loss, también puede obtener medicamentos asequibles sin cobertura enviados a su puerta, lo que típicamente tendrá sentido para aquellos que deseen comenzar de inmediato y puede seguir teniendo sentido si su autorización previa no es aprobada.`;
    insuranceText4 =
      'Los precios de los medicamentos pueden variar según la cobertura del seguro, la cantidad y la dosis.';
    buttonText = 'Continuar para especificar el medicamento solicitado';
  }

  return loading ? (
    <Spinner />
  ) : (
    <Container maxWidth="xs">
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        {titleText}
      </Typography>
      {patient?.insurance_skip &&
      variant8288?.variation_name !== 'Variation-1' ? (
        <>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {insuranceSkipText1}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {insuranceSkipText2}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {insuranceText1}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {insuranceText2}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {insuranceText3}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {insuranceText4}
          </Typography>
        </>
      )}

      <Button
        type="button"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={() => nextPage()}
      >
        {buttonText}
      </Button>
    </Container>
  );
};

export default WeightLossPay;

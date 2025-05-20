import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { Container, Typography, Button } from '@mui/material';

interface WeightLossMedicalProps {
  nextPage: (nextPage?: string) => void;
}

const WeightLossMedical = ({ nextPage }: WeightLossMedicalProps) => {
  const { potentialInsurance, variant } = useIntakeState();
  const { data: patient } = usePatient();
  const language = useLanguage();

  let title = "Next, you'll answer questions about your medical history.";
  let bundledMessage = (insurance: string | null) =>
    `This is important to complete because it will be used by your Zealthy medical provider to write your ${
      insurance?.split(' ')?.[0]
    } prescription, if medically appropriate.`;
  let timeEstimate = 'These questions will take about 5 minutes to answer.';
  let generalMessage =
    'This is important to complete because it will be used by your Zealthy medical provider to write your GLP-1 prescription, if medically appropriate.';
  let insuranceMessage =
    "If you have insurance, it will also allow us to help you get your medication covered by insurance, often reducing medication cost by up to $1000/month. If you don't have insurance, we also have affordable options for out of pocket patients.";
  let detailedTimeEstimate =
    'These questions will take about 5 minutes to answer. Please complete all questions in order for us to provide you with care, including GLP-1 medication if medically appropriate.';
  let continueButton = 'Continue';

  if (language === 'esp') {
    title = 'A continuación, responderá preguntas sobre su historial médico.';
    bundledMessage = insurance =>
      `Es importante completar esto porque será utilizado por su proveedor médico de Zealthy para escribir su receta de ${
        insurance?.split(' ')?.[0]
      }, si es médicamente apropiado.`;
    timeEstimate =
      'Estas preguntas tomarán alrededor de 5 minutos en responder.';
    generalMessage =
      'Es importante completar esto porque será utilizado por su proveedor médico de Zealthy para escribir su receta de GLP-1, si es médicamente apropiado.';
    insuranceMessage =
      'Si tiene seguro, también nos permitirá ayudarle a que su medicamento sea cubierto por el seguro, a menudo reduciendo el costo del medicamento hasta en $1000 al mes. Si no tiene seguro, también tenemos opciones asequibles para pacientes que pagan de su bolsillo.';
    detailedTimeEstimate =
      'Estas preguntas tomarán alrededor de 5 minutos en responder. Por favor, complete todas las preguntas para que podamos brindarle atención, incluida la medicación GLP-1 si es médicamente apropiada.';
    continueButton = 'Continuar';
  }

  return (
    <Container maxWidth="xs">
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        {title}
      </Typography>
      {['Semaglutide Bundled', 'Tirzepatide Bundled'].includes(
        potentialInsurance || ''
      ) ? (
        <>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {bundledMessage(potentialInsurance)}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {timeEstimate}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
            {generalMessage}
          </Typography>
          {patient?.insurance_skip || variant === '4935Var2NI' ? null : (
            <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
              {insuranceMessage}
            </Typography>
          )}
          <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
            {detailedTimeEstimate}
          </Typography>
        </>
      )}
      <Button
        type="button"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={() => nextPage()}
      >
        {continueButton}
      </Button>
    </Container>
  );
};

export default WeightLossMedical;

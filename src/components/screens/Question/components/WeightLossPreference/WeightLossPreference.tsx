import { useLanguage, usePatient } from '@/components/hooks/data';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import { Container, Typography, Button } from '@mui/material';
import { useMemo } from 'react';
import { useVWOVariationName } from '@/components/hooks/data';

interface WeightLossMedicalProps {
  nextPage: (nextPage?: string) => void;
}

const WeightLossPreference = ({ nextPage }: WeightLossMedicalProps) => {
  const { data: patient } = usePatient();
  const { data: variant8288 } = useVWOVariationName('8288');
  const answers = useAnswerState();
  const language = useLanguage();

  const hasDiabetes = useMemo(() => {
    const { answer } =
      answers['WEIGHT_L_Q7'] || answers['WEIGHT_L_POST_Q4'] || '';
    if (answer && isCodedAnswer(answer)) {
      return answer.some(a => a?.valueCoding?.display === 'Type 2 diabetes');
    }
    return false;
  }, [answers]);

  let almostDoneText =
    variant8288?.variation_name === 'Variation-1'
      ? 'You’re almost done!'
      : "You're almost done! Now that you have completed your medical intake, we'd like to better understand your Rx preferences.";
  let careTeamText =
    variant8288?.variation_name === 'Variation-1'
      ? ''
      : 'Your care team will find the best treatment for you.';
  let preferencesQuestionText =
    variant8288?.variation_name === 'Variation-1'
      ? ''
      : "To do so, we'll ask a few questions about your preferred medication";
  let continueButtonText = language === 'esp' ? 'Continuar' : 'Continue';

  if (language === 'esp') {
    almostDoneText =
      variant8288?.variation_name === 'Variation-1'
        ? '¡Ya casi terminas! Ahora que has completado tu ingreso médico, solo necesitas completar un paso más para que tu plan de tratamiento pueda ser revisado y creado por uno de nuestros proveedores médicos, si es clínicamente apropiado.'
        : '¡Ya casi terminas! Ahora que has completado tu ingreso médico, nos gustaría entender mejor tus preferencias de medicamentos recetados.';
    careTeamText =
      variant8288?.variation_name === 'Variation-1'
        ? ''
        : 'Tu equipo de atención encontrará el mejor tratamiento para ti.';
    preferencesQuestionText =
      variant8288?.variation_name === 'Variation-1'
        ? ''
        : 'Para ello, te haremos algunas preguntas sobre tu medicamento preferido.';
  }

  return (
    <Container maxWidth="xs">
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        {almostDoneText}
      </Typography>
      {variant8288?.variation_name === 'Variation-1' && (
        <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
          Now that you have completed your medical intake, you just need to
          complete one more step before your treatment plan can be reviewed and
          created by one of our medical providers, if clinically appropriate.
        </Typography>
      )}
      <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
        {patient?.glp1_ineligible
          ? ''
          : `${
              language === 'esp'
                ? 'Hay varios medicamentos GLP-1.'
                : 'There are a number of GLP-1 medications.'
            } ${
              variant8288?.variation_name === 'Variation-1'
                ? language === 'esp'
                  ? 'Wegovy es a menudo la mejor opción para personas como tú, ya que está aprobado por la FDA para el control del peso, y muchos optan por comenzar con semaglutida primero mientras esperan la aprobación del seguro de Wegovy.'
                  : 'Wegovy is often the best option for people like you since it is FDA-approved for weight management, and many will choose to start with semaglutide first while they wait for insurance approval of Wegovy.'
                : hasDiabetes
                ? language === 'esp'
                  ? 'Es posible que hayas oído hablar de Mounjaro, que suele ser la mejor opción para una pérdida de peso duradera para personas como tú que han sido diagnosticadas con diabetes tipo 2.'
                  : 'You may have heard of Mounjaro, which is often the best option for lasting weight loss for people like you who have been diagnosed with Type 2 diabetes'
                : language === 'esp'
                ? 'Es posible que hayas oído hablar de Wegovy y Zepbound, y semaglutida y tirzepatide compuestas, que suelen ser las mejores opciones para una pérdida de peso duradera para personas como tú. Todos nuestros medicamentos provienen de socios registrados por la FDA.'
                : 'You may have heard of Wegovy and Zepbound, and compounded semaglutide and tirzepatide, which are often the best options for lasting weight loss for people like you. All of our medications are sourced from FDA-registered partners.'
            }`}
      </Typography>
      {careTeamText && (
        <Typography variant="body1" sx={{ marginBottom: '1rem' }}>
          {careTeamText}
        </Typography>
      )}
      {preferencesQuestionText && (
        <Typography variant="body1" sx={{ marginBottom: '3rem' }}>
          {preferencesQuestionText}
        </Typography>
      )}
      <Button
        type="button"
        fullWidth
        sx={{
          marginBottom: '1rem',
          marginTop:
            variant8288?.variation_name === 'Variation-1' ? '1rem' : '0',
        }}
        onClick={() => nextPage()}
      >
        {continueButtonText}
      </Button>
    </Container>
  );
};

export default WeightLossPreference;

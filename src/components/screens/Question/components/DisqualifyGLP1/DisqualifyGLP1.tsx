import { useLanguage } from '@/components/hooks/data';
import { useUpdatePatient } from '@/components/hooks/mutations';
import { Container, Typography, Button } from '@mui/material';
import { useCallback } from 'react';

interface Props {
  nextPage: (nextPage?: string) => void;
}

const DisqualifyGLP1 = ({ nextPage }: Props) => {
  const updatePatient = useUpdatePatient();
  const language = useLanguage();

  const handleNext = useCallback(async () => {
    nextPage();
  }, [updatePatient]);

  return (
    <Container maxWidth="xs">
      <Typography variant="h2" mb="1rem">
        {language === 'esp'
          ? 'Los GLP-1 pueden no ser adecuados para usted.'
          : 'GLP-1s may not be right for you.'}
      </Typography>
      <Typography variant="body1" mb="1rem">
        {language === 'esp'
          ? 'No será elegible para medicamentos GLP-1 según su respuesta.'
          : 'You won’t be eligible for GLP-1 medications based on your response.'}
      </Typography>
      <Typography variant="body1" mb="1rem">
        {language === 'esp'
          ? 'Queremos informarle ahora, ya que sabemos que muchos miembros de Zealthy están interesados en comenzar el tratamiento con GLP-1.'
          : 'We want to let you know now since we know many Zealthy weight loss members are looking to start GLP-1 treatment.'}
      </Typography>

      <Typography variant="body1" mb="1rem">
        {language === 'esp'
          ? 'Zealthy ofrece otras opciones para la pérdida de peso, como metformina y coaching, que podrían ser adecuadas para usted.'
          : 'Zealthy does offer other weight loss options, such as metformin and coaching, that you may be eligible for.'}
      </Typography>

      <Typography variant="body1" mb="3rem">
        {language === 'esp'
          ? 'Si decide continuar a continuación, debe hacerlo reconociendo que entiende que lo más probable es que un proveedor médico determine que no es candidato para medicamentos GLP-1 específicamente según su respuesta anterior.'
          : 'If you choose to continue below, you must do so acknowledging that you understand that you most likely will be determined by a medical provider to not be a candidate for GLP-1 medication specifically based on your previous response.'}
      </Typography>
      <Button fullWidth onClick={handleNext}>
        {language === 'esp' ? 'Entiendo' : 'I understand'}
      </Button>
    </Container>
  );
};

export default DisqualifyGLP1;

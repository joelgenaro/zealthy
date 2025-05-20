import { useLanguage } from '@/components/hooks/data';
import Typography from '@mui/material/Typography';

const BMIDisqualify = () => {
  const lan = useLanguage();

  let message =
    'Your BMI does not meet the requirements to be eligible for GLP-1 medications.';

  if (lan === 'esp') {
    message =
      'Su IMC no cumple con los requisitos para ser elegible para medicamentos GLP-1.';
  }

  return (
    <>
      <Typography>{message}</Typography>
    </>
  );
};

export default BMIDisqualify;

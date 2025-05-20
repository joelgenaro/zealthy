import { useLanguage } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePatientState } from '@/components/hooks/usePatient';
import { percentage } from '@/utils/percentage';
import Typography from '@mui/material/Typography';
import getConfig from '../../../../../../../../config';

const WeightLossDescription = () => {
  const { weight } = usePatientState();
  const { potentialInsurance } = useIntakeState();
  const lossPrediction = percentage(20, weight!);
  const language = useLanguage();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  /// APPLY LBS TO KG CONVERSION RATES

  return ['Semaglutide Bundled', 'Tirzepatide Bundled'].includes(
    potentialInsurance || ''
  ) ? (
    language === 'esp' ? (
      <Typography>
        {`Cada persona reacciona de manera diferente, pero el programa de pérdida de peso de ${siteName} predice que perderás alrededor de ${
          potentialInsurance === 'Tirzepatide Bundled' ? '20%' : '15%'
        } de tu peso.*`}
      </Typography>
    ) : (
      <Typography>
        {`Everyone reacts differently, but ${siteName}’s weight loss program predicts
    you’ll lose ${
      potentialInsurance === 'Tirzepatide Bundled' ? '20%' : '15%'
    } of your body weight.*`}
      </Typography>
    )
  ) : language === 'esp' ? (
    <Typography>
      Cada persona reacciona de manera diferente, pero el programa de pérdida de
      peso de {siteName} predice que perderás alrededor de {lossPrediction}{' '}
      libras para alcanzar un peso de {weight! - lossPrediction} lbs.
    </Typography>
  ) : (
    <Typography>
      Everyone reacts differently, but {siteName}’s weight loss program predicts
      you’ll lose about {lossPrediction} lbs to achieve a weight of{' '}
      {weight! - lossPrediction} lbs.
    </Typography>
  );
};

export default WeightLossDescription;

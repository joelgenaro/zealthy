import React, { useCallback, useEffect } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import Lottie from 'react-lottie';
import animationData from 'public/lottie/waiting.json';
import animationDataZplan from 'public/lottie/waiting-zplan.json';
import { Container, useTheme } from '@mui/system';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePatient } from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';
import CheckMark from '@/components/shared/icons/CheckMark';
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { QuestionWithName } from '@/types/questionnaire';
import { useVWO } from '@/context/VWOContext';
import { useLanguage } from '@/components/hooks/data';
import getConfig from '../../../../../../config';

function generateDataPoints(min: number, max: number, xValues: number[]) {
  const dataPoints = [];
  const range = max - min;
  const n = xValues.length;

  for (let i = 0; i < n; i++) {
    const progress = i / (n - 1);
    const scaledValue = Math.sin((progress * Math.PI) / 2) * range;

    const dataPoint = Math.round(max - scaledValue);

    dataPoints.push({ weight: dataPoint, week: xValues[i] });
  }

  return dataPoints;
}

const controlWeeks = [0, 4, 8, 12, 16, 20, 28, 36, 44, 52];
const variantWeeks = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36];

interface AnalyzeWeightLossResultsProps {
  onNext: (page?: string) => void;
  question: QuestionWithName;
}

const AnalyzeWeightLossResults = ({
  onNext,
  question,
}: AnalyzeWeightLossResultsProps) => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const theme = useTheme();

  const { data: patient } = usePatient();
  const { potentialInsurance } = useIntakeState();
  const { weight } = usePatientState();

  const variant3314 = true;
  const weeks = variant3314 ? variantWeeks : controlWeeks;

  const [loading, setLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [poundsLost, setPoundsLost] = React.useState(0);
  const [newWeight, setNewWeight] = React.useState(0);
  const [dataPoints, setDataPoints] = React.useState<any>([]);
  const vwoClient = useVWO();
  const language = useLanguage();

  const onContinue = useCallback(() => {
    if (question.next && onNext) {
      onNext();
      return;
    }
    /// whenever we're about to call to router.push, we will look if the language object is 'en' (since this is the default),
    /// which if true will take the user to the default json file. Otherwise, we will simply add the language code (keep this naming convention) and continue on that language
    potentialInsurance === 'Weight Loss Sync'
      ? language !== 'en'
        ? Router.push(
            `/questionnaires-v2/weight-loss-coaching-${language}/WEIGHT-PROVIDER_SCHEDULE`
          )
        : Router.push(
            `/questionnaires-v2/weight-loss-coaching/WEIGHT-PROVIDER_SCHEDULE`
          )
      : Router.replace(Pathnames.WHAT_NEXT);
  }, []);

  useEffect(() => {
    if (weight) {
      let newWeight;

      if (
        variant3314 ||
        potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
      ) {
        newWeight = Math.floor(weight * 0.8);
      } else {
        newWeight = Math.floor(weight * 0.85);
      }
      const poundsLost = weight - newWeight;
      const dataPoints = generateDataPoints(newWeight, weight, weeks);
      setPoundsLost(poundsLost);
      setNewWeight(newWeight);
      setDataPoints(dataPoints);
    }
  }, [weight, potentialInsurance, variant3314, weeks]);

  useEffect(() => {
    const resultsAnalyzed = sessionStorage.getItem('wl-results-analyzed');
    if (resultsAnalyzed === 'true') {
      setLoading(false);
      setAnalyzing(false);
      return;
    } else {
      setLoading(false);
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        sessionStorage.setItem('wl-results-analyzed', 'true');
      }, 4000);
    }
  }, []);

  if (loading) return null;

  let continueText = 'Continue';
  let lbsLabel = 'Weight (lbs)';
  let weeksLabel = 'Weeks';
  let estimatedWeightLabel = 'Your estimated new weight: ';
  let totalPoundsLabel = 'Total pounds lost:';
  let restrictiveEatingLabel = 'No need for restrictive dieting';
  let congratulations = 'Congratulations';
  let analysing = 'Analyzing your results...';
  let checkingEligibility = `This will take a few seconds as we confirm your eligibility for the ${siteName} Weight Loss Program.`;

  if (language === 'esp') {
    continueText = 'Continuar';
    lbsLabel = 'Peso (libras)';
    weeksLabel = 'Semanas';
    estimatedWeightLabel = 'Su peso nuevo estimado:';
    totalPoundsLabel = 'Total de libras perdidas:';
    restrictiveEatingLabel = 'No requiere dietas restrictivas';
    congratulations = '¡Felicidades';
    analysing = 'Analyzando sus resultados';
    checkingEligibility = `Esto tomará unos segundos mientras confirmamos su elegibilidad para el Programa de Pérdida de Peso ${siteName}.`;
  }

  return (
    <Container>
      {analyzing ? (
        <Stack gap={3} alignItems="center" textAlign="center">
          <Typography>{analysing}</Typography>
          <Lottie
            height={150}
            width={150}
            options={{
              loop: true,
              autoplay: true,
              animationData:
                siteName === 'Zealthy' || siteName === 'FitRx'
                  ? animationData
                  : animationDataZplan,
            }}
          />
          <Typography maxWidth="225px">{checkingEligibility}</Typography>
        </Stack>
      ) : (
        <Stack gap={3} alignItems="center">
          <Typography variant="h2" alignSelf="flex-start">
            {congratulations}, {patient?.profiles.first_name}!
          </Typography>
          <Typography>
            {language === 'esp'
              ? `¡Has calificado para el programa de pérdida de peso con receta de ${siteName}! Esto es lo que puedes esperar con el programa de pérdida de peso de ${siteName}!`
              : potentialInsurance ===
                PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
              ? `You’ve qualified for the prescription Tirzepatide + doctor Program! Here’s what to expect with the Tirzepatide program at ${siteName}.`
              : potentialInsurance ===
                PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
              ? `You’ve qualified for the prescription Semaglutide + Doctor Program! Here’s what to expect with the Semaglutide program at ${siteName}.`
              : `You’ve qualified for the prescription ${siteName} Weight Loss Program! Here’s what to expect with the weight loss program at ${siteName}.`}
          </Typography>
          <Box
            sx={{
              backgroundColor: 'white',
              padding: '15px',
              width: '100%',
              maxWidth: '300px',
              borderRadius: '15px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Stack
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <Stack direction="row" alignItems="center" gap="5px">
                <CheckMark stroke="#005315" style={{ scale: '0.7' }} />{' '}
                <Typography>
                  {estimatedWeightLabel}
                  <b>{newWeight}*</b>
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="5px">
                <CheckMark stroke="#005315" style={{ scale: '0.7' }} />{' '}
                <Typography>
                  {totalPoundsLabel} <b>{poundsLost}*</b>
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="5px">
                <CheckMark stroke="#005315" style={{ scale: '0.7' }} />{' '}
                <Typography>{restrictiveEatingLabel}</Typography>
              </Stack>
            </Stack>
          </Box>
          <ResponsiveContainer width="110%" height={300}>
            <LineChart
              data={dataPoints}
              margin={{ top: 5, right: 30, left: 20, bottom: 15 }}
            >
              <Line
                type="monotone"
                dataKey="weight"
                stroke={theme.palette.primary.main}
                xAxisId="week"
                yAxisId="weight"
                isAnimationActive={true}
                animationDuration={2000}
                animationBegin={500}
              />
              <XAxis
                dataKey="week"
                type="number"
                xAxisId="week"
                domain={['dataMin', 'dataMax']}
                ticks={weeks}
              >
                <Label
                  value={weeksLabel}
                  position="insideBottom"
                  offset={-10}
                  style={{ textAnchor: 'middle' }}
                />
              </XAxis>
              <YAxis
                dataKey="weight"
                type="number"
                yAxisId="weight"
                domain={[Math.floor(newWeight * 0.96), weight || 250]}
                tickCount={10}
              >
                <Label
                  angle={-90}
                  value={lbsLabel}
                  position="insideLeft"
                  style={{ textAnchor: 'middle' }}
                />
              </YAxis>
            </LineChart>
          </ResponsiveContainer>
          <Typography variant="h4">
            {potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
              ? `*This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity”. Treatment was given in addition to diet and exercise.`
              : potentialInsurance ===
                PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
              ? '*This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”'
              : language === 'esp'
              ? '*Esta estimación se deriva de los resultados del ensayo clínico SURMOUNT-4 de Eli Lilly, que mostró una pérdida de peso promedio del 20% durante 36 semanas entre las personas que utilizaron una dosis máxima tolerada de 10 mg o 15 mg una vez por semana. La dosis inicial de 2.5 mg de Zepbound se incrementó en 2.5 mg cada cuatro semanas hasta que se alcanzó la dosis máxima tolerada. El tratamiento se administró además de la dieta y el ejercicio.'
              : variant3314
              ? `*This estimate derives from Eli Lilly’s SURMOUNT-4 clinical trial
              results which showed 20% average weight loss over 36 weeks among people
              utilized a maximum tolerated dose of 10 mg or 15 mg once-weekly. The
              starting dose of 2.5 mg Zepbound was increased by 2.5 mg every four weeks
              until maximum tolerated dose was achieved. Treatment was given in addition
              to diet and exercise.`
              : `*This estimate derives from the New England Journal of Medicine’s
              data on patients treated with semaglutide once a week. Patients
              received a 2.4 mg dose and made lifestyle changes for 68 weeks.`}
          </Typography>
          <Button fullWidth onClick={onContinue}>
            {continueText}
          </Button>
        </Stack>
      )}
    </Container>
  );
};

export default AnalyzeWeightLossResults;

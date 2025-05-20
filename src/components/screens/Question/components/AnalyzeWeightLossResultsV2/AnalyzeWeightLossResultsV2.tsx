import React, { useCallback, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Container } from '@mui/system';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';
import { QuestionWithName } from '@/types/questionnaire';
import ArrowDown from '@/components/shared/icons/ArrowDown';

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

interface AnalyzeWeightLossResultsV2Props {
  onNext: (page?: string) => void;
  question: QuestionWithName;
}

const AnalyzeWeightLossResultsV2 = ({
  onNext,
  question,
}: AnalyzeWeightLossResultsV2Props) => {
  const { data: patient } = usePatient();
  const { potentialInsurance } = useIntakeState();

  const weightFromStorage = JSON.parse(
    sessionStorage.getItem('patientWeight') || '0'
  );
  const heightFromStorage = JSON.parse(
    sessionStorage.getItem('patientHeight') || '0'
  );
  const bmiFromStorage = JSON.parse(
    sessionStorage.getItem('patientBMI') || '0'
  );

  const [loading, setLoading] = React.useState(true);
  const [analyzing, setAnalyzing] = React.useState(false);

  // Default state initialized with values from sessionStorage
  const [poundsLost, setPoundsLost] = React.useState(() => {
    const weight = weightFromStorage;
    const newWeight = Math.floor(weight * 0.8);
    return weight - newWeight;
  });

  const [newWeight, setNewWeight] = React.useState(() => {
    const weight = weightFromStorage;
    return Math.floor(weight * 0.8);
  });

  const [dataPoints, setDataPoints] = React.useState<any>(() => {
    const weight = weightFromStorage;
    const newWeight = Math.floor(weight * 0.8);
    const weeks = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36];
    return generateDataPoints(newWeight, weight, weeks);
  });

  const language = useLanguage();

  const today = new Date();
  const futureDate = new Date(today.getTime() + 252 * 24 * 60 * 60 * 1000);
  const formattedFutureDate = futureDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const onContinue = useCallback(() => {
    if (question.next && onNext) {
      onNext();
      return;
    }

    potentialInsurance === 'Weight Loss Sync'
      ? language !== 'en'
        ? Router.push(
            `/questionnaires-v2/weight-loss-coaching-${language}/WEIGHT-PROVIDER_SCHEDULE`
          )
        : Router.push(
            `/questionnaires-v2/weight-loss-coaching/WEIGHT-PROVIDER_SCHEDULE`
          )
      : Router.replace(Pathnames.WHAT_NEXT);
  }, [potentialInsurance, language, question.next, onNext]);

  // Update state when patientWeight changes
  useEffect(() => {
    const weight = JSON.parse(sessionStorage.getItem('patientWeight') || '0');
    if (weight) {
      const calculatedNewWeight = Math.floor(weight * 0.8);
      const poundsDifference = weight - calculatedNewWeight;

      const chartDataPoints = generateDataPoints(
        calculatedNewWeight,
        weight,
        [0, 4, 8, 12, 16, 20, 24, 28, 32, 36]
      );

      setPoundsLost(poundsDifference);
      setNewWeight(calculatedNewWeight);
      setDataPoints(chartDataPoints);
    }
  }, []);

  useEffect(() => {
    const resultsAnalyzed = sessionStorage.getItem('wl-results-analyzed');
    if (resultsAnalyzed === 'true') {
      setLoading(false);
      setAnalyzing(false);
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

  return (
    <Container>
      <Stack alignItems="start">
        <Box style={{ paddingLeft: 85 }}>
          <Typography variant="h4" alignSelf="center" marginBottom="10px">
            *Your weight
          </Typography>
          <Box
            sx={{
              maxWidth: '300px',
              marginBottom: 5,
            }}
          >
            <Stack
              sx={{
                alignItems: 'start',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <Stack direction="row" alignItems="center" gap="5px">
                <Typography
                  variant="h1"
                  style={{
                    fontSize: '72px',
                    marginBottom: '10px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {newWeight} lbs
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="5px">
                <ArrowDown height={40} width={40} />{' '}
                <Typography
                  variant="h2"
                  style={{ fontSize: '40px' }}
                  color="#005315"
                >
                  {poundsLost} lbs
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={dataPoints}
            margin={{ top: 5, right: 30, left: 20, bottom: 15 }}
          >
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#005315"
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
              ticks={[0, 4, 8, 12, 16, 20, 24, 28, 32, 36]}
            >
              <Label
                value="Weeks"
                position="insideBottom"
                offset={-10}
                style={{ textAnchor: 'middle' }}
              />
            </XAxis>
            <YAxis
              dataKey="weight"
              type="number"
              yAxisId="weight"
              domain={[Math.floor(newWeight * 0.96), weightFromStorage || 250]}
              tickCount={10}
            >
              <Label
                angle={-90}
                value="Weight (lbs)"
                position="insideLeft"
                style={{ textAnchor: 'middle' }}
              />
            </YAxis>
            <ReferenceLine
              yAxisId="weight"
              xAxisId="week"
              x={36}
              label={{
                position: 'top',
                value: formattedFutureDate,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Stack>
    </Container>
  );
};

export default AnalyzeWeightLossResultsV2;

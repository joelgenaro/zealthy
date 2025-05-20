import { QuestionWithName } from '@/types/questionnaire';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {
  Area,
  AreaChart,
  Label,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { usePatientState } from '@/components/hooks/usePatient';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';

interface WeightGoalProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const WeightGraph = ({ question, nextPage }: WeightGoalProps) => {
  const { weight } = usePatientState();
  const { potentialInsurance } = useIntakeState();
  const isMobile = useIsMobile();
  const dataPoints = [
    { month: 'Month 1', dietExercise: 100, zealthy: 100 },
    { month: 'Month 8', dietExercise: 80, zealthy: 40 },
    { month: 'Month 12', dietExercise: 75, zealthy: 20 },
  ];

  const header =
    potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED ? (
      <>
        Lose{' '}
        <span style={{ color: '#00531B' }}>5x as much weight with GLP-1s</span>{' '}
        (like Semaglutide) 🤩🎊
      </>
    ) : (
      <>
        {' '}
        Lose{' '}
        <span style={{ color: '#00531B' }}>
          5x as much weight with GLP-1s
        </span>{' '}
        (like Wegovy, Zepbound, or Ozempic) 🤩🎊
      </>
    );

  return (
    <Stack gap={3}>
      <Typography
        variant="h2"
        width={isMobile ? 'fit-content' : '727px'}
        sx={{ alignSelf: 'center' }}
      >
        {header}
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={dataPoints}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <defs>
            <linearGradient id="colorDietExercise" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2CA02C" stopOpacity={1} />
              <stop offset="95%" stopColor="#2CA02C" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="colorZealthy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2CA02C" stopOpacity={1} />
              <stop offset="95%" stopColor="#2CA02C" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis dataKey="month" hide></XAxis>
          <YAxis hide>
            <Label
              value="Your Weight"
              position="insideLeft"
              style={{ textAnchor: 'middle' }}
            />
          </YAxis>
          <Area
            type="monotone"
            dataKey="zealthy"
            stroke="#2CA02C"
            fillOpacity={1}
            fill="url(#colorZealthy)"
            strokeWidth={3}
          />
          <Area
            type="monotone"
            dataKey="dietExercise"
            stroke="#2CA02C"
            fillOpacity={0}
            strokeWidth={3}
          />
          <ReferenceDot x="Month 12" y={75} r={6} fill="#2CA02C" />
          <ReferenceDot x="Month 12" y={20} r={6} fill="#2CA02C" />
          <text x="75%" y="13%" textAnchor="middle" fontSize={16}>
            DIET & EXERCISE ALONE
          </text>

          <text
            x="85%"
            y="60%"
            textAnchor="middle"
            fill="#2CA02C"
            fontSize={16}
            fontWeight="bold"
          >
            ZEALTHY
          </text>
          <text
            x="12%"
            y="81%"
            textAnchor="middle"
            fill="#2CA02C"
            fontSize={16}
            fontWeight="bold"
          >
            Month 1
          </text>
          <text
            x="85%"
            y="80%"
            textAnchor="middle"
            fill="#2CA02C"
            fontSize={16}
            fontWeight="bold"
          >
            Month 12
          </text>
          <text
            x="50%"
            y="95%"
            textAnchor="middle"
            fill="#000"
            fontSize={12}
            fontStyle="italic"
          >
            *According to the New England Journal of Medicine
          </text>
        </AreaChart>
      </ResponsiveContainer>
    </Stack>
  );
};

export default WeightGraph;

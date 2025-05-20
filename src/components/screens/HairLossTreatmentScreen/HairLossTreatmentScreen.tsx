import { Pathnames } from '@/types/pathnames';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import { useCallback, useMemo } from 'react';
import HowDoesItWork from './components/HowDoesItWork';
import RecommendedTreatment from './components/RecommendedTreatment';
import CustomizeYourPlan from './components/CustomizeYourPlan';
import Rating from './components/Rating';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';

const HairLossTreatmentScreen = () => {
  const medication = useVisitSelect(v =>
    v.medications.find(m => m.type === MedicationType.HAIR_LOSS)
  );
  const answer = useAnswerSelect(a => a['HAIR_L_Q3']?.answer) as CodedAnswer[];

  const handleTreatment = useCallback(() => {
    if (medication?.name === 'Topical Finasteride and Minoxidil Gel') {
      Router.push(Pathnames.HAIR_LOSS_REGION);
    } else {
      Router.push(Pathnames.HAIR_LOSS_TREATMENT_FREQUENCY);
    }
  }, [medication?.name]);

  const comboName = useMemo(() => {
    if (answer?.[0]?.valueCoding.display === 'Pills (oral)') {
      return 'Oral Minoxidil and Oral Finasteride';
    } else {
      return 'Oral Finasteride and Minoxidil Foam';
    }
  }, [answer]);

  return (
    <Stack gap="40px">
      <Typography variant="h2" textAlign="center">
        Here’s your custom plan
      </Typography>
      <RecommendedTreatment
        handleTreatment={handleTreatment}
        comboName={comboName}
      />
      <CustomizeYourPlan
        handleTreatment={handleTreatment}
        comboName={comboName}
      />
      <Divider>
        <Typography
          variant="h2"
          sx={{
            whiteSpace: 'pre',
          }}
        >
          {'Get healthier and thicker\nhair with Zealthy'}
        </Typography>
      </Divider>
      <Rating />
      <HowDoesItWork />
    </Stack>
  );
};

export default HairLossTreatmentScreen;

import { useLanguage, usePatient } from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import { Box, Button } from '@mui/material';
import Router from 'next/router';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions } from '@/components/hooks/useIntake';
import ChoiceItem from '@/components/shared/ChoiceItem';
interface AddWeighLossCoachingProps {
  onNext: () => void;
}

const WeightLossEligible = ({ onNext }: AddWeighLossCoachingProps) => {
  const [selected, setSelected] = useState('');
  const { data: patient } = usePatient();
  const { addPotentialInsurance } = useIntakeActions();
  const language = useLanguage();
  let router: any;

  const handleContinue = useCallback(() => {
    if (selected === '') {
      return toast.error('Must select an answer to continue');
    }
    if (selected === 'Medicare' && patient?.region === 'FL') {
      addPotentialInsurance(PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA);

      language !== 'en'
        ? (router = Router.push(
            `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching-${language}/WEIGHT-COACHING-Q4`
          ))
        : (router = Router.push(
            `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching/WEIGHT-COACHING-Q4`
          ));
      return router;
    }
    language !== 'en'
      ? Router.push(
          `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching-${language}/WEIGHT-COACHING-INELIGIBLE`
        )
      : Router.push(
          `${Pathnames.QUESTIONNAIRES}/weight-loss-coaching/WEIGHT-COACHING-INELIGIBLE`
        );
  }, [onNext, selected, language]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ChoiceItem
          item={{ text: 'Medicare' }}
          selected={selected === 'Medicare'}
          handleItem={() => setSelected('Medicare')}
        />
        <ChoiceItem
          item={{ text: 'Medicaid' }}
          selected={selected === 'Medicaid'}
          handleItem={() => setSelected('Medicaid')}
        />
        <ChoiceItem
          item={{ text: 'Tricare' }}
          selected={selected === 'Tricare'}
          handleItem={() => setSelected('Tricare')}
        />
        <ChoiceItem
          item={{ text: 'Other' }}
          selected={selected === 'Other'}
          handleItem={() => setSelected('Other')}
        />
      </Box>
      <Button onClick={handleContinue}>Continue</Button>
    </>
  );
};

export default WeightLossEligible;

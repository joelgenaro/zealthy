import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { ED_MAPPING } from '@/constants/ed-mapping';
import { MedicationName } from '@/constants/ed-mapping/types';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { getKeys } from '@/utils/getKeys';
import { Button, Container, Stack, Typography } from '@mui/material';
import { useCallback, useMemo } from 'react';
import RadioOptionList from '../../Question/components/RadioOptionList';

type Option = {
  label: string;
  options: {
    label: string;
    value: string;
  }[];
};

const optionsByMedication = (
  medicationName: MedicationName,
  fontSize: string
): Option[] => {
  const keys = getKeys(ED_MAPPING[medicationName]);
  const recommended = keys.filter(
    key => ED_MAPPING[medicationName][key].recommended
  );
  const others = keys.filter(
    key => !ED_MAPPING[medicationName][key].recommended
  );

  return [
    {
      label: 'Recommended dosage',
      options: recommended.map(key => ({
        label: `<span style="font-size: ${fontSize}">${key}</span><span style="font-size: ${fontSize}">as low as $${ED_MAPPING[
          medicationName
        ][key].price.toFixed(2)}/dose</span>`,
        value: key as string,
      })),
    },
    {
      label: 'Other dosages',
      options: others.map(key => ({
        label: `<span style="font-size: ${fontSize}">${key}</span><span style="font-size: ${fontSize}">as low as $${ED_MAPPING[
          medicationName
        ][key].price.toFixed(2)}/dose</span>`,
        value: key as string,
      })),
    },
  ];
};

interface EDDosageProps {
  setPage: (page: string) => void;
}

const EDDosage = ({ setPage }: EDDosageProps) => {
  const isMobile = useIsMobile();
  const { updateMedication } = useVisitActions();
  const medication = useVisitSelect(visit =>
    visit.medications.find(m => m.type === MedicationType.ED)
  );

  if (!medication) {
    throw new Error('No medication was selected');
  }

  const { name, dosage } = medication;

  const options = useMemo(() => {
    return optionsByMedication(
      name as MedicationName,
      isMobile ? '14px' : '16px'
    );
  }, [isMobile, name]);

  const handleDosage = useCallback(
    (dosage: string) => {
      updateMedication({
        type: MedicationType.ED,
        update: { dosage },
      });
    },
    [updateMedication]
  );

  const changeFrequency = () => setPage('change-frequency');

  const isSelected = useCallback((value: string) => dosage === value, [dosage]);

  return (
    <Container maxWidth="sm">
      <Stack gap="24px">
        <Typography variant="h2">{`Select your preferred dosage strength for ${name}`}</Typography>
        <RadioOptionList
          isSelected={isSelected}
          groups={options}
          onSelect={handleDosage}
        />
        <Button onClick={changeFrequency}>Continue</Button>
      </Stack>
    </Container>
  );
};

export default EDDosage;

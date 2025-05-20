import Image from 'next/image';
import { Combination } from '@/constants/hairLossMedicationMapping';
import { OptionProps } from '../types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface UnselectedOptionProps extends OptionProps {
  addMedication: (med: Combination) => void;
}

const UnselectedOption = ({
  medication,
  addMedication,
}: UnselectedOptionProps) => {
  const onClick = () => addMedication(medication);

  return (
    <Stack
      border="1px solid #808080"
      borderRadius="6px"
      width="306px"
      bgcolor="#F1F0EA"
    >
      <Stack
        alignItems="center"
        bgcolor="#F1F0EA"
        padding="18px 24px"
        justifyContent="center"
        flexBasis="100%"
        gap="16px"
      >
        <Typography fontWeight={600}>{medication.displayName}</Typography>
        <Image
          src={medication.images[0]}
          alt="zealthy bottle"
          style={{
            height: medication.height[0],
            width: 'fit-content',
          }}
        />
        <Button variant="text" onClick={onClick}>
          Undo
        </Button>
      </Stack>
    </Stack>
  );
};

export default UnselectedOption;

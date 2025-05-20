import Image from 'next/image';
import StrikethroughText from '@/components/shared/StrikethroughText';
import { Combination } from '@/constants/hairLossMedicationMapping';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { OptionProps } from '../types';
import BigCheckBox from './BigCheckMark';

interface SelectedOptionProps extends OptionProps {
  removeMedication: (med: Combination) => void;
}

const SelectedOption = ({
  medication,
  removeMedication,
}: SelectedOptionProps) => {
  const onClick = () => removeMedication(medication);
  const { Icon } = medication;

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <Stack border="1px solid #808080" borderRadius="6px" width="306px">
        <Stack
          padding="24px 16px"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Icon />
          <BigCheckBox />
        </Stack>
        <Stack
          alignItems="center"
          bgcolor="#F1F0EA"
          padding="18px 24px"
          gap="16px"
        >
          <Typography fontWeight={600}>{medication.displayName}</Typography>
          <Image
            src={medication.images[0]}
            alt="zealthy bottle"
            style={{
              width: 'fit-content',
              height: medication.height[0],
            }}
          />
          <Stack gap="8px" alignItems="center">
            <Stack direction="row" gap="8px">
              <StrikethroughText>${medication.price}</StrikethroughText>
              <Typography fontWeight="600" color="#E38869">
                ${medication.discountedPrice}
              </Typography>
            </Stack>

            <Typography textAlign="center">{medication.interval}</Typography>
            <Typography textAlign="center">
              Delivered quarterly, only charged if prescribed.
            </Typography>
          </Stack>
        </Stack>
        <Stack padding="20px 27px">
          <Typography textAlign="left">{medication.description}</Typography>
        </Stack>
      </Stack>
    </ButtonBase>
  );
};

export default SelectedOption;

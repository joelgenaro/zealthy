import { useCallback, useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import StrikethroughText from '@/components/shared/StrikethroughText';
import LoopIcon from '@mui/icons-material/Loop';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import StyledChip from '@/components/shared/Chip/StyledChip';

type Option = {
  id: number;
  name: string;
  frequency: string;
  dosage: string;
  dose: string;
  medication_quantity_id: number;
  quantity: number;
  subHeader: string;
  subHeader2: string;
  textPrice?: string;
  discounted_price: number;
  price: number;
  recurring: {
    interval: string;
    interval_count: number;
  };
  hasBanner: boolean;
  type: CoachingType;
};
3;

interface RadioButtonProps {
  option: Option;
  basePrice: number;
  onChange: (o: Option) => void;
  isSelected: boolean;
}

const BundledRadioButton = ({
  option,
  onChange,
  isSelected,
  basePrice,
}: RadioButtonProps) => {
  const theme = useTheme();
  const onClick = useCallback(() => {
    onChange(option);
  }, [onChange, option]);

  const showBox = useMemo(() => {
    return isSelected;
  }, [isSelected]);

  return (
    <Stack>
      {option.hasBanner ? (
        <Box
          sx={{
            backgroundColor: '#008A2E',
            width: 'fit-content',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            padding: '0px 12px',
            position: 'relative',
            left: '5%',
          }}
        >
          <Typography variant="body1" sx={{ color: '#ffffff' }}>
            Max savings
          </Typography>
        </Box>
      ) : null}
      <Button
        onClick={onClick}
        variant="outlined"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: 0,
        }}
      >
        <Stack direction="row" alignItems="center">
          <Radio checked={isSelected} />
          <Typography color="#1b1b1b" fontWeight={700}>
            {option.frequency}
          </Typography>
        </Stack>
        <Stack direction="column" alignItems="flex-end">
          <Typography color="#367A35" fontWeight={700}>
            {option.subHeader}
            {/* <span style={{ color: '#367A35', fontWeight: 700 }}>
              ${option.textPrice}
            </span> */}
          </Typography>
          <Typography variant="h4" sx={{ textDecoration: 'line-through' }}>
            {option.subHeader2}
          </Typography>
        </Stack>
      </Button>
      {showBox ? (
        <Stack
          alignItems="center"
          bgcolor="#EAFFF1"
          padding="16px"
          borderRadius="8px"
          direction="row"
          gap="8px"
        >
          <LoopIcon />
          <Typography
            variant="h4"
            fontWeight="500"
          >{`Refills ship automatically ${
            option.recurring.interval_count === 3
              ? 'every 3 months'
              : 'every month'
          } along with $${option.discounted_price} charge for first ${
            option.recurring.interval_count === 3
              ? `3 months then $${option.price} every 3 months after`
              : `month and $${option.price} future months`
          }. Cancel anytime.`}</Typography>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default BundledRadioButton;

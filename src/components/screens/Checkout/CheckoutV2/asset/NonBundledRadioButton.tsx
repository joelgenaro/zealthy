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
  planId: string;
  header: string;
  subHeader: string;
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

interface RadioButtonProps {
  option: Option;
  basePrice: number;
  onChange: (o: Option) => void;
  isSelected: boolean;
}

const NonBundledRadioButton = ({
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
      <Box
        sx={{
          border: '0.5px solid #215222;',
          borderRadius: '10px',
          padding: '12px',
        }}
      >
        <Button
          onClick={onClick}
          // variant="outlined"
          fullWidth
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: 0,
            backgroundColor: '#ffffff',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#89DBA3',
            },
          }}
        >
          <Stack direction="row" alignItems="center">
            <Radio checked={isSelected} />
            <Typography color="#1b1b1b">{option.header}</Typography>
          </Stack>
          <Stack direction="row" gap="16px">
            <Typography color="#367A35">
              {option.subHeader}{' '}
              <span style={{ color: '#367A35', fontWeight: 700 }}>
                ${option.textPrice}
              </span>
            </Typography>
          </Stack>
        </Button>
        {showBox ? (
          <Stack
            alignItems="center"
            bgcolor="#EDEDED"
            padding="12px"
            borderRadius="8px"
            direction="row"
            gap="8px"
          >
            <LoopIcon />
            <Typography variant="h4" fontWeight="500">{`Pay $${
              option.discounted_price
            } today for first ${
              option.recurring.interval_count === 3 ? 'three months' : 'month'
            }. $${
              option.recurring.interval_count === 3
                ? Math.round(option.price / 3)
                : option.price
            }/month thereafter (paid ${
              option.recurring.interval_count === 3 ? 'quarterly' : 'monthly'
            }). Cancel any time.`}</Typography>
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
};

export default NonBundledRadioButton;

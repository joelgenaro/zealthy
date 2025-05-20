import { useCallback, useState } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import { useTheme } from '@mui/material';
import StrikethroughText from '@/components/shared/StrikethroughText';
import { useVisitActions, useVisitState } from '@/components/hooks/useVisit';
import WhiteBox from '@/components/shared/layout/WhiteBox';

interface RadioButtonProps {
  option: any;
  basePrice: number;
  onChange: (o: any) => void;
  isSelected: boolean;
}

const RadioButton = ({
  option,
  onChange,
  isSelected,
  basePrice,
}: RadioButtonProps) => {
  const theme = useTheme();
  const onClick = useCallback(() => {
    onChange(option);
  }, [onChange, option]);

  return (
    <Stack>
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
          <Typography sx={{ marginRight: '20px' }} color="#1b1b1b">
            {option.label}
          </Typography>
        </Stack>
        <Stack direction="row" gap="10px">
          {option?.discounted_price ? (
            <StrikethroughText color="#1b1b1b">{`$${Math.round(
              basePrice / option?.recurring?.interval_count
            )}`}</StrikethroughText>
          ) : null}
          <Typography
            color={
              option?.discounted_price ? theme.palette.primary.light : '#1b1b1b'
            }
            fontWeight={option?.discounted_price ? 600 : 400}
          >
            $
            {option?.discounted_price
              ? `${Math.round(
                  option?.discounted_price / option?.recurring?.interval_count
                )}/mo`
              : `${Math.round(option.price)}/mo`}
          </Typography>
        </Stack>
      </Button>
    </Stack>
  );
};

interface ModalProps {
  open: boolean;
  selectedMed: Medication | null;
  onClose: (m: boolean) => void;
  nextPage: (nextPage?: string) => void;
}

const TreatmentModal = () => {
  const { medications } = useVisitState();
  const { updateMedication } = useVisitActions();

  const isMobile = useIsMobile();
  const [duration, setDuration] = useState<string>('');

  const medDurations = [
    {
      name: 'Hair Strengthen Foam',
      label: 'Every 1 month',
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 428 : 388,
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      price: 100,
    },
    {
      name: 'Hair Strengthen Foam',
      label: 'Every 3 months',
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 429 : 389,
      quantity: 3,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      price: 300,
      discounted_price: 270,
    },
    {
      name: 'Hair Restore Solution',
      label: 'Every 1 month',
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 426 : 386,
      quantity: 1,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      price: 100,
    },
    {
      name: 'Hair Restore Solution',
      label: 'Every 3 months',
      medication_quantity_id:
        process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 427 : 387,
      quantity: 3,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      price: 300,
      discounted_price: 270,
    },
    {
      name: 'Minoxidil',
      label: 'Every 3 months',
      medication_quantity_id: 113,
      quantity: 90,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      price: 240,
      discounted_price: 147,
    },
    {
      name: 'Minoxidil',
      label: 'Every 6 months',
      medication_quantity_id: 113,
      quantity: 180,
      recurring: {
        interval: 'month',
        interval_count: 6,
      },
      price: 480,
      discounted_price: 234,
    },
  ];

  const onChange = useCallback(
    (d: any) => {
      setDuration(d.label);
      updateMedication({
        type: MedicationType.FEMALE_HAIR_LOSS,
        update: {
          quantity: d?.quantity,
          recurring: d?.recurring,
          medication_quantity_id: d.medication_quantity_id,
          price: d?.price,
          discounted_price: d?.discounted_price,
        },
      });
    },
    [updateMedication]
  );

  return (
    <WhiteBox padding="16px 24px" gap="2px">
      <Box>
        <Typography
          fontWeight={600}
          fontSize={isMobile ? '18px!important' : ''}
        >
          Please select supply duration
        </Typography>
        <br></br>

        <Stack gap={2}>
          {medications[0] &&
            medDurations
              .filter(d => d.name === medications?.[0]?.name)
              .map((d, idx) => (
                <RadioButton
                  key={idx}
                  option={d}
                  basePrice={d.price}
                  onChange={onChange}
                  isSelected={d.label === duration}
                />
              ))}
        </Stack>
        <br></br>
      </Box>
    </WhiteBox>
  );
};

export default TreatmentModal;

import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import {
  MedicationType,
  OtherOption,
} from '@/context/AppContext/reducers/types/visit';
import {
  Button,
  Container,
  Radio,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import LoopIcon from '@mui/icons-material/Loop';

const StrikethroughText = styled(Typography)`
  text-decoration: line-through;
  font-weight: 500;
`;

interface RadioButtonProps {
  option: OtherOption;
  basePrice: number;
  onChange: (o: OtherOption) => void;
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

  const showBox = useMemo(() => {
    return basePrice !== option.price && isSelected;
  }, [basePrice, isSelected, option.price]);

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
          <Typography color="#1b1b1b">{option.label}</Typography>
        </Stack>
        <Stack direction="row" gap="16px">
          {basePrice !== option.price ? (
            <StrikethroughText color="#1b1b1b">{`$${Math.round(
              basePrice
            )}`}</StrikethroughText>
          ) : null}
          <Typography
            color={
              basePrice !== option.price
                ? theme.palette.primary.light
                : '#1b1b1b'
            }
            fontWeight={basePrice !== option.price ? 600 : 400}
          >{`$${Math.round(
            option.price / option.recurring.interval_count
          )}/mo`}</Typography>
        </Stack>
      </Button>
      {showBox ? (
        <Stack
          alignItems="center"
          bgcolor="#d3d3d3"
          padding="16px"
          borderRadius="8px"
          direction="row"
          gap="8px"
        >
          <LoopIcon />
          <Typography variant="h4" fontWeight="500">{`Pay for and receive a ${
            option.recurring.interval_count
          }x supply for $${Math.round(option.price)} every ${
            option.recurring.interval_count
          } months. Cancel any time.`}</Typography>
        </Stack>
      ) : null}
    </Stack>
  );
};

interface RefillFrequencyProps {
  setPage: (page: string) => void;
}

const options = [
  'Ship every month',
  'Ship quarterly - every 3 months',
  'Ship yearly - every 12 months',
];

const ChangeInterval = ({ setPage }: RefillFrequencyProps) => {
  const nextPage = () => setPage('confirm-changes');
  const { updateMedication } = useVisitActions();
  const [frequency, setFrequency] = useState('Every 3 months');
  const medication = useVisitSelect(visit =>
    visit.medications.find(m => m.type === MedicationType.ED)
  );

  const frequencies = useMemo(() => {
    if (!medication || !medication.otherOptions) return [];
    return medication.otherOptions;
  }, [medication]);

  const handleChange = useCallback(
    (f: OtherOption) => {
      setFrequency(f.label);
      updateMedication({
        type: MedicationType.ED,
        update: {
          quantity: f.quantity,
          recurring: f.recurring,
          medication_quantity_id: f.medication_quantity_id,
          price: f.price,
          discounted_price: f.discounted_price,
        },
      });
    },
    [updateMedication]
  );

  const basePrice = useMemo(() => {
    if (!medication || !medication.otherOptions) return 0;
    return medication.otherOptions[0].price;
  }, [medication]);

  return (
    <Container maxWidth="sm">
      <Stack gap="24px">
        <Typography variant="h2">Update refill frequency</Typography>
        <Stack gap="16px">
          {frequencies.map(f => (
            <RadioButton
              key={f.medication_quantity_id}
              isSelected={f.label === frequency}
              onChange={handleChange}
              option={f}
              basePrice={basePrice}
            />
          ))}
        </Stack>
        <Stack gap="16px">
          <Button onClick={nextPage}>Continue</Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default ChangeInterval;

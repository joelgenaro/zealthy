import { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Radio,
  FormControl,
  Box,
  Button,
} from '@mui/material';
import { useVisitActions } from '@/components/hooks/useVisit';
import toast from 'react-hot-toast';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';

interface SleepSelectionProps {
  nextPage: (nextPage?: string) => void;
}

interface PricingOption {
  id: number;
  duration: string;
  pills: number;
  pricePerPill: number;
  originalPrice: number;
  discount: string;
  mostPopular?: boolean;
}

const pricingOptions: PricingOption[] = [
  {
    id: 1,
    duration: '2-Month Supply',
    pills: 60,
    pricePerPill: 2.21,
    originalPrice: 4.0,
    discount: '45% OFF',
    mostPopular: true,
  },
  {
    id: 2,
    duration: '1-Month Supply',
    pills: 30,
    pricePerPill: 2.6,
    originalPrice: 4.0,
    discount: '35% OFF',
  },
  {
    id: 3,
    duration: '4-Month Supply',
    pills: 120,
    pricePerPill: 1.95,
    originalPrice: 4.0,
    discount: '52% OFF',
  },
];

const medicationOptions = {
  1: {
    display_name: 'Ramelteon',
    dosage: 'Standard Dose',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 510 : 500,
    name: 'Ramelteon Medication',
    price: 133,
    quantity: 60,
    recurring: {
      interval: 'month',
      interval_count: 2,
    },
    type: MedicationType.SLEEP,
  },
  2: {
    display_name: 'Ramelteon',
    dosage: 'Standard Dose',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 509 : 499,
    name: 'Ramelteon Medication',
    price: 78,
    quantity: 30,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    type: MedicationType.SLEEP,
  },
  3: {
    display_name: 'Ramelteon',
    dosage: 'Standard Dose',
    medication_quantity_id:
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 511 : 501,
    name: 'Ramelteon Medication',
    price: 234,
    quantity: 120,
    recurring: {
      interval: 'month',
      interval_count: 4,
    },
    type: MedicationType.SLEEP,
  },
};

interface SupplyOptionProps {
  option: PricingOption;
  selected: boolean;
  onClick: (id: number) => void;
}

const SupplyOption: React.FC<SupplyOptionProps> = ({
  option,
  selected,
  onClick,
}) => (
  <Card
    onClick={() => onClick(option.id)}
    sx={{
      position: 'relative',
      padding: 2,
      borderRadius: 5,
      border: selected ? '3px solid darkgreen' : '1px solid #ccc',
      cursor: 'pointer',
      boxShadow: selected
        ? '4px 4px 10px rgba(144, 238, 144, 0.8)'
        : '0px 0px 12px rgba(0, 0, 0, 0.1)',
      transition:
        'border 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
      width: '100%',
      textAlign: 'center',
      marginBottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }}
  >
    <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
      <Radio
        checked={selected}
        onChange={() => onClick(option.id)}
        value={option.id}
        name="pricing-options"
        inputProps={{ 'aria-label': option.duration }}
      />
    </Box>

    {option.mostPopular && (
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: '#ff9800',
          padding: '4px 8px',
          borderRadius: '10px',
          fontSize: '0.8rem',
          color: 'white',
        }}
      >
        Most Popular
      </Box>
    )}

    <CardContent
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
      }}
    >
      <Typography variant="h3" fontWeight="bold">
        {option.duration}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {option.pills} tablets
      </Typography>
      <Typography variant="body1" sx={{ marginTop: 1 }}>
        ${option.pricePerPill.toFixed(2)} / Pill{' '}
        <span style={{ textDecoration: 'line-through', color: 'red' }}>
          ${option.originalPrice.toFixed(2)}
        </span>
      </Typography>

      <Box sx={{ flexGrow: 1 }} />
    </CardContent>

    <Box
      sx={{
        backgroundColor: 'green',
        borderRadius: '8px',
        padding: '8px',
        marginTop: 'auto',
        width: '35%',
        alignSelf: 'center',
      }}
    >
      <Typography variant="body2" color="white">
        Save {option.discount}
      </Typography>
    </Box>
  </Card>
);

const SleepSelection: React.FC<SleepSelectionProps> = ({ nextPage }) => {
  const { addMedication } = useVisitActions();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    setSelectedOption(id);
  };

  const handleClick = () => {
    if (selectedOption === null)
      return toast.error('Please select a treatment option');

    const selectedMedication = medicationOptions[selectedOption as 1 | 2 | 3];
    addMedication(selectedMedication);
    nextPage();
  };

  return (
    <Container maxWidth="sm">
      <Stack spacing={3} alignItems="center">
        <Typography variant="h2" fontWeight="bold">
          Treatment Selection
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          <span
            style={{
              fontWeight: 'bold',
              textDecoration: 'underline',
            }}
          >
            Save 52%
          </span>{' '}
          by ordering a 4-month supply
        </Typography>

        <FormControl component="fieldset" sx={{ width: '100%' }}>
          {pricingOptions.map(option => (
            <SupplyOption
              key={option.id}
              option={option}
              selected={selectedOption === option.id}
              onClick={handleSelect}
            />
          ))}
        </FormControl>
        <Button
          fullWidth
          variant="contained"
          sx={{
            bgcolor: { bgcolor: '#1B5E20' },
            '&:hover': '#2E7D32',
          }}
          onClick={handleClick}
        >
          Next Step: Finalize Treatment
        </Button>
      </Stack>
    </Container>
  );
};

export default SleepSelection;

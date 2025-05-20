import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Stack,
  Typography,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  Medication,
  MedicationType,
} from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName, Questionnaire } from '@/types/questionnaire';
import Image from 'next/image';
import menopauseGeneric from 'public/images/menopause-generic.png';
import menopauseTreatmentBottle from 'public/images/menopause-treatment-bottle.png';
import menopauseGel from 'public/images/menopause-gel.png';

interface MenopauseTreatmentSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  nextPage: (nextPage?: string) => void;
}

const MenopauseTreatmentSelect = ({
  question,
  questionnaire,
  nextPage,
}: MenopauseTreatmentSelectProps) => {
  const { addMedications, resetMedications } = useVisitActions();
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitFreeTextAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });

  // Full medication dataset (all dosages)
  const comprehensiveMedicationDataset: Record<string, Medication[]> = useMemo(
    () => ({
      'Estradiol Pill': [
        {
          name: 'Estradiol Pill',
          dosage: '0.5 MG Tablet',
          type: MedicationType.MENOPAUSE,
          image: menopauseTreatmentBottle,
          price: 120,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 515 : 502,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
        {
          name: 'Estradiol Pill',
          dosage: '1 MG Tablet',
          type: MedicationType.MENOPAUSE,
          image: menopauseTreatmentBottle,
          price: 120,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 516 : 504,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
        {
          name: 'Estradiol Pill',
          dosage: '2 MG Tablet',
          type: MedicationType.MENOPAUSE,
          image: menopauseTreatmentBottle,
          price: 120,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 517 : 505,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
      ],
      'Estradiol Gel': [
        {
          name: 'Estradiol Gel',
          dosage: '0.1% / 1 MG Packets',
          type: MedicationType.MENOPAUSE,
          image: menopauseGel,
          price: 210,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 518 : 506,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
      ],
      'Estradiol Patch': [
        {
          name: 'Estradiol Patch',
          dosage: '0.05 MG Patch (2x/Week)',
          type: MedicationType.MENOPAUSE,
          image: menopauseGeneric,
          price: 225,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 519 : 507,
          quantity: 24,
          recurring: { interval: 'month', interval_count: 3 },
        },
        {
          name: 'Estradiol Patch',
          dosage: '0.075 MG Patch (2x/Week)',
          type: MedicationType.MENOPAUSE,
          image: menopauseGeneric,
          price: 225,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 520 : 508,
          quantity: 24,
          recurring: { interval: 'month', interval_count: 3 },
        },
        {
          name: 'Estradiol Patch',
          dosage: '0.1 MG Patch (2x/Week)',
          type: MedicationType.MENOPAUSE,
          image: menopauseGeneric,
          price: 225,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 521 : 509,
          quantity: 24,
          recurring: { interval: 'month', interval_count: 3 },
        },
      ],
      'Low-dose Birth Control Pill': [
        {
          name: 'Low-dose Birth Control Pill',
          dosage: 'Norethindrone-Ethinyl Estradiol 1-0.02 MG',
          type: MedicationType.MENOPAUSE,
          image: menopauseGeneric,
          price: 118,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 522 : 510,
          quantity: 84,
          recurring: { interval: 'month', interval_count: 3 },
        },
      ],
      Paroxetine: [
        {
          name: 'Paroxetine',
          dosage: '10 MG Tablet',
          type: MedicationType.MENOPAUSE,
          image: menopauseTreatmentBottle,
          price: 105,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 523 : 511,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
      ],
      Progesterone: [
        {
          name: 'Progesterone',
          dosage: '100 MG Capsule',
          type: MedicationType.MENOPAUSE,
          image: menopauseTreatmentBottle,
          price: 119,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 524 : 512,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
        {
          name: 'Progesterone',
          dosage: '200 MG Capsule',
          type: MedicationType.MENOPAUSE,
          image: menopauseTreatmentBottle,
          price: 119,
          medication_quantity_id:
            process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 525 : 513,
          quantity: 90,
          recurring: { interval: 'month', interval_count: 3 },
        },
      ],
    }),
    []
  );

  // Rendered options (only parent categories)
  const renderedMedicationOptions = useMemo(
    () => [
      {
        name: 'Estradiol Pill',
        dosage: 'Available dosages: 0.5 mg, 1 mg, 2 mg',
        type: MedicationType.MENOPAUSE,
        image: menopauseTreatmentBottle,
        datasetKey: 'Estradiol Pill',
      },
      {
        name: 'Estradiol Gel',
        dosage: 'Available dosage: 0.1% / 1 mg packets',
        type: MedicationType.MENOPAUSE,
        image: menopauseGel,
        datasetKey: 'Estradiol Gel',
      },
      {
        name: 'Estradiol Patch',
        dosage: 'Available dosages: 0.05 mg, 0.075 mg, 0.1 mg (2x/week)',
        type: MedicationType.MENOPAUSE,
        image: menopauseGeneric,
        datasetKey: 'Estradiol Patch',
      },
      {
        name: 'Low-dose Birth Control Pill',
        dosage: 'Available dosage: 1-20 MG-MCG',
        type: MedicationType.MENOPAUSE,
        image: menopauseGeneric,
        datasetKey: 'Low-dose Birth Control Pill',
      },
      {
        name: 'Paroxetine',
        dosage: 'Available dosage: 10 mg Tablet',
        type: MedicationType.MENOPAUSE,
        image: menopauseTreatmentBottle,
        datasetKey: 'Paroxetine',
      },
      {
        name: 'Progesterone',
        dosage: 'Available dosages: 100 mg, 200 mg Capsule',
        type: MedicationType.MENOPAUSE,
        image: menopauseTreatmentBottle,
        datasetKey: 'Progesterone',
      },
    ],
    []
  );

  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  const handleSelection = (medicationName: string) => {
    setSelectedMedications(prevSelected =>
      prevSelected.includes(medicationName)
        ? prevSelected.filter(name => name !== medicationName)
        : [...prevSelected, medicationName]
    );
  };

  const handleContinue = () => {
    resetMedications();
    const selectedMedicationObjects = selectedMedications.map(
      medicationName => {
        const detailedOptions = comprehensiveMedicationDataset[medicationName];
        // Take the first (lowest) dosage option for each selected medication
        return detailedOptions[0];
      }
    );

    addMedications(selectedMedicationObjects);
    submitFreeTextAnswer({ text: selectedMedications.join(', ') });
    submitAnswer();
    nextPage();
  };

  const medicationList = useMemo(() => {
    return renderedMedicationOptions.map((option, i) => {
      const isSelected = selectedMedications.includes(option.name);
      const isGelOrBottle =
        option.image === menopauseGel ||
        option.image === menopauseTreatmentBottle;

      return (
        <Box
          key={option.name + i}
          onClick={() => handleSelection(option.name)}
          sx={{
            border: isSelected ? '2px solid #027C2A' : '1px solid #E6E6E6',
            borderRadius: '8px',
            backgroundColor: isSelected ? '#F3FFF3' : '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            p: 2,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            '&:hover': {
              borderColor: '#027C2A',
            },
          }}
        >
          <Checkbox size="medium" checked={isSelected} />
          <Stack spacing={0.5} flexGrow={1}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {option.name}
            </Typography>
            <Typography variant="body2">{option.dosage}</Typography>
          </Stack>
          <Box
            sx={{
              bgcolor: '#EAFFF1',
              width: '100px',
              height: '100px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              quality={100}
              priority
              src={option.image}
              alt={option.name}
              width={isGelOrBottle ? 140 : 80}
              height={isGelOrBottle ? 140 : 80}
              style={{
                objectFit: 'contain',
                borderRadius: '1px',
              }}
            />
          </Box>
        </Box>
      );
    });
  }, [renderedMedicationOptions, selectedMedications]);

  return (
    <Container maxWidth="md">
      <Grid container direction="column" gap={2}>
        <Stack gap={1}>
          <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
            Your treatment options
          </Typography>
          <Typography>Select the best options for your needs.</Typography>
        </Stack>
        <Paper>
          <Stack gap={2}>{medicationList}</Stack>
        </Paper>
        <Button
          variant="contained"
          disabled={selectedMedications.length === 0}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Grid>
    </Container>
  );
};

export default MenopauseTreatmentSelect;

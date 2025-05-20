import { useState } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import {
  Box,
  Button,
  Checkbox,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DOMPurify from 'dompurify';

const medicationOptions = [
  {
    name: 'Junel 1.5/30',
    description: 'Norethindrone/ee - 1.5/30 - FE',
    benefits: ['helps pms', 'helps iron deficiency', 'lighter periods'],
    type: 'Monophasic',
  },
  {
    name: 'Syeda (generic Yasmin)',
    description: 'Drospirenone/ee - 3/30',
    benefits: ['helps pms', 'lighter periods'],
    type: 'Monophasic',
  },
  {
    name: 'Drospirenone (generic Yaz)',
    description: 'EE 3/0.03mg',
    benefits: ['lighter periods', 'helps acne', 'helps pms'],
    type: 'Monophasic',
  },
  {
    name: 'Blisovi Fe 1/20',
    description: 'Norethindrone - EE',
    benefits: ['helps acne', 'lighter periods'],
    type: 'Monophasic',
  },
  {
    name: 'Heather',
    description: 'Norethindrone',
    benefits: ['no estrogen', 'helps with migraines'],
    type: 'Progestin-only',
  },
  {
    name: 'I have no Birth Control preference',
    description:
      'Allow your Zealthy provider to select the medication would be the best match for you based on your medical questionaire.',
    benefits: [],
  },
  {
    name: 'Other',
    description: '',
    benefits: [],
  },
];

interface BirthControlMedicationProps {
  handleSelectMedication: (medication: string) => void;
}

const BirthControlMedication = ({
  handleSelectMedication,
}: BirthControlMedicationProps) => {
  const isMobile = useIsMobile();
  const [selectedMedication, setSelectedMedication] = useState<string | null>(
    null
  );
  const [other, setOther] = useState<string | null>(null);

  function handleContinue() {
    if (selectedMedication === 'Other') {
      if (other) {
        handleSelectMedication(
          `Other (${DOMPurify.sanitize(other, {
            USE_PROFILES: { html: false },
          })})`
        );
      } else {
        handleSelectMedication('Other (not specified)');
      }
    } else if (selectedMedication === 'I have no Birth Control preference') {
      handleSelectMedication(
        'No preference birth control - likely recommend Tri Estarylla, Heather, Norethindrone'
      );
    } else {
      if (selectedMedication) {
        handleSelectMedication(selectedMedication);
      }
    }
  }

  return (
    <Stack gap={2}>
      <Typography variant="h2">Your birth control options</Typography>
      <Typography variant="h4">
        Upon submitting your visit, a doctor will review your information and
        determine the best treatment plan for you. This can include medications
        not in this list.
      </Typography>
      <Stack gap={3} mt={3}>
        {medicationOptions.map((option, i) => (
          <Box
            key={option.name + i}
            onClick={() => setSelectedMedication(option.name)}
            sx={{
              width: '100%',
              backgroundColor: '#FFFAF2',
              // boxShadow: " ",
              padding: '15px',
              display: 'grid',
              gap: '1rem',
              borderRadius: '8px',
              gridTemplateColumns: '40px 1fr',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <Box>
              <Checkbox
                size="small"
                checked={selectedMedication === option.name}
              />
            </Box>
            <Stack>
              {option.type && (
                <Typography
                  sx={{
                    color: '#027C2A',
                    fontSize: '10px !important',
                  }}
                >
                  {option.type}
                </Typography>
              )}
              <Typography variant="h3">{option?.name}</Typography>
              {option.description && (
                <Typography>{option.description}</Typography>
              )}
              {option.benefits.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap="5px" mt={1}>
                  {option.benefits.map(benefit => (
                    <Box
                      key={benefit}
                      sx={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        border: '1px solid #A8A8A8',
                        borderRadius: '8px',
                        color: '#535353',
                        padding: '0px 7px',
                        width: 'fit-content',
                        height: 'fit-content',
                        lineHeight: '20px',
                      }}
                    >
                      {benefit.toUpperCase()}
                    </Box>
                  ))}
                </Box>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
      {selectedMedication === 'Other' && (
        <Stack gap={1}>
          <Typography variant="h3">
            Please specify what your preferred birth control medication is:
          </Typography>
          <TextField
            sx={{ width: '100%', backgroundColor: 'white' }}
            multiline
            rows={4}
            placeholder="Type here..."
            value={other}
            onChange={e => setOther(e.target.value)}
          />
        </Stack>
      )}
      <Button
        size="small"
        sx={{ marginTop: '1rem' }}
        disabled={!selectedMedication}
        onClick={handleContinue}
      >
        Continue
      </Button>
    </Stack>
  );
};

export default BirthControlMedication;

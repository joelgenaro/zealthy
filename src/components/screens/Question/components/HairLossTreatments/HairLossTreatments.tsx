import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName } from '@/types/questionnaire';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { drugs } from './data';

interface OptionsProps {
  question: QuestionWithName;
}
type Medications = Medication & {
  delivery: string;
  description: string;
  icon: any;
};
const HairLossTreatments = ({ question }: OptionsProps) => {
  const { addMedication } = useVisitActions();
  const { submitSingleSelectAnswer } = useAnswerAction(question);

  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [seeMore, setSeeMore] = useState(false);
  console.info(question);
  const handleSubmit = useCallback(
    (value: Medication) => {
      console.info(value);
      const answer = question?.answerOptions?.find(a => a.text === value.name);
      const newValue = {
        name: value.name,
        type: value.type,
        quantity: value.quantity,
        dosage: value.dosage,
        price: value.price,
        discounted_price: value.discounted_price,
        recurring: value.recurring,
        medication_quantity_id: value.medication_quantity_id,
      };
      setSelectedMed(value);
      addMedication(newValue);
      submitSingleSelectAnswer({
        text: value.name,
        code: answer?.code,
        next: answer?.next,
        system: answer?.system,
      });
    },
    [addMedication, submitSingleSelectAnswer]
  );
  return (
    <Stack spacing={2}>
      <List
        sx={{
          // pl: 3,
          marginBottom: '8px',
        }}
        disablePadding
      >
        {drugs.map(
          (med, i) =>
            (!seeMore ? i < 1 : i < drugs.length) && (
              <ListItem
                key={med.name}
                sx={{
                  display: 'list-item',
                  borderRadius: '12px',
                  border:
                    selectedMed?.name === med.name
                      ? '2px solid #B1B1B1'
                      : '1px solid #CCCCCC',
                  padding: '2rem',
                  alignItems: 'center',
                  gap: '24px',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  background: '#FFFFFF',
                }}
                onClick={() => handleSubmit(med)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      marginBottom: '1.12rem',
                      gap: '1.5rem',
                      alignItems: 'start',
                    }}
                  >
                    <Radio checked={selectedMed?.name === med.name} />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <Typography
                        variant="h3"
                        sx={{
                          color: '#1B1B1B',
                          fontWeight: '600',
                          fontSize: '16px',
                        }}
                      >
                        {med.name}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: '#1B1B1B',
                          fontWeight: '500',
                          fontSize: '16px',
                        }}
                      >
                        {`90-Day Supply (${
                          (med?.quantity ?? 0) > 1 ? `${med.quantity} x ` : ''
                        }${med.dosage}${
                          med.name === 'Topical Minoxidil' ? ', 5%' : ''
                        })`}
                      </Typography>

                      <Typography
                        variant="h3"
                        sx={{
                          color: '#1B1B1B',
                          fontWeight: '500',
                          fontSize: '16px',
                          display: 'flex',
                          gap: '0.3rem',
                        }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            color: '#1B1B1B',
                            fontWeight: '500',
                            fontSize: '16px',
                            display: 'flex',
                            gap: '0.3rem',
                            textDecoration: 'line-through',
                          }}
                        >
                          {`$${parseInt(
                            ((med.price ?? 0) / 3).toString(),
                            10
                          )}`}
                        </Typography>
                        {`$${parseInt(
                          ((med.discounted_price ?? 0) / 3).toString(),
                          10
                        )} per month`}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: '#666666',
                          fontWeight: '300',
                          fontSize: '14px',
                        }}
                      >
                        {med.delivery}
                      </Typography>
                    </Box>
                    <med.icon />
                  </Box>
                  {med.description}
                </Box>
              </ListItem>
            )
        )}
        <Button
          color="grey"
          fullWidth
          onClick={() => setSeeMore(more => !more)}
          sx={{ background: 'transparent' }}
        >
          {seeMore ? 'View less' : 'View more'}
          {seeMore ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </Button>
      </List>
    </Stack>
  );
};

export default HairLossTreatments;

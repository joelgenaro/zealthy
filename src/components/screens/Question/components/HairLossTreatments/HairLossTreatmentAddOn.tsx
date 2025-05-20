import React, { useCallback, useState } from 'react';
import { Box, List, ListItem, Radio, Stack, Typography } from '@mui/material';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName } from '@/types/questionnaire';
import { useVisitActions, useVisitSelect } from '@/components/hooks/useVisit';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { addOnDrugs } from './data';

interface OptionsProps {
  question: QuestionWithName;
}
type Medications = Medication & {
  delivery: string;
  description: string;
  icon: any;
};

const HairLossTreatmentAddOn = ({ question }: OptionsProps) => {
  const { addMedication, removeMedication } = useVisitActions();
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const medications = useVisitSelect(visit => visit.medications);

  const [selectedMed, setSelectedMed] = useState<Medications | null>(null);
  const [medOption] = useState<Medications | undefined>(
    medications[0].name === 'Oral Finasteride'
      ? addOnDrugs.find(d => d.name === 'Oral Minoxidil')
      : addOnDrugs.find(d => d.name === 'Oral Finasteride')
  );

  const handleSubmit = useCallback(
    (value: Medications) => {
      if (selectedMed !== null) {
        removeMedication(selectedMed.type);
        setSelectedMed(null);
      }
      if (selectedMed === null) {
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
        submitFreeTextAnswer({ text: 'treatment_add_on' });
      }
    },
    [addMedication, submitFreeTextAnswer, selectedMed]
  );

  return (
    <>
      <Stack spacing={2}>
        {medOption && (
          <>
            <List
              sx={{
                marginBottom: '8px',
              }}
              disablePadding
            >
              <ListItem
                sx={{
                  display: 'list-item',
                  borderRadius: '12px',
                  border:
                    selectedMed?.name === medOption.name
                      ? '2px solid #B1B1B1'
                      : '1px solid #CCCCCC',
                  padding: '2rem',
                  alignItems: 'center',
                  gap: '24px',
                  cursor: 'pointer',
                  marginBottom: '1.5rem',
                  background: '#FFFFFF',
                }}
                onClick={() => {
                  handleSubmit(medOption);
                }}
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
                    <Radio checked={selectedMed?.name === medOption?.name} />
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
                        {medOption.name}
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
                          (medOption?.quantity ?? 0) > 1
                            ? `${medOption.quantity} x `
                            : ''
                        }${medOption.dosage}${
                          medOption.name === 'Topical Minoxidil' ? ', 5%' : ''
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
                            textDecoration: 'line-through',
                            color: '#1B1B1B',
                            fontWeight: '500',
                            fontSize: '16px',
                            display: 'flex',
                            gap: '0.3rem',
                          }}
                        >
                          {`$${parseInt(
                            ((medOption.price ?? 0) / 3).toString(),
                            10
                          )}`}
                        </Typography>
                        {`$${parseInt(
                          ((medOption.discounted_price ?? 0) / 3).toString(),
                          10
                        )} per month`}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          color: '#666666',
                          fontWeight: '300',
                          fontSize: '14px',
                        }}
                      >
                        {medOption.delivery}
                      </Typography>
                    </Box>
                    <medOption.icon />
                  </Box>
                  {medOption.description}
                </Box>
              </ListItem>
            </List>
          </>
        )}
      </Stack>
    </>
  );
};

export default HairLossTreatmentAddOn;

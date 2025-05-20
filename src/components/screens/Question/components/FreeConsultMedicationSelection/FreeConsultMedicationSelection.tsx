import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  styled,
  Divider,
} from '@mui/material';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { QuestionWithName } from '@/types/questionnaire';

interface FreeConsultMedicationSelectionProps {
  nextPage: (nextPage?: string, selectedBoxId?: number) => void;
  question: QuestionWithName;
}

const KlarnaLabel = styled(Box)({
  backgroundColor: '#2E7D32',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '12px',
  padding: '4px 8px',
  borderTopLeftRadius: '10px',
  borderTopRightRadius: '10px',
  textTransform: 'none',
  display: 'inline-block',
  textAlign: 'left',
  alignSelf: 'flex-start',
});

const StyledCard = styled(Card)({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  boxShadow: 'none',
  cursor: 'pointer',
});

const FreeConsultMedicationSelection = ({
  nextPage,
  question,
}: FreeConsultMedicationSelectionProps) => {
  const [selectedMedicationIndex, setSelectedMedicationIndex] = useState<
    number | null
  >(null);

  const handleBoxClick = (item: any, boxId: number) => {
    setSelectedMedicationIndex(boxId);
    submitSingleSelectAnswer(item);
  };

  const handleButtonClick = () => {
    if (selectedMedicationIndex !== null) {
      nextPage();
    }
  };

  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: question.questionnaire,
    answerOptions: question.answerOptions,
  });

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', paddingTop: '24px' }}>
      {question?.answerOptions?.map((item, i) => (
        <Box
          key={i}
          display="flex"
          flexDirection="column"
          onClick={() => handleBoxClick(item, i)}
        >
          <KlarnaLabel>Buy now pay later with Klarna</KlarnaLabel>
          <Box
            padding="10px"
            border="2px solid"
            borderColor={selectedMedicationIndex === i ? 'green' : 'lightgrey'}
            boxShadow={
              selectedMedicationIndex === i
                ? '0 4px 12px rgba(0, 128, 0, 0.4)'
                : 'none'
            }
            sx={{
              cursor: 'pointer',
              marginBottom: '16px',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              borderBottomLeftRadius: '8px',
            }}
          >
            <Typography variant="h3" textAlign="left">
              {i === 0 ? 'Semaglutide' : 'Tirzepatide'}
            </Typography>
            <Divider sx={{ marginY: 1 }} />
            <Box display="flex" flexDirection="row" alignItems="center">
              <Box
                component="img"
                src={`/images/free-consult/${
                  i === 0 ? 'semaglutide-bottle.png' : 'tirzepatide-bottle.png'
                }`}
                alt="Medication"
                sx={{
                  height: 100,
                  textAlign: 'left',
                  marginLeft: 2,
                }}
              />
              <Typography variant="body1" marginLeft="25px">
                Compounded
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                marginLeft="auto"
                marginRight="10px"
              >
                <Typography>Starting At:</Typography>
                <Typography sx={{ color: 'green', fontWeight: 'bold' }}>
                  {i === 0 ? '$125 / mo' : '$250 / mo'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
      <Button
        variant="contained"
        fullWidth
        disabled={selectedMedicationIndex === null}
        sx={{
          backgroundColor:
            selectedMedicationIndex !== null ? '#2E7D32' : '#E0E0E0',
          color: selectedMedicationIndex !== null ? '#fff' : '#9E9E9E',
          fontWeight: 'bold',
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
        }}
        onClick={handleButtonClick}
      >
        Get started
      </Button>
    </Container>
  );
};

export default FreeConsultMedicationSelection;

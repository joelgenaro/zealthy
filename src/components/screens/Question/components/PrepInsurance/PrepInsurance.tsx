import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { Container, Box, Typography, Button } from '@mui/material';
import { useAnswerAction } from '@/components/hooks/useAnswer';

interface PrepInsuranceProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
}
const PrepInsurance = ({
  question,
  questionnaire,
  answer,
}: PrepInsuranceProps) => {
  const { submitSingleSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
    answerOptions: question.answerOptions,
  });
  const isSelected = (option: QuestionnaireQuestionAnswerOptions) => {
    return !!answer?.find(ans => ans?.valueCoding?.code === option?.code);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          bgcolor: '#E8F5E9',
          p: 3,
          borderRadius: 2,
          textAlign: 'left',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          We&apos;re ready to provide care!
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          Now what?
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Once you finish checking out, a licensed medical provider will review
          the information you shared and recommend a treatment plan, as
          medically appropriate.
        </Typography>
      </Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 'bold',
          textAlign: 'left',
          mt: 2,
          mb: 2,
        }}
      >
        How would you like to pay for your medication?
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
        }}
      >
        {question?.answerOptions?.map((option, index) => (
          <Button
            key={index}
            variant={isSelected(option) ? 'contained' : 'outlined'}
            size="large"
            sx={{
              width: '48%',
              bgcolor: isSelected(option) ? '#2E7D32' : 'transparent',
              color: isSelected(option) ? '#FFFFFF' : '#000000',
              borderColor: '#2E7D32',
              borderRadius: '16px',
              '&:hover': {
                bgcolor: isSelected(option) ? '#1B5E20' : 'transparent',
              },
            }}
            onClick={() => submitSingleSelectAnswer(option)}
          >
            {option.text}
          </Button>
        ))}
      </Box>
    </Container>
  );
};

export default PrepInsurance;

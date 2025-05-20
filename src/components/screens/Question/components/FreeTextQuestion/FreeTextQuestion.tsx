import { useAnswerAction } from '@/components/hooks/useAnswer';
import { QuestionWithName } from '@/types/questionnaire';
import Detail from '../Detail';
import { useLanguage } from '@/components/hooks/data';

interface FreeTextAnswerProps {
  question: QuestionWithName;
}

const FreeTextQuestion = ({ question }: FreeTextAnswerProps) => {
  const { submitFreeTextAnswer } = useAnswerAction(question);
  const language = useLanguage();

  let typeHere = 'Type here...';

  if (language === 'esp') {
    typeHere = 'Escriba aquí...';
  }

  return (
    <Detail
      questionName={question.name}
      placeholder={question?.input_placeholder || typeHere}
      onChange={submitFreeTextAnswer}
    />
  );
};

export default FreeTextQuestion;

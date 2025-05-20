import { useVisitActions } from '@/components/hooks/useVisit';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  Questionnaire,
  QuestionnaireName,
  QuestionWithName,
} from '@/types/questionnaire';
import { toVisitQuestionnaire } from '@/utils/mapSpecificCareToQuestionnaires';
import { useEffect } from 'react';
import Choice from '../Choice';

interface QuestionnaireChoiceProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
}

const QuestionnaireChoice = ({
  question,
  questionnaire,
  answer,
}: QuestionnaireChoiceProps) => {
  const { addQuestionnaire, removeQuestionnaire } = useVisitActions();

  useEffect(() => {
    if (!answer?.[0]) return;

    if (answer[0].valueCoding.display === 'Evaluate me for rosacea and acne') {
      addQuestionnaire(toVisitQuestionnaire(QuestionnaireName.ACNE_TREATMENT));
    } else {
      removeQuestionnaire(QuestionnaireName.ACNE_TREATMENT);
    }
  }, [addQuestionnaire, answer, removeQuestionnaire]);

  return (
    <Choice question={question} questionnaire={questionnaire} answer={answer} />
  );
};

export default QuestionnaireChoice;

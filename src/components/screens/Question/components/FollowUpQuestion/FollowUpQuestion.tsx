import { useLanguage } from '@/components/hooks/data';
import { useAnswerAction, useAnswerSelect } from '@/components/hooks/useAnswer';
import { QuestionWithName } from '@/types/questionnaire';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import Detail from '../Detail';

interface FollowUpQuestionProps {
  question: QuestionWithName;
  isAlt?: boolean;
}

const FollowUpQuestion = ({ question, isAlt }: FollowUpQuestionProps) => {
  let { followUp } = question;
  const answer = useAnswerSelect(answers => answers[question!.name]);
  const language = useLanguage();
  if (isAlt) {
    followUp = question.followUpAlt;
  }

  const { submitFreeTextAnswer } = useAnswerAction({
    questionnaire: question.questionnaire,
    name: followUp!.code,
    header: followUp!.description,
    canvas_linkId: followUp!.canvas_linkId,
  });

  if (!answer) {
    return null;
  }

  let typeHere = 'Type here...';
  if (language === 'esp') {
    typeHere = 'Escribe aquí...';
  }

  if (
    isCodedAnswer(answer.answer) &&
    answer.answer.some(a => a.valueCoding.code === followUp!.showIfResponse)
  ) {
    return (
      <Detail
        questionName={followUp!.code}
        label={followUp!.description}
        subLabel={followUp?.body}
        placeholder={followUp?.input_placeholder || typeHere}
        onChange={submitFreeTextAnswer}
      />
    );
  }

  return null;
};

export default FollowUpQuestion;

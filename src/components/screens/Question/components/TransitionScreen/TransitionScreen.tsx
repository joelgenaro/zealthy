import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import { useEffect } from 'react';
import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface TransitionProps {
  nextPath: (nextPage?: string) => void;
  question: QuestionWithName;
}

const TransitionScreen = ({ nextPath, question }: TransitionProps) => {
  const isMobile = useIsMobile();
  const duration = question?.transition?.time;
  const imageUrl = isMobile
    ? question.transition?.imageSrcMobile
    : question.transition?.imageSrc;

  const validImageUrl =
    imageUrl ||
    question.transition?.imageSrc ||
    question.transition?.imageSrcMobile ||
    null;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        nextPath();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, nextPath]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {validImageUrl ? (
        <Image
          alt={question.name}
          src={validImageUrl}
          objectFit="contain"
          style={{
            objectPosition: 'center',
            height: '100%',
            width: '100%',
          }}
          priority
        />
      ) : null}
    </div>
  );
};

export default TransitionScreen;

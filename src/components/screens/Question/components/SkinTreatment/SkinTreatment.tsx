import { useConsultationActions } from '@/components/hooks/useConsultation';
import { ConsultationType } from '@/context/AppContext/reducers/types/consultation';
import { QuestionWithName } from '@/types/questionnaire';
import { useEffect } from 'react';

interface SkinTreatmentProps {
  question: QuestionWithName;
}

const SkinTreatment = ({ question }: SkinTreatmentProps) => {
  const { addConsultation } = useConsultationActions();

  useEffect(() => {
    //add acne consultation fee
    addConsultation({
      name: `${question.subType} Medical Consultation`,
      price: 50,
      discounted_price: 20,
      type: question.subType as ConsultationType,
    });
  }, [addConsultation, question.subType]);

  return null;
};

export default SkinTreatment;

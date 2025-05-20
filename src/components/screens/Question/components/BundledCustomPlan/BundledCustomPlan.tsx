import { useSelector } from '@/components/hooks/useSelector';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { QuestionWithName } from '@/types/questionnaire';
import TirzepatideBundledCustomPlan from '@/components/screens/Question/components/TirzepatideBundledCustomPlan';
import SemaglutideBundledCustomPlan from '../SemaglutideBundledCustomPlan';

interface BundledCustomPlanProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const BundledCustomPlan = ({ question, nextPage }: BundledCustomPlanProps) => {
  const potentialInsurance = useSelector(
    store => store.intake.potentialInsurance
  );

  if (potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED) {
    return (
      <TirzepatideBundledCustomPlan question={question} nextPage={nextPage} />
    );
  }

  if (
    potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED ||
    SpecificCareOption.WEIGHT_LOSS
  ) {
    return (
      <SemaglutideBundledCustomPlan question={question} nextPage={nextPage} />
    );
  }

  throw new Error(`This bundled plan is not setup yet`);
};

export default BundledCustomPlan;

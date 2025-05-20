import dynamic from 'next/dynamic';
import {
  CodedAnswer,
  FreeTextAnswer,
} from '@/context/AppContext/reducers/types/answer';
import { Questionnaire, QuestionWithName } from '@/types/questionnaire';
import NonGlp1Final from '../NonGlp1Final';
import WorkingTogether from '../WorkingTogether';
import AsyncMentalHealthTreatment from '../AsyncMentalHealthTreatment';
import PhotoFace from '../PhotoFace';
import SubmitNonGlp1MedsRequest from '../SubmitNonGlp1MedsRequest';
import SideEffectLog from '@/components/screens/Question/components/SideEffectLog';
import EnclomipheneTreatmentSelect from '../EnclomipheneTreatmentSelect';
import PreWorkoutTreatmentSelect from '../PreWorkout/PreWorkoutTreatmentSelect';
import AtHomeLab from '../AtHomeLab';
import LoadingResults from '@/components/shared/LoadingResults';
import AsyncMentalHealthDosages from '../AsyncMentalHealthDosages';
import AmhMessageEffect from '../MessageEffect/AmhMessageEffect';
import PreWorkoutPerformanceProtocol from '../PreWorkout/PerformanceProtocol';
import PreWorkoutBloodPressure from '../PreWorkout/PreWorkoutBloodPressure';
import EDUsage from '../EDUsage';
import EDTreatmentsV2 from '../EDTreatments/EDTreatmentsV2';
import FemaleHairLossMessage from '../FemaleHairLoss/FemaleHairLossMessage';
import FemaleHairLossReview from '../FemaleHairLoss/FemaleHairLossReview';
import FemaleHairLossBeforeAfter from '../FemaleHairLoss/FemaleHairLossBeforeAfter';
import FemaleHairLossWhatNext from '../FemaleHairLoss/FemaleHairLossWhatNext';
import FemaleHairLossSelect from '../FemaleHairLoss/FemaleHairLossSelect';
import FemaleHairLossInfo from '../FemaleHairLoss/FemaleHairLossInfo';
import FemaleHairLossTreatmentSelect from '../FemaleHairLoss/FemaleHairLossTreatmentSelect';
import EDHairLossTreatmentSelect from '../EDHairLoss/EDHairLossTreatmentSelect';
import LabOrBloodTests from '../LabOrBloodTests';
import WeightGoal from '../WeightGoal';
import WeightGraph from '../WeightGraph';
import Glp1Explanation from '../Glp1Explanation';
import PricingOptions from '../PricingOptions';
import WeightLossPreference from '../WeightLossPreference';
import WeightLossPay from '../WeightLossPay';
import WeightLossTreatment from '../WeightLossTreatment';
import CompoundSemExplanation from '../CompoundSemExplanation';
import InsurancePlan from '../InsurancePlan';
import BundledPreference from '../BundledPreference';
import SkincareWhatNext from '../SkincareWhatNext';
import OralSemaglutidePlanDetails from '@/components/shared/OralSemaglutidePlanDetails';
import InsuranceInformation from '../InsuranceInformation';
import PharmacySelection from '../PharmacySelection';
import EDHairLossSelect from '../EDHairLoss/EDHairLossSelect';
import EDHairLossImageQuestion from '../EDHairLoss/EDHairLossImageQuestion';
import NowWhat from '../NowWhat';

const SSNVerification = dynamic(() => import('../SSNVerification'));
const CrossCheckVerification = dynamic(
  () => import('../CrossCheckVerification')
);

const SingleChoice = dynamic(() => import('../Choice/components/SingleChoice'));

const AddMentalHealthCoach = dynamic(() => import('../AddMentalHealthCoach'), {
  ssr: false,
});
const AddWeightLossCoach = dynamic(() => import('../AddWeightLossCoach'), {
  ssr: false,
});
const AddWeightLossCoachAccess = dynamic(
  () => import('../AddWeightLossCoachAccess'),
  { ssr: false }
);
const AnxietyDepressionResults = dynamic(
  () => import('../AnxietyDepressionResults'),
  { ssr: false }
);
const AsyncWhatHappensNext = dynamic(() => import('../AsyncWhatHappensNext'), {
  ssr: false,
});
const AsyncWhatHappensNextV2 = dynamic(
  () => import('../AsyncWhatHappensNextV2'),
  {
    ssr: false,
  }
);
const BirthControlTreatmentSelect = dynamic(
  () => import('../BirthControlTreatmentSelect'),
  { ssr: false }
);
const BirthControlTreatmentSelectV2 = dynamic(
  () => import('../BirthControlTreatmentSelectV2'),
  { ssr: false }
);
const BloodPressure = dynamic(() => import('../BloodPressure'), { ssr: false });
const Choice = dynamic(() => import('../Choice'), { ssr: false });
const EDDosage = dynamic(() => import('../EDDosage'), { ssr: false });
const EDFrequency = dynamic(() => import('../EDFrequency'), { ssr: false });
const EDTreatments = dynamic(() => import('../EDTreatments'), { ssr: false });
const EmergencyContraception = dynamic(
  () => import('../EmergencyContraception'),
  { ssr: false }
);
const FreeTextQuestion = dynamic(() => import('../FreeTextQuestion'), {
  ssr: false,
});
const HairLossImageUpload = dynamic(() => import('../HairLossImageUpload'), {
  ssr: false,
});
const HairLossTreatments = dynamic(() => import('../HairLossTreatments'), {
  ssr: false,
});
const HairLossTreatmentAddOn = dynamic(
  () => import('../HairLossTreatments/HairLossTreatmentAddOn'),
  { ssr: false }
);
const HeightWeight = dynamic(() => import('../HeightWeight'), { ssr: false });
const GoalWeight = dynamic(() => import('../GoalWeight'), { ssr: false });
const Weight = dynamic(() => import('../Weight'), { ssr: false });
const ImageChoice = dynamic(() => import('../ImageChoice'), { ssr: false });
const InstantVisitStart = dynamic(() => import('../InstantVisitStart'), {
  ssr: false,
});
const MedicalHistory = dynamic(() => import('../MedicalHistory'), {
  ssr: false,
});
const MentalHealthCoachingAddon = dynamic(
  () => import('../MentalHealthCoachingAddon'),
  { ssr: false }
);
const MentalHealthZealthyProgram = dynamic(
  () => import('../MentalHealthZealthyProgram'),
  { ssr: false }
);
const NumberQuestion = dynamic(() => import('../NumberQuestion'), {
  ssr: false,
});
const QuestionnaireChoice = dynamic(() => import('../QuestionnaireChoice'), {
  ssr: false,
});
const SelectVisitType = dynamic(() => import('../SelectVisitType'), {
  ssr: false,
});
const SkinTreatment = dynamic(() => import('../SkinTreatment'), { ssr: false });
const SuicideDisclaimer = dynamic(() => import('../SuicideDisclaimer'), {
  ssr: false,
});
const VisitConfirmation = dynamic(() => import('../VisitConfirmation'), {
  ssr: false,
});
const WeightLossEligible = dynamic(() => import('../WeightLossEligible'), {
  ssr: false,
});
const WeightLossGovernmentInsurance = dynamic(
  () => import('../WeightLossGovernmentInsurance'),
  { ssr: false }
);
const WeightLossIneligible = dynamic(() => import('../WeightLossIneligible'), {
  ssr: false,
});
const WeightLossAgreement = dynamic(() => import('../WeightLossAgreement'), {
  ssr: false,
});
const AnalyzeWeightLossResults = dynamic(
  () => import('../AnalyzeWeightLossResults'),
  { ssr: false }
);
const ZealthyProviderSchedule = dynamic(
  () => import('../ZealthyProviderSchedule'),
  {
    ssr: false,
  }
);
const HonestyPrivacy = dynamic(() => import('../HonestyPrivacy'), {
  ssr: false,
});
const PrepInsurance = dynamic(() => import('../PrepInsurance'), {
  ssr: false,
});
const ImageScreen = dynamic(() => import('../Image'), { ssr: false });
const TransitionScreen = dynamic(() => import('../TransitionScreen'), {
  ssr: false,
});

const WeightLossFreeConsultInsurance = dynamic(
  () => import('../WeightLossFreeConsultInsurance'),
  { ssr: false }
);
const FreeConsultSelection = dynamic(() => import('../FreeConsultSelection'), {
  ssr: false,
});
const FreeConsultMedicationSelection = dynamic(
  () => import('../FreeConsultMedicationSelection'),
  {
    ssr: false,
  }
);
const FreeConsultMedicationSelectionPeriod = dynamic(
  () => import('../FreeConsultMedicationSelectionPeriod'),
  {
    ssr: false,
  }
);
const MenopauseTreatmentSelect = dynamic(
  () => import('../MenopauseTreatmentSelect/MenopauseTreatmentSelect'),
  { ssr: false }
);

interface QuestionBodyProps {
  question: QuestionWithName;
  content?: string;
  questionnaire: Questionnaire;
  answer: CodedAnswer[] | FreeTextAnswer[];
  onClick: (nextPage?: string) => void;
  nextPage: (nextPage?: string) => void;
}

const QuestionBody = ({
  question,
  questionnaire,
  content,
  answer,
  onClick,
  nextPage,
}: QuestionBodyProps) => {
  return (
    <>
      {question.type === 'transition' ? (
        <TransitionScreen nextPath={nextPage} question={question} />
      ) : null}
      {/* rename hair-loss-photo type to attachment */}
      {question.type === 'hair-loss-photo' ? (
        <HairLossImageUpload
          question={question}
          nextPath={nextPage}
          questionnaire={questionnaire}
        />
      ) : null}
      {question.type === 'photo-face' ? (
        <PhotoFace question={question} nextPath={nextPage} />
      ) : null}
      {question.type === 'image-choice' ? (
        <ImageChoice
          questionnaire={questionnaire}
          question={question}
          answer={answer as CodedAnswer[]}
        />
      ) : null}
      {question.type === 'honesty-privacy' ? (
        <HonestyPrivacy question={question} nextPage={nextPage} />
      ) : null}
      {question.type === 'ssn-verification' ? (
        <SSNVerification nextPage={nextPage} />
      ) : null}

      {question.type === 'crosscheck-verification' ? (
        <CrossCheckVerification nextPage={nextPage} />
      ) : null}

      {question.type === 'mental-health-zealthy-program' ? (
        <MentalHealthZealthyProgram />
      ) : null}
      {question.type === 'provider-schedule' ? (
        <ZealthyProviderSchedule onSelect={nextPage} />
      ) : null}
      {question.type === 'number' ? (
        <NumberQuestion
          question={question}
          answer={answer as FreeTextAnswer[]}
        />
      ) : null}
      {question.type === 'hair-loss-treatment-select' ? (
        <HairLossTreatments question={question} />
      ) : null}
      {question.type === 'hair-loss-treatment-add-on' ? (
        <HairLossTreatmentAddOn question={question} />
      ) : null}
      {question.type === 'ed-treatment-select' ? (
        <EDTreatments question={question} onNext={nextPage} />
      ) : null}

      {question.type === 'ed-treatment-select-v2' ? (
        <EDTreatmentsV2 question={question} onNext={nextPage} />
      ) : null}

      {question.type === 'enclomiphene-treatment-select' ? (
        <EnclomipheneTreatmentSelect
          question={question}
          questionnaire={questionnaire}
          onNext={nextPage}
        />
      ) : null}

      {question.type === 'at-home-lab' ? (
        <AtHomeLab
          question={question}
          questionnaire={questionnaire}
          // answer={answer as CodedAnswer[]}
          onNext={nextPage}
        />
      ) : null}

      {question.type === 'lab-or-blood-tests' ? (
        <LabOrBloodTests nextPage={nextPage} />
      ) : null}

      {question.type === 'skin-treatment' ? (
        <SkinTreatment question={question} />
      ) : null}

      {question.type === 'oral-semaglutide-plan' ? (
        <OralSemaglutidePlanDetails />
      ) : null}

      {question.type === 'amh-message-effect' ? <AmhMessageEffect /> : null}

      {question.type === 'ed-dosage-select' ? (
        <EDDosage question={question} />
      ) : null}

      {question.type === 'ed-usage-select' ? (
        <EDUsage
          question={question}
          questionnaire={questionnaire}
          onNext={nextPage}
        />
      ) : null}

      {question.type === 'ed-quantity-select' ? (
        <EDFrequency question={question} />
      ) : null}

      {question.type === 'text' ? (
        <FreeTextQuestion question={question} />
      ) : null}
      {question.type === 'non-glp1-final' ? (
        <NonGlp1Final nextPage={nextPage} />
      ) : null}
      {question.type === 'submit-non-glp1-meds-request' ? (
        <SubmitNonGlp1MedsRequest />
      ) : null}
      {question.type === 'height-weight' ? (
        <HeightWeight question={question} onClick={nextPage} />
      ) : null}
      {question.type === 'goal-weight' ? (
        <GoalWeight question={question} onClick={nextPage} />
      ) : null}
      {question.type === 'weight' ? (
        <Weight
          questionnaire={questionnaire}
          question={question}
          onClick={nextPage}
        />
      ) : null}

      {question.type === 'blood-pressure' ? (
        <BloodPressure
          question={question}
          answer={answer as FreeTextAnswer[]}
        />
      ) : null}

      {question.type === 'medical-history' ? (
        <MedicalHistory
          question={question}
          answer={answer as FreeTextAnswer[]}
        />
      ) : null}

      {question.type === 'questionnaire-choice' ? (
        <QuestionnaireChoice
          question={question}
          questionnaire={questionnaire}
          answer={answer as CodedAnswer[]}
        />
      ) : null}

      {question.type === 'choice' ? (
        <SingleChoice
          questionnaire={questionnaire}
          question={question}
          answer={answer as CodedAnswer[]}
          nextPage={nextPage}
        />
      ) : null}
      {question.type === 'side-effects' ? <SideEffectLog /> : null}
      {['multiple-choice', 'choice-details'].includes(question.type) ? (
        <Choice
          questionnaire={questionnaire}
          question={question}
          answer={answer as CodedAnswer[]}
          onClick={onClick}
        />
      ) : null}

      {question.type === 'prep-insurance' ? (
        <PrepInsurance
          question={question}
          questionnaire={questionnaire}
          answer={answer as CodedAnswer[]}
        />
      ) : null}

      {question.type === 'ed-hl-treatment-select' ? (
        <EDHairLossTreatmentSelect
          question={question}
          questionnaire={questionnaire}
          onNext={nextPage}
        />
      ) : null}

      {question.type === 'suicide-disclaimer' ? (
        <SuicideDisclaimer showDisclaimer />
      ) : null}

      {question.type === 'suicide-alarm' ? <SuicideDisclaimer /> : null}

      {question.type === 'add-mental-coaching' ? (
        <AddMentalHealthCoach onNext={nextPage} questionnaire={questionnaire} />
      ) : null}

      {question.type === 'mental-health-addon-payment' ? (
        <MentalHealthCoachingAddon question={question} onNext={nextPage} />
      ) : null}

      {question.type === 'add-weight-coaching' ? (
        <AddWeightLossCoach onNext={onClick} />
      ) : null}
      {question.type === 'add-weight-coaching-access' ? (
        <AddWeightLossCoachAccess onNext={nextPage} />
      ) : null}
      {question.type === 'weight-loss-eligibility' ? (
        <WeightLossEligible
          onNext={nextPage}
          question={question}
          questionnaire={questionnaire}
        />
      ) : null}
      {question.type === 'weight-coaching-agreement' ? (
        <WeightLossAgreement onNext={nextPage} />
      ) : null}
      {question.type === 'weight-loss-ineligible' ? (
        <WeightLossIneligible />
      ) : null}
      {question.type === 'weight-government-insurance' ? (
        <WeightLossGovernmentInsurance onNext={nextPage} />
      ) : null}
      {question.type === 'analyze-weight-loss-results' ? (
        <AnalyzeWeightLossResults onNext={nextPage} question={question} />
      ) : null}
      {question.type === 'birth-control-treatment-select' ? (
        <BirthControlTreatmentSelect
          question={question}
          questionnaire={questionnaire}
        />
      ) : null}
      {question.type === 'birth-control-treatment-select-v2' ? (
        <BirthControlTreatmentSelectV2
          question={question}
          questionnaire={questionnaire}
          onNext={nextPage}
        />
      ) : null}
      {question.type === 'emergency-contraception' ? (
        <EmergencyContraception
          questionnaire={questionnaire}
          question={question}
          answer={answer as CodedAnswer[]}
        />
      ) : null}

      {question.type === 'mental-health-result' ? (
        <AnxietyDepressionResults />
      ) : null}

      {question.type === 'select-visit-type' ? (
        <SelectVisitType nextPage={nextPage} />
      ) : null}

      {question.type === 'ilv-start' ? (
        <InstantVisitStart nextPage={nextPage} />
      ) : null}

      {question.type === 'confirmation' ? <VisitConfirmation /> : null}
      {question.type === 'async-what-happens-next' ? (
        <AsyncWhatHappensNext />
      ) : null}
      {question.type === 'async-what-happens-next-v2' ? (
        <AsyncWhatHappensNextV2 />
      ) : null}

      {question.type === 'skincare-what-next' ? <SkincareWhatNext /> : null}

      {question.type === 'async-results' ? (
        <LoadingResults nextPage={nextPage} />
      ) : null}

      {question.type === 'working-together' ? <WorkingTogether /> : null}
      {question.type === 'async-mental-health-treatment' ? (
        <AsyncMentalHealthTreatment />
      ) : null}

      {question.type === 'async-mental-health-dosages' ? (
        <AsyncMentalHealthDosages
          question={question}
          questionnaire={questionnaire}
          answer={answer as CodedAnswer[]}
          nextPage={nextPage}
        />
      ) : null}

      {question.type === 'performance-protocol' ? (
        <PreWorkoutPerformanceProtocol />
      ) : null}

      {question.type === 'pre-workout-blood-pressure' ? (
        <PreWorkoutBloodPressure question={question} nextPage={nextPage} />
      ) : null}

      {question.type === 'pre-workout-treatment-select' ? (
        <PreWorkoutTreatmentSelect
          question={question}
          questionnaire={questionnaire}
          onNext={nextPage}
        />
      ) : null}

      {question.type === 'hair-loss-message' ? <FemaleHairLossMessage /> : null}

      {question.type === 'hair-loss-review' ? <FemaleHairLossReview /> : null}

      {question.type === 'hair-loss-before-after' ? (
        <FemaleHairLossBeforeAfter question={question} />
      ) : null}

      {question.type === 'hair-loss-what-next' ? (
        <FemaleHairLossWhatNext />
      ) : null}

      {question.type === 'female-hair-loss-select' ? (
        <FemaleHairLossSelect
          question={question}
          questionnaire={questionnaire}
          nextPage={nextPage}
        />
      ) : null}

      {question.type === 'female-hair-loss-info' ? (
        <FemaleHairLossInfo question={question} />
      ) : null}

      {question.type === 'female-hair-loss-treatment-select' ? (
        <FemaleHairLossTreatmentSelect
          question={question}
          nextPage={nextPage}
        />
      ) : null}

      {question.type === 'ed-hl-select' ? (
        <EDHairLossSelect
          question={question}
          questionnaire={questionnaire}
          nextPage={nextPage}
        />
      ) : null}

      {question.type === 'ed-hl-image-question' && (question as any).content ? (
        <EDHairLossImageQuestion content={(question as any).content} />
      ) : null}

      {question.type === 'image' && (question as any).content ? (
        <ImageScreen content={(question as any).content} />
      ) : null}

      {question.type === 'weight-goal' ? (
        <WeightGoal question={question} nextPage={nextPage} />
      ) : null}

      {question.type === 'weight-graph' ? (
        <WeightGraph question={question} nextPage={nextPage} />
      ) : null}
      {question.type === 'glp1-explanation' ? (
        <Glp1Explanation nextPage={nextPage} />
      ) : null}
      {question.type === 'pricing-options' ? (
        <PricingOptions nextPage={nextPage} question={question} />
      ) : null}

      {question.type === 'weight-loss-preference' ? (
        <WeightLossPreference nextPage={nextPage} />
      ) : null}

      {question.type === 'weight-loss-pay' ? (
        <WeightLossPay nextPage={nextPage} />
      ) : null}

      {question.type === 'now-what' ? <NowWhat nextPage={nextPage} /> : null}

      {question.type === 'weight-loss-treatment' ? (
        <WeightLossTreatment nextPage={nextPage} />
      ) : null}
      {question.type === 'compound-sem-explanation' ? (
        <CompoundSemExplanation nextPage={nextPage} />
      ) : null}
      {question.type === 'insurance-plan' ? (
        <InsurancePlan nextPage={nextPage} question={question} />
      ) : null}
      {question.type === 'bundled-choice' ? (
        <BundledPreference nextPage={nextPage} question={question} />
      ) : null}
      {question.type === 'insurance-information' ? (
        <InsuranceInformation nextPage={nextPage} />
      ) : null}
      {question.type === 'pharmacy-select' ? (
        <PharmacySelection nextPage={nextPage} />
      ) : null}
      {question.type === 'weight-loss-free-consult-insurance' ? (
        <WeightLossFreeConsultInsurance nextPage={nextPage} />
      ) : null}
      {question.type === 'free-consult-selection' ? (
        <FreeConsultSelection onClick={onClick} question={question} />
      ) : null}
      {question.type === 'free-consult-medication-selection' ? (
        <FreeConsultMedicationSelection
          nextPage={nextPage}
          question={question}
        />
      ) : null}
      {question.type === 'free-consult-medication-selection-period' ? (
        <FreeConsultMedicationSelectionPeriod nextPage={nextPage} />
      ) : null}
      {question.type === 'menopause-treatment-select' ? (
        <MenopauseTreatmentSelect
          question={question}
          questionnaire={questionnaire}
          nextPage={nextPage}
        />
      ) : null}
    </>
  );
};

export default QuestionBody;

import { Questionnaire, QuestionnaireName } from '@/types/questionnaire';
import EDdev from './development/ed-dev.json';
import EDPrescriptionRenewal from './shared/ed-renewal.json';
import GAD7dev from './development/gad-7-dev.json';
import PHQ9dev from './development/phq-9-dev.json';
import HairLossDev from './development/hair-loss-dev.json';
import FemaleHairLoss from './shared/hair-loss-f.json';
import HairLossFemalePrescriptionRenewal from './shared/hair-loss-female-renewal.json';
import WeightLossDev from './development/weight-loss-dev.json';
import WeightLossDevV2 from './shared/weight-loss-4314.json';
import WeightLossDevEsp from './shared/weight-loss-esp.json';
import WeightLossPost from './shared/weight-loss-post.json';
import WeightLossPostV2 from './shared/weight-loss-post-v2.json';
import WeightLossMedical from './shared/weight-loss-medical.json';
import WeightLossPreference from './shared/weight-loss-preference.json';
import WeightLossPay from './shared/weight-loss-pay.json';
import WeightLossPriorAuth from './shared/weight-loss-prior-auth.json';
import WeightLossBillOfRights from './shared/weight-loss-bill-of-rights.json';
import WeightLossTreatment from './shared/weight-loss-treatment.json';
import BirthControlDev from './development/birth-control-dev.json';
import BirthControlRenewal from './shared/birth-control-renewal.json';
import WeightCoaching from './shared/weight-loss-coaching.json';
import WeightCoachingSpanish from './shared/weight-loss-coaching-esp.json';
import MentalAddCoachingPlan from './shared/mental-health-add-coaching-plan.json';
import MentalScheduleCoach from './shared/mental-health-schedule-coach.json';
import WeightScheduleCoach from './shared/weight-loss-schedule-coach.json';
import MentalHealthTreatmentDev from './development/mental-health-treatment-dev.json';
import MentalCheckinResults from './shared/mental-health-checkin-results.json';
import MentalFollowupResults from './shared/mental-health-followup-results.json';
import PharmacyPreference from './shared/pharmacy-preference.json';
import MedicalHistoryDev from './development/general-intake-dev.json';
import HeightWeightDev from './development/height-weight-dev.json';
import BloodPressureDev from './development/blood-pressure-dev.json';
import BirthControlUpsellDev from './development/birth-control-upsell-dev.json';
import DrugsAlcoholTobaccoDev from './development/drugs-alcohol-tobacco-dev.json';
import MentalHealthProviderSchedule from './shared/mental-health-provider-schedule.json';
import MentalHealthAddScheduleCoach from './shared/mental-health-add-schedule-coach.json';
import PHQ9devcheckin from './development/phq-9-checkin-dev.json';
import PHQ9devfollowup from './development/phq-9-followup-dev.json';
import DeliveryAddress from './shared/delivery-address.json';
import InsuranceInformation from './shared/insurance-information.json';
import LabOrBloodTests from './shared/lab-or-blood-tests.json';
import ResponsesReviewed from './shared/responses-reviewed.json';
import MobileDownload from './shared/mobile-download.json';
import IdentityVerification from './shared/identity-verification.json';
import PhotoIdentification from './shared/photo-identification.json';
import ProviderVisitConfirmation from './shared/provider-visit-confirmation.json';
import InstantLiveVisitStart from './shared/instant-live-visit-start.json';
import InstantLiveVisitEnd from './shared/instant-live-visit-end.json';
import AsyncWhatHappensNext from './shared/async-what-happens-next.json';
import AsyncWhatHappensNextV2 from './shared/async-what-happens-next-v2.json';
import SkincareWhatNext from './shared/skincare-what-next.json';
import ThankYouSync from './shared/thank-you.json';
import AsyncMedicalHistory from './development/async-medical-history-dev.json';
import UnableConfirmScheduledAppointment from './shared/unable-confirm-scheduled-appointment.json';
import UnableConfirmWalkedInAppointment from './shared/unable-confirm-walkedin-appointment.json';
import CheckoutSuccess from './shared/checkout-success.json';
import WeightLossCheckoutSuccess from './shared/weight-loss-checkout-success.json';
import WeightLossCheckoutSuccessSpanish from './shared/weight-loss-checkout-success-esp.json';
import WeightLossAccessPortal from './shared/weight-loss-access-portal.json';
import PsychiatryPostCheckoutIntro from './shared/psychiatry-postcheckout-intro.json';
import AcneTreatment from './shared/acne-treatment-v2.json';
import AntiAgingTreatment from './development/anti-aging-treatment.json';
import MelasmaTreatment from './development/melasma-treatment.json';
import RosaceaTreatment from './development/rosacea-treatment.json';
import SkincareIntro from './shared/skincare-intro.json';
import AcneIntro from './shared/acne-intro.json';
import RosaceaIntro from './shared/rosacea-intro.json';
import MelasmaIntro from './shared/melasma-intro.json';
import AntiAgingIntro from './shared/anti-aging-intro.json';
import Enclomiphene from './development/enclomiphene-dev.json';
import EnclomiphenePrescriptionRenewal from './shared/enclomiphene-prescription-renewal.json';
import WeightLossRefill from './development/weight-loss-refill-dev.json';
import WeightLossRefillAdditional from './shared/weight-loss-refill-additional.json';
import WeightLossBundleRefill from './development/weight-loss-bundle-refill-dev.json';
import WeightLossCompoundRefill from './shared/weight-loss-compound-refill.json';
import WeightLossCompoundQuarterlyRefill from './shared/weight-loss-compound-quarterly-refill.json';
import WeightLossQuarterlyCheckin from './shared/weight-loss-quarterly-checkin.json';
import WeightLossCompoundRefillRecurring from './shared/weight-loss-compound-refill-recurring.json';
import WeightLossCompoundRefillRecurringAdditional from './shared/weight-loss-compound-recurring-refill-additional.json';
import PrimaryCare from './shared/primary-care.json';
import Nonglp1Meds from './development/non-glp1-meds-dev.json';
import NonGLP1MedsRequest from './shared/non-glp1-meds-request.json';
import AsyncMentalHealthInto from './shared/async-mental-health-intro.json';
import AsyncMentalHealthResults from './shared/async-mental-health-results.json';
import AsyncMentalHealthMedQuestions from './shared/async-mental-health-med-questions.json';
import AsyncMentalHealthIdVerification from './shared/async-mental-health-id-verification.json';
import ConsultationSelection from './shared/consultation-selection.json';
import SideEffects from './shared/side-effects.json';
import WeightLossAccessV2 from './shared/weight-loss-access-v2.json';
import HairLossPost from './shared/hair-loss-post.json';
import HairLossMalePrescriptionRenewal from './shared/hair-loss-male-renewal.json';
import WeightLossTreatmentBundled from './shared/weight-loss-bundled-treatment.json';
import VouchedVerification from './shared/vouched-verification.json';
import CompleteVisit from './shared/complete-visit.json';
import WeightLossBundleReorder from './shared/weight-loss-bundle-reorder.json';
import BMS from './shared/bipolar-and-mania-screener.json';
import BundledFlow from './shared/weight-loss-bundled.json';
import BundledFlowPost from './shared/weight-loss-post-bundled.json';
import FullBodyPhoto from './shared/weight-loss-full-body-photo.json';
import AsyncMentalHealthPreSignup from './shared/async-mental-health-pre-signup.json';
import PreWorkoutPreSignup from './shared/pre-workout-pre-signup.json';
import PreWorkoutPrescriptionRenewal from './shared/pre-workout-prescription-renewal.json';
import PreWorkout from './shared/pre-workout.json';
import AsyncMentalHealthPost from './shared/async-mental-health-post.json';
import LiveProviderVisit from './shared/live-provider-visit.json';
import FullBodyPhotoGeneric from './shared/full-body-photo.json';
import EDHardiesFlow from './shared/ed-hardies.json';
import SkincareCheckoutSuccess from './shared/skincare-checkout-success.json';
import SkinType from './shared/skin-type.json';
import AdditionalPaQuestions from './shared/additional-pa.json';
import WeightLoss4758 from './shared/weight-loss-4758.json';
import WeightLoss4758Post from './shared/weight-loss-4758-post.json';
import WeightLossPostOralSemaglutideBundled from './shared/weight-loss-post-oral-semaglutide-bundled.json';
import WeightLossBundled4758 from './shared/weight-loss-bundled-4758.json';
import PersonalizedPsyciatryRefill from './shared/refill-request-personalized-psychiatry.json';
import Prep from '@/questionnaires/shared/prep.json';
import WeightLossContinue from './shared/weight-loss-continue.json';
import Sleep from '@/questionnaires/shared/sleep.json';
import SleepPrescriptionRenewal from './shared/sleep-renewal.json';
import WeightLossFreeConsult from '@/questionnaires/shared/weight-loss-free-consult.json';
import EDHL from './shared/ed-hl.json';
import EDHLPrescriptionRenewal from './shared/ed-hl-prescription-renewal.json';
import NowWhat from '@/questionnaires/shared/now-what.json';
import NowWhat7380 from '@/questionnaires/shared/now-what-7380.json';
import AB7752 from '@/questionnaires/shared/ab7752-var1.json';
import Menopause from './shared/menopause.json';
import MenopauseRefill from './shared/menopause-refill.json';

export const devMapping: { [key in QuestionnaireName]: Questionnaire | null } =
  {
    ed: EDdev as unknown as Questionnaire,
    'ed-prescription-renewal':
      EDPrescriptionRenewal as unknown as Questionnaire,
    'primary-care': PrimaryCare as unknown as Questionnaire,
    'gad-7': GAD7dev as unknown as Questionnaire,
    'bipolar-and-mania-screener': BMS as unknown as Questionnaire,
    'phq-9': PHQ9dev as unknown as Questionnaire,
    'phq-9-checkin': PHQ9devcheckin as unknown as Questionnaire,
    'phq-9-followup': PHQ9devfollowup as unknown as Questionnaire,
    'hair-loss': HairLossDev as unknown as Questionnaire,
    'weight-loss': WeightLossDev as unknown as Questionnaire,
    'weight-loss-esp': WeightLossDevEsp as unknown as Questionnaire,
    'weight-loss-v2': WeightLossDevV2 as unknown as Questionnaire,
    'weight-loss-post': WeightLossPost as unknown as Questionnaire,
    'weight-loss-post-v2': WeightLossPostV2 as unknown as Questionnaire,
    'weight-loss-medical': WeightLossMedical as unknown as Questionnaire,
    'weight-loss-preference': WeightLossPreference as unknown as Questionnaire,
    'weight-loss-pay': WeightLossPay as unknown as Questionnaire,
    'weight-loss-prior-auth': WeightLossPriorAuth as unknown as Questionnaire,
    'weight-loss-treatment': WeightLossTreatment as unknown as Questionnaire,
    'weight-loss-bundled-treatment':
      WeightLossTreatmentBundled as unknown as Questionnaire,
    'consultation-selection': ConsultationSelection as unknown as Questionnaire,
    'birth-control': BirthControlDev as unknown as Questionnaire,
    'birth-control-prescription-renewal':
      BirthControlRenewal as unknown as Questionnaire,
    'weight-loss-coaching-esp':
      WeightCoachingSpanish as unknown as Questionnaire,
    'weight-loss-coaching': WeightCoaching as unknown as Questionnaire,
    'mental-health-add-coaching-plan':
      MentalAddCoachingPlan as unknown as Questionnaire,
    'mental-health-schedule-coach':
      MentalScheduleCoach as unknown as Questionnaire,
    'weight-loss-schedule-coach':
      WeightScheduleCoach as unknown as Questionnaire,
    'mental-health-treatment':
      MentalHealthTreatmentDev as unknown as Questionnaire,
    'async-mental-health-results':
      AsyncMentalHealthResults as unknown as Questionnaire,

    'mental-health-checkin-results':
      MentalCheckinResults as unknown as Questionnaire,
    'mental-health-followup-results':
      MentalFollowupResults as unknown as Questionnaire,
    'pharmacy-preference': PharmacyPreference as unknown as Questionnaire,
    'general-intake': MedicalHistoryDev as unknown as Questionnaire,
    'height-weight': HeightWeightDev as unknown as Questionnaire,
    'blood-pressure': BloodPressureDev as unknown as Questionnaire,
    'birth-control-upsell': BirthControlUpsellDev as unknown as Questionnaire,
    'drugs-alcohol-tobacco': DrugsAlcoholTobaccoDev as unknown as Questionnaire,
    'mental-health-provider-schedule':
      MentalHealthProviderSchedule as unknown as Questionnaire,
    'mental-health-add-schedule-coach':
      MentalHealthAddScheduleCoach as unknown as Questionnaire,
    'delivery-address': DeliveryAddress as unknown as Questionnaire,
    'photo-identification': PhotoIdentification as unknown as Questionnaire,
    'vouched-verification': VouchedVerification as unknown as Questionnaire,
    'identity-verification': IdentityVerification as unknown as Questionnaire,
    'insurance-information': InsuranceInformation as unknown as Questionnaire,
    'lab-or-blood-tests': LabOrBloodTests as unknown as Questionnaire,
    'responses-reviewed': ResponsesReviewed as unknown as Questionnaire,
    'mobile-download': MobileDownload as unknown as Questionnaire,
    'provider-visit-confirmation':
      ProviderVisitConfirmation as unknown as Questionnaire,
    'instant-live-visit-start':
      InstantLiveVisitStart as unknown as Questionnaire,
    'instant-live-visit-end': InstantLiveVisitEnd as unknown as Questionnaire,
    'async-what-happens-next': AsyncWhatHappensNext as unknown as Questionnaire,
    'async-what-happens-next-v2':
      AsyncWhatHappensNextV2 as unknown as Questionnaire,
    'skincare-what-next': SkincareWhatNext as unknown as Questionnaire,
    'async-mental-health-pre-signup':
      AsyncMentalHealthPreSignup as unknown as Questionnaire,
    'async-mental-health-post':
      AsyncMentalHealthPost as unknown as Questionnaire,
    'thank-you': ThankYouSync as unknown as Questionnaire,
    'async-medical-history': AsyncMedicalHistory as unknown as Questionnaire,
    'unable-confirm-scheduled-appointment':
      UnableConfirmScheduledAppointment as unknown as Questionnaire,
    'unable-confirm-walkedin-appointment':
      UnableConfirmWalkedInAppointment as unknown as Questionnaire,
    'checkout-success': CheckoutSuccess as unknown as Questionnaire,
    'weight-loss-checkout-success':
      WeightLossCheckoutSuccess as unknown as Questionnaire,
    'weight-loss-checkout-success-esp':
      WeightLossCheckoutSuccessSpanish as unknown as Questionnaire,
    'acne-treatment-v2': AcneTreatment as unknown as Questionnaire,
    'anti-aging-treatment': AntiAgingTreatment as unknown as Questionnaire,
    'psychiatry-postcheckout-intro':
      PsychiatryPostCheckoutIntro as unknown as Questionnaire,
    'melasma-treatment': MelasmaTreatment as unknown as Questionnaire,
    'rosacea-treatment': RosaceaTreatment as unknown as Questionnaire,
    'side-effects': SideEffects as unknown as Questionnaire,
    'acne-intro': AcneIntro as unknown as Questionnaire,
    'rosacea-intro': RosaceaIntro as unknown as Questionnaire,
    'melasma-intro': MelasmaIntro as unknown as Questionnaire,
    'anti-aging-intro': AntiAgingIntro as unknown as Questionnaire,
    'skincare-intro': SkincareIntro as unknown as Questionnaire,
    'weight-loss-refill': WeightLossRefill as unknown as Questionnaire,
    'weight-loss-refill-additional':
      WeightLossRefillAdditional as unknown as Questionnaire,
    'weight-loss-bundle-refill':
      WeightLossBundleRefill as unknown as Questionnaire,
    'weight-loss-compound-refill':
      WeightLossCompoundRefill as unknown as Questionnaire,
    'weight-loss-compound-refill-recurring':
      WeightLossCompoundRefillRecurring as unknown as Questionnaire,
    'weight-loss-compound-refill-recurring-additional':
      WeightLossCompoundRefillRecurringAdditional as unknown as Questionnaire,
    'weight-loss-bundle-reorder':
      WeightLossBundleReorder as unknown as Questionnaire,
    'weight-loss-compound-quarterly-refill':
      WeightLossCompoundQuarterlyRefill as unknown as Questionnaire,
    'weight-loss-quarterly-checkin':
      WeightLossQuarterlyCheckin as unknown as Questionnaire,
    'weight-loss-access-portal':
      WeightLossAccessPortal as unknown as Questionnaire,
    'weight-loss-access-v2': WeightLossAccessV2 as unknown as Questionnaire,
    'weight-loss-bill-of-rights':
      WeightLossBillOfRights as unknown as Questionnaire,
    'non-glp1-meds': Nonglp1Meds as unknown as Questionnaire,
    'non-glp1-meds-request': NonGLP1MedsRequest as unknown as Questionnaire,
    'async-mental-health-intro':
      AsyncMentalHealthInto as unknown as Questionnaire,
    'async-mental-health-med-questions':
      AsyncMentalHealthMedQuestions as unknown as Questionnaire,
    'async-mental-health-id-verification':
      AsyncMentalHealthIdVerification as unknown as Questionnaire,
    'hair-loss-post': HairLossPost as unknown as Questionnaire,
    'hair-loss-male-prescription-renewal':
      HairLossMalePrescriptionRenewal as unknown as Questionnaire,
    'complete-visit': CompleteVisit as unknown as Questionnaire,
    enclomiphene: Enclomiphene as unknown as Questionnaire,
    'enclomiphene-prescription-renewal':
      EnclomiphenePrescriptionRenewal as unknown as Questionnaire,
    '': null,
    'pre-workout-pre-signup': PreWorkoutPreSignup as unknown as Questionnaire,
    'pre-workout-prescription-renewal':
      PreWorkoutPrescriptionRenewal as unknown as Questionnaire,
    'pre-workout': PreWorkout as unknown as Questionnaire,
    'weight-loss-bundled': BundledFlow as unknown as Questionnaire,
    'weight-loss-post-bundled': BundledFlowPost as unknown as Questionnaire,
    'weight-loss-post-oral-semaglutide-bundled':
      WeightLossPostOralSemaglutideBundled as unknown as Questionnaire,
    'weight-loss-full-body-photo': FullBodyPhoto as unknown as Questionnaire,
    'live-provider-visit': LiveProviderVisit as unknown as Questionnaire,
    'hair-loss-f': FemaleHairLoss as unknown as Questionnaire,
    'hair-loss-female-prescription-renewal':
      HairLossFemalePrescriptionRenewal as unknown as Questionnaire,
    'full-body-photo': FullBodyPhotoGeneric as unknown as Questionnaire,
    'ed-hardies': EDHardiesFlow as unknown as Questionnaire,
    'skincare-checkout-success':
      SkincareCheckoutSuccess as unknown as Questionnaire,
    'skin-type': SkinType as unknown as Questionnaire,
    'additional-pa': AdditionalPaQuestions as unknown as Questionnaire,
    'weight-loss-4758': WeightLoss4758 as unknown as Questionnaire,
    'weight-loss-4758-post': WeightLoss4758Post as unknown as Questionnaire,
    'weight-loss-continue': WeightLossContinue as unknown as Questionnaire,
    'weight-loss-bundled-4758':
      WeightLossBundled4758 as unknown as Questionnaire,
    'refill-request-personalized-psychiatry':
      PersonalizedPsyciatryRefill as unknown as Questionnaire,
    prep: Prep as unknown as Questionnaire,
    sleep: Sleep as unknown as Questionnaire,
    'sleep-renewal': SleepPrescriptionRenewal as unknown as Questionnaire,
    'ed-hl': EDHL as unknown as Questionnaire,
    'ed-hl-prescription-renewal':
      EDHLPrescriptionRenewal as unknown as Questionnaire,
    menopause: Menopause as unknown as Questionnaire,
    'menopause-refill': MenopauseRefill as unknown as Questionnaire,
    'weight-loss-free-consult':
      WeightLossFreeConsult as unknown as Questionnaire,
    'now-what': NowWhat as unknown as Questionnaire,
    'now-what-7380': NowWhat7380 as unknown as Questionnaire,
    'wl-insurance-option': AB7752 as unknown as Questionnaire,
  };

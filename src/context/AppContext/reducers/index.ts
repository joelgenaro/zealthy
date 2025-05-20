import insuranceReducer, { insuranceInitialState } from './insurance/reducer';
import combineReducers from 'react-combine-reducers';
import profileReducer, { profileInitialState } from './profile/reducer';
import patientReducer, { patientInitialState } from './patient/reducer';
import { AppReducer } from './types/appState';
import shoppingCartReducer, {
  shoppingCartInitialState,
} from './shoppingCart/reducer';
import intakeReducer, { intakeInitialState } from './intake/reducer';
import appointmentReducer, {
  appointmentInitialState,
} from './appointment/reducer';
import visitReducer, { initialVisitState } from './visit/reducer';
import answerReducer, { initialAnswerState } from './answer/reducer';
import coachingReducer, { initialCoachingState } from './coaching/reducer';
import consultationReducer, {
  initialConsultationState,
} from './consultation/reducer';
import flowReducer, { initialFlowState } from './flow/reducer';

const rootReducer = combineReducers<AppReducer>({
  insurance: [insuranceReducer, insuranceInitialState],
  intake: [intakeReducer, intakeInitialState],
  profile: [profileReducer, profileInitialState],
  patient: [patientReducer, patientInitialState],
  shoppingCart: [shoppingCartReducer, shoppingCartInitialState],
  appointment: [appointmentReducer, appointmentInitialState],
  visit: [visitReducer, initialVisitState],
  answer: [answerReducer, initialAnswerState],
  coaching: [coachingReducer, initialCoachingState],
  consultation: [consultationReducer, initialConsultationState],
  flow: [flowReducer, initialFlowState],
});

export default rootReducer;

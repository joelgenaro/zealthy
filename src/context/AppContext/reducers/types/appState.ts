import { AnswerAction, AnswerState } from './answer';
import { AppointmentActions, AppointmentState } from './appointment';
import { CoachingActions, CoachingState } from './coaching';
import { ConsultationActions, ConsultationState } from './consultation';
import { InsuranceAction, InsuranceState } from './insurance';
import { IntakeAction, IntakeState } from './intake';
import { PatientAction, PatientState } from './patient';
import { ProfileAction, ProfileState } from './profile';
import { ShoppingCartAction, ShoppingCartState } from './shoppingCart';
import { VisitActions, VisitState } from './visit';
import { FlowActions, FlowState } from './flow';

export type IAppState = {
  insurance: InsuranceState;
  profile: ProfileState;
  patient: PatientState;
  intake: IntakeState;
  shoppingCart: ShoppingCartState;
  appointment: AppointmentState[];
  visit: VisitState;
  answer: AnswerState;
  coaching: CoachingState[];
  consultation: ConsultationState[];
  flow: FlowState;
};

export type IAppActions =
  | InsuranceAction
  | IntakeAction
  | ProfileAction
  | PatientAction
  | ShoppingCartAction
  | AppointmentActions
  | VisitActions
  | AnswerAction
  | CoachingActions
  | ConsultationActions
  | FlowActions;

export type AppReducer = (state: IAppState, action: IAppActions) => IAppState;

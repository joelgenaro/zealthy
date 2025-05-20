import { AppointmentState } from './appointment';
import { CoachingState } from './coaching';
import { ConsultationState } from './consultation';
import { InsuranceState } from './insurance';
import { PatientState } from './patient';
import { ProfileState } from './profile';
import { ShoppingCartState } from './shoppingCart';
import { VisitState } from './visit';

export enum CommonActionTypes {
  INIT = 'INIT',
  RESET = 'RESET',
}

export type PartialAppState = Partial<{
  insurance: Partial<InsuranceState>;
  patient: Partial<PatientState>;
  profile: Partial<ProfileState>;
  shoppingCart: Partial<ShoppingCartState>;
  appointment: Partial<AppointmentState[]>;
  visit: Partial<VisitState>;
  coaching: Partial<CoachingState[]>;
  consultation: Partial<ConsultationState[]>;
}>;

export type CommonAction =
  | {
      type: CommonActionTypes.INIT;
      payload: Partial<PartialAppState>;
    }
  | { type: CommonActionTypes.RESET };

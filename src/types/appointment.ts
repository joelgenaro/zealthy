import { CareProvider } from './careProvider';
import { CareTeamMember } from './careTeamMember';

export enum AppointmentStatus {
  PROPOSED = 'proposed',
  BOOKED = 'booked',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  NOSHOW = 'noshow',
}

export enum VisitType {
  VIDEO = 'video',
  PHONE = 'phone',
  IN_PERSON = 'in-person',
}

export enum AppointmentType {
  ROUTINE = 'routine',
  WALKIN = 'walkin',
  CHECKUP = 'checkup',
  FOLLOWUP = 'followup',
  EMERGENCY = 'emergency',
}

export interface CreateAppointmentInput {
  carePersonId: number;
  startsAt: string;
  endsAt: string;
  patientId: number;
  status: AppointmentStatus;
  duration: number;
  visitType: VisitType;
  appointmentType: AppointmentType;
}

export interface IAppointment {
  id?: string;
  carePersonId: number;
  carePerson: CareTeamMember;
  startsAt: string;
  endsAt: string;
  patientId: number;
  status: AppointmentStatus;
  duration: number;
  visitType: VisitType;
  appointmentType: AppointmentType;
}

export interface ISimpleAppointment {
  dateTime: string;
  duration: number;
  careProvider: CareProvider;
  id?: string;
  visitType?: VisitType.VIDEO | VisitType.PHONE;
}

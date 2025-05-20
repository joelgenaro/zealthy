import {
  AppointmentStatus,
  AppointmentType,
  CreateAppointmentInput,
  IAppointment,
  ISimpleAppointment,
  VisitType,
} from '@/types/appointment';
import { addMinutes } from 'date-fns';
import { faker } from '@faker-js/faker';
import careTeam from './careTeam';
import careProviders from './careProviders';

const dates = (startDate: string, duration: number) => {
  const endDate = addMinutes(new Date(startDate), duration);

  return {
    startsAt: startDate,
    endsAt: new Date(endDate).toISOString(),
  };
};

export const proposedAppointment: CreateAppointmentInput = {
  appointmentType: AppointmentType.ROUTINE,
  carePersonId: 1,
  duration: 30,
  patientId: 1,
  ...dates(faker.date.soon(1).toISOString(), 30),
  status: AppointmentStatus.PROPOSED,
  visitType: VisitType.VIDEO,
};

export const bookedAppointment: IAppointment = {
  appointmentType: AppointmentType.ROUTINE,
  carePersonId: careTeam[5].id,
  carePerson: careTeam[5],
  duration: 30,
  patientId: 1,
  ...dates(faker.date.soon(1).toISOString(), 30),
  status: AppointmentStatus.BOOKED,
  visitType: VisitType.VIDEO,
};

export const simpleAppointment: ISimpleAppointment = {
  dateTime: new Date().toISOString(),
  duration: 30,
  careProvider: careProviders[0],
  visitType: VisitType.VIDEO,
};

export const simpleAppointmentVideo: ISimpleAppointment = {
  id: '1',
  dateTime: new Date().toISOString(),
  duration: 30,
  careProvider: careProviders[6],
  visitType: VisitType.VIDEO,
};

export const simpleAppointmentPhone: ISimpleAppointment = {
  id: '2',
  dateTime: new Date().toISOString(),
  duration: 30,
  careProvider: careProviders[6],
  visitType: VisitType.PHONE,
};

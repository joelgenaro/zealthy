import { PatientStatus } from '@/context/AppContext/reducers/types/patient';

const mapStatusToPriority: { [key in PatientStatus]: number } = {
  [PatientStatus.LEAD]: 0,
  [PatientStatus.PROFILE_CREATED]: 1,
  [PatientStatus.PAYMENT_SUBMITTED]: 2,
  [PatientStatus.ACTIVE]: 3,
  [PatientStatus.SUSPENDED]: 3,
};

export const calculatePatientStatus = (
  newStatus: PatientStatus,
  currentStatus: PatientStatus
) => {
  return mapStatusToPriority[newStatus] >=
    mapStatusToPriority[currentStatus as PatientStatus]
    ? newStatus
    : currentStatus;
};

import { differenceInYears } from 'date-fns';

export default function isPatientSixtyFivePlus(patientBirthDate: string) {
  const birthDate = new Date(patientBirthDate || '');
  const today = new Date();

  const age = differenceInYears(today, birthDate);

  return age >= 65;
}

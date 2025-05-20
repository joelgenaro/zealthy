const hasDisqualifyingConditions = (
  intake: any,
  qName: string,
  disqualifiers: string[]
) =>
  intake.response.items
    .find((q: { name: string }) => q.name === qName)
    ?.answer?.some((a: { valueCoding: { code: any } }) =>
      disqualifiers.includes(a.valueCoding.code)
    );

export const isBirthControlCandidate = (patientIntakes: any[]) => {
  const bcIntake = patientIntakes?.find(
    i => i.questionnaire_name === 'birth-control'
  );

  if (!bcIntake) return false;

  const hasHighBloodPressure =
    bcIntake.response.items.find(
      (q: { name: string }) => q.name === 'BIRTH_C_Q7-1'
    )?.answer?.[0]?.valueCoding?.display === 'Very High (More than 150/100)';

  if (hasHighBloodPressure) return false;

  if (
    hasDisqualifyingConditions(bcIntake, 'BIRTH_C_Q5', [
      'BIRTH_C_Q5_A1',
      'BIRTH_C_Q5_A2',
      'BIRTH_C_Q5_A3',
    ]) ||
    hasDisqualifyingConditions(bcIntake, 'BIRTH_C_Q8', [
      'BIRTH_C_Q8_A1',
      'BIRTH_C_Q8_A3',
      'BIRTH_C_Q8_A4',
      'BIRTH_C_Q8_A5',
    ]) ||
    hasDisqualifyingConditions(bcIntake, 'BIRTH_C_Q9', [
      'BIRTH_C_Q9_A1',
      'BIRTH_C_Q9_A2',
      'BIRTH_C_Q9_A4',
    ])
  ) {
    return false;
  }

  return true;
};

export const isEDCandidate = (patientIntakes: any[]) => {
  const edIntake = patientIntakes?.find(i => i.questionnaire_name === 'ed');

  if (!edIntake) return false;

  if (
    hasDisqualifyingConditions(edIntake, 'ED_Q11', [
      'ED_Q11_A1',
      'ED_Q11_A2',
      'ED_Q11_A3',
      'ED_Q11_A4',
    ]) ||
    hasDisqualifyingConditions(edIntake, 'ED_Q12', [
      'ED_Q12_A1',
      'ED_Q12_A3',
      'ED_Q12_A5',
      'ED_Q12_A8',
    ]) ||
    hasDisqualifyingConditions(edIntake, 'ED_Q13', [
      'ED_Q13_A1',
      'ED_Q13_A6',
      'ED_Q13_A9',
      'ED_Q13_A5',
    ]) ||
    hasDisqualifyingConditions(edIntake, 'ED_Q14', [
      'ED_Q14_A1',
      'ED_Q14_A2',
      'ED_Q14_A3',
      'ED_Q14_A4',
      'ED_Q14_A6',
    ])
  ) {
    return false;
  }

  return true;
};

export const isEnclomipheneCandidate = (patientIntakes: any[]) => {
  const enclomipheneIntake = patientIntakes?.find(
    i => i.questionnaire_name === 'enclomiphene'
  );

  if (!enclomipheneIntake) return false;

  if (
    hasDisqualifyingConditions(enclomipheneIntake, 'ENCLOMIPHENE_Q20', [
      'ENCLOMIPHENE_Q20_A1',
    ]) ||
    hasDisqualifyingConditions(enclomipheneIntake, 'ENCLOMIPHENE_Q22', [
      'ENCLOMIPHENE_Q22_A1',
      'ENCLOMIPHENE_Q22_A2',
      'ENCLOMIPHENE_Q22_A4',
    ]) ||
    hasDisqualifyingConditions(enclomipheneIntake, 'ENCLOMIPHENE_Q23', [
      'ENCLOMIPHENE_Q23_A1',
      'ENCLOMIPHENE_Q23_A2',
      'ENCLOMIPHENE_Q23_A4',
    ])
  ) {
    return false;
  }

  return true;
};

export const isSleepCandidate = (patientIntakes: any[]) => {
  const insomniaIntake = patientIntakes?.find(
    i => i.questionnaire_name === 'Insomnia'
  );

  if (!insomniaIntake) return false;

  if (
    hasDisqualifyingConditions(insomniaIntake, 'SLEEP_Q19', ['SLEEP_Q19_A2']) ||
    hasDisqualifyingConditions(insomniaIntake, 'SLEEP_Q20', [
      'SLEEP_Q20_A2',
      'Ramelteon',
    ]) ||
    hasDisqualifyingConditions(insomniaIntake, 'SLEEP_Q7', ['SLEEP_Q6_A4'])
  ) {
    return false;
  }
  return true;
};

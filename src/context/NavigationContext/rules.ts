export const isSyncVisit = {
  '===': [{ var: 'visit.isSync' }, true],
};

export const isAsyncVisit = {
  '===': [{ var: 'visit.isSync' }, false],
};

export const hasNotVerifiedIdentity = {
  '===': [{ var: 'patient.has_verified_identity' }, false],
};

export const isHairLossOnly = {
  all: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Hair loss'] }],
};

export const isBirthControlOnly = {
  all: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Birth control'] }],
};

export const isWeightLossOnly = {
  all: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Weight loss'] }],
};

export const isEDOnly = {
  all: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Erectile dysfunction'] },
  ],
};

export const alwaysTrue = {
  '===': [true, true],
};

export const alwaysAcceptWeightLoss = {
  none: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Weight loss'] }],
};

export const isMentalHealthCoachSelected = {
  some: [{ var: 'coaching' }, { '===': [{ var: 'type' }, 'MENTAL_HEALTH'] }],
};

export const isWeightLossCoachSelected = {
  some: [{ var: 'coaching' }, { '===': [{ var: 'type' }, 'WEIGHT_LOSS'] }],
};

export const isCoachNotSelected = {
  none: [{ var: 'coaching' }, { '===': [{ var: 'type' }, 'MENTAL_HEALTH'] }],
};

export const isMentalHealth = {
  some: [
    { var: 'reasons' },
    { '===': [{ var: 'reason' }, 'Anxiety or depression'] },
  ],
};

export const isWeightLoss = {
  some: [{ var: 'reasons' }, { '===': [{ var: 'reason' }, 'Weight loss'] }],
};

export const isProviderScheduledAppointmentConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'encounter_type' }, 'Scheduled'] },
        { '===': [{ var: 'status' }, 'Confirmed'] },
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
      ],
    },
  ],
};

export const isProviderScheduledAppointmentNotConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'encounter_type' }, 'Scheduled'] },
        { '!==': [{ var: 'status' }, 'Confirmed'] },
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
      ],
    },
  ],
};

export const isProviderWalkedInAppointmentConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'encounter_type' }, 'Walked-in'] },
        { '===': [{ var: 'status' }, 'Unassigned'] },
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
      ],
    },
  ],
};

export const isProviderWalkedInAppointmentNotConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'encounter_type' }, 'Walked-in'] },
        { '===': [{ var: 'status' }, 'Rejected'] },
        { '===': [{ var: 'appointment_type' }, 'Provider'] },
      ],
    },
  ],
};

export const isMentalCoachAppointmentConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'status' }, 'Confirmed'] },
        {
          '===': [{ var: 'appointment_type' }, 'Coach (Mental Health)'],
        },
      ],
    },
  ],
};

export const isWeightLossAppointmentConfirmed = {
  some: [
    { var: 'appointments' },
    {
      and: [
        { '===': [{ var: 'status' }, 'Confirmed'] },
        { '===': [{ var: 'appointment_type' }, 'Coach (Weight Loss)'] },
      ],
    },
  ],
};

export const offerMentalHealthCoaching = {
  and: [{ var: '' }],
};

export const mentalHealthCoachingScheduleRule = {
  and: [
    { ...isMentalHealth },
    { ...isMentalHealthCoachSelected },
    { ...isSyncVisit },
  ],
};

export const weightLossCoachingScheduleRule = {
  and: [{ ...isWeightLoss }, { ...isWeightLossCoachSelected }],
};

import { CareSelectionMapping } from '@/types/careSelection';
import {
  CoachingState,
  CoachingType,
} from '@/context/AppContext/reducers/types/coaching';
import { QuestionnaireName } from '@/types/questionnaire';
import { differenceInYears } from 'date-fns';

export enum ConditionalType {
  SEX_AT_BIRTH = 'SEX_AT_BIRTH',
  AGE_LESS_THAN = 'AGE_LESS_THAN',
  REQUIRE_INSURANCE = 'REQUIRE_INSURANCE',
  DOES_NOT_HAVE_COACHING = 'DOES_NOT_HAVE_COACHING',
  ACCEPT_IF_SEEKING_CARE_FOR = 'ACCEPT_IF_SEEKING_CARE_FOR',
  REJECT_IF_SEEKING_CARE_FOR = 'REJECT_IF_SEEKING_CARE_FOR',
}

export type Conditional = {
  type: ConditionalType;
  careSelections?: CareSelectionMapping[];
  gender?: 'MALE' | 'FEMALE';
  age?: number;
  coaching?: CoachingType[];
};

export const intakeQuestionnaires: {
  questionnaire: QuestionnaireName;
  conditionals: Conditional[];
}[] = [
  {
    questionnaire: QuestionnaireName.MENTAL_HEALTH_ADD_SCHEDULE_COACH,
    conditionals: [
      {
        type: ConditionalType.ACCEPT_IF_SEEKING_CARE_FOR,
        careSelections: [CareSelectionMapping.MENTAL_HEALTH],
      },
      {
        type: ConditionalType.DOES_NOT_HAVE_COACHING,
        coaching: [CoachingType.MENTAL_HEALTH],
      },
    ],
  },
  {
    questionnaire: QuestionnaireName.MEDICAL_HISTORY,
    conditionals: [],
  },
  {
    questionnaire: QuestionnaireName.HEIGHT_WEIGHT,
    conditionals: [
      {
        type: ConditionalType.REJECT_IF_SEEKING_CARE_FOR,
        careSelections: [CareSelectionMapping.WEIGHT_LOSS],
      },
    ],
  },
  {
    questionnaire: QuestionnaireName.BLOOD_PRESSURE,
    conditionals: [
      {
        type: ConditionalType.ACCEPT_IF_SEEKING_CARE_FOR,
        careSelections: [
          CareSelectionMapping.BIRTH_CONTROL,
          CareSelectionMapping.WEIGHT_LOSS,
          CareSelectionMapping.ERECTILE_DYSFUNCTION,
        ],
      },
    ],
  },
  {
    questionnaire: QuestionnaireName.PHQ_9,
    conditionals: [
      {
        type: ConditionalType.REJECT_IF_SEEKING_CARE_FOR,
        careSelections: [CareSelectionMapping.MENTAL_HEALTH],
      },
    ],
  },
  {
    questionnaire: QuestionnaireName.GAD_7,
    conditionals: [
      {
        type: ConditionalType.REJECT_IF_SEEKING_CARE_FOR,
        careSelections: [CareSelectionMapping.MENTAL_HEALTH],
      },
    ],
  },
  {
    questionnaire: QuestionnaireName.BIRTH_CONTROL_UPSELL,
    conditionals: [
      {
        type: ConditionalType.SEX_AT_BIRTH,
        gender: 'FEMALE',
      },
      {
        type: ConditionalType.AGE_LESS_THAN,
        age: 50,
      },
      {
        type: ConditionalType.REJECT_IF_SEEKING_CARE_FOR,
        careSelections: [CareSelectionMapping.BIRTH_CONTROL],
      },
    ],
  },
  {
    questionnaire: QuestionnaireName.DRUGS_ALCOHOL_TOBACCO,
    conditionals: [
      {
        type: ConditionalType.REQUIRE_INSURANCE,
      },
    ],
  },
];

export const meetsConditions = (
  conditions: Conditional[],
  careSelections: CareSelectionMapping[],
  hasInsurance: boolean,
  birth_date: string | null,
  gender: string | null,
  coaching: CoachingState[]
) => {
  let meetsAllConditions = true;

  conditions.forEach(c => {
    let careMatch = false;
    switch (c.type) {
      case ConditionalType.REQUIRE_INSURANCE:
        // Check if user has insurance
        if (hasInsurance) {
          break;
        } else {
          meetsAllConditions = false;
          break;
        }

      case ConditionalType.AGE_LESS_THAN:
        // Check if user is less than age
        const age = differenceInYears(new Date(), new Date(birth_date || ''));
        if (c.age && age < c.age) {
          break;
        } else {
          meetsAllConditions = false;
          break;
        }

      case ConditionalType.SEX_AT_BIRTH:
        // Check if user matches gender
        const userGender = gender?.toUpperCase();
        if (c.gender && userGender === c.gender) {
          break;
        } else {
          meetsAllConditions = false;
          break;
        }

      case ConditionalType.ACCEPT_IF_SEEKING_CARE_FOR:
        // Check if user is seeking care for a matching care type
        if (c.careSelections) {
          careMatch = c.careSelections.some(v => careSelections.includes(v));
        }
        // meets condition if care match is found
        if (careMatch) {
          break;
        } else {
          meetsAllConditions = false;
          break;
        }

      case ConditionalType.REJECT_IF_SEEKING_CARE_FOR:
        // Check if user is seeking care for a matching care type
        if (c.careSelections) {
          careMatch = c.careSelections.some(v => careSelections.includes(v));
        }
        // meets condition if care match is not found
        if (!careMatch) {
          break;
        } else {
          meetsAllConditions = false;
          break;
        }
      case ConditionalType.DOES_NOT_HAVE_COACHING:
        if (
          c.coaching &&
          c.coaching.some(c => coaching.find(coach => coach.type === c))
        ) {
          meetsAllConditions = false;
          break;
        } else {
          break;
        }

      default:
        meetsAllConditions = false;
        break;
    }
  });

  return meetsAllConditions;
};

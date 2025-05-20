import { isSyncVisit } from '@/utils/isSyncVisit';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { IAppState } from '../types/appState';
import { CommonActionTypes } from '../types/common';
import { VisitActions, VisitState, VisitTypeActions } from '../types/visit';

export const initialVisitState: VisitState = {
  id: null,
  isSync: false,
  questionnaires: [],
  intakes: [],
  medications: [],
  selectedCare: {
    careSelections: [],
    other: '',
  },
};

const visitReducer = (state: VisitState, action: VisitActions): VisitState => {
  switch (action.type) {
    case CommonActionTypes.INIT:
      return {
        ...state,
        ...(action.payload as IAppState).visit,
      };
    case CommonActionTypes.RESET:
      return initialVisitState;

    case VisitTypeActions.UPDATE_VISIT:
      return {
        ...state,
        ...action.payload,
      };
    case VisitTypeActions.ADD_VISIT_ID:
      return {
        ...state,
        id: action.payload,
        medications: [],
      };
    case VisitTypeActions.ADD_MEDICATION:
      return {
        ...state,
        medications: state.medications
          .filter(m => m?.type !== action?.payload?.type)
          .concat(action.payload),
      };
    case VisitTypeActions.ADD_MEDICATIONS:
      return {
        ...state,
        medications: [
          ...state.medications.filter(
            existingMed =>
              !action.payload.some(newMed => newMed.type === existingMed.type)
          ),
          ...action.payload,
        ],
      };
    case VisitTypeActions.REMOVE_MEDICATION:
      return {
        ...state,
        medications: state.medications.filter(m => m.type !== action.payload),
      };
    case VisitTypeActions.RESET_MEDICATIONS:
      return {
        ...state,
        medications: [],
      };
    case VisitTypeActions.ADD_MEDICATION_UPDATE:
      return {
        ...state,
        medications: state.medications.map(m => {
          if (m?.type === action?.payload?.type) {
            return {
              ...m,
              ...action.payload.update,
            };
          }
          return m;
        }),
      };
    case VisitTypeActions.ADD_CARE:
      return {
        ...state,
        isSync: isSyncVisit(action.payload.care.careSelections),
        selectedCare: {
          ...action.payload.care,
        },
        questionnaires: action.payload.updateQuestionnaires
          ? mapCareToQuestionnaires(
              action.payload.care.careSelections.map(c => c.reason)
            )
          : state.questionnaires.slice(),
      };
    case VisitTypeActions.ADD_ASYNC:
      return {
        ...state,
        isSync: action.payload,
      };
    case VisitTypeActions.ADD_QUESTIONNAIRES:
      return {
        ...state,
        questionnaires: action.payload.slice(),
      };
    case VisitTypeActions.ADD_QUESTIONNAIRE:
      return {
        ...state,
        questionnaires: state.questionnaires
          .filter(q => q.name !== action.payload.name)
          .concat(action.payload),
      };
    case VisitTypeActions.REMOVE_QUESTIONNAIRE:
      return {
        ...state,
        questionnaires: state.questionnaires.filter(
          q => q.name !== action.payload
        ),
      };
    case VisitTypeActions.RESET_QUESTIONNAIRES:
      return {
        ...state,
        questionnaires: [],
      };
    default:
      return state;
  }
};

export default visitReducer;

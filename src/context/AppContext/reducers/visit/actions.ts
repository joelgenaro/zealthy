import { Dispatch } from 'react';
import {
  AddCarePayload,
  Medication,
  MedicationType,
  VisitActions,
  VisitQuestionnaireType,
  VisitState,
  VisitTypeActions,
} from '../types/visit';

export const getVisitActions = (dispatch: Dispatch<VisitActions>) => ({
  addVisitId: (payload: number) =>
    dispatch({
      type: VisitTypeActions.ADD_VISIT_ID,
      payload,
    }),
  addCare: ({ care, updateQuestionnaires = true }: AddCarePayload) =>
    dispatch({
      type: VisitTypeActions.ADD_CARE,
      payload: {
        care,
        updateQuestionnaires,
      },
    }),
  addAsync: (payload: boolean) =>
    dispatch({
      type: VisitTypeActions.ADD_ASYNC,
      payload,
    }),
  addMedication: (payload: Medication) =>
    dispatch({
      type: VisitTypeActions.ADD_MEDICATION,
      payload,
    }),
  addMedications: (payload: Medication[]) =>
    dispatch({
      type: VisitTypeActions.ADD_MEDICATIONS,
      payload,
    }),
  removeMedication: (payload: MedicationType) =>
    dispatch({
      type: VisitTypeActions.REMOVE_MEDICATION,
      payload,
    }),
  resetMedications: () =>
    dispatch({
      type: VisitTypeActions.RESET_MEDICATIONS,
    }),
  updateMedication: (payload: {
    type: MedicationType;
    update: Partial<VisitState['medications'][number]>;
  }) =>
    dispatch({
      type: VisitTypeActions.ADD_MEDICATION_UPDATE,
      payload,
    }),
  updateVisit: (payload: Partial<VisitState>) =>
    dispatch({
      type: VisitTypeActions.UPDATE_VISIT,
      payload,
    }),
  addQuestionnaires: (payload: VisitQuestionnaireType[]) =>
    dispatch({
      type: VisitTypeActions.ADD_QUESTIONNAIRES,
      payload,
    }),
  addQuestionnaire: (payload: VisitQuestionnaireType) =>
    dispatch({
      type: VisitTypeActions.ADD_QUESTIONNAIRE,
      payload,
    }),
  removeQuestionnaire: (payload: string) =>
    dispatch({
      type: VisitTypeActions.REMOVE_QUESTIONNAIRE,
      payload,
    }),
  resetQuestionnaires: () =>
    dispatch({
      type: VisitTypeActions.RESET_QUESTIONNAIRES,
    }),
});

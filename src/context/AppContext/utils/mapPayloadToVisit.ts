import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { VisitState } from '../reducers/types/visit';
import { initialVisitState } from '../reducers/visit/reducer';
import { PayloadType } from './payload';

export const mapPayloadToVisit = (data: PayloadType['visit']): VisitState => {
  const visit = data && data[0];
  if (!visit) {
    return initialVisitState;
  }

  return {
    id: visit.id,
    intakes: visit.intakes,
    isSync: visit.isSync,
    questionnaires: mapCareToQuestionnaires(
      visit.careSelected.map(c => c.reason)
    ),
    medications: [],
    selectedCare: {
      careSelections: visit.careSelected,
      other: '',
    },
  };
};

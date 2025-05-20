import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';

export const isSyncVisit = (careSelections: ReasonForVisit[]) => {
  return careSelections.some(p => p.synchronous);
};

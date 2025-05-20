import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { VISIT_QUERY } from '@/context/AppContext/query';
import {
  VisitPayload,
  VisitState,
} from '@/context/AppContext/reducers/types/visit';
import { getVisitActions } from '@/context/AppContext/reducers/visit/actions';
import { mapPayloadToVisit } from '@/context/AppContext/utils/mapPayloadToVisit';
import { Database } from '@/lib/database.types';
import { QuestionnaireName } from '@/types/questionnaire';
import { IntakeType } from '@/utils/getIntakesForVisit';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useMemo } from 'react';
import { usePatient } from './data';
import { useResetValues } from './useResetValues';
import { usePatientState } from '@/components/hooks/usePatient';
import { useIntakeState } from './useIntake';
import { useFlowState } from './useFlow';

export const useVisitState = () => {
  const state = useAppStateContext();

  const visit = useMemo(() => state.visit, [state.visit]);

  return visit;
};

export const useVisitActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getVisitActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

export const useVisitSelect = <T>(selector: (visit: VisitState) => T) => {
  const visit = useVisitState();

  return selector(visit);
};

export const useVisitAsync = () => {
  const visit = useVisitState();
  const resetValues = useResetValues();
  const { updateVisit } = useVisitActions();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { currentFlow } = useFlowState();

  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const { id: patient_id } = usePatientState();

  const fetchVisitById = useCallback(
    async (visitId: number) => {
      return supabase
        .from('online_visit')
        .select(VISIT_QUERY)
        .eq('id', visitId)
        .single();
    },
    [supabase]
  );

  const createOnlineVisit = useCallback(
    async (isSync: boolean = false, reset: boolean = true) => {
      const patientID = patient?.id || patient_id;
      if (!patientID) return;
      const { data } = await supabase
        .from('online_visit')
        .upsert({
          id: visit.id || undefined,
          synchronous: isSync || visit.isSync,
          patient_id: patientID,
          status: 'Created',
          specific_care: specificCare,
          potential_insurance: potentialInsurance,
          variant,
        })
        .select(VISIT_QUERY)
        .single();

      if (data) {
        await supabase.from('visit_reason').insert(
          visit.selectedCare.careSelections.map(c => ({
            visit_id: data.id,
            reason_id: c.id,
          }))
        );

        updateVisit({
          isSync: isSync || visit.isSync,
          id: data.id,
          intakes: [],
        });

        // Do not update meds for renewal flow
        if (!currentFlow?.includes('renewal')) {
          updateVisit({
            medications: [],
          });
        }

        if (reset) {
          resetValues();
        }
      }
    },
    [
      patient?.id,
      patient_id,
      resetValues,
      supabase,
      updateVisit,
      visit.id,
      visit.isSync,
      visit.selectedCare.careSelections,
      specificCare,
      potentialInsurance,
      currentFlow,
    ]
  );

  const updateOnlineVisit = useCallback(
    async (
      info: Database['public']['Tables']['online_visit']['Update'],
      updateLocalState: boolean = true
    ) => {
      const { data } = await supabase
        .from('online_visit')
        .update({
          ...info,
        })
        .eq('id', visit.id!)
        .select(VISIT_QUERY)
        .single();

      if (data && updateLocalState) {
        const visit = mapPayloadToVisit([data] as VisitPayload[]);
        updateVisit(visit);
      }
    },
    [supabase, updateVisit, visit.id]
  );

  const updateIntakeQuestionnaires = useCallback(
    (questionnaireName: QuestionnaireName, questionName: string | null) => {
      const indexOf = visit.intakes.findIndex(
        q => q.name === questionnaireName
      );

      if (indexOf === -1) return;
      const updatedIntakes = [
        ...visit.intakes.slice(0, indexOf).map(q => ({
          ...q,
          entry: null,
        })),
        { name: questionnaireName, entry: questionName } as IntakeType,
        ...visit.intakes.slice(indexOf + 1),
      ];

      updateOnlineVisit(
        {
          intakes: updatedIntakes,
        },
        false
      );
    },
    [updateOnlineVisit, visit.intakes]
  );

  return {
    fetchVisitById,
    createOnlineVisit,
    updateOnlineVisit,
    updateIntakeQuestionnaires,
  };
};

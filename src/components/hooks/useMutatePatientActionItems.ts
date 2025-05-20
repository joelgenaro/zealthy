import { useApi } from '@/context/ApiContext';
import { Database } from '@/lib/database.types';
import { Endpoints } from '@/types/endpoints';
import { useCallback } from 'react';
import { useQueryClient } from 'react-query';

type PatientActionItemInsert =
  Database['public']['Tables']['patient_action_item']['Insert'];

type PatientActionItemUpdate =
  Database['public']['Tables']['patient_action_item']['Update'] & {
    patient_id: number;
    type: string;
  };

type PatientActionItem =
  Database['public']['Tables']['patient_action_item']['Row'];

export const useMutatePatientActionItems = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const upsertActionItem = useCallback(
    async (data: PatientActionItemInsert) => {
      return api
        .post<PatientActionItem>(Endpoints.UPSERT_PATIENT_ITEM, data)
        .then(response => {
          queryClient.invalidateQueries('actionItems');
          return response;
        });
    },
    [api, queryClient]
  );

  const updateActionItem = useCallback(
    async (data: PatientActionItemUpdate) => {
      return api
        .post<PatientActionItem>(Endpoints.UPDATE_PATIENT_ITEM, data)
        .then(response => {
          queryClient.invalidateQueries('actionItems');
          return response;
        });
    },
    [api, queryClient]
  );

  return {
    upsertActionItem,
    updateActionItem,
  };
};

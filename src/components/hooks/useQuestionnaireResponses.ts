import { useApi } from '@/context/ApiContext';
import { Endpoints } from '@/types/endpoints';
import { useUser } from '@supabase/auth-helpers-react';
import { useCallback } from 'react';

export const useQuestionnaireResponses = () => {
  const api = useApi();
  const user = useUser();

  return useCallback(async () => {
    return api.post(Endpoints.SUBMIT_RESPONSES, {
      user_id: user!.id,
    });
  }, [api, user]);
};

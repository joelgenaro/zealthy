import { useApi } from '@/context/ApiContext';
import {
  useAppDispatchContext,
  useAppStateContext,
} from '@/context/AppContext';
import { getInsuranceActions } from '@/context/AppContext/reducers/insurance/actions';
import { InsuranceCoverage } from '@/context/AppContext/reducers/types/insurance';
import { Database } from '@/lib/database.types';
import { RTEInput, RTEResponse } from '@/pages/api/service/insurance/verify';
import { LookUpResponse } from '@/pages/api/v1/samples';
import { imageToBlob } from '@/utils/imageToBlob';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AxiosResponse } from 'axios';
import { ExtractionResultsDto } from 'butler-sdk';
import { useCallback, useMemo } from 'react';
import { FileType } from '../shared/ImageUploader/ImageUploader';
import { usePatient } from './data';
import { useProfileState } from './useProfile';

export const useInsuranceActions = () => {
  const dispatch = useAppDispatchContext();
  const dispatchBoundActions = useMemo(
    () => getInsuranceActions(dispatch),
    [dispatch]
  );

  return dispatchBoundActions;
};

export const useInsuranceState = () => {
  const state = useAppStateContext();
  const insurance = useMemo(() => state.insurance, [state.insurance]);
  return {
    ...insurance,
    hasINInsurance: insurance.plan_status === 'ACTIVE_COVERAGE',
  };
};

export const useInsuranceAsync = () => {
  const { addInsuranceCoverage } = useInsuranceActions();
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const {
    payer,
    member_id,
    policyholder_first_name,
    policyholder_last_name,
    is_dependent,
  } = useInsuranceState();
  const { birth_date } = useProfileState();
  const api = useApi();

  const lookUpPayer = useCallback(
    async (payerName: string) => {
      return api.get<LookUpResponse>('/service/lookup/payer', {
        params: { payerName },
      });
    },
    [api]
  );

  const deleteInsurancePolicy = useCallback(
    async (id: number) => {
      await supabase
        .from('insurance_policy')
        .delete()
        .eq('patient_id', patient?.id!)
        .eq('id', id);
    },
    [patient?.id, supabase]
  );

  const createInsurancePolicy = useCallback(
    async (coverage: InsuranceCoverage) => {
      if (!patient) return;
      addInsuranceCoverage(coverage);
      api
        .post('/canvas_emr/create-coverage', {
          canvas_patient_id: patient?.canvas_patient_id,
          is_dependent,
          payer_name: payer?.name,
          external_payer_id: payer?.external_payer_id,
          plan_start: coverage.plan_start,
          member_id,
        })
        .then(async res => {
          const canvas_coverage_id = res.data;
          await supabase.from('insurance_policy').insert({
            patient_id: patient?.id,
            payer_id: payer!.id,
            is_dependent,
            member_id,
            policyholder_first_name,
            policyholder_last_name,
            plan_name: coverage.plan_name,
            plan_status: coverage.plan_status,
            plan_type: coverage.plan_type,
            member_obligation: coverage.member_obligation,
            out_of_network: coverage.out_of_network,
            canvas_coverage_id,
          });
        });
    },
    [
      patient,
      addInsuranceCoverage,
      api,
      is_dependent,
      payer,
      member_id,
      supabase,
      policyholder_first_name,
      policyholder_last_name,
    ]
  );

  const uploadInsuranceCard = useCallback(
    async (file: FileType) => {
      const blob = await imageToBlob(file.fileToUpload);
      return supabase.storage
        .from('insurance')
        .upload(`${patient?.id}/${file.name}`, blob, {
          cacheControl: '3600',
          // Overwrite file if it exist
          upsert: true,
        });
    },
    [patient?.id, supabase.storage]
  );

  const extractDataFromCard = useCallback(
    async (file: FileType) => {
      return api.post<ExtractionResultsDto>('/service/insurance/extract', {
        insurance: {
          fileToUpload: file?.fileToUpload,
          fileName: file?.name,
        },
      });
    },
    [api]
  );

  const rteVerification = useCallback(
    (external_payer_id: string, region: string = 'FL') => {
      return api.post<RTEResponse, AxiosResponse<RTEResponse>, RTEInput>(
        '/service/insurance/verify',
        {
          external_payer_id,
          member_id,
          member_dob: birth_date || '2001-01-01',
          policyholder_first_name,
          policyholder_last_name,
          region,
        }
      );
    },
    [
      member_id,
      birth_date,
      api,
      policyholder_first_name,
      policyholder_last_name,
    ]
  );

  return {
    createInsurancePolicy,
    deleteInsurancePolicy,
    uploadInsuranceCard,
    extractDataFromCard,
    lookUpPayer,
    rteVerification,
  };
};

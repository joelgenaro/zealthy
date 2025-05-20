import { useApi } from '@/context/ApiContext';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useState } from 'react';
import { CanvasSlot } from '../shared/AvailableTimeSlots';
import { ClinicianProps } from './data';

export interface PractitionerWithSchedule {
  clinician: ClinicianProps;
  schedule: any;
}

type SlotResponse = {
  total: number;
  entry: {
    resource: CanvasSlot;
  }[];
};

export const useSpecificProviderSchedule = (
  clinician_id: number,
  duration: number,
  starts_at?: string
) => {
  const api = useApi();
  const supabase = useSupabaseClient<Database>();
  const [practitioners, setPractitioners] = useState<
    PractitionerWithSchedule[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchProvidersSchedule = useCallback(async () => {
    setLoading(true);

    if (!clinician_id) {
      setLoading(false);
      return;
    }

    const clinician = await supabase
      .from('clinician')
      .select('*, profiles(*)')
      .eq('id', clinician_id)
      .single()
      .then(({ data }) => data as ClinicianProps);

    if (!clinician) {
      setLoading(false);
      return;
    }

    const schedules_by_practitioner = await api.post(
      '/onsched/get-availability',
      {
        ids: [
          {
            clinician_id: clinician?.id,
            email: clinician?.profiles?.email,
            resourceId: clinician?.profiles?.onsched_resource_id,
          },
        ],
        duration,
        start: starts_at,
      }
    );

    console.log({ schedules_by_practitioner });

    setPractitioners(() =>
      Object.entries(schedules_by_practitioner.data).map(p => {
        return {
          clinician: clinician,
          schedule: p[1],
        };
      })
    );

    setLoading(false);
  }, [clinician_id, api, duration, supabase]);

  useEffect(() => {
    if (clinician_id) {
      fetchProvidersSchedule();
    }
  }, [clinician_id, fetchProvidersSchedule]);

  return {
    practitioners,
    loading,
  };
};

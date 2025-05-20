import { useApi } from '@/context/ApiContext';
import { Database } from '@/lib/database.types';
import { CoachType } from '@/types/carePersonType';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CanvasSlot } from '../shared/AvailableTimeSlots';
import {
  ClinicianProps,
  useAllVisiblePatientSubscription,
  usePatient,
} from './data';
import { useInsuranceState } from './useInsurance';
import intersection from 'lodash/intersection';
import { useIntakeSelect } from './useIntake';
import { useSelector } from './useSelector';

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

type ProviderType = Database['public']['Enums']['provider_type'];

type AppointmentType = Database['public']['Enums']['appointment_type'];
type Clinician = Pick<
  Database['public']['Tables']['clinician']['Row'],
  | 'id'
  | 'canvas_practitioner_id'
  | 'daily_room'
  | 'status'
  | 'type'
  | 'specialties'
  | 'bio'
> & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

type UseProviderScheduleParams = {
  type: AppointmentType;
  duration: number;
  starts_at?: string;
  exclude_providers?: ProviderType[];
};

type ScheduleEntry = {
  start: string;
  end: string;
};

type SchedulesByPractitioner = Record<string, ScheduleEntry[]>;

export const useProviderSchedule = (params: UseProviderScheduleParams) => {
  const {
    type,
    duration,
    starts_at,
    exclude_providers = ['Provider (PMHNP)'],
  } = params;

  const api = useApi();
  const potentialInsurance = useIntakeSelect(
    intake => intake.potentialInsurance
  );
  const { data: patient } = usePatient();
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();

  const supabase = useSupabaseClient<Database>();
  const [practitioners, setPractitioners] = useState<
    PractitionerWithSchedule[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { hasINInsurance } = useInsuranceState();
  const payerId = useSelector(store => store.insurance.payer?.id);
  const region = useMemo(() => patient?.region, [patient?.region]);
  const weightLossSubs = visibleSubscriptions?.filter(s =>
    s.subscription.name.includes('Weight Loss')
  );
  const isBundled =
    weightLossSubs?.some(s => s?.price === 449) ||
    weightLossSubs?.some(s => s?.price === 297);

  const getDeveloperProfileIds = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles_v2')
        .select('profile_id')
        .overlaps('roles', ['DEVELOPER', 'TESTER']);

      if (error) {
        console.error('Error fetching developer profiles:', error);
        return [];
      }

      const developerProfileIds = data ? data.map(item => item.profile_id) : [];

      return developerProfileIds;
    } catch (err) {
      console.error('Error in getDeveloperProfileIds:', err);
      return [];
    }
  };

  const fetchProvidersSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const developerProfileIds = await getDeveloperProfileIds();
      let clinicians: ClinicianProps[] = [];

      if (
        ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
          potentialInsurance || ''
        )
      ) {
        const payerName =
          potentialInsurance === 'Medicare Access Florida'
            ? 'Medicare (FL)'
            : 'FL Medicaid';

        const { data: payerData } = await supabase
          .from('payer')
          .select('id')
          .eq('name', payerName)
          .maybeSingle();

        const payerId = payerData?.id;

        if (!payerId) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('state_payer_clinician')
          .select(
            'clinician!inner(id, canvas_practitioner_id, zoom_link, daily_room, status, type, specialties, free_consult_eligible, bio, profiles(*)), state_payer!inner(state,payer_id)'
          )
          .eq('active', true)
          .eq('state_payer.state', region!)
          .eq('state_payer.payer_id', payerId)
          .eq('clinician.status', 'ON')
          .not('clinician.profiles.onsched_resource_id', 'is', null);

        if (error) {
          console.error('Error fetching clinicians:', error);
          setLoading(false);
          return;
        }

        clinicians = (data || [])
          .map(item => item.clinician)
          .filter(
            (clinician): clinician is ClinicianProps =>
              clinician != null &&
              clinician.profiles != null &&
              clinician.profiles.id != null
          );
      } else if (hasINInsurance && payerId) {
        const { data, error } = await supabase
          .from('state_payer_clinician')
          .select(
            'clinician!inner(id, canvas_practitioner_id, zoom_link, daily_room, status, type, specialties, bio, profiles(*)), state_payer!inner(state,payer_id)'
          )
          .eq('active', true)
          .eq('state_payer.state', region!)
          .eq('state_payer.payer_id', payerId)
          .eq('clinician.status', 'ON')
          .not('clinician.profiles.onsched_resource_id', 'is', null);

        if (error) {
          console.error('Error fetching clinicians:', error);
          setLoading(false);
          return;
        }

        clinicians = (data || [])
          .map(item => item.clinician)
          .filter(
            (clinician): clinician is ClinicianProps =>
              clinician != null &&
              clinician.profiles != null &&
              clinician.profiles.id != null
          );
      } else {
        const { data, error } = await supabase
          .from('state_clinician')
          .select('clinician!inner(*, profiles(*))')
          .eq('clinician.status', 'ON')
          .match({ state: region, active: true })
          .not('clinician.profiles.onsched_resource_id', 'is', null);

        if (error) {
          console.error('Error fetching clinicians:', error);
          setLoading(false);
          return;
        }

        clinicians = (data || [])
          .map(item => item.clinician)
          .filter(
            (clinician): clinician is ClinicianProps =>
              clinician != null &&
              clinician.profiles != null &&
              clinician.profiles.id != null
          );
      }

      // Filter out developer profiles if IDs exist
      if (developerProfileIds && developerProfileIds.length > 0) {
        clinicians = clinicians.filter(
          clinician =>
            clinician.profiles?.id &&
            !developerProfileIds.includes(clinician.profiles.id)
        );
      }

      if (!clinicians?.length) {
        setLoading(false);
        return;
      }

      const enabled_clinicians = clinicians.filter(
        p => p.type && !intersection(p.type, exclude_providers).length
      );

      const canvas_ids: {
        clinician_id: number;
        email: string;
        resourceId: string;
      }[] = [];
      const bundled_canvas_ids: {
        clinician_id: number;
        email: string;
        resourceId: string;
      }[] = [];

      for (const d of enabled_clinicians) {
        const isProvider = d?.type?.some(t => t.includes('Provider'));
        const isBundled = d?.type?.some(t => t.includes('Bundled'));

        if (isProvider && d.profiles?.onsched_resource_id) {
          canvas_ids.push({
            clinician_id: d.id,
            email: d.profiles.email ?? '',
            resourceId: d.profiles.onsched_resource_id,
          });
        }

        if (isBundled && d.profiles?.onsched_resource_id) {
          bundled_canvas_ids.push({
            clinician_id: d.id,
            email: d.profiles.email ?? '',
            resourceId: d.profiles.onsched_resource_id,
          });
        }
      }

      if (
        (isBundled && !bundled_canvas_ids.length) ||
        (!isBundled && !canvas_ids.length)
      ) {
        setPractitioners(() => []);
        setLoading(false);
        return;
      }

      const { data: schedulesData } = await api.post<SchedulesByPractitioner>(
        '/onsched/get-availability',
        {
          ids: isBundled ? bundled_canvas_ids : canvas_ids,
          duration,
          start: starts_at,
        }
      );

      if (!schedulesData || Object.keys(schedulesData).length === 0) {
        setPractitioners(() => []);
        setLoading(false);
        return;
      }

      // Calculate the 1 week limit time, ...onSched not handling in-advance limits properly
      const startTime = starts_at
        ? new Date(starts_at).getTime()
        : new Date().getTime();
      const oneWeekLater = startTime + 168 * 60 * 60 * 1000;

      const filteredSchedules: SchedulesByPractitioner = {};

      for (const [email, schedule] of Object.entries(schedulesData)) {
        if (!schedule || !Array.isArray(schedule)) continue;

        filteredSchedules[email] = schedule.filter(slot => {
          const slotTime = new Date(slot.start).getTime();
          return slotTime < oneWeekLater;
        });
      }

      const clinicianMap: Record<string, ClinicianProps> = {};
      for (const c of clinicians) {
        if (c?.profiles?.email) {
          clinicianMap[c.profiles.email] = c;
        }
      }

      setPractitioners(() => {
        const practitionersList = Object.entries(filteredSchedules)
          .map(([email, schedule]) => ({
            clinician: clinicianMap[email],
            schedule,
          }))
          .filter(item => item.clinician);

        practitionersList.sort((a, b) => {
          if (!a.schedule?.length) return 1;
          if (!b.schedule?.length) return -1;

          const startTimeA = new Date(a.schedule[0].start).getTime();
          const startTimeB = new Date(b.schedule[0].start).getTime();
          return startTimeA - startTimeB;
        });

        return practitionersList;
      });

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchProvidersSchedule:', error);
      setPractitioners(() => []);
      setLoading(false);
    }
  }, [
    supabase,
    api,
    region,
    potentialInsurance,
    payerId,
    duration,
    hasINInsurance,
    starts_at,
  ]);

  const fetchCoachesSchedule = useCallback(
    async (coachType: CoachType) => {
      setLoading(true);

      try {
        const developerProfileIds = await getDeveloperProfileIds();

        let query = supabase
          .from('clinician')
          .select(
            'id, canvas_practitioner_id, zoom_link, daily_room, status, type, bio, specialties, profiles(*)'
          )
          .eq('status', 'ON');

        if (developerProfileIds.length > 0) {
          query = query.not(
            'profiles.id',
            'in',
            `(${developerProfileIds.join(',')})`
          );
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching clinicians:', error);
          setPractitioners([]);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setPractitioners([]);
          setLoading(false);
          return;
        }

        const coaches = data.filter(
          d =>
            d.type?.some(t => t === coachType) &&
            d.profiles &&
            d.profiles.onsched_resource_id
        );

        if (coaches.length === 0) {
          setPractitioners([]);
          setLoading(false);
          return;
        }

        const canvas_ids = coaches.map(d => ({
          clinician_id: d.id,
          email: d.profiles?.email,
          resourceId: d.profiles?.onsched_resource_id,
        }));

        const { data: schedulesData } = await api.post(
          '/onsched/get-availability',
          {
            ids: canvas_ids,
            duration,
            start: starts_at,
          }
        );

        if (!schedulesData || Object.keys(schedulesData).length === 0) {
          setPractitioners([]);
          setLoading(false);
          return;
        }

        const cliniciansByEmail: Record<string, ClinicianProps> = {};
        coaches.forEach(clinician => {
          if (clinician.profiles?.email) {
            cliniciansByEmail[clinician.profiles.email] =
              clinician as ClinicianProps;
          }
        });

        const practitionersList = Object.entries(schedulesData)
          .map(([email, schedule]) => ({
            clinician: cliniciansByEmail[email],
            schedule,
          }))
          .filter(
            item =>
              item.clinician &&
              Array.isArray(item.schedule) &&
              item.schedule.length > 0
          );

        setPractitioners(practitionersList);
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchCoachesSchedule:', error);
        setPractitioners([]);
        setLoading(false);
      }
    },

    [api, duration, supabase, starts_at]
  );

  useEffect(() => {
    if (type === 'Provider') {
      fetchProvidersSchedule();
    } else {
      fetchCoachesSchedule(type as CoachType);
    }
  }, [fetchCoachesSchedule, fetchProvidersSchedule, type, starts_at]);

  return {
    practitioners,
    loading,
  };
};

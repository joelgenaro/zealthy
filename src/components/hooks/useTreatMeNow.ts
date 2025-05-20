import { useApi } from '@/context/ApiContext';
import { Database } from '@/lib/database.types';
import { EstimatedTimeResponse } from '@/pages/api/service/treat-me-now/estimated-time';
import { AvailabilityResponse } from '@/pages/api/service/treat-me-now/types';
import { Endpoints } from '@/types/endpoints';
import { patientAwaitingIlvEvent } from '@/utils/freshpaint/events';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePatient } from './data';
import useInterval from './useInterval';
import { useSelector } from './useSelector';

export const useIsTreatMeNow = () => {
  const { pathname, query } = useRouter();
  const appointment = useSelector(store =>
    store.appointment.find(a => a.encounter_type === 'Walked-in')
  );

  const isTreatMeNow = useMemo(() => {
    return (
      ['Unassigned', 'Confirmed'].includes(appointment?.status || '') &&
      ![
        '/checkout/complete',
        '/checkout/create-intake',
        '/checkout/submit-responses',
        '/checkout/create-appointment',
        '/post-checkout/schedule-visit',
        '/post-checkout/questionnaires-v2',
      ].includes(pathname) &&
      !['instant-live-visit-start', 'checkout-success'].includes(
        query.name as string
      )
    );
  }, [appointment?.status, pathname, query.name]);

  return isTreatMeNow;
};

type EstimatedTimeType = {
  estimated_time: number;
  place_in_queue: number;
};

type AvailabilityType = {
  available: boolean;
  estimates: EstimatedTimeType | null;
};

export const useTreatMeNowAvailability = () => {
  const { estimatedTime, availability } = useTreatMeNow();
  const [interval, setInterval] = useState<number | null>(60000);
  const [data, setData] = useState<AvailabilityType | null>(null);

  const getAvailability = useCallback(() => {
    availability().then(({ data: { available } }) => {
      if (available) {
        estimatedTime().then(({ data: estimates }) => {
          setData({
            available,
            estimates,
          });
        });
      } else {
        setInterval(null);
        setData({
          available: false,
          estimates: null,
        });
      }
    });
  }, [availability, estimatedTime]);

  useEffect(() => {
    getAvailability();
  }, [getAvailability]);

  useInterval(() => {
    getAvailability();
  }, interval);

  return data;
};

export const useEstimatedTime = () => {
  const [data, setData] = useState<{
    estimated_time: number | null;
    place_in_queue: number | null;
  }>({
    estimated_time: null,
    place_in_queue: null,
  });
  const [interval, setInterval] = useState<number | null>(60000);
  const { estimatedTime, availability } = useTreatMeNow();

  const getAvailability = useCallback(() => {
    availability().then(({ data }) => {
      if (data.available) {
        estimatedTime().then(({ data }) => {
          setData(data);
        });
      } else {
        setInterval(null);
      }
    });
  }, [availability, estimatedTime]);

  useEffect(() => {
    getAvailability();
  }, [getAvailability]);

  useInterval(() => {
    getAvailability();
  }, interval);

  return {
    time: data.estimated_time,
    place_in_queue: data.place_in_queue,
  };
};

export const useTreatMeNow = () => {
  const api = useApi();
  const { data: patient } = usePatient();
  const supabase = useSupabaseClient<Database>();

  const estimatedTime = useCallback(() => {
    return api.get<EstimatedTimeResponse>(
      Endpoints.TREAT_ME_NOW_ESTIMATED_TIME,
      {
        params: { region: patient?.region, patient_id: patient?.id },
      }
    );
  }, [patient, api]);

  const availability = useCallback(() => {
    return api.get<AvailabilityResponse>(Endpoints.TREAT_ME_NOW_AVAILABILITY, {
      headers: {
        'x-tap-uid-fdi': patient?.profile_id,
      },
    });
  }, [api, patient?.id]);

  const notifyClinicians = useCallback(async () => {
    if (!patient?.region) return;
    const { data } = await supabase
      .from('state')
      .select(
        `*, 
      state_cash_payer(
        accept_treat_me_now
      ), 
      state_clinician(
        *, 
        clinician(
          id, 
          accept_treat_me_now,
          profiles(
            phone_number
          )
        )
      )`
      )
      // check if state is active
      .eq('abbreviation', patient?.region)
      .eq('active', true)
      // check if state has any licensed clinicians
      .eq('state_clinician.active', true)
      // check if clinicians are accepting treat me now requests
      .eq('state_clinician.clinician.accept_treat_me_now', true)
      .eq('state_clinician.clinician.status', 'ON')
      .single();

    if (data && data.state_clinician) {
      if (data.state_clinician instanceof Array) {
        data.state_clinician.forEach((c: any) => {
          let clinician = c.clinician;
          if (Array.isArray(clinician)) {
            clinician = clinician[0];
          }
          let profile = clinician?.profiles;
          if (Array.isArray(profile)) {
            profile = profile[0];
          }
          let phone_number = profile?.phone_number;

          if (phone_number) {
            patientAwaitingIlvEvent(phone_number);
          }
        });
      }
    }
  }, [patient, supabase]);

  return {
    estimatedTime,
    availability,
    notifyClinicians,
  };
};

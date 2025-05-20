import { usePatient } from '@/components/hooks/data';
import { Database } from '@/lib/database.types';
import { Endpoints } from '@/types/endpoints';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useApi } from '../ApiContext';

type Appointment = Database['public']['Tables']['appointment']['Row'];

interface AppointmentSubscriptionProviderProps {
  children: React.ReactNode;
}

type ILVContextType = {
  request: Appointment | null;
  requestILV: () => Promise<void>;
  cancelRequest: (r: Appointment) => Promise<void>;
};

const ILVContext = createContext<ILVContextType>({
  request: null,
  requestILV: async () => {},
  cancelRequest: async (r: Appointment) => {},
});

const ILVContextProvider = ({
  children,
}: AppointmentSubscriptionProviderProps) => {
  const supabase = useSupabaseClient<Database>();
  const [request, setRequest] = useState<Appointment | null>(null);
  const api = useApi();
  const { data: patient } = usePatient();

  const cancelRequest = useCallback(
    async (request: Appointment) => {
      const appointment = await supabase
        .from('appointment')
        .update({
          status: 'Cancelled',
        })
        .eq('id', request.id)
        .select()
        .single()
        .throwOnError();

      await supabase
        .from('task_queue')
        .update({ visible: false })
        .eq('id', appointment.data?.queue_id!);
      return;
    },
    [supabase]
  );

  const requestILV = useCallback(async () => {
    const { data: request } = await api.get<Appointment>(
      Endpoints.REQUEST_TREAT_ME_NOW
    );

    setRequest(request);
  }, [api]);

  const value = useMemo(() => {
    return {
      request: request,
      requestILV: requestILV,
      cancelRequest: cancelRequest,
    };
  }, [cancelRequest, request, requestILV]);

  useEffect(() => {
    if (!request) return;

    const channel = supabase
      .channel('realtime appointment')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          table: 'appointment',
          schema: 'public',
          filter: `id=eq.${request.id}`,
        },
        async payload => {
          console.log({ PAYLOAD: payload });
          const newAppointment =
            payload.new as Database['public']['Tables']['appointment']['Row'];

          setRequest(newAppointment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [request, supabase]);

  useEffect(() => {
    if (!patient) return;
    if (!request) {
      supabase
        .from('appointment')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('encounter_type', 'Walked-in')
        .in('status', ['Unassigned', 'Confirmed'])
        .throwOnError()
        .then(({ data }) => data || [])
        .then(data => {
          if (data.filter(a => a.status === 'Confirmed').length) {
            setRequest(data.find(a => a.status === 'Confirmed') || null);
          } else if (data.filter(a => a.status === 'Unassigned').length) {
            setRequest(data.find(a => a.status === 'Unassigned') || null);
          } else {
            setRequest(null);
          }
        });
    }
  }, [patient, request, supabase]);

  return <ILVContext.Provider value={value}>{children}</ILVContext.Provider>;
};

export const useILV = () => useContext(ILVContext);

export default ILVContextProvider;

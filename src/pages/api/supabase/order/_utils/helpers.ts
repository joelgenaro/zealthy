import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Patient = {
  profiles: {
    email: string;
    id: string;
  };
} | null;

export const findEmail = async (patientId: number) => {
  return supabaseAdmin
    .from('patient')
    .select('profiles(email)')
    .eq('id', patientId)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => (data as Patient)?.profiles?.email);
};

export const findProfileId = async (patientId: number) => {
  return supabaseAdmin
    .from('patient')
    .select('profiles(id)')
    .eq('id', patientId)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => (data as Patient)?.profiles?.id);
};

export const findPrescription = async (prescriptionId: number) => {
  return supabaseAdmin
    .from('prescription')
    .select('*')
    .eq('id', prescriptionId)
    .maybeSingle()
    .then(({ data }) => data);
};

export const findAddress = async (patientId: number) => {
  return supabaseAdmin
    .from('address')
    .select('*')
    .eq('patient_id', patientId)
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);
};

export const findActionItem = async (
  patientId: number,
  type: Database['public']['Enums']['patient_action_type']
) => {
  return supabaseAdmin
    .from('patient_action_item')
    .select('*')
    .eq('patient_id', patientId)
    .eq('type', type)
    .eq('completed', false)
    .throwOnError()
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => data);
};

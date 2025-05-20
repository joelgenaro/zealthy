import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { findCoordinator } from './findCoordinator';
import { updateCareTeam } from './updateCareTeam';
import { findMessageGroup } from './findMessageGroup';
import { getClinicianAlias } from '@/utils/getClinicianAlias';
import axios from 'axios';
import { replaceAll } from '@/utils/replaceAll';
import {
  activeMemberSync,
  syncVisit,
  variables,
} from '@/constants/welcome-messages';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import parseISO from 'date-fns/parseISO';
import getVisitRoomLink from '@/utils/getVisitRoomLink';

type OnlineVisit = Database['public']['Tables']['online_visit']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = {
  timezone: string;
  status: string;
  canvas_patient_id: string;
  profile: Profile;
};

type Clinician = Database['public']['Tables']['clinician']['Row'];
type PatientAppointment = Database['public']['Tables']['appointment']['Row'] & {
  provider: Clinician | null;
};

export const handleSynchronousVisitComplete = async (
  visit: OnlineVisit,
  isActiveSubscriber: boolean
) => {
  let template = syncVisit;
  const groupName = 'Primary Care';
  const careName = 'Primary Care';

  try {
    const patient = await supabaseAdmin
      .from('patient')
      .select('status, canvas_patient_id, timezone, profile: profiles!inner(*)')
      .eq('id', visit.patient_id)
      .single()
      .then(({ data }) => data as Patient | null);

    if (!patient) {
      throw new Error(
        `Could not find patient for id: ${visit.patient_id} for Primary care`
      );
    }

    // find or create weight loss group
    const existingGroup = await findMessageGroup(patient.profile.id, groupName);

    if (!existingGroup) {
      throw new Error(
        `Could not create ${groupName} group for patient: ${visit.patient_id}`
      );
    }

    // find group members
    const groupMembers = await supabaseAdmin
      .from('messages_group_member')
      .select()
      .eq('messages_group_id', existingGroup.id)
      .then(({ data }) => data || []);

    // find care team
    const careTeamMembers = await supabaseAdmin
      .from('patient_care_team')
      .select()
      .eq('patient_id', visit.patient_id)
      .then(({ data }) => data || []);

    // find coordinator
    const coordinator = await findCoordinator(
      careTeamMembers?.find(m => m.role === 'Coordinator')
    );

    const primaryCareAppointments = await supabaseAdmin
      .from('appointment')
      .select('*, provider: clinician!inner(*)')
      .eq('patient_id', visit.patient_id)
      .eq('status', 'Confirmed')
      .eq('appointment_type', 'Provider')
      .in('care', [
        'I’m not sure',
        'Primary care',
        'Other',
        'Cold or flu-like symptoms',
      ])
      .order('created_at', { ascending: false })
      .then(({ data }) => (data || []) as PatientAppointment[]);

    // update group members and care team incase they are not added already
    let careTeam = [{ id: coordinator?.clinician?.id, role: 'Coordinator' }];

    const scheduledAppointmentWithProvider = primaryCareAppointments.find(
      a => a.encounter_type === 'Scheduled'
    );

    if (scheduledAppointmentWithProvider?.provider?.id) {
      careTeam.push({
        id: scheduledAppointmentWithProvider?.provider.id,
        role: 'Provider',
      });
    }

    // update care team
    await updateCareTeam({
      careTeam,
      currentGroup: groupMembers,
      currentTeam: careTeamMembers,
      patientId: visit.patient_id,
      groupId: existingGroup.id,
    });

    if (isActiveSubscriber) {
      template = activeMemberSync;
    }

    const timezone = patient.timezone || 'America/New_York';

    const message = replaceAll(template, variables, [
      patient.profile.first_name!,
      getClinicianAlias(coordinator?.clinician?.id).split(' ')[0] || '', // will error handle to empty str
      '',
      '',
      scheduledAppointmentWithProvider
        ? formatInTimeZone(
            parseISO(scheduledAppointmentWithProvider?.starts_at!),
            timezone,
            "eeee, MMMM do 'at' h:mma zzz"
          )
        : '',
      scheduledAppointmentWithProvider?.daily_room
        ? getVisitRoomLink(
            scheduledAppointmentWithProvider.daily_room,
            scheduledAppointmentWithProvider.id
          )
        : '',
      '',
      '',
      careName,
    ]);

    const finalMessage = {
      sender: `Practitioner/${coordinator?.clinician?.profile_id}`,
      recipient: `Patient/${patient?.profile?.id}`,
      message: message || 'Welcome to Zealthy',
      notify: false,
      groupId: existingGroup?.id,
      initialMessage: true,
      is_phi: false,
    };

    console.log('syncFinalMessage', {
      message: `FINAL_MESSAGE`,
      zealthy_patient_id: visit.patient_id,
      zealthy_template: template,
      zealthy_groupId: existingGroup.id,
      zealthy_careName: careName,
    });

    return axios.post(
      ['production', 'preview'].includes(process.env.VERCEL_ENV!)
        ? `https://${process.env.VERCEL_URL}/api/message`
        : process.env.VERCEL_URL + '/api/message',
      {
        data: finalMessage,
      }
    );
  } catch (err) {
    console.error(err);
  }
};

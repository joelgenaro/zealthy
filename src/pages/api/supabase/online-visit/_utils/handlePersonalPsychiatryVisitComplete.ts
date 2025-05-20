import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { findCoordinator } from './findCoordinator';
import { updateCareTeam } from './updateCareTeam';
import { findMessageGroup } from './findMessageGroup';
import { parseISO } from 'date-fns';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import axios from 'axios';
import { replaceAll } from '@/utils/replaceAll';
import {
  activeMemberSync,
  syncAndMentalHealth,
  syncPersonalizedPsychiatry,
  variables,
} from '@/constants/welcome-messages';
import getVisitRoomLink from '@/utils/getVisitRoomLink';
import { getClinicianAlias } from '@/utils/getClinicianAlias';

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
type Coach = Clinician & {
  profiles: Profile;
};

export const handlePersonalPsychiatryVisitComplete = async (
  visit: OnlineVisit,
  isActiveSubscriber: boolean
) => {
  try {
    const patient = await supabaseAdmin
      .from('patient')
      .select('status, canvas_patient_id, timezone, profile: profiles!inner(*)')
      .eq('id', visit.patient_id)
      .single()
      .then(({ data }) => data as Patient | null);

    if (!patient) {
      throw new Error(`Could not find patient for id: ${visit.patient_id}`);
    }

    // find or create weight loss group
    const existingGroup = await findMessageGroup(
      patient.profile.id,
      'Psychiatry'
    );

    if (!existingGroup) {
      throw new Error(
        `Could not create Psychiatry group for patient: ${visit.patient_id}`
      );
    }

    // find group members
    const groupMembers = await supabaseAdmin
      .from('messages_group_member')
      .select()
      .eq('messages_group_id', existingGroup?.id)
      .then(({ data }) => data || []);

    // find care team
    const careTeamMembers = await supabaseAdmin
      .from('patient_care_team')
      .select()
      .eq('patient_id', visit.patient_id)
      .then(({ data }) => data || []);

    // find upcoming weight loss appointments
    const psychiatryAppointments = await supabaseAdmin
      .from('appointment')
      .select('*, provider: clinician!inner(*)')
      .eq('patient_id', visit.patient_id)
      .eq('status', 'Confirmed')
      .eq('encounter_type', 'Scheduled')
      .eq('care', 'Anxiety or depression')
      .then(({ data }) => (data || []) as PatientAppointment[]);

    // find coordinator
    const coordinator = await findCoordinator(
      careTeamMembers?.find(m => m.role === 'Coordinator')
    );

    // find coach
    let coach = null;

    const scheduledAppointmentWithCoach = psychiatryAppointments.find(
      a => a.appointment_type === 'Coach (Mental Health)'
    );

    if (scheduledAppointmentWithCoach?.provider?.id) {
      coach = await supabaseAdmin
        .from('clinician')
        .select('*, profiles (*)')
        .eq('id', scheduledAppointmentWithCoach.provider.id)
        .single()
        .then(({ data }) => {
          return { clinician: data as Coach, total: 1 };
        });
    }
    // update group members and care team incase they are not added already
    let careTeam = [{ id: coordinator?.clinician?.id, role: 'Coordinator' }];

    if (coach) {
      careTeam.push({
        id: coach.clinician?.id,
        role: 'Mental Health Coach',
      });
    }

    const scheduledAppointmentWithProvider = psychiatryAppointments.find(
      a => a.appointment_type === 'Provider'
    );

    if (scheduledAppointmentWithProvider?.provider?.id) {
      careTeam.push({
        id: scheduledAppointmentWithProvider.provider.id,
        role: 'Psychiatric Provider',
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

    //build message
    let template = syncPersonalizedPsychiatry;

    if (isActiveSubscriber && scheduledAppointmentWithProvider) {
      template = activeMemberSync;
    } else if (
      scheduledAppointmentWithProvider &&
      scheduledAppointmentWithCoach
    ) {
      template = syncAndMentalHealth;
    }

    const timezone = patient.timezone || 'America/New_York';

    const message = replaceAll(template, variables, [
      patient.profile.first_name!,
      getClinicianAlias(coordinator?.clinician?.id)?.split(' ')[0], // defaults/error handles to empty str
      coach?.clinician?.profiles?.first_name || '',
      scheduledAppointmentWithCoach
        ? formatInTimeZone(
            parseISO(scheduledAppointmentWithCoach?.starts_at!),
            timezone,
            "eeee, MMMM do 'at' h:mma zzz"
          )
        : '',
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
            scheduledAppointmentWithProvider?.id
          )
        : '',
      scheduledAppointmentWithCoach?.daily_room
        ? getVisitRoomLink(
            scheduledAppointmentWithCoach.daily_room,
            scheduledAppointmentWithCoach.id
          )
        : '',
      '',
      'Personalized Psychiatry',
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

    console.log('psychiatryfinalMessage', {
      message: `FINAL_MESSAGE`,
      zealthy_patient_id: visit.patient_id,
      zealthy_template: template,
      zealthy_groupId: existingGroup.id,
      zealthy_careName: 'Personalized Psychiatry',
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

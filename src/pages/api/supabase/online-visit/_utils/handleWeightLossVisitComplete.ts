import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { findCoach } from './findCoach';
import { findCoordinator } from './findCoordinator';
import { updateCareTeam } from './updateCareTeam';
import { findMessageGroup } from './findMessageGroup';
import { parseISO } from 'date-fns';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import axios from 'axios';
import {
  weightLossOnly,
  weightLossAccessOnly,
  weightLossOnlyPlusVisit,
  weightLossOnlyNoCompound,
  compoundBundleOnly,
  activeMember,
  activeMemberSync,
  syncAndWeightLoss,
  variables,
  weightLossOralCompound,
} from '@/constants/welcome-messages';
import { replaceAll } from '@/utils/replaceAll';
import getVisitRoomLink from '@/utils/getVisitRoomLink';
import { getClinicianAlias } from '@/utils/getClinicianAlias';

type OnlineVisit = Database['public']['Tables']['online_visit']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Patient = {
  timezone: string;
  status: string;
  canvas_patient_id: string;
  has_verified_identity: boolean;
  vouched_verified: boolean;
  profile: Profile;
};
type Clinician = Database['public']['Tables']['clinician']['Row'];
type PatientAppointment = Database['public']['Tables']['appointment']['Row'] & {
  provider: Clinician | null;
};
type PatientSubscription =
  Database['public']['Tables']['patient_subscription']['Row'] & {
    subscription: Database['public']['Tables']['subscription']['Row'];
  };

export const handleWeightLossVisitComplete = async (
  visit: OnlineVisit,
  isActiveSubscriber: boolean
) => {
  try {
    const patient = await supabaseAdmin
      .from('patient')
      .select(
        'status, canvas_patient_id, timezone, has_verified_identity, vouched_verified,  profile: profiles!inner(*)'
      )
      .eq('id', visit.patient_id)
      .single()
      .then(({ data }) => data as Patient | null);

    if (!patient) {
      throw new Error(
        `Could not find patient for id: ${visit.patient_id} for Weight Loss`
      );
    }

    const requests = await supabaseAdmin
      .from('prescription_request')
      .select('*')
      .eq('patient_id', visit.patient_id)
      .then(({ data }) => data || []);

    const hasCompoundRequest = requests.some(
      r => r.medication_quantity_id === 98
    );

    const hasOralCompoundRequest = requests.some(
      r => r.type === 'WEIGHT_LOSS_GLP1 (ORAL)'
    );

    // find or create weight loss group
    const existingGroup = await findMessageGroup(
      patient.profile.id,
      'Weight Loss'
    );

    if (!existingGroup) {
      throw new Error(
        `Could not create Weight Loss group for patient: ${visit.patient_id}`
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

    // find upcoming weight loss appointments
    const weightLossAppointments = await supabaseAdmin
      .from('appointment')
      .select('*, provider: clinician!inner(*)')
      .eq('patient_id', visit.patient_id)
      .eq('status', 'Confirmed')
      .eq('care', 'Weight loss')
      .then(({ data }) => (data || []) as PatientAppointment[]);

    // find existing Weight Loss group messages
    const existingMessages = await supabaseAdmin
      .from('messages-v2')
      .select()
      .eq('messages_group_id', existingGroup.id)
      .then(({ data }) => data);

    const weightLossSubs = await supabaseAdmin
      .from('patient_subscription')
      .select('*, subscription!inner(*)')
      .eq('patient_id', visit.patient_id)
      .eq('status', 'active')
      .ilike('subscription.name', '%Weight Loss%')
      .then(({ data }) => (data || []) as PatientSubscription[]);

    const compoundBundle = weightLossSubs.find(
      s => s.price === 449 || s.price === 297
    );

    // find coach
    const coach = await findCoach(
      careTeamMembers?.find(m => m.role === 'Weight Loss Coach'),
      'Weight Loss'
    );

    // find coordinator
    const coordinator = await findCoordinator(
      careTeamMembers?.find(m => m.role === 'Coordinator')
    );

    //update group members and care team incase they are not added already

    let careTeam = [
      { id: coordinator?.clinician?.id, role: 'Coordinator' },
      ...(compoundBundle
        ? []
        : [{ id: coach?.clinician?.id, role: 'Weight Loss Coach' }]),
    ];

    const scheduledAppointmentWithProvider = weightLossAppointments.find(
      a => a.appointment_type === 'Provider' && a.encounter_type === 'Scheduled'
    );

    if (scheduledAppointmentWithProvider?.provider?.id) {
      careTeam.push({
        id: scheduledAppointmentWithProvider.provider.id,
        role: 'Weight Loss Provider',
      });
    }

    //update care team
    await updateCareTeam({
      careTeam,
      currentGroup: groupMembers,
      currentTeam: careTeamMembers,
      patientId: visit.patient_id,
      groupId: existingGroup.id,
    });

    // if existing messages, do not send welcome message
    if (existingMessages?.length) {
      return;
    }

    const isWeightLossAccess = weightLossSubs.find(
      s => s.subscription.name === 'Zealthy Weight Loss Access'
    );

    const scheduledAppointmentWithCoach = weightLossAppointments.find(
      a => a.appointment_type === 'Coach (Weight Loss)'
    );

    //build message
    let template = weightLossOnly;

    if (isActiveSubscriber && scheduledAppointmentWithProvider) {
      template = activeMemberSync;
    } else if (isActiveSubscriber) {
      template = activeMember;
    } else if (
      visit.synchronous &&
      scheduledAppointmentWithProvider &&
      scheduledAppointmentWithCoach
    ) {
      template = syncAndWeightLoss;
    } else if (
      visit.synchronous &&
      scheduledAppointmentWithProvider &&
      isWeightLossAccess
    ) {
      template = weightLossAccessOnly;
    } else if (scheduledAppointmentWithProvider) {
      template = weightLossOnlyPlusVisit;
    } else if (compoundBundle) {
      template = compoundBundleOnly;
    } else if (hasOralCompoundRequest) {
      template = weightLossOralCompound;
    } else if (!hasCompoundRequest) {
      template = weightLossOnlyNoCompound;
    }

    if (!patient.has_verified_identity && !patient.vouched_verified) {
      template = template.replace(
        'Your Zealthy provider will be carefully reviewing your medical information and will be in touch with you shortly about your prescription request and the best next steps for you to achieve lasting weight loss. Typically, you’ll hear from your provider within 1-2 business days via message here and they should be able to walk you through your suggested treatment plan, including GLP-1 medication if medically appropriate, and next steps.',
        `For your Zealthy provider to review your responses and create your treatment plan including weight loss medication, you must upload your ID to verify your identity first. Use this link to do so: <a href="https://app.getzealthy.com/patient-portal/identity-verification">https://app.getzealthy.com/patient-portal/identity-verification</a> Once this is completed, your provider will be carefully reviewing your medical information and will be in touch with you about your prescription request and the best next steps for you to achieve lasting weight loss. Typically, you’ll hear from your provider within 1-2 business days of adding your ID via message here and they should be able to walk you through your suggested treatment plan, including GLP-1 medication if medically appropriate, and next steps.`
      );
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
            scheduledAppointmentWithProvider.id
          )
        : '',
      scheduledAppointmentWithCoach?.daily_room
        ? getVisitRoomLink(
            scheduledAppointmentWithCoach.daily_room,
            scheduledAppointmentWithCoach.id
          )
        : '',
      compoundBundle?.subscription?.name?.match(/\+\s*([^\s]+)/)?.[1] || '',
      'Weight loss',
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

    console.log('wlFinalMessage', {
      level: 'info',
      message: `FINAL_MESSAGE`,
      zealthy_patient_id: visit.patient_id,
      zealthy_template: template,
      zealthy_groupId: existingGroup.id,
      zealthy_careName: 'Weight loss',
    });

    return axios.post(
      ['production', 'preview'].includes(process.env.VERCEL_ENV!)
        ? `https://${process.env.VERCEL_URL}/api/message`
        : `${process.env.VERCEL_URL}/api/message`,
      {
        data: finalMessage,
      }
    );
  } catch (err) {
    console.error(err);
  }
};

import { Database } from '@/lib/database.types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type MessagesGroupMember =
  Database['public']['Tables']['messages_group_member']['Row'];
type PatientCareMember =
  Database['public']['Tables']['patient_care_team']['Row'];

type CareTeamMember = {
  id: number;
  role: string;
};

type UpdateCareTeamParams = {
  careTeam: CareTeamMember[];
  currentGroup: MessagesGroupMember[];
  currentTeam: PatientCareMember[];
  patientId: number;
  groupId: number;
};

export const updateCareTeam = async ({
  careTeam,
  currentGroup,
  currentTeam,
  patientId,
  groupId,
}: UpdateCareTeamParams) => {
  return Promise.allSettled(
    careTeam
      .filter(item => !!item.id)
      .map(({ id, role }) => {
        const promises = [];
        if (!currentGroup.find(m => m.clinician_id === id)) {
          promises.push(
            supabaseAdmin.from('messages_group_member').insert({
              messages_group_id: groupId,
              clinician_id: id,
            })
          );
        }

        if (!currentTeam.find(m => m.clinician_id === id)) {
          promises.push(
            supabaseAdmin.from('patient_care_team').insert({
              patient_id: patientId,
              clinician_id: id,
              role,
            })
          );
        }

        return Promise.allSettled(promises);
      })
  );
};

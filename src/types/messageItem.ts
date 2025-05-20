import { Database } from '@/lib/database.types';
import { CareTeamGroup } from '@/utils/careTeamGroups';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type MessageGroup = Omit<
  Database['public']['Tables']['messages_group']['Row'],
  'name'
> & { name: CareTeamGroup | null };

export interface MessageItemI {
  id: number;
  created_at: string;
  display_at: string;
  sender: Profile;
  recipient: Profile;
  decrypted_message_encrypted: string;
  messages_group_id: MessageGroup;
  members: any;
}

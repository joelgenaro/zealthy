import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const findMessageGroup = async (profileId: string, name: string) => {
  const existingGroup = await supabaseAdmin
    .from('messages_group')
    .select()
    .eq('name', name)
    .eq('profile_id', profileId)
    .single()
    .then(({ data }) => data);

  if (existingGroup) {
    return existingGroup;
  }

  return supabaseAdmin
    .from('messages_group')
    .insert({
      profile_id: profileId,
      name,
    })
    .select()
    .single()
    .then(({ data }) => data);
};

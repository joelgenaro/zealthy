import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePatient } from './data';
import { useQuery, useQueryClient } from 'react-query';
import { Database } from '@/lib/database.types';

/**
 * Hook to fetch RATE_COACH action items for the current patient
 * Automatically cleans up duplicate action items
 */
export function useRatableCoachItems() {
  const supabase = useSupabaseClient<Database>();
  const patient = usePatient();
  const queryClient = useQueryClient();
  const isAuthed = !!patient.data?.id;

  return useQuery(
    ['rateCoaches'],
    async () => {
      // First, check for duplicate RATE_COACH items in the future
      const { data: futureItems, error: futureItemsError } = await supabase
        .from('patient_action_item')
        .select('*')
        .eq('patient_id', patient?.data?.id!)
        .eq('type', 'RATE_COACH')
        .eq('completed', false)
        .eq('canceled', false)
        .gt('created_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      // If we have multiple future items, cancel all but the first one
      if (futureItems && futureItems.length > 1) {
        console.log(
          `Found ${futureItems.length} future RATE_COACH items, cleaning up duplicates`
        );
        const keepItem = futureItems[0];
        const duplicateIds = futureItems.slice(1).map(item => item.id);

        await supabase
          .from('patient_action_item')
          .update({
            canceled: true,
            canceled_at: new Date().toISOString(),
          })
          .in('id', duplicateIds);

        // Invalidate cache since we updated items
        queryClient.invalidateQueries('actionItems');
      }

      // Now fetch the current items that should be displayed
      const actionItems = await supabase
        .from('patient_action_item')
        .select('*')
        .eq('patient_id', patient?.data?.id!)
        .eq('type', 'RATE_COACH')
        .lte('created_at', new Date().toISOString())
        .eq('completed', false)
        .eq('canceled', false)
        .order('created_at', { ascending: false })
        .then(({ data }) => data as any[]);

      console.log(actionItems, 'AI');
      return actionItems;
    },
    { enabled: isAuthed, staleTime: 4 * (60 * 1000) }
  );
}

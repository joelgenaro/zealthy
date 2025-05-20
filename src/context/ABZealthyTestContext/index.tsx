import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  ReactNode,
} from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useQueryClient } from 'react-query';

// Define the context type for AB testing
type ABTestContextType = {
  assignVariation: (
    campaignKey: string,
    profileId: string,
    firstName: string,
    lastName: string
  ) => Promise<string | null>;
  trackMetric: (
    campaignKey: string,
    profileId: string,
    metric: string
  ) => Promise<void>;
};

// Create the ABTestContext
const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

// Custom hook to use the ABTestContext
export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

// ABTestProvider component to provide the context value
export const ABTestProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useSupabaseClient<Database>();
  const queryClient = useQueryClient(); // Initialize the query client

  // Function to assign a variation to a user
  const assignVariation = useCallback(
    async (
      campaignKey: string,
      profileId: string,
      firstName: string,
      lastName: string
    ) => {
      // Step 1: Fetch the campaign and its variations
      const { data: campaignWithVariations, error: fetchError } = await supabase
        .from('ab_zealthy_campaign')
        .select(
          `
          id,
          status,
          ab_zealthy_variation (variation_name)
          `
        )
        .eq('campaign_key', campaignKey)
        .single(); // Fetch only one campaign

      if (fetchError || !campaignWithVariations) {
        throw new Error(
          `Error fetching campaign or variations: ${
            fetchError?.message || 'No data found'
          }`
        );
      }

      if (campaignWithVariations.status !== 'live') {
        return null;
      }

      const variations = campaignWithVariations.ab_zealthy_variation;
      if (!variations || variations.length === 0) {
        throw new Error('No variations found for this campaign.');
      }

      // Step 2: Check if the user is already assigned to a variation for this campaign
      const { data: existingAssignment, error: checkError } = await supabase
        .from('ab_zealthy_user_variation')
        .select('variation_name')
        .eq('campaign_key', campaignKey)
        .eq('profile_id', profileId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(
          `Error checking existing assignment: ${checkError.message}`
        );
      }

      // If user is already assigned to a variation, return the existing variation
      if (existingAssignment) {
        console.info('User already assigned to variation', existingAssignment);
        return existingAssignment.variation_name;
      }

      // Step 3: Handle forced variation assignment based on firstName and lastName
      let variationName: string;
      const zMatch = firstName.match(/^z+/i); // Match leading 'z's in the firstName

      if (lastName === 'zzzTEST' && zMatch) {
        const zCount = zMatch[0].length; // Get the count of leading 'z's

        if (zCount === 1) {
          variationName = 'Control'; // zTEST zzzTEST => Control
        } else if (zCount > 1 && zCount <= variations.length) {
          // Ensure there are enough variations for the given zCount
          variationName = variations[zCount - 1].variation_name; // zzTEST zzzTEST => Variation 1, zzzTEST zzzTEST=> Variation 2
        } else {
          // If there are not enough variations, randomly assign a variation
          const randomIndex = Math.floor(Math.random() * variations.length);
          variationName = variations[randomIndex].variation_name;
        }
      } else {
        // Step 4: Randomly assign a variation from the fetched campaign's variations if no forced variation
        const randomIndex = Math.floor(Math.random() * variations.length);
        variationName = variations[randomIndex].variation_name;
      }

      // Step 5: Insert the assigned variation into the user_variation table
      const { error: insertError } = await supabase
        .from('ab_zealthy_user_variation')
        .upsert({
          profile_id: profileId,
          campaign_key: campaignKey,
          variation_name: variationName,
        });

      if (insertError) {
        throw new Error(
          `Error assigning user to variation: ${insertError.message}`
        );
      }

      queryClient.invalidateQueries(['useABZVariationName', campaignKey]); // Invalidate the specific query
      return variationName;
    },
    [supabase, queryClient]
  );

  // Function to track an event (metric) for a user
  const trackMetric = useCallback(
    async (campaignKey: string, profileId: string, metric: string) => {
      // Step 1: Check if the user is part of the campaign by checking user variation
      const { data: userVariation, error: variationError } = await supabase
        .from('ab_zealthy_user_variation')
        .select('variation_name')
        .eq('campaign_key', campaignKey)
        .eq('profile_id', profileId)
        .single();

      if (!userVariation) {
        return;
      }

      // Step 2: Check if the metric exists for the given campaign
      const { data: existingMetric } = await supabase
        .from('ab_zealthy_metric')
        .select('metric_name')
        .eq('campaign_key', campaignKey)
        .eq('metric_name', metric)
        .single();

      if (!existingMetric) {
        throw new Error('Metric does not exist for this campaign');
      }

      // Step 3: Check if the user has already tracked this metric for the campaign
      const { data: userMetric } = await supabase
        .from('ab_zealthy_user_metric')
        .select('metric_name')
        .eq('campaign_key', campaignKey)
        .eq('profile_id', profileId)
        .eq('metric_name', metric)
        .single();

      if (userMetric) {
        console.log('Metric already tracked for this user and campaign');
        return;
      }

      // Step 4: Insert the new metric into the user_metric table
      const { error: insertError } = await supabase
        .from('ab_zealthy_user_metric')
        .insert({
          campaign_key: campaignKey,
          metric_name: metric,
          profile_id: profileId,
        });

      if (insertError) {
        throw new Error(`Error tracking metric: ${insertError.message}`);
      }

      console.info('Successfully added metric');
      return;
    },
    [supabase]
  );

  // Memoize the value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      assignVariation,
      trackMetric,
    }),
    [assignVariation, trackMetric]
  );

  return (
    <ABTestContext.Provider value={value}>{children}</ABTestContext.Provider>
  );
};

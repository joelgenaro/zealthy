import getVWOInstance from '@/utils/vwoClient';
import { VWOApiOptions, vwoInstance } from 'vwo-node-sdk';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PatientProps, usePatient } from '@/components/hooks/data';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useSelector } from '@/components/hooks/useSelector';

const testingUsers = [
  'zTEST zzzTEST',
  'zzTEST zzzTEST',
  'zzzTEST zzzTEST',
  'zzzzTEST zzzTEST',
  'zzzzzTEST zzzTEST',
  'zzzzzzTEST zzzTEST',
  'zzzzzzzTEST zzzTEST',
  'zzzzzzzzTEST zzzTEST',
];

type MetricHit = {
  goalIdentifier: string;
};

type IsPatient = {
  id: number;
  profile_id: string;
};

type ActivateOptions = {
  userId: string;
  firstName: string;
  lastName: string;
  patientId: number;
};

type VariationInfo = {
  campaignKey: string;
  variationName: string | null | undefined;
  patientId: string;
  vwoOptions?: VWOApiOptions;
  metrics?: MetricHit[];
};

type VWOContextType = {
  activate: <T extends IsPatient>(
    campaignKey: string,
    patient: T
  ) => Promise<string | null | undefined>;
  activateBefore: (
    campaignKey: string,
    options: ActivateOptions
  ) => Promise<string | null | undefined>;
  track: (
    campaignSpecifier: string,
    goalIdentifier: string,
    patient: PatientProps | any
  ) => Promise<Record<string, boolean> | undefined>;
  getVariationName: (
    campaignKey: string,
    userId: string
  ) => string | null | undefined;
};

const VWOContext = createContext<VWOContextType>({
  activateBefore: async () => undefined,
  activate: async () => undefined,
  track: async () => undefined,
  getVariationName: () => undefined,
});

export function useVWO() {
  return useContext(VWOContext);
}

interface VWOContextProviderProps {
  children: ReactNode;
}

const VWOContextProvider = ({ children }: VWOContextProviderProps) => {
  const [instance, setInstance] = useState<vwoInstance | null>(null);
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const first_name = useSelector(store => store.profile.first_name);
  const last_name = useSelector(store => store.profile.last_name);

  const name = useMemo(() => {
    if (patient && patient.profiles.first_name && patient.profiles.last_name) {
      return `${patient.profiles.first_name} ${patient.profiles.last_name}`;
    }
    return `${first_name} ${last_name}`;
  }, [first_name, last_name, patient]);

  const vwoOptions = useMemo(() => {
    let vwoOpts: VWOApiOptions | undefined = undefined;
    if (testingUsers.includes(name)) {
      vwoOpts = {
        variationTargetingVariables: {
          'User Name': name,
        },
      };
    }
    return vwoOpts;
  }, [name]);

  function saveVariationToLocalStorage(entry: VariationInfo) {
    const storedStr = localStorage.getItem('vwoVariations');
    const existing: VariationInfo[] = storedStr ? JSON.parse(storedStr) : [];
    const idx = existing.findIndex(
      v =>
        v.campaignKey === entry.campaignKey && v.patientId === entry.patientId
    );
    if (idx === -1) {
      existing.push(entry);
    } else {
      existing[idx] = {
        ...existing[idx],
        ...entry,
      };
    }
    localStorage.setItem('vwoVariations', JSON.stringify(existing));
  }

  const activate = useCallback(
    async <T extends IsPatient>(campaignKey: string, patient: T) => {
      const variationName = instance?.activate(
        campaignKey,
        String(patient.id),
        vwoOptions
      );

      if (patient.profile_id && variationName) {
        const { data: existingRows } = await supabase
          .from('ab_campaign_user')
          .select('*')
          .eq('campaign_key', campaignKey)
          .eq('profile_id', patient.profile_id)
          .eq('variation_name', variationName);
        if (!existingRows?.length) {
          await supabase.from('ab_campaign_user').insert({
            campaign_key: campaignKey,
            profile_id: patient.profile_id,
            variation_name: variationName,
          });
        }
      }

      if (campaignKey && variationName && patient.id) {
        const newEntry: VariationInfo = {
          campaignKey,
          variationName,
          patientId: String(patient.id),
        };
        if (testingUsers.includes(name) && vwoOptions) {
          newEntry.vwoOptions = vwoOptions;
        }
        saveVariationToLocalStorage(newEntry);
      }

      return variationName;
    },
    [instance, supabase, vwoOptions, name]
  );

  const activateBefore = useCallback(
    async (campaignKey: string, options: ActivateOptions) => {
      const { userId, patientId } = options;
      const variationName = instance?.activate(
        campaignKey,
        String(patientId),
        vwoOptions
      );

      if (variationName) {
        const { data: existingRows } = await supabase
          .from('ab_campaign_user')
          .select('*')
          .eq('campaign_key', campaignKey)
          .eq('profile_id', userId)
          .eq('variation_name', variationName);
        if (!existingRows?.length) {
          await supabase.from('ab_campaign_user').insert({
            campaign_key: campaignKey,
            profile_id: userId,
            variation_name: variationName,
          });
        }
      }

      if (campaignKey && variationName && patientId) {
        const newEntry: VariationInfo = {
          campaignKey,
          variationName,
          patientId: String(patientId),
        };
        if (testingUsers.includes(name) && vwoOptions) {
          newEntry.vwoOptions = vwoOptions;
        }
        saveVariationToLocalStorage(newEntry);
      }

      return variationName;
    },
    [instance, supabase, vwoOptions, name]
  );

  const track = useCallback(
    async (
      campaignSpecifier: string,
      goalIdentifier: string,
      patient: PatientProps
    ) => {
      if (!patient?.profile_id) return;
      const { data: existingMetric } = await supabase
        .from('ab_campaign_metric')
        .select('*')
        .eq('profile_id', patient.profile_id)
        .eq('metric_name', goalIdentifier)
        .eq('campaign_key', campaignSpecifier);
      if (!existingMetric?.length) {
        await supabase.from('ab_campaign_metric').insert({
          profile_id: patient.profile_id,
          metric_name: goalIdentifier,
          campaign_key: campaignSpecifier,
        });
      }

      const vwoTracker = instance?.track(
        campaignSpecifier,
        String(patient.id),
        goalIdentifier
      );

      if (vwoTracker) {
        const storedStr = localStorage.getItem('vwoVariations');
        const variations: VariationInfo[] = storedStr
          ? JSON.parse(storedStr)
          : [];
        const index = variations.findIndex(
          v =>
            v.campaignKey === campaignSpecifier &&
            v.patientId === String(patient.id) &&
            v.variationName
        );
        if (index === -1) {
          return vwoTracker;
        }
        const existingMetrics = variations[index].metrics || [];
        const hasSameGoal = existingMetrics.some(
          m => m.goalIdentifier === goalIdentifier
        );
        if (!hasSameGoal) {
          existingMetrics.push({ goalIdentifier });
          variations[index].metrics = existingMetrics;
          localStorage.setItem('vwoVariations', JSON.stringify(variations));
        }
      }

      return vwoTracker;
    },
    [instance, supabase]
  );

  const getVariationName = useCallback(
    (campaignKey: string, userId: string) => {
      return instance?.getVariationName(campaignKey, userId, vwoOptions);
    },
    [instance, vwoOptions]
  );

  useEffect(() => {
    const loadUserData = async () => {
      if (!patient?.profile_id) return;
      const { data: userCampaigns } = await supabase
        .from('ab_campaign_user')
        .select('*')
        .eq('profile_id', patient.profile_id);
      const validCampaigns = (userCampaigns || []).filter(
        row =>
          row.campaign_key &&
          row.profile_id &&
          row.variation_name &&
          row.variation_name !== 'null'
      );
      validCampaigns.forEach(row => {
        const entry: VariationInfo = {
          campaignKey: row.campaign_key!,
          variationName: row.variation_name!,
          patientId: String(patient.id),
        };
        if (testingUsers.includes(name) && vwoOptions) {
          entry.vwoOptions = vwoOptions;
        }
        saveVariationToLocalStorage(entry);
      });

      const { data: userMetrics } = await supabase
        .from('ab_campaign_metric')
        .select('*')
        .eq('profile_id', patient.profile_id);
      (userMetrics || []).forEach(row => {
        const { campaign_key, metric_name } = row;
        if (!campaign_key || !metric_name) return;
        const storedStr = localStorage.getItem('vwoVariations');
        const variations: VariationInfo[] = storedStr
          ? JSON.parse(storedStr)
          : [];
        const idx = variations.findIndex(
          v =>
            v.campaignKey === campaign_key &&
            v.patientId === String(patient.id) &&
            v.variationName
        );
        if (idx === -1) {
          return;
        }
        const newMetric: MetricHit = {
          goalIdentifier: metric_name,
        };
        const existingMetrics = variations[idx].metrics || [];
        const hasSameGoal = existingMetrics.some(
          m => m.goalIdentifier === metric_name
        );
        if (!hasSameGoal) {
          existingMetrics.push(newMetric);
          variations[idx].metrics = existingMetrics;
        }
        localStorage.setItem('vwoVariations', JSON.stringify(variations));
      });
    };
    loadUserData();
  }, [patient?.profile_id, supabase, name, vwoOptions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        window.navigator.userAgent !==
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/13.6.3 Chrome/114.0.5735.289 Electron/25.8.4 Safari/537.36'
      ) {
        getVWOInstance().then(vwo => setInstance(vwo));
      }
    }
  }, []);

  const value = useMemo(
    () => ({
      activate,
      activateBefore,
      track,
      getVariationName,
    }),
    [activate, activateBefore, track, getVariationName]
  );

  return <VWOContext.Provider value={value}>{children}</VWOContext.Provider>;
};

export default VWOContextProvider;

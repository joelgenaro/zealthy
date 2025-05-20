import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  usePatientActions,
  usePatientAsync,
  usePatientState,
} from '@/components/hooks/usePatient';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import UsStates from '@/constants/us-states';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useLanguage } from '@/components/hooks/data';
import { VARIANT_7759 } from '@/pages/ed';

interface RegionPickerProps {
  nextPage: string;
  shouldCreatePatient?: boolean;
}

const RegionPicker = ({
  nextPage,
  shouldCreatePatient = true,
}: RegionPickerProps) => {
  const { region } = usePatientState();
  const { addRegion } = usePatientActions();
  const [loading, setLoading] = useState(false);
  const { createPatient } = usePatientAsync();
  const supabase = useSupabaseClient<Database>();
  const [supportedRegions, setSupportedRegions] = useState<string[]>([]);
  const { addPotentialInsurance, addSpecificCare, addVariant } =
    useIntakeActions();
  const { potentialInsurance, specificCare } = useIntakeState();
  const [unsupportedParams, setUnsupportedParams] = useState('');
  const router = useRouter();
  const user = useUser();
  const { query, push } = Router;
  const language = useLanguage();
  let continueText = 'Continue';
  let label = 'State of residence';

  const handleContinue = async () => {
    if (!region) return;

    window?.freshpaint?.identify(user?.id, {
      state: region,
    });

    if (
      potentialInsurance ===
        PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED &&
      ['CA', 'MN'].includes(region)
    ) {
      Router.push(`${Pathnames.UNSUPPORTED_REGION}?care=${'Weight loss'}`);
      return;
    }

    if (
      ['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        potentialInsurance || ''
      ) &&
      region !== 'FL'
    ) {
      Router.push(Pathnames.UNSUPPORTED_PROGRAM);
      return;
    }

    if (
      router.pathname === '/ed/region' &&
      (!supportedRegions.includes(region) || region === 'SC')
    ) {
      Router.push(Pathnames.ED_UNSUPPORTED_REGION);
      return;
    }

    if (
      specificCare === SpecificCareOption.FEMALE_HAIR_LOSS &&
      ['CA', 'MN']?.includes(region)
    ) {
      Router.push(`${Pathnames.UNSUPPORTED_REGION}?care=Hair+Loss`);
      return;
    }

    if (
      specificCare === SpecificCareOption.ENCLOMIPHENE &&
      ['CA']?.includes(region)
    ) {
      Router.push(
        `${Pathnames.UNSUPPORTED_PROGRAM}?care=${SpecificCareOption.ENCLOMIPHENE}`
      );
      return;
    }

    if (
      specificCare === SpecificCareOption.SEX_PLUS_HAIR &&
      ['CA', 'MN', 'AL', 'AR', 'HI', 'MS', 'KS', 'MI', 'VA']?.includes(region)
    ) {
      Router.push(`${Pathnames.UNSUPPORTED_REGION}?care=Sex+Hair`);
      return;
    }

    if (!supportedRegions.includes(region)) {
      Router.push(`${Pathnames.UNSUPPORTED_REGION}?care=${unsupportedParams}`);
      return;
    }

    if (potentialInsurance === 'OH' && region !== 'OH') {
      addPotentialInsurance(null);
    }

    if (query.variant === '5674-ED') {
      addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
      addPotentialInsurance(PotentialInsuranceOption.ED_HARDIES);
      addVariant('5674-ED');
      push({
        pathname: Pathnames.ED_AGE,
        query: {
          care: SpecificCareOption.ERECTILE_DYSFUNCTION,
          ins: PotentialInsuranceOption.ED_HARDIES,
          variant: '5674-ED',
        },
      });
    }

    if (query.variant === '5440') {
      addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
      addVariant('5440');
      push({
        pathname: Pathnames.ED_AGE,
        query: {
          care: SpecificCareOption.ERECTILE_DYSFUNCTION,
          variant: '5440',
        },
      });
    }

    if (query.variant === VARIANT_7759) {
      sessionStorage.setItem('region-ed', region);
      addVariant(VARIANT_7759);
      push({
        pathname: Pathnames.ED_AGE,
        query: {
          variant: VARIANT_7759,
        },
      });
      return;
    }

    try {
      setLoading(true);
      shouldCreatePatient && (await createPatient());
      sessionStorage.setItem(`valid-region`, region);
      Router.push(nextPage);
      setLoading(false);
    } catch (err) {
      console.error('regionPick_continue_err', err as any);
      setLoading(false);
    }
  };

  const handleRegion = useCallback(
    (e: SelectChangeEvent<string | null>) => {
      const { value } = e.target;
      if (value) addRegion(value);
    },
    [addRegion]
  );

  useEffect(() => {
    if (specificCare?.toLowerCase()?.includes('mental health')) {
      setSupportedRegions(['CA', 'PA', 'FL']);
      setUnsupportedParams('mental health');
    } else {
      const getSupportedStates = async () => {
        return supabase
          .from('state')
          .select('abbreviation')
          .eq('active', true)
          .then(({ data }) => data?.map(state => state.abbreviation) || [])
          .then(setSupportedRegions);
      };
      getSupportedStates();
    }
  }, [supabase, specificCare]);

  if (language === 'esp') {
    label = 'Estado de residencia';
    continueText = 'Continuar';
    label = 'Estado de residencia';
  }

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="select-state-label">{label}</InputLabel>
        <Select
          required
          labelId="select-state-label"
          id="select-state"
          value={region || ''}
          label={label}
          onChange={handleRegion}
        >
          {UsStates.map(({ name, abbreviation }) => (
            <MenuItem key={abbreviation} value={abbreviation}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <LoadingButton
        disabled={!region}
        loading={loading}
        onClick={handleContinue}
      >
        {continueText}
      </LoadingButton>
    </>
  );
};

export default RegionPicker;

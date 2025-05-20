import ErrorMessage from '@/components/shared/ErrorMessage';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DatePicker from '@/components/shared/DatePicker';
import { useCallback, useState } from 'react';
import {
  useProfileActions,
  useProfileAsync,
  useProfileState,
} from '@/components/hooks/useProfile';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import format from 'date-fns/format';
import { differenceInYears } from 'date-fns';
import isValid from 'date-fns/fp/isValid';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';
import UsStates from '@/constants/us-states';

interface BirthDayPickerProps {
  nextPage: string;
  shouldUpdateProfile?: boolean;
  showNoPhoneOrVideo?: boolean;
}

const BirthDayPicker = ({
  nextPage,
  shouldUpdateProfile = true,
  showNoPhoneOrVideo = false,
}: BirthDayPickerProps) => {
  const isMobile = useIsMobile();
  const { addDateOfBirth } = useProfileActions();
  const { addSpecificCare, addVariant, addPotentialInsurance } =
    useIntakeActions();
  const { variant } = useIntakeState();
  const updateProfile = useProfileAsync();
  const { birth_date } = useProfileState();
  const { region } = usePatientState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputBirthday, setInputBirthday] = useState<string>(
    birth_date ? birth_date : ''
  );
  const user = useUser();
  const languageParams = useSearchParams();
  const { query, push } = Router;
  const language = useLanguage();
  let dateOfBirthText = 'What’s your date of birth?';
  let confirmText = 'Confirm you’re eligible';
  let continueText = 'Continue';
  let invalidText = 'Invalid date';
  let monthDayYear = 'MM/DD/YYYY';
  const noVideoOrCallText = 'No video or phone call required in [State Name]!';

  if (language === 'esp') {
    dateOfBirthText = 'Cual es tu fecha de nacimiento';
    confirmText = 'Confirma que eres elgible';
    continueText = 'Continuar';
    invalidText = 'Fecha no es valida';
    monthDayYear = 'MM/DD/AAAA';
  }

  const handleDate = useCallback(
    (value: string | null) => {
      setError('');
      if (isValid(new Date(value || ''))) {
        const date = format(new Date(value!), 'yyyy-MM-dd');
        setInputBirthday(date);
        addDateOfBirth(date);
      } else {
        setInputBirthday('');
        setError(invalidText);
      }
    },
    [addDateOfBirth, setError, setInputBirthday]
  );

  const handleContinue = async () => {
    const age = differenceInYears(new Date(), new Date(inputBirthday));

    if (!isValid(new Date(inputBirthday))) {
      setError(invalidText);
      return;
    }

    if (age >= 120) {
      setError(invalidText);
      return;
    }

    const oldEnough = age && age >= 18;

    try {
      setLoading(true);
      if (shouldUpdateProfile) {
        await updateProfile({ birth_date: inputBirthday });
      }

      if (oldEnough) {
        window?.freshpaint?.identify(user?.id, {
          birth_date: birth_date,
        });
        if (query.variant === '5674-ED') {
          addSpecificCare(SpecificCareOption.ERECTILE_DYSFUNCTION);
          addPotentialInsurance(PotentialInsuranceOption.ED_HARDIES);
          addVariant('5674-ED');
          push({
            pathname: Pathnames.ED_SIGNUP,
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
            pathname: Pathnames.ED_SIGNUP,
            query: {
              care: SpecificCareOption.ERECTILE_DYSFUNCTION,
              variant: '5440',
            },
          });
        }
        Router.push(nextPage);
      } else {
        window?.freshpaint?.identify(user?.id, {
          birth_date: birth_date,
        });
        Router.push(Pathnames.UNSUPPORTED_AGE);
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <Grid container direction="column" gap={isMobile ? 4 : 6}>
      <Grid container direction="column" gap="16px">
        <Typography variant="h4">{confirmText}</Typography>
        <Typography variant="h2">{dateOfBirthText}</Typography>
        {showNoPhoneOrVideo && region ? (
          <Typography
            variant="body1"
            color="white"
            bgcolor="#3C975A"
            px={0.5}
            borderRadius={1}
            width="fit-content"
          >
            {noVideoOrCallText.replace(
              '[State Name]',
              UsStates.find(s => s.abbreviation === region)?.name ??
                'invalid state'
            )}
          </Typography>
        ) : null}
      </Grid>

      <Box display="flex" flexDirection="column" gap="5px">
        <DatePicker
          desktopModeMediaQuery="(min-width: 0px)"
          value={inputBirthday}
          onChange={handleDate}
          placeholder={monthDayYear}
        />
        {inputBirthday && error ? <ErrorMessage>{error}</ErrorMessage> : null}
      </Box>

      <LoadingButton
        fullWidth
        loading={loading}
        disabled={!inputBirthday || loading}
        onClick={handleContinue}
      >
        {continueText}
      </LoadingButton>
    </Grid>
  );
};

export default BirthDayPicker;

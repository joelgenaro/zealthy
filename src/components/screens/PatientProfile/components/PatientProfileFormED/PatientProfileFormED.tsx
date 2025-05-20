import Router from 'next/router';
import {
  forwardRef,
  ChangeEvent,
  FormEvent,
  useState,
  useMemo,
  useCallback,
} from 'react';
import CustomText from '@/components/shared/Text/CustomText';
import {
  ProfileInfo,
  useProfileActions,
  useProfileState,
} from '@/components/hooks/useProfile';
import {
  PatientInfo,
  usePatientActions,
  usePatientState,
} from '@/components/hooks/usePatient';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useUser } from '@supabase/auth-helpers-react';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import InsuranceSelection from '../InsuranceSelection';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { calculatePatientStatus } from '@/utils/calculatePatientStatus';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { Pathnames } from '@/types/pathnames';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { validatePhoneNumber } from '@/utils/phone/validatePhoneNumber';
import { usePatient } from '@/components/hooks/data';
import { useVWO } from '@/context/VWOContext';
import { useQuestionnaireQuestion } from '@/components/hooks/useQuestionnaireQuestion';
import { IMaskInput } from 'react-imask';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

interface PatientProfileFormProps {
  updateUser: (
    userInfo: ProfileInfo,
    patientInfo: PatientInfo
  ) => Promise<void>;
  error: string;
  setError: (error: string) => void;
  isActive: boolean;
}

const PhoneInputMaskV1 = forwardRef<HTMLElement, CustomProps>(
  function PhoneInputMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="+1 (#00) 000-0000"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

const PatientProfileFormED = ({
  updateUser,
  error,
  setError,
  isActive,
}: PatientProfileFormProps) => {
  const user = useUser();
  const { addFirstName, addLastName, addSexAtBirth, addPhone } =
    useProfileActions();
  const { addOptedInForUpdates } = usePatientActions();
  const { age, ...profileState } = useProfileState();
  const patientState = usePatientState();
  const { data: patient } = usePatient();
  const { potentialInsurance, specificCare } = useIntakeState();
  const [loading, setLoading] = useState(false);
  const [variation6399, setVariation6399] = useState<string | undefined>();
  const quesitonnaire = useQuestionnaireQuestion();
  const vwoClient = useVWO();

  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patientState.id
  );

  const phoneNumberErr =
    !!profileState?.phone_number &&
    !validatePhoneNumber(profileState?.phone_number);

  const allValid = useMemo(() => {
    const validPhone = validatePhoneNumber(profileState?.phone_number);

    return (
      !!profileState.first_name?.trimEnd() &&
      !!profileState.last_name?.trimEnd() &&
      !!profileState.gender &&
      validPhone
    );
  }, [
    profileState.first_name,
    profileState.gender,
    profileState.last_name,
    profileState.phone_number,
  ]);

  const handleFirstName = (e: ChangeEvent<HTMLInputElement>) =>
    addFirstName(e.target.value.trimStart());

  const handleLastName = (e: ChangeEvent<HTMLInputElement>) =>
    addLastName(e.target.value.trimStart());

  const handlePhoneNumber = (e: ChangeEvent<HTMLInputElement>) =>
    addPhone(e.target.value);

  const handleSexAtBirth = (e: ChangeEvent<HTMLInputElement>) =>
    addSexAtBirth(e.target.value);

  const handleOptedInForUpdates = (e: ChangeEvent<HTMLInputElement>) =>
    addOptedInForUpdates(e.target.checked);

  const onSuccess = useCallback(() => {
    activateVariant();
    if (profileState.gender === 'female') {
      return Router.push(Pathnames.ED_UNSUPPORTED_CARE);
    }

    createVisitAndNavigateAway([SpecificCareOption.ERECTILE_DYSFUNCTION], {
      resetValues: false,
    });
  }, [createVisitAndNavigateAway, profileState.gender]);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      updateUser(
        { ...profileState, email: user?.email! },
        {
          text_me_update: patientState.text_me_update,
          status: calculatePatientStatus(
            PatientStatus.PROFILE_CREATED,
            patientState.status as PatientStatus
          ),
        }
      )
        .then(() => onSuccess())
        .catch(() => {
          setError('Something went wrong. Please try again.');
          setLoading(false);
        });
    },

    [
      onSuccess,
      patientState.status,
      patientState.text_me_update,
      profileState,
      setError,
      updateUser,
      user?.email,
    ]
  );
  console.log({ HELLO_patient: patient });
  console.log({ HELLO_quesitonnaire: quesitonnaire });

  const activateVariant = async () => {
    if (patient) {
      const variation6399 = await vwoClient.activate('6399', patient!);
      setVariation6399(variation6399!);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Grid
        container
        direction="column"
        gap={{ sm: '48px', xs: '32px' }}
        display="flex"
      >
        <Grid container direction="column" gap="16px" display="flex">
          <Grid container direction="row" gap="16px" display="flex">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  placeholder="First Name"
                  variant="outlined"
                  autoComplete="given-name"
                  value={profileState.first_name}
                  inputProps={{ maxLength: 50 }}
                  onChange={handleFirstName}
                  disabled={isActive}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  placeholder="Last Name"
                  variant="outlined"
                  autoComplete="family-name"
                  value={profileState.last_name}
                  inputProps={{ maxLength: 50 }}
                  onChange={handleLastName}
                  disabled={isActive}
                  required
                />
              </Grid>
            </Grid>
          </Grid>
          <FormControl fullWidth>
            {!profileState.gender && (
              <InputLabel
                sx={{
                  fontSize: '16px',
                  color: '#777777',
                  pl: '10px',
                  overflow: 'visible',
                }}
                id="select-sex-label"
              >
                Sex assigned at birth
              </InputLabel>
            )}
            <TextField
              select
              required
              autoComplete="sex"
              value={profileState.gender || ''}
              placeholder="Sex assigned at birth"
              onChange={handleSexAtBirth}
            >
              <MenuItem value={'male'}>Male</MenuItem>
              <MenuItem value={'female'}>Female</MenuItem>
            </TextField>
          </FormControl>
        </Grid>
        {potentialInsurance &&
          ![
            PotentialInsuranceOption.MEDICARE_ACCESS_FLORIDA,
            PotentialInsuranceOption.OUT_OF_NETWORK_V2,
            PotentialInsuranceOption.ED_HARDIES,
          ].includes(potentialInsurance) && <InsuranceSelection />}
        <Grid container direction="column" gap="16px">
          <TextField
            value={profileState.phone_number}
            required
            fullWidth
            onChange={handlePhoneNumber}
            placeholder="Phone number"
            variant="outlined"
            autoComplete="tel"
            error={!!phoneNumberErr}
            type="tel"
            InputProps={{
              inputComponent: PhoneInputMaskV1 as any,
              disableUnderline: true,
            }}
          />
          {!!phoneNumberErr ? (
            <CustomText color="red" textAlign="center">
              Please add a valid phone number.
            </CustomText>
          ) : null}

          <Box
            padding="20px 24px 24px"
            border="1px solid #00000033"
            borderRadius="12px"
            color="#00000099"
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={patientState.text_me_update}
                  onChange={handleOptedInForUpdates}
                />
              }
              label="Text me updates"
            />
            <Box
              padding="20px 24px"
              color="#1B1B1B"
              borderRadius="12px"
              bgcolor="#EEEEEE"
            >
              <Typography variant="h4" marginBottom="1rem">
                Opt-in for SMS notifications about latest offers from Zealthy
              </Typography>
              <Typography variant="h4">
                By selecting “Text me updates”, you agree to receive texts from
                Zealthy to the number you provided that might be considered
                marketing. Agreeing is not required to purchase. Message and
                data rates may apply. Message frequency varies. Reply HELP for
                help. Reply STOP to opt-out. Read Zealthy’s SMS policy{' '}
                <Link href="#" underline="none">
                  here
                </Link>
                .
              </Typography>
            </Box>
          </Box>
        </Grid>
        {error ? (
          <CustomText color="red" textAlign="center">
            {error}
          </CustomText>
        ) : null}
        <LoadingButton
          disabled={!allValid || loading}
          type="submit"
          loading={loading}
        >
          Continue
        </LoadingButton>
      </Grid>
    </form>
  );
};

export default PatientProfileFormED;

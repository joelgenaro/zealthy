import Router from 'next/router';
import PhoneInputMask from '@/components/shared/PhoneInputMask/PhoneInputMask';
import {
  ChangeEvent,
  FormEvent,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CustomText from '@/components/shared/Text/CustomText';
import { useInsuranceState } from '@/components/hooks/useInsurance';
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
import { Pathnames } from '@/types/pathnames';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useUser } from '@supabase/auth-helpers-react';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { calculatePatientStatus } from '@/utils/calculatePatientStatus';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';
import { validatePhoneNumber } from '@/utils/phone/validatePhoneNumber';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useLanguage, usePatient } from '@/components/hooks/data';
import getConfig from '../../../../../../config';
import { IMaskInput } from 'react-imask';
import { useVWOVariationName } from '@/components/hooks/data';

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

const PatientProfileForm = ({
  updateUser,
  error,
  setError,
  isActive,
}: PatientProfileFormProps) => {
  const user = useUser();
  const isMobile = useIsMobile();
  const { data: variation9363 } = useVWOVariationName('9363');
  const isVariation9363 = variation9363?.variation_name === 'Variation-1';

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const { addFirstName, addLastName, addSexAtBirth, addPhone } =
    useProfileActions();
  const { addOptedInForUpdates } = usePatientActions();
  const { hasInsurance } = useInsuranceState();
  const { age, ...profileState } = useProfileState();
  const patientState = usePatientState();
  const { potentialInsurance, specificCare, variant } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { data: patient } = usePatient();
  const [loading, setLoading] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const redirectUser = useRedirectUser(patientState.id);
  const language = useLanguage();
  const phoneNumberErr =
    !!profileState?.phone_number &&
    !validatePhoneNumber(profileState?.phone_number);

  let updates = 'Text me updates';
  let optIn = `Opt-in for SMS notifications about latest offers from ${siteName}`;
  let textMeUpdates = `By selecting "Text me updates", you agree to receive texts
                          from ${siteName} to the number you provided that might be
                          considered marketing. Agreeing is not required to purchase.
                          Message and data rates may apply. Message frequency varies.
                          Reply HELP for help. Reply STOP to opt-out. Read ${siteName}'s SMS
                          policy`;

  let phoneNum = 'Phone Number';
  let firstName = 'First Name';
  let genderOpt = 'Sex assigned at birth';
  let lastName = 'Last Name';
  let M = 'Male';
  let F = 'Female';
  let continueButtonText = 'Continue';
  let here = ' here ';
  let invalidInput = 'Invalid input';

  if (language === 'esp') {
    updates = 'Envíame actualizaciones por mensaje de texto';
    optIn = `Optar por notificaciones SMS sobre las últimas ofertas de ${siteName}`;
    textMeUpdates = `Al seleccionar "Envíame actualizaciones por mensaje de
                      texto", aceptas recibir mensajes de texto de ${siteName} al
                      número que proporcionaste y que podrían considerarse
                      marketing. No es necesario aceptar para realizar una compra.
                      Se pueden aplicar tarifas de mensajes y datos. La frecuencia
                      de los mensajes puede variar. Responde AYUDA para obtener
                      ayuda. Responde STOP para cancelar la suscripción. Lee la
                      política de SMS de ${siteName} `;
    phoneNum = 'Numero de telefono';
    firstName = 'Nombre';
    lastName = 'Apellido';
    genderOpt = 'Genero';
    M = 'Masculino';
    F = 'Femenino';
    updates = 'Envíame actualizaciones por mensaje de texto';
    continueButtonText = 'Continuar';
    here = ' aquí ';
    invalidInput = 'Entrada inválida.';
  }

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

  const handleFirstName = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      addFirstName('');
      setFirstNameError('');
      return;
    }

    if (e.target.validity.valid) {
      addFirstName(e.target.value.trimStart());
      setFirstNameError('');
    } else {
      setFirstNameError(invalidInput);
    }
  };

  const handleLastName = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      addLastName('');
      setLastNameError('');
      return;
    }

    if (e.target.validity.valid) {
      addLastName(e.target.value.trimStart());
      setLastNameError('');
    } else {
      setLastNameError(invalidInput);
    }
  };

  const handlePhoneNumber = (e: ChangeEvent<HTMLInputElement>) =>
    addPhone(e.target.value);

  const handleSexAtBirth = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      addSexAtBirth(e.target.value);

      if (
        e.target.value === 'male' &&
        specificCare === SpecificCareOption.FEMALE_HAIR_LOSS
      ) {
        addSpecificCare(SpecificCareOption.HAIR_LOSS);
        return;
      }

      if (
        e.target.value === 'female' &&
        specificCare === SpecificCareOption.HAIR_LOSS
      ) {
        addSpecificCare(SpecificCareOption.FEMALE_HAIR_LOSS);
      }
    },
    [addSexAtBirth, addSpecificCare, specificCare]
  );

  const commonTextStyles = {
    position: 'absolute',
    top: isMobile ? '-45px' : '-50px',
    left: '0',
    width: '100%',
    textAlign: 'center',
    color: 'red',
    zIndex: 9999,
  };

  const getValidationMessage = () => {
    const errors = [];
    if (!profileState.gender) {
      errors.push(
        language === 'esp'
          ? 'Por favor seleccione su sexo asignado al nacer para continuar.'
          : 'Please select your sex assigned at birth to continue.'
      );
    }
    if (!profileState.first_name || !profileState.last_name) {
      errors.push(
        language === 'esp'
          ? 'Por favor asegúrese de ingresar su nombre completo.'
          : 'Please make sure that your full name is entered.'
      );
    }
    if (!validatePhoneNumber(profileState.phone_number)) {
      errors.push(
        language === 'esp'
          ? 'Por favor, asegúrese de que su número de teléfono esté ingresado correctamente con la cantidad correcta de dígitos.'
          : 'Please make sure your phone number is entered accurately with the correct number of digits.'
      );
    }

    if (errors.length === 1) {
      return errors[0];
    } else if (errors.length > 1) {
      return language === 'esp'
        ? 'Por favor, asegúrese de que todos los campos anteriores estén completos y sean precisos.'
        : 'Please make sure all of the above fields are entered fully and accurately.';
    }
    return null;
  };

  const validationMessage = getValidationMessage();

  const handleOptedInForUpdates = (e: ChangeEvent<HTMLInputElement>) =>
    addOptedInForUpdates(e.target.checked);

  const onSuccess = useCallback(() => {
    if (
      (profileState.gender === 'male' &&
        specificCare === SpecificCareOption.BIRTH_CONTROL) ||
      (profileState.gender === 'female' &&
        (specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION ||
          specificCare === SpecificCareOption.ENCLOMIPHENE))
    ) {
      return Router.push('/onboarding/unsupported-care');
    }
    if (
      hasInsurance &&
      potentialInsurance == PotentialInsuranceOption.OUT_OF_NETWORK_V2
    ) {
      return Router.push(Pathnames.SCHEDULE_VISIT);
    } else if (
      potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS
    ) {
      return Router.push(Pathnames.INSURANCE_FORM);
    } else if (
      hasInsurance &&
      !['Medicare Access Florida', 'Medicaid Access Florida'].includes(
        potentialInsurance || ''
      )
    ) {
      return Router.push(Pathnames.INSURANCE_CAPTURE);
    } else {
      redirectUser();
    }
  }, [
    hasInsurance,
    potentialInsurance,
    profileState.gender,
    redirectUser,
    specificCare,
    variant,
  ]);

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setLoading(true);

      const sanitizedPhone = profileState.phone_number?.replace(/\D/g, '');

      try {
        await updateUser(
          {
            ...profileState,
            phone_number: sanitizedPhone,
            email: user?.email!,
            signup_variant: patient?.profiles?.signup_variant || variant,
          },
          {
            text_me_update: patientState.text_me_update,
            status: calculatePatientStatus(
              PatientStatus.PROFILE_CREATED,
              patientState.status as PatientStatus
            ),
            ...(potentialInsurance === 'Semaglutide Bundled Oral Pills' && {
              insurance_skip: true,
            }),
          }
        );

        setError('');
        onSuccess();
      } catch (error) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
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

  return (
    <Stack component="form" onSubmit={onSubmit}>
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
                  placeholder={firstName}
                  variant="outlined"
                  autoComplete="given-name"
                  value={profileState.first_name}
                  inputProps={{
                    maxLength: 50,
                    pattern: '[A-Za-z ]+',
                  }}
                  onChange={handleFirstName}
                  disabled={isActive && !!patient?.profiles?.first_name}
                  error={!!firstNameError}
                  helperText={firstNameError}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  placeholder={lastName}
                  variant="outlined"
                  autoComplete="family-name"
                  value={profileState.last_name}
                  inputProps={{
                    maxLength: 50,
                    pattern: '[A-Za-z ]+',
                  }}
                  onChange={handleLastName}
                  disabled={isActive && !!patient?.profiles?.last_name}
                  error={!!lastNameError}
                  helperText={lastNameError}
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
                {genderOpt}
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
              <MenuItem value={'male'}>{M}</MenuItem>
              <MenuItem value={'female'}>{F}</MenuItem>
            </TextField>
          </FormControl>
        </Grid>
        <Grid container direction="column" gap="16px">
          <TextField
            value={profileState.phone_number}
            required
            fullWidth
            onChange={handlePhoneNumber}
            placeholder={phoneNum}
            variant="outlined"
            autoComplete="tel"
            error={!!phoneNumberErr}
            type="tel"
            InputProps={{
              inputComponent: isVariation9363
                ? (PhoneInputMask as any)
                : (PhoneInputMaskV1 as any),
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
              label={updates}
            />
            <Box
              padding="20px 24px"
              color="#1B1B1B"
              borderRadius="12px"
              bgcolor="#EEEEEE"
            >
              <>
                <Typography variant="h4" marginBottom="1rem">
                  {optIn}
                </Typography>
                <Typography variant="h4">
                  {textMeUpdates}
                  <Link
                    href="https://www.getzealthy.com/texting-terms-of-use"
                    underline="none"
                  >
                    {here}
                  </Link>
                  .
                </Typography>
              </>
            </Box>
          </Box>
        </Grid>
        {error ? (
          <CustomText color="red" textAlign="center">
            {error}
          </CustomText>
        ) : null}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            mt: 2,
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <LoadingButton
            disabled={!allValid || loading}
            type="submit"
            loading={loading}
            fullWidth
          >
            {continueButtonText}
          </LoadingButton>
          {isHovering && validationMessage ? (
            <CustomText sx={commonTextStyles}>{validationMessage}</CustomText>
          ) : null}
        </Box>
      </Grid>
    </Stack>
  );
};

export default PatientProfileForm;

import UsStates from '@/constants/us-states';
import {
  Box,
  Divider,
  FilledInput,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Radio,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import LoadingButton from '../Button/LoadingButton';
import axios from 'axios';
import querystring from 'querystring';
import { parseStringPromise } from 'xml2js';
import { Close } from '@mui/icons-material';
import {
  useActiveRegions,
  useLanguage,
  usePatient,
  useWeightLossSubscription,
} from '@/components/hooks/data';
import ErrorMessage from '../ErrorMessage';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { useIntakeState } from '@/components/hooks/useIntake';
import { isPOBox } from '@/utils/isPOBox';
import { useUpdateAddress } from '@/components/hooks/mutations';
import { PatientInfo } from '@/components/hooks/usePatient';

const USPS_BASE_URL = 'https://secure.shippingapis.com/ShippingAPI.dll';
const USPS_USER_ID = '9ZEALT7857X29';

export interface FormAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
}
interface AddressProps {
  onSuccess: () => void;
  patient: PatientInfo;
}

export function DeliveryAddressForm({ onSuccess }: AddressProps) {
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Database>();
  const { specificCare } = useIntakeState();
  const updateAddress = useUpdateAddress();
  const language = useLanguage();

  const { data: patient } = usePatient();
  const { data: activeRegions } = useActiveRegions();
  const { data: weightLossPatient } = useWeightLossSubscription();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const [suggestedAddress, setSuggestedAddress] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const [showSuggestedAddress, setShowSuggestedAddress] = useState(false);
  const [selectedOption, setSelectedOption] = useState('suggested');

  let streetAddressLabel = 'Street address';
  let aptSuiteUnit = 'Apt, suite, unit, bldg (optional)';
  let cityAddress = 'City';
  let stateAddress = 'State';
  let continueBtn = 'Continue';
  let verifyAddress = 'Verify address';
  let enteredText = 'You entered:';
  let suggestText = 'We suggest:';
  let verifyText = `Using an unverified address may cause issues with medication
              delivery (if prescribed). Please consider using suggested address below.`;
  let selectedAddButton = 'Use selected address';
  let errorMessage =
    'The address as submitted could not be found. This could be because there are typos or are you missing specific information, and could also be due to excessive abbreviations in the Street Address or City fields.';

  if (language === 'esp') {
    streetAddressLabel = 'dirección de calle';
    aptSuiteUnit = 'Apto, suite, unidad, edificio (opcional)';
    cityAddress = 'Ciudad';
    stateAddress = 'Estado';
    continueBtn = 'Continuar';
    verifyAddress = 'Verifica tu dirección';
    enteredText = 'Ingresaste:';
    suggestText = 'Nuestra sugerencia:';
    verifyText = `El uso de una dirección no verificada puede causar problemas con la entrega de medicamentos (si se recetan). Por favor, considere usar la dirección sugerida a continuación.`;
    selectedAddButton = 'Usar la dirección seleccionada';
    errorMessage =
      'No se pudo encontrar la dirección tal como se envió. Esto podría deberse a errores tipográficos o a la falta de información específica, y también podría ser debido al uso excesivo de abreviaturas en los campos de Dirección o Ciudad.';
  }

  const handleFormSubmit = useCallback(async () => {
    if (!patient) return;

    const address =
      selectedOption === 'suggested' && showSuggestedAddress
        ? suggestedAddress
        : formData;

    setLoading(true);

    try {
      await updateAddress.mutateAsync({
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        patient_id: patient.id,
      });

      onSuccess();
    } catch (err) {
      onSuccess();
    } finally {
      setLoading(false);
    }
  }, [
    formData,
    onSuccess,
    patient,
    selectedOption,
    suggestedAddress,
    updateAddress,
  ]);

  async function validateAddress(address: FormAddress) {
    const queryParams = {
      API: 'Verify',
      XML: `
        <AddressValidateRequest USERID="${USPS_USER_ID}">
          <Address>
            <Address1>${address!
              .address_line_2!.toUpperCase()
              .trim()}</Address1>
            <Address2>${address.address_line_1.toUpperCase().trim()}</Address2>
            <City>${address.city.toUpperCase().trim()}</City>
            <State>${address.state.toUpperCase().trim()}</State>
            <Zip5>${address.zip_code}</Zip5>
            <Zip4>${''}</Zip4>
          </Address>
        </AddressValidateRequest>
      `,
    };

    const queryString = querystring.stringify(queryParams);
    const apiUrl = `${USPS_BASE_URL}?${queryString}`;

    try {
      const response = await axios.get(apiUrl);

      console.log(response, 'res from usps');
      const parsedData = await parseStringPromise(response.data, {
        explicitArray: false, // Set to false to avoid creating arrays for single items
        ignoreAttrs: true, // Ignore XML attributes, only consider element values
      });

      // Extract the relevant fields from the parsed data
      const addressValidationResult =
        parsedData.AddressValidateResponse.Address;

      return addressValidationResult;
    } catch (error) {
      console.error(error as any);
      setError(`Invalid address. Please check all fields and try again.`);
    }
  }

  async function onContinue() {
    if (weightLossPatient || specificCare?.includes('Weight loss')) {
      if (
        isPOBox(formData.address_line_1) ||
        isPOBox(formData.address_line_2)
      ) {
        setError(
          'You must enter a valid address here that can receive shipped medications, which does not include PO boxes.'
        );
        return;
      }
    }

    if (
      formData.address_line_1.length < 5 ||
      formData.city.length < 4 ||
      formData.zip_code.length < 4
    ) {
      setError(errorMessage);
      return;
    }

    const isActiveRegion = activeRegions?.some(
      region => region.abbreviation === formData.state
    );

    if (!isActiveRegion) {
      setError(
        'Zealthy is not able to ship Rx to this state.\n Please use your address in the state that you signed up in.'
      );
      return;
    }

    setError('');
    setLoading(true);
    const data = await validateAddress(formData);
    if (data.Error) {
      setError(errorMessage);
      setLoading(false);
    } else if (
      (data.Address2 &&
        data.Address2.toUpperCase() !==
          formData.address_line_1.toUpperCase().trim()) ||
      (data.Address1 &&
        data.Address1.toUpperCase() !==
          formData.address_line_2.toUpperCase().trim()) ||
      (data.State &&
        data.State.toUpperCase() !== formData.state.toUpperCase().trim()) ||
      (data.City &&
        data.City.toUpperCase() !== formData.city.toUpperCase().trim()) ||
      (data.Zip5 && data.Zip5 !== formData.zip_code)
    ) {
      setSuggestedAddress({
        address_line_1: data.Address2,
        address_line_2: data.Address1 || '',
        city: data.City,
        state: data.State,
        zip_code: data.Zip5,
      });
      setShowSuggestedAddress(true);
      setLoading(false);
    } else {
      handleFormSubmit();
    }
  }

  const handleOnChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name!]: value,
    }));
  }, []);

  const handleSelect = useCallback((e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name!]: value,
    }));
  }, []);

  const populateAddress = useCallback(async () => {
    if (!patient?.id) {
      return;
    }
    const { data: address } = await supabase
      .from('address')
      .select()
      .eq('patient_id', patient?.id)
      .maybeSingle();

    if (address) {
      setFormData({
        address_line_1: address.address_line_1,
        address_line_2: address.address_line_2 || '',
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
      });
    }
  }, [patient?.id, supabase]);

  useEffect(() => {
    if (patient) {
      populateAddress();
    }
  }, [patient, populateAddress]);

  return (
    <>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <FormControl
          variant="filled"
          fullWidth
          required
          error={formData?.address_line_1.length < 6}
        >
          <InputLabel htmlFor="address_line_1">{streetAddressLabel}</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.address_line_1}
            name="address_line_1"
            id="address-line-1"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth>
          <InputLabel htmlFor="address_line_2">{aptSuiteUnit}</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.address_line_2}
            name="address_line_2"
            id="address-line-2"
            onChange={handleOnChange}
          />
        </FormControl>
        <FormControl
          variant="filled"
          fullWidth
          required
          error={formData.city.length < 2}
        >
          <InputLabel htmlFor="email">{cityAddress}</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.city}
            name="city"
            id="city"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            gap: '16px',
            marginBottom: '20px',
            textAlign: 'left',
          }}
        >
          <FormControl
            variant="filled"
            fullWidth
            required
            error={formData.state.length < 1}
          >
            <InputLabel htmlFor="state">{stateAddress}</InputLabel>
            <Select
              labelId="state"
              id="state"
              name="state"
              value={formData.state}
              disableUnderline={true}
              onChange={handleSelect}
            >
              {UsStates.map(option => (
                <MenuItem key={option.name} value={option.abbreviation}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl
            variant="filled"
            fullWidth
            required
            error={formData.zip_code.length <= 4}
          >
            <InputLabel htmlFor="zip-code">ZIP</InputLabel>
            <FilledInput
              fullWidth
              disableUnderline={true}
              value={formData?.zip_code}
              name="zip_code"
              id="zip-code"
              onChange={handleOnChange}
              required
            />
          </FormControl>
        </Box>
        <Box sx={{ width: '100%' }}>
          <ErrorMessage>{error}</ErrorMessage>
        </Box>
        <LoadingButton
          onClick={onContinue}
          loading={loading}
          sx={{
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {continueBtn}
        </LoadingButton>
      </Box>
      <Modal
        open={showSuggestedAddress}
        onClose={() => setShowSuggestedAddress(false)}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.default',
            minWidth: 350,
            maxWidth: 450,
            maxHeight: '100%',
            overflow: 'auto',
            p: 4,
            outline: 'none',
            borderRadius: '16px',
          }}
        >
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h3">{verifyAddress}</Typography>
            <IconButton onClick={() => setShowSuggestedAddress(false)}>
              <Close />
            </IconButton>
          </Stack>
          <Divider />
          <Typography variant="h4" margin="1rem 0">
            {verifyText}
          </Typography>
          <Typography variant="h3">{enteredText}</Typography>

          <Box
            display="grid"
            gridTemplateColumns="25px 1fr"
            gap="15px"
            margin="1rem 0"
            onClick={() => setSelectedOption('entered')}
            style={{ cursor: 'pointer' }}
          >
            <Radio
              checked={selectedOption === 'entered'}
              onChange={handleSelect}
              value="entered"
              name="radio-buttons"
              inputProps={{ 'aria-label': 'you entered' }}
              disableRipple={true}
            />
            <Stack gap={1}>
              <Typography style={{ fontSize: '15px' }}>
                {formData.address_line_1}
              </Typography>
              {formData?.address_line_2 && (
                <Typography style={{ fontSize: '15px' }}>
                  {formData.address_line_2}
                </Typography>
              )}
              <Typography style={{ fontSize: '15px' }}>
                {formData.city}
                {', '}
                {formData.state} {formData.zip_code}
              </Typography>
            </Stack>
          </Box>
          <Divider />

          <Typography margin="1rem 0" variant="h3">
            {suggestText}
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns="25px 1fr"
            gap="15px"
            onClick={() => setSelectedOption('suggested')}
            style={{ cursor: 'pointer' }}
          >
            <Radio
              checked={selectedOption === 'suggested'}
              onChange={handleSelect}
              value="suggested"
              name="radio-buttons"
              inputProps={{ 'aria-label': 'we suggest' }}
              disableRipple={true}
            />
            <Stack gap={1}>
              <Typography style={{ fontSize: '15px' }}>
                {suggestedAddress.address_line_1}
              </Typography>
              {suggestedAddress?.address_line_2 && (
                <Typography style={{ fontSize: '15px' }}>
                  {suggestedAddress.address_line_2}
                </Typography>
              )}
              <Typography style={{ fontSize: '15px' }}>
                {suggestedAddress.city}
                {', '}
                {suggestedAddress.state} {suggestedAddress.zip_code}
              </Typography>
            </Stack>
          </Box>

          <LoadingButton
            loading={loading}
            size="small"
            style={{ marginTop: '2rem' }}
            fullWidth
            onClick={handleFormSubmit}
          >
            {selectedAddButton}
          </LoadingButton>
        </Box>
      </Modal>
    </>
  );
}

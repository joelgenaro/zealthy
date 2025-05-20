import { ChangeEvent, useState } from 'react';
import Title from '@/components/shared/Title';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import InsuranceProviderSelector from '../../screens/PatientProfile/components/InsuranceProviderSelector';
import {
  useInsuranceActions,
  useInsuranceState,
} from '@/components/hooks/useInsurance';
import Router from 'next/router';
import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import { Pathnames } from '@/types/pathnames';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingModal from '@/components/shared/Loading/LoadingModal';

import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface InsuranceFormProps {
  title: string;
  description: string;
  patient: Database['public']['Tables']['patient']['Row'];
}

const InsuranceForm = ({ title, description, patient }: InsuranceFormProps) => {
  console.log({ patient });
  const {
    member_id,
    policyholder_first_name,
    policyholder_last_name,
    payer,
    is_dependent,
  } = useInsuranceState();
  const [error, setError] = useState('');
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);
  const policyType =
    (Router.query
      .policy_type as Database['public']['Enums']['insurance_policy_type']) ||
    'Primary';

  const {
    addInsuranceProvider,
    addMemberId,
    addPolicyholderFirstName,
    addPolicyholderLastName,
    addUserIsDependent,
    addHasInsurance,
  } = useInsuranceActions();

  const handleInsuranceProviderChange = (value: InsuranceProvider) => {
    addInsuranceProvider(value);
    setError('');
  };

  const handleMemberIDChange = (e: ChangeEvent<HTMLInputElement>) =>
    addMemberId(e.target.value);

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderFirstName(e.target.value);

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderLastName(e.target.value);

  const handleIsUserDependent = (e: ChangeEvent<HTMLInputElement>) =>
    addUserIsDependent(e.target.checked);

  const skipInsurance = () => {
    addHasInsurance(false);
    Router.push(Pathnames.PATIENT_PORTAL_PROFILE);
  };

  const handleSubmit = async () => {
    if (!patient) return;
    if (!payer) {
      setError('Please select payer from the list');
      return;
    }

    try {
      setLoading(true);

      // create policy
      await supabase.from('insurance_policy').insert({
        patient_id: patient?.id,
        payer_id: payer!.id,
        is_dependent,
        member_id,
        policyholder_first_name,
        policyholder_last_name,
        policy_type: policyType,
      });

      //next page
      Router.push(Pathnames.PATIENT_PORTAL_PROFILE);
    } catch (e) {
      setLoading(false);
      setError(
        "We're having trouble validating your insurance right now. Please feel free to skip this step and you'll be able to work with a Zealthy coordinator to add it later."
      );
      console.error(e as any);
    }
  };

  return (
    <Container maxWidth="sm">
      <Grid container direction="column" gap="48px">
        <Grid container direction="column" gap="16px">
          <Title text={title} />
          <Typography>{description}</Typography>
        </Grid>
        <FormControl>
          <Grid container direction="column" gap="48px">
            <Grid container direction="column" gap="16px">
              <TextField
                required
                fullWidth
                label="First name on insurance card"
                id="insurance-first-name"
                onChange={handleFirstNameChange}
                value={policyholder_first_name}
              />
              <TextField
                required
                fullWidth
                label="Last name on insurance card"
                id="insurance-last-name"
                onChange={handleLastNameChange}
                value={policyholder_last_name}
              />
              <InsuranceProviderSelector
                isRequired
                setProvider={handleInsuranceProviderChange}
              />
              <TextField
                required
                fullWidth
                label="Member ID"
                id="insurance-member-id"
                onChange={handleMemberIDChange}
                value={member_id}
              />
            </Grid>
            <Grid container direction="column" gap="16px">
              <Box padding="7.5px" borderRadius="4px" color="#00000099">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={is_dependent}
                      onChange={handleIsUserDependent}
                    />
                  }
                  label="I am a dependent on this insurance policy."
                />
              </Box>
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              {loading && (
                <LoadingModal
                  title="Submitting insurance information..."
                  description="This will take a few seconds."
                />
              )}
              <Button onClick={handleSubmit}>
                Update insurance information
              </Button>
              <Button color="grey" onClick={skipInsurance}>
                Go back
              </Button>
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Container>
  );
};

export default InsuranceForm;

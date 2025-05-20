import { ChangeEvent, useCallback, useEffect, useState } from 'react';
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
import InsuranceProviderSelector from '../PatientProfile/components/InsuranceProviderSelector';
import {
  useInsuranceActions,
  useInsuranceAsync,
  useInsuranceState,
} from '@/components/hooks/useInsurance';
import Router from 'next/router';
import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import { Pathnames } from '@/types/pathnames';
import ErrorMessage from '@/components/shared/ErrorMessage';
import LoadingModal from '@/components/shared/Loading/LoadingModal';
import { usePatient } from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useRedirectUser } from '@/components/hooks/useRedirectUser';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitState } from '@/components/hooks/useVisit';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import DOMPurify from 'dompurify';

interface InsuranceFormProps {
  title: string;
  description: string;
}

const InsuranceForm = ({ title, description }: InsuranceFormProps) => {
  const supabase = useSupabaseClient<Database>();

  const {
    member_id,
    policyholder_first_name,
    policyholder_last_name,
    payer,
    is_dependent,
  } = useInsuranceState();
  const { id: visitID } = useVisitState();
  const { data: patient } = usePatient();
  const redirectUser = useRedirectUser(patient?.id);
  const { rteVerification, createInsurancePolicy } = useInsuranceAsync();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);

  const { potentialInsurance } = useIntakeState();
  const insuranceAcceptedV2 =
    potentialInsurance == PotentialInsuranceOption.OUT_OF_NETWORK_V2;

  const {
    addInsuranceProvider,
    addMemberId,
    addPolicyholderFirstName,
    addPolicyholderLastName,
    addUserIsDependent,
    addHasInsurance,
    resetInsuranceCoverage,
  } = useInsuranceActions();

  const handleInsuranceProviderChange = (value: InsuranceProvider) => {
    addInsuranceProvider(value);
    setError('');
  };

  const handleMemberIDChange = (e: ChangeEvent<HTMLInputElement>) =>
    addMemberId(e.target.value);

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderFirstName(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderLastName(
      DOMPurify.sanitize(e.target.value, {
        USE_PROFILES: { html: false },
      })
    );

  const handleIsUserDependent = (e: ChangeEvent<HTMLInputElement>) =>
    addUserIsDependent(e.target.checked);

  const toUnsupportedPage = () => Router.push(Pathnames.INSURANCE_UNSUPPORTED);

  const skipInsurance = useCallback(async () => {
    addHasInsurance(false);
    setSkipLoading(true);
    resetInsuranceCoverage();
    if (potentialInsurance == PotentialInsuranceOption.BLUE_CROSS_ILLINOIS) {
      return Router.push(Pathnames.INSURANCE_SKIP);
    }
    if (insuranceAcceptedV2) {
      return Router.push(Pathnames.WHAT_NEXT);
    }
    await redirectUser();
    setSkipLoading(false);
  }, [addHasInsurance, redirectUser]);

  const toCongratulationPage = () => Router.push(Pathnames.INSURANCE_ELIGIBLE);
  const toCongratulationOONPage = () =>
    Router.push(Pathnames.INSURANCE_OON_ELIGIBLE);

  const handleSubmit = async () => {
    if (!payer) {
      setError('Please select payer from the list');
      return;
    }

    if (!member_id || !policyholder_first_name || !policyholder_last_name) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      if (insuranceAcceptedV2) {
        const response = {
          items: [
            {
              name: 'INSURANCE_I',
              text: 'Insurance details',
              answer: [
                {
                  valueString: `Policyholder First: ${policyholder_first_name} // Policyholder Last: ${policyholder_last_name} // Insurance Provider: ${payer.name} (${payer.external_payer_id}) // Member ID: ${member_id} // User Is Dependent: ${is_dependent}`,
                },
              ],
              questionnaire: 'insurance-info',
            },
          ],
        };

        await supabase.from('questionnaire_response').upsert({
          visit_id: visitID!,
          questionnaire_name: 'insurance-info',
          response,
          submitted: true,
        });
        setTimeout(() => {
          return toCongratulationPage();
        }, 2000);
      }

      // verify eligibility
      // aetna - 60054
      // United- 87726
      // FL BCBS - 00590

      const { data } = await rteVerification(
        payer.external_payer_id,
        patient?.region || 'FL'
      );

      const plan: any = data.items
        ?.filter(
          (t: any) =>
            t.type === 'ACTIVE_COVERAGE' &&
            t.serviceTypeCodes.includes('HEALTH_BENEFIT_PLAN_COVERAGE')
        )
        ?.slice(-1)?.[0];

      const outOfNetwork = plan.messages.some((e: string) =>
        e.includes('PROVIDER IS OUT NETWORK FOR MEMBER')
      );

      let coPay = data.items
        ?.filter(
          (c: any) =>
            c.type === 'COPAYMENT' &&
            c.serviceTypeCodes.includes('PROFESSIONAL_VISIT_OFFICE') &&
            !c.messages.some((e: any) => e.includes('AFTER DEDUCTIBLE')) &&
            !c.messages.some((e: any) => e.includes('VALUE CHOICE PCP'))
        )
        .reduce(function (min: any, obj: any) {
          var amount = parseFloat(obj.benefitAmount.amount);
          return amount < min ? amount : min;
        }, Infinity);

      if (coPay == Infinity) {
        coPay = undefined;
      }

      const coInsurance = data.items?.find(
        (c: any) =>
          c.type === 'COINSURANCE' &&
          c.serviceTypeCodes.includes('PROFESSIONAL_VISIT_OFFICE') &&
          c.benefitPercentage
      ) || { benefitPercentage: '' };

      if (plan.type) {
        // create policy
        createInsurancePolicy({
          plan_start: plan.eligibilityFromDate,
          plan_name: plan.coverageDescription,
          plan_status: plan.type,
          plan_type: plan.planType,
          member_obligation: coPay,
          co_insurance: parseFloat(coInsurance?.benefitPercentage) || undefined,
          out_of_network: outOfNetwork,
        });
      }

      //navigate to next screen
      if (plan && !outOfNetwork) {
        toCongratulationPage();
      } else if (plan && outOfNetwork) {
        toCongratulationOONPage();
      } else {
        toUnsupportedPage();
      }
    } catch (e) {
      setLoading(false);
      setError(
        "We're having trouble validating your insurance right now. Please feel free to skip this step and you'll be able to work with a Zealthy coordinator to add it later."
      );
      console.error(e as any);
    }
  };

  async function fetchBCBSIL() {
    const data = await supabase
      .from('payer')
      .select('name, id, external_payer_id')
      .eq('external_payer_id', '00621')
      .single()
      .then(({ data }) => data as InsuranceProvider);

    if (data) {
      addInsuranceProvider(data);
    }
  }

  useEffect(() => {
    if (potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS) {
      fetchBCBSIL();
    }
  }, [potentialInsurance]);

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
            </Grid>
            <Grid container direction="column" gap="16px">
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
              {loading && (
                <LoadingModal
                  title="Submitting insurance information..."
                  description="This will take a few seconds."
                />
              )}
              <Button onClick={handleSubmit}>
                Submit insurance information
              </Button>
              <LoadingButton
                loading={skipLoading}
                disabled={skipLoading}
                color="grey"
                onClick={skipInsurance}
              >
                Skip insurance
              </LoadingButton>
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Container>
  );
};

export default InsuranceForm;

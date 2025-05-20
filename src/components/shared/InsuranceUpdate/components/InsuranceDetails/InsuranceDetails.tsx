import {
  useInsuranceActions,
  useInsuranceState,
} from '@/components/hooks/useInsurance';
import InsuranceProviderSelector from '@/components/screens/PatientProfile/components/InsuranceProviderSelector';
import CustomText from '@/components/shared/Text/CustomText';
import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import { Button, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { ChangeEvent } from 'react';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '448px',
};

const InsuranceDetails = () => {
  const { policyholder_first_name, policyholder_last_name, member_id } =
    useInsuranceState();
  const {
    addInsuranceProvider,
    addMemberId,
    addPolicyholderFirstName,
    addPolicyholderLastName,
  } = useInsuranceActions();
  const handleInsuranceProviderChange = (value: InsuranceProvider) =>
    addInsuranceProvider(value);

  const handleMemberIDChange = (e: ChangeEvent<HTMLInputElement>) =>
    addMemberId(e.target.value);

  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderFirstName(e.target.value);

  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) =>
    addPolicyholderLastName(e.target.value);

  return (
    <Box sx={style}>
      <Box
        width="448px"
        bgcolor="white"
        padding="50px 20px"
        display="flex"
        flexDirection="column"
        gap="20px"
      >
        <CustomText fontWeight={600}>
          Double-check your captured insurance info
        </CustomText>
        <Box>
          <Grid container direction="column" gap="16px" marginTop="10px">
            <Box>
              <TextField
                required
                fullWidth
                label="First name on insurance card"
                value={policyholder_first_name}
                id="insurance-first-name"
                onChange={handleFirstNameChange}
              />
            </Box>
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
        </Box>
        <Button style={{ width: '100%' }}>Confirm Insurance Details</Button>
        <Box display="flex" justifyContent="center" flexDirection="column">
          <Button variant="text" sx={{ padding: '0' }}>
            <CustomText color="#6699FF" fontSize="14px" textTransform="none">
              Retake photos
            </CustomText>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InsuranceDetails;

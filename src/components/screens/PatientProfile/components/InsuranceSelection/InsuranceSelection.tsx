import {
  useInsuranceActions,
  useInsuranceState,
} from '@/components/hooks/useInsurance';
import { useInsuranceProviders } from '@/components/hooks/useInsuranceProviders';
import { useIntakeState } from '@/components/hooks/useIntake';
import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { ChangeEvent, memo } from 'react';
import InsuranceProviderSelector from '../InsuranceProviderSelector';

const InsuranceSelection = () => {
  const { addHasInsurance, addInsuranceProvider } = useInsuranceActions();
  const { hasInsurance } = useInsuranceState();
  const { hasProviders } = useInsuranceProviders();
  const { potentialInsurance } = useIntakeState();
  const handleHasInsurance = (e: ChangeEvent<HTMLInputElement>) => {
    addHasInsurance(e.target.checked);
  };
  const handleInsuranceProviderChange = (value: InsuranceProvider) => {
    addInsuranceProvider(value);
  };

  if (!hasProviders) {
    return null;
  }

  return (
    <Stack direction="column" gap="10px">
      <Box
        padding="7px 24px"
        border="1px solid #D8D8D8"
        borderRadius="12px"
        color="#1B1B1B"
      >
        <FormControlLabel
          control={
            <Checkbox checked={hasInsurance} onChange={handleHasInsurance} />
          }
          label="Use insurance"
        />
      </Box>
      {hasInsurance && (
        <InsuranceProviderSelector
          isRequired={hasInsurance}
          setProvider={handleInsuranceProviderChange}
        />
      )}
      <Typography variant="caption" color="#777777">
        {potentialInsurance === 'Aetna'
          ? `For a limited time, ${potentialInsurance} Florida members may pay as little as $0 for your first 3 months of care at Zealthy.`
          : 'By using your insurance, you can pay as little as $0. But no need to worry if you don’t have insurance or your insurance isn’t listed; we have affordable cash pay options too!'}
      </Typography>
    </Stack>
  );
};

export default memo(InsuranceSelection);

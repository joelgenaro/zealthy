import { useAllPayers } from '@/components/hooks/data';
import { useInsuranceState } from '@/components/hooks/useInsurance';
import { useIntakeState } from '@/components/hooks/useIntake';
import { InsuranceProvider } from '@/context/AppContext/reducers/types/insurance';
import { Autocomplete, TextField } from '@mui/material';
import { useEffect } from 'react';

interface InsuranceProviderSelectorProps {
  setProvider: (option: InsuranceProvider) => void;
  isRequired: boolean;
}

const InsuranceProviderSelector = ({
  isRequired,
  setProvider,
}: InsuranceProviderSelectorProps) => {
  const { data: payers } = useAllPayers();
  const { potentialInsurance } = useIntakeState();
  const { payer } = useInsuranceState();

  useEffect(() => {
    if (payers?.find((p: any) => p?.name === payer?.name)) {
      setProvider(payers?.find((p: any) => p?.name === payer?.name));
    } else if (payers?.find((p: any) => p?.name === potentialInsurance)) {
      setProvider(payers.find((p: any) => p?.name === potentialInsurance));
    }
  }, [payers]);

  return (
    <Autocomplete
      value={payer}
      disablePortal
      id="insurance-provider"
      getOptionLabel={(option: InsuranceProvider) => option?.name || ''}
      isOptionEqualToValue={(option: InsuranceProvider, value) =>
        option?.external_payer_id === value?.external_payer_id
      }
      options={payers || []}
      fullWidth
      renderOption={(props, option) => {
        return (
          <li {...props} key={option?.id}>
            {option?.name}
          </li>
        );
      }}
      renderInput={params => (
        <TextField
          {...params}
          required={isRequired}
          label="Search Insurance Provider (e.g. Aetna)"
        />
      )}
      onChange={(_: React.ChangeEvent<{}>, value: InsuranceProvider) =>
        setProvider(value)
      }
    />
  );
};

export default InsuranceProviderSelector;

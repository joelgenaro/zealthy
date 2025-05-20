import { useLanguage, usePatientAddress } from '@/components/hooks/data';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface DeliveryAddressProps {
  onChange: () => void;
}

const DeliveryAddress = ({ onChange }: DeliveryAddressProps) => {
  const { data: patientAddress } = usePatientAddress();
  const language = useLanguage();

  let ship = 'Ship to:';
  let edit = 'Edit';

  if (language === 'esp') {
    ship = 'Enviar a:';
    edit = 'Editar';
  }

  return (
    <Stack direction="row" width="100%" justifyContent="space-between">
      <Stack direction="row" gap="8px" alignItems="baseline">
        <Typography
          width="75px"
          fontWeight={600}
          sx={{
            lineHeight: '24px !important',
          }}
        >
          {ship}
        </Typography>
        <Box>
          <Typography>{patientAddress?.address_line_1}</Typography>
          <Typography>{patientAddress?.address_line_2}</Typography>
          <Typography>
            {patientAddress?.city}, {patientAddress?.state}
          </Typography>
          <Typography>{patientAddress?.zip_code}</Typography>
          <Typography>United States</Typography>
        </Box>
      </Stack>
      <Link onClick={onChange} sx={{ fontWeight: '600', cursor: 'pointer' }}>
        {edit}
      </Link>
    </Stack>
  );
};

export default DeliveryAddress;

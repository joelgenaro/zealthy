import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import { DosespotPharmacy as DosespotPharmacyType } from '@/pages/api/dosespot/_utils/pharmacySearch';
import Spinner from '@/components/shared/Loading/Spinner';

interface DosespotPharmacyProps {
  pharmacy: DosespotPharmacyType;
  onSelect: (pharmacy: DosespotPharmacyType) => Promise<void>;
}

const DosespotPharmacy = ({ pharmacy, onSelect }: DosespotPharmacyProps) => {
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback(async () => {
    setLoading(true);
    await onSelect(pharmacy);
  }, [onSelect, pharmacy]);

  return (
    <ListItemButton
      selected={loading}
      disabled={loading}
      key={pharmacy.PharmacyId}
      sx={{ textAlign: 'left' }}
      onClick={handleSelect}
    >
      <Stack gap="5px">
        <Typography fontWeight={600}>{`${pharmacy.StoreName}`}</Typography>
        <Stack>
          <Typography variant="h5">{`${pharmacy.Address1}`}</Typography>
          <Typography variant="h5">{`${pharmacy.City}, ${pharmacy.State}, ${pharmacy.ZipCode}`}</Typography>
        </Stack>
      </Stack>
      {loading ? (
        <Typography>
          <Spinner />
        </Typography>
      ) : null}
    </ListItemButton>
  );
};

export default DosespotPharmacy;

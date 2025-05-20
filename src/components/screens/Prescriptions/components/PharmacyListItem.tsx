import { PharmacyInfo } from '@/types/pharmacy';
import { ListItemButton, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  onSelect: (pharmacy: PharmacyInfo | null) => void;
  pharmacy: PharmacyInfo;
  selected: boolean;
}

const PharmacyListItem = ({ pharmacy, selected, onSelect }: Props) => {
  const onClick = () => onSelect(selected ? null : pharmacy);

  const splitAddress = pharmacy?.formattedAddress?.split(',');

  if (!splitAddress) return null;
  const street = splitAddress[0];
  const city = splitAddress[1];
  const stateZip = splitAddress[2];

  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        flexDirection: 'column',
        alignItems: 'start',
        gap: '2px',
        background: `${selected ? '#B8F5CC' : '#FFFFFF'} !important`,
        border: `1px solid ${selected ? '#000000' : '#E1E1E1'}`,
        borderRadius: 4,
        p: 3,
      }}
    >
      <Checkbox
        size="medium"
        checked={selected}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          pointerEvents: 'none',
        }}
      />
      <Typography>{pharmacy.name}</Typography>
      <Typography sx={{ opacity: 0.5 }}>{street}</Typography>
      <Typography sx={{ opacity: 0.5 }}>{`${city}, ${stateZip}`}</Typography>
    </ListItemButton>
  );
};

export default PharmacyListItem;

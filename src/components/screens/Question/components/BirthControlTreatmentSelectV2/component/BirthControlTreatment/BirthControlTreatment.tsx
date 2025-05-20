import CheckMark from '@/components/shared/icons/CheckMark';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { Box, ListItemButton, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

interface BirthControlTreatmentProps {
  details: any;
  birthControl: Medication;
  isSelected: boolean;
  onSelect: (treatment: Medication) => void;
}

const BirthControlTreatment = ({
  details,
  birthControl,
  isSelected = false,
  onSelect,
}: BirthControlTreatmentProps) => {
  const onClick = useCallback(() => {
    onSelect(birthControl);
  }, [onSelect, birthControl]);

  return (
    <ListItemButton
      selected={isSelected}
      key={birthControl.medication_quantity_id}
      onClick={onClick}
      sx={{ position: 'relative' }}
    >
      <Stack direction="column" gap={0.5}>
        <Typography fontWeight="600">
          {details.quantity} - {details.price}
        </Typography>
        <Typography fontWeight="300" sx={{ fontSize: '13px !important' }}>
          {details.description}
        </Typography>
        <Stack direction="row" gap={1}>
          {!!details.discountMonthlyPrice && (
            <Typography
              variant="h3"
              sx={{
                textDecoration: 'line-through',
                color: '#A8A8A8',
                fontWeight: '400 !important',
              }}
            >{`$${details.discountMonthlyPrice}`}</Typography>
          )}

          <Typography variant="h3" fontWeight="400 !important">
            ${details.monthlyPrice}/mo
          </Typography>
        </Stack>
      </Stack>
      {isSelected && (
        <CheckMark
          style={{
            position: 'absolute',
            right: 18,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        />
      )}
      {!!details.savings && (
        <Box
          sx={{
            position: 'absolute',
            top: '-10px',
            right: '0',
            padding: '0 30px',
            backgroundColor: '#027C2A',
            borderRadius: '10px',
            color: '#FFFAF2',
            fontWeight: 'bold',
            fontSize: '14px',
            zIndex: 1,
          }}
        >
          Save ${details.savings}
        </Box>
      )}
    </ListItemButton>
  );
};

export default BirthControlTreatment;

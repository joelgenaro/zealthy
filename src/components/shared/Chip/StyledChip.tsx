import { Chip, ChipProps } from '@mui/material';
import { styled } from '@mui/system';

interface StyledChipProps extends ChipProps {
  inBox?: boolean;
}

const StyledChip = styled(Chip)<StyledChipProps>(({ inBox }) => ({
  // If the Chip is used in a Box, apply these styles
  ...(inBox && {
    position: 'relative',
    top: 15,
    left: 18,
    zIndex: 1,
    backgroundColor: 'darkgreen', // Change the background color to dark green
    '& .MuiChip-label': {
      fontSize: 12,
      lineHeight: '16px',
      color: 'white',
    },
  }),
}));

export default StyledChip;

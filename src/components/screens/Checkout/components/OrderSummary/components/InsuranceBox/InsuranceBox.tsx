import { useInsuranceProviders } from '@/components/hooks/useInsuranceProviders';
import AttentionIcon from '@/components/shared/icons/AttentionIcon';
import PlusSign from '@/components/shared/icons/PlusSign';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { InsuranceState } from '@/context/AppContext/reducers/types/insurance';
import { Button, Typography, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { useCallback, useState } from 'react';
import InsuranceCaptureModal from '../../InsuranceCaptureModal';

interface InsuranceBoxProps {
  insurance: InsuranceState;
}

const InsuranceBox = ({ insurance }: InsuranceBoxProps) => {
  const { hasProviders } = useInsuranceProviders();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  if (!hasProviders) {
    return null;
  }

  if (insurance.plan_status === 'ACTIVE') return null;

  return (
    <>
      <WhiteBox
        compact
        flexDirection="row"
        alignItems="center"
        bgcolor="#EEEEEE"
        justifyContent="space-between"
      >
        <Box display="flex" gap="16px" alignItems="center">
          <AttentionIcon />
          <Typography>Pay as little as $0 by adding insurance!</Typography>
        </Box>
        <Button color="secondary" size="small" onClick={handleOpen}>
          <Box display="flex" gap="10px" alignItems="center" width="150px">
            <PlusSign color={theme.palette.text.primary} />
            <Typography variant="body2" fontWeight="600">
              Add insurance
            </Typography>
          </Box>
        </Button>
      </WhiteBox>
      <InsuranceCaptureModal isOpen={open} handleClose={handleClose} />
    </>
  );
};

export default InsuranceBox;

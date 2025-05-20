import { useIsMobile } from '@/components/hooks/useIsMobile';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import { useCallback, useMemo } from 'react';
import { OptionType } from '../types';
import { useVariant } from '@/context/ABTestContext';
import { useVWOVariationName } from '@/components/hooks/data';
import { useSubscription } from '@/components/hooks/data';
import { usePatient } from '@/components/hooks/data';

const paperSx = {
  background: 'white',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid rgba(0, 0, 0, 0.19)',
};

const paperSxMobile = {
  background: 'white',
  padding: '16px 10px !important',
  borderRadius: '16px',
  border: '1px solid rgba(0, 0, 0, 0.19)',
  '& * p': {
    fontSize: '12px',
  },
};

interface OptionCardProps {
  option: OptionType;
}

const MedicationOptionCard = ({ option }: OptionCardProps) => {
  const isMobile = useIsMobile();
  const { plan } = Router.query;
  const { data: patient } = usePatient();

  const sx = useMemo(() => {
    return isMobile ? paperSxMobile : paperSx;
  }, [isMobile]);

  const nextPage = useCallback(() => {
    return Router.push(`${option.path}`);
  }, [option.path]);

  return (
    <ListItemButton sx={sx} onClick={nextPage}>
      <Stack gap="8px" width="100%">
        {/* KEEPING FOR FUTURE REFERENCE */}
        {option.popular && (
          <Box
            bgcolor="#FDFFA2"
            padding="5px 15px"
            borderRadius="16px"
            width="fit-content"
          >
            <Typography textAlign="center" variant="subtitle1">
              Most popular
            </Typography>
          </Box>
        )}
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight="600">{option.header}</Typography>
          <Typography sx={{ color: '#005315' }} fontWeight="600">
            {option.subHeader}
          </Typography>
        </Stack>

        <Box display="flex" sx={{ gap: '0.4rem' }}>
          <Typography
            fontFamily="Gelasio"
            fontSize="1.5rem!important"
            sx={{ color: '#00872B' }}
          >
            5-8%
          </Typography>
          <Typography>expected weight loss every 3 months*</Typography>
        </Box>
      </Stack>
    </ListItemButton>
  );
};

export default MedicationOptionCard;

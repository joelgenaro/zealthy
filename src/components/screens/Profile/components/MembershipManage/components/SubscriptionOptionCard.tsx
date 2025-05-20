import { useIsMobile } from '@/components/hooks/useIsMobile';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import { useCallback, useMemo } from 'react';
import { OptionType } from '../types';
import { useVariant } from '@/context/ABTestContext';

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

const SubscriptionOptionCard = ({ option }: OptionCardProps) => {
  const isMobile = useIsMobile();
  const { isVariation1 } = useVariant();

  const sx = useMemo(() => {
    return isMobile ? paperSxMobile : paperSx;
  }, [isMobile]);

  const nextPage = useCallback(() => {
    if (option.path.includes('downgrade')) {
      return Router.push({
        pathname: option.path,
        query: {
          page: 'confirm-downgrade',
          plan: 'Discounted Weight Loss Plan',
        },
      });
    } else {
      return Router.push({
        pathname: option.path,
        query: {
          page: 'confirm-upgrade',
          plan: option.header.split('Plan')[0].trim(),
          discount: option.subHeader,
          type: option.type,
        },
      });
    }
  }, [option.header, option.path, option.subHeader, option.type]);

  return (
    <ListItemButton sx={sx} onClick={nextPage}>
      <Stack gap="8px" width="100%">
        {option.popular ? (
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
        ) : null}
        <Stack direction="row" justifyContent="space-between">
          <Typography fontWeight="600">{option.header}</Typography>
          <Typography sx={{ color: '#005315' }} fontWeight="600">
            {option.subHeader}
          </Typography>
        </Stack>
        <Typography>{option.body}</Typography>
      </Stack>
    </ListItemButton>
  );
};

export default SubscriptionOptionCard;

import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Router from 'next/router';
import { useCallback } from 'react';
import { OptionType } from './MembershipManage/types';

interface OptionCardProps {
  option: OptionType;
}

const PrescriptionOptionCard = ({ option }: OptionCardProps) => {
  const nextPage = useCallback(() => {
    return Router.push(option.path);
  }, [option]);

  return (
    <ListItemButton onClick={nextPage}>
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
          <Typography fontWeight="600">{option.subHeader}</Typography>
        </Stack>
        <Typography>{option.body}</Typography>
      </Stack>
    </ListItemButton>
  );
};

export default PrescriptionOptionCard;

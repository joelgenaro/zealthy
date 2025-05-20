import WhiteBox from '@/components/shared/layout/WhiteBox';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback } from 'react';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';

const MembersHelpCenterCard = () => {
  const handleSelect = useCallback(() => {
    Router.push(Pathnames.WL_MEMBER_HELP_CENTER);
  }, []);

  return (
    <WhiteBox
      padding="24px"
      gap="16px"
      //   key={}
      alignItems="start"
    >
      <Stack alignItems="start">
        <Typography
          variant="h3"
          sx={{
            fontSize: '16px !important',
            fontWeight: '600',
            lineHeight: '24px !important',
            color: '#989898',
          }}
        >
          Help Center For Weight Loss Members
        </Typography>
      </Stack>
      <Link
        onClick={handleSelect}
        sx={{
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        View
      </Link>
    </WhiteBox>
  );
};

export default MembersHelpCenterCard;

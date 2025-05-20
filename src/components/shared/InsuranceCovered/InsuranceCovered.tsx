import { Box, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import CheckMarkCircleGreenVariant from '@/components/shared/icons/CheckMarkCircleGreenVariant';
import BCBSILLogo from 'public/payers/BCBSIL.jpg';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface Props {
  message?: string;
}

export default function InsuranceCovered({ message }: Props) {
  const isMobile = useIsMobile();
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'white',
        border: '2px solid #8ACDA0',
        borderRadius: '18px',
        boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.25)',
        padding: isMobile ? '18px 5px 18px 13px' : '18px 24px',
        display: 'grid',
        gridTemplateColumns: '75px 1fr 100px',
        gridTemplateRows: '1fr',
        gap: '15px',
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      <CheckMarkCircleGreenVariant />
      <Stack textAlign="center" gap="5px">
        <Typography variant="h3">
          {message ? message : 'Your insurance has you covered!'}
        </Typography>
      </Stack>
      <Image
        width={'100'}
        src={BCBSILLogo}
        alt="Blue Cross Blue Shield Illinois logo"
      />
    </Box>
  );
}

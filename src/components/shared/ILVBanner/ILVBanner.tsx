import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import NoProvidersModal from '../NoProvidersModal';
import { useLiveVisitAvailability } from '@/components/hooks/data';
import useCountDown from '@/utils/hooks/useCountdown';
import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingButton from '../Button/LoadingButton';
import { Button, IconButton, Link, Stack } from '@mui/material';
import { Close } from '@mui/icons-material';
import CancelILVRequest from './components/CancelILVRequest';
import { useILV } from '@/context/ILVContextProvider';
import { supabaseClient } from '@/lib/supabaseClient';

interface ILVBannerProps {
  onLeave: () => Promise<void>;
  buttonText: string;
}

type Clinician = {
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    prefix: string | null;
  };
};

const ILVBanner = ({ onLeave, buttonText }: ILVBannerProps) => {
  const { data: available } = useLiveVisitAvailability();
  const [open, setOpen] = useState(false);
  const [openCancel, setCancelOpen] = useState(false);
  const { request } = useILV();
  const [clinician, setClinician] = useState<Clinician | null>(null);

  useEffect(() => {
    if (!request?.clinician_id) {
      return;
    }
    supabaseClient
      .from('clinician')
      .select('profile:profiles(avatar_url, first_name, last_name, prefix)')
      .eq('id', request.clinician_id)
      .maybeSingle()
      .then(({ data }) => {
        setClinician(data as Clinician);
      });
  }, [request, supabaseClient]);

  const clinicianFullName = useMemo(() => {
    const array = [];
    if (clinician?.profile.prefix) {
      array.push(clinician?.profile.prefix);
    }
    array.push(clinician?.profile?.first_name);
    array.push(clinician?.profile?.last_name);
    return array.join(' ');
  }, [clinician]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCancel = useCallback(() => {
    setCancelOpen(true);
  }, []);

  const count = useCountDown(handleOpen, available?.estimatedWaitTime || 15);
  console.log(request);

  return (
    <Box width="100%" padding={'8px 16px'} bgcolor="#B8F5CC" color="#000">
      <Stack sx={{ display: 'flex', justifyContent: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent={'center'}>
          <Typography variant="subtitle1">
            {`Estimated wait time until visit is: ${Number(
              count.split(':')[0]
            )} min`}
          </Typography>
          <IconButton size="small" onClick={handleCancel}>
            <Close />
          </IconButton>
        </Stack>
        <Box
          sx={{
            padding: '8px 8px',
            height: 'auto',
            textWrap: 'nowrap',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {request &&
            request.clinician_id &&
            request.status === 'Confirmed' && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Button
                  sx={{ width: 'min-content', mb: '10px' }}
                  variant="rounded"
                  size="small"
                  onClick={() =>
                    window.open(
                      `/visit/room/${request?.daily_room || ''}?appointment=${
                        request?.id
                      }`,
                      '_blank'
                    )
                  }
                >
                  Join Visit
                  {clinicianFullName ? ' with ' + clinicianFullName : ''}
                </Button>
              </Box>
            )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <LoadingButton
              variant={'rounded'}
              size="small"
              sx={{ width: 'min-content' }}
              onClick={onLeave}
            >
              {buttonText}
            </LoadingButton>
          </Box>
        </Box>
      </Stack>
      <NoProvidersModal
        open={open}
        setOpen={setOpen}
        buttonText="Continue"
        onLeave={onLeave}
      />
      <CancelILVRequest
        open={openCancel}
        setOpen={setCancelOpen}
        count={Number(count.split(':')[0])}
      />
    </Box>
  );
};

export default ILVBanner;

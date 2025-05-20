import { StandardModal } from '../modals';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect, useMemo } from 'react';
import { Database } from '@/lib/database.types';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Appointment = Database['public']['Tables']['appointment']['Row'];

type Clinician = {
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    prefix: string | null;
  };
};

interface ILVConfirmedModalProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  request: Appointment;
}

const ILVConfirmedModal = ({
  open,
  setOpen,
  request,
}: ILVConfirmedModalProps) => {
  const supabase = useSupabaseClient<Database>();
  const [clinician, setClinician] = useState<Clinician | null>(null);

  useEffect(() => {
    if (!request?.clinician_id) {
      return;
    }
    supabase
      .from('clinician')
      .select('profile:profiles(avatar_url, first_name, last_name, prefix)')
      .eq('id', request.clinician_id)
      .maybeSingle()
      .then(({ data }) => {
        setClinician(data as Clinician);
      });
  }, [request, supabase]);

  const clinicianFullName = useMemo(() => {
    const array = [];
    if (clinician?.profile.prefix) {
      array.push(clinician?.profile.prefix);
    }
    array.push(clinician?.profile?.first_name);
    array.push(clinician?.profile?.last_name);
    return array.join(' ');
  }, [clinician]);

  return (
    <StandardModal setModalOpen={setOpen} modalOpen={open}>
      <Stack alignItems="center" gap="24px">
        {clinician?.profile ? (
          <>
            <Avatar
              alt="doctor's image"
              src={clinician.profile.avatar_url || ''}
              sx={{ width: 72, height: 72 }}
            />
            <Box>
              <Typography
                variant="h3"
                textAlign="center"
              >{`${clinicianFullName} is ready to see you now.`}</Typography>
            </Box>
          </>
        ) : null}

        <Button
          target="_blank"
          href={`/visit/room/${request?.daily_room || ''}?appointment=${
            request?.id
          }`}
        >
          Continue to your visit
        </Button>
      </Stack>
    </StandardModal>
  );
};

export default ILVConfirmedModal;

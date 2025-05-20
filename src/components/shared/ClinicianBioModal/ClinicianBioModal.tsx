import { useIsMobile } from '@/components/hooks/useIsMobile';
import { PractitionerWithSchedule } from '@/components/hooks/useProviderSchedule';
import { clinicianTitle } from '@/utils/clinicianTitle';
import { Box, Divider, Modal, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Circle from '../Circle';
import ProfilePlaceholder from 'public/images/profile-placeholder.jpg';
import { Close } from '@mui/icons-material';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  clinician: PractitionerWithSchedule;
}

const ClinicianBioModal = ({ open, setOpen, clinician }: Props) => {
  const isMobile = useIsMobile();
  const [show, setShow] = useState(false);
  const title = clinicianTitle(clinician?.clinician);

  useEffect(() => {
    if (open) {
      setShow(true);
    }
  }, [open]);

  const closeModal = () => {
    setShow(false);
    if (isMobile) {
      setTimeout(() => setOpen(false), 250);
    } else {
      setOpen(false);
    }
  };

  const styles = isMobile
    ? {
        position: 'absolute',
        height: '100%',
        width: '80%',
        backgroundColor: '#fff',
        right: show ? '0%' : '-100%',
        transition: 'right 0.25s ease-in-out',
        top: 'auto',
        left: 'auto',
        transform: 'none',
        minWidth: 'auto',
        minHeight: 'auto',
        maxHeight: '100%',
        borderRadius: 0,
        padding: '25px',
      }
    : {
        position: 'absolute',
        backgroundColor: '#fff',
        height: 'auto',
        width: 'auto',
        right: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 300,
        minHeight: 300,
        maxHeight: '90%',
        borderRadius: 5,
        padding: '40px',
      };

  return (
    <Modal open={open} onClose={closeModal}>
      <Stack
        direction="column"
        gap={isMobile ? '25px' : '10px'}
        alignItems="center"
        sx={styles}
      >
        <Stack
          alignSelf="flex-end"
          alignItems="center"
          flexDirection="row"
          gap="5px"
          onClick={closeModal}
          sx={{ cursor: 'pointer' }}
        >
          {isMobile && <Typography>Close Window</Typography>}
          <Close style={{ fontSize: isMobile ? '20px' : '25px' }} />
        </Stack>
        <Box
          display="grid"
          gridTemplateColumns={isMobile ? '1fr' : '200px 1fr'}
          overflow="scroll"
          gap="50px"
        >
          {!isMobile && (
            <Circle size="200px">
              <Image
                src={
                  clinician.clinician.profiles?.avatar_url || ProfilePlaceholder
                }
                alt="image of a care provider"
                width={200}
                height={0}
                style={{ height: 'auto' }}
              />
            </Circle>
          )}
          <Stack gap="10px">
            <Typography variant="h2">{title}</Typography>
            {clinician.clinician.specialties && (
              <Typography variant="h3" color="#777777">
                {clinician.clinician.specialties}
              </Typography>
            )}
            <Divider />
            <Stack gap="1rem" marginTop="1rem">
              <Typography variant={isMobile ? 'h3' : 'body1'}>
                About {title}
              </Typography>
              <Typography variant="body1">{clinician.clinician.bio}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
};

export default ClinicianBioModal;

import Router from 'next/router';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import getConfig from '../../../../../../config';
interface Props {
  isOpen: boolean;
  setClose: (open: boolean) => void;
}

const VerifyIDModal = ({ isOpen, setClose }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const { data: patient } = usePatient();
  const [isMentalHealth, setIsMentalHealth] = useState<boolean>(false);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const closeModal = () => {
    sessionStorage.setItem('displayedVIDModal', 'true');
    setClose(false);
    setTimeout(() => sessionStorage.removeItem('displayedVIDModal'), 900000);
  };

  const verifyID = () => {
    Router.push('/patient-portal/identity-verification');
    closeModal();
  };

  const isMobile = useIsMobile();

  const styles = isMobile
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: '#fff',
        transition: 'right 0.25s ease-in-out',
        top: 'auto',
        left: 'auto',
        transform: 'none',
        minWidth: 'auto',
        minHeight: 'auto',
        maxHeight: '100%',
        borderRadius: 0,
        paddingBottom: '20px',
      }
    : {
        position: 'absolute',
        backgroundColor: '#fff',
        height: 'auto',
        width: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 500,
        minHeight: 300,
        maxHeight: '90%',
        borderRadius: 5,
        paddingBottom: '25px',
      };

  async function fetchIsPatientMentalHealth() {
    const mentalHealth = await supabase
      .from('visit_reason')
      .select(
        `*, visit_id!inner(patient_id, status), reason_for_visit!inner(reason)`
      )
      .eq('visit_id.patient_id', patient?.id!)
      .in('reason_for_visit.reason', ['Anxiety or depression', 'Mental health'])
      .eq('visit_id.status', 'Completed');

    if ((mentalHealth.data?.length ?? 0) > 0) {
      setIsMentalHealth(true);
    }
  }

  useEffect(() => {
    if (patient?.id) {
      fetchIsPatientMentalHealth();
    }
  }, [patient?.id]);

  return (
    <Modal open={isOpen} sx={{ 'z-index': 1500 }}>
      <Stack
        direction="column"
        gap={isMobile ? '25px' : '10px'}
        alignItems="center"
        sx={styles}
      >
        <Box
          onClick={closeModal}
          color="primary"
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            'background-color': '#E0280E4D',
            'padding-top': '2vh',
            'padding-bottom': '2vh',
            'padding-right': '25px',
            'padding-left': '25px',
            'border-top-right-radius': isMobile ? 0 : 15,
            'border-top-left-radius': isMobile ? 0 : 15,
          }}
        >
          <Image
            src={'/icons/alert-triangle.png'}
            alt="alert-triangle"
            height="20"
            width="20"
          />
          <Typography
            sx={{
              'margin-left': '10px',
              'margin-right': '10px',
            }}
          >
            You won’t be able to receive your treatment plan until you complete
            your ID verification
          </Typography>
          <Typography sx={{ fontSize: '16px' }}>X</Typography>
        </Box>
        <Stack sx={{ padding: isMobile ? '20px' : '25px' }}>
          <Typography
            variant="h2"
            fontWeight={400}
            sx={{
              'align-self': 'start',
              'font-family': 'Inter',
              'font-size': '24px',
              'line-height': '31.2px',
              'text-align': 'left',
              'margin-bottom': '1vh',
            }}
          >
            Complete your ID verification
          </Typography>
          <Typography sx={{ 'margin-top': '1vh', 'margin-bottom': '1vh' }}>
            {`A provider can not review your responses or create your ${
              isMentalHealth ? 'mental health' : 'GLP-1'
            }
            treatment plan until you have uploaded your ID and verified your
            identity.`}
          </Typography>
          <Typography sx={{ 'margin-top': '1vh' }}>
            {`You have already paid for your first month, which includes a ${siteName}
            medical provider reviewing your responses and creating a ${
              isMentalHealth ? 'mental health' : 'GLP-1'
            }
            treatment plan as appropriate.`}
          </Typography>
        </Stack>
        <Button
          color="primary"
          sx={{ 'padding-right': '10vw', 'padding-left': '10vw' }}
          onClick={verifyID}
        >
          Complete ID Verification
        </Button>
      </Stack>
    </Modal>
  );
};

export default VerifyIDModal;

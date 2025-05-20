import React from 'react';
import {
  Modal,
  Stack,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatientState } from '@/components/hooks/usePatient';
import { Database } from '@/lib/database.types';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useIntakeState } from '@/components/hooks/useIntake';
import { usePatientCompoundOrders } from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';

interface Props {
  open: boolean;
  title?: string;
  subtitle?: string;
  image?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onClose: () => void;
}

const CheckoutPopUpModalGLP1 = ({
  title = 'GLP-1 Injections: Semaglutide, Tirzepatide, & Liraglutide',
  subtitle = `Discover doctor-developed Weight Loss treatment plans tailored to your body’s needs - now available in {State of residence}, if prescribed.`,
  image = '/glp1-injection-vials.png',
  confirmButtonText = 'Learn More',
  cancelButtonText = 'Maybe Later',
  open,
  onClose,
}: Props) => {
  const supabase = useSupabaseClient<Database>();
  const theme = useTheme();
  const { specificCare } = useIntakeState();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useVisitActions();
  const patientState = usePatientState();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patientState.id
  );
  const { addSpecificCare, removeSpecificCare } = useIntakeActions();
  const { data: compoundOrders = [] } = usePatientCompoundOrders();

  const handleLearnMoreClick = async () => {
    if (specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION) {
      await supabase
        .from('online_visit')
        .update({ status: 'Canceled' })
        .eq('patient_id', patientState.id)
        .eq('specific_care', SpecificCareOption.ANXIETY_OR_DEPRESSION);
    } else {
      await supabase
        .from('online_visit')
        .update({ status: 'Canceled' })
        .eq('patient_id', patientState.id)
        .eq('specific_care', specificCare!);
    }

    removeSpecificCare();

    if (specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION) {
      addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
      await createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS], {
        navigateAway: true,
        resetValues: true,
        requestedQuestionnaires: [],
        resetMedication: true,
        questionnaires: undefined,
        skipQuestionnaires: [],
      });
      return;
    }
    await createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS], {
      navigateAway: false,
      resetValues: true,
      requestedQuestionnaires: [],
      resetMedication: true,
      questionnaires: undefined,
      skipQuestionnaires: [],
    });
    const doesNotHaveCompoundOrder = compoundOrders.length === 0;
    if (doesNotHaveCompoundOrder) {
      Router.push(Pathnames.WL_NONBUNDLED_TREATMENT);
    } else {
      Router.push(Pathnames.WL_REFILL_TREATMENT);
    }
  };

  subtitle = `Discover doctor-developed Weight Loss treatment plans tailored to your body’s needs - now available in ${patientState.region}, if prescribed.`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        paddingTop: '1rem',
      }}
    >
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={2}
        height={isMobile ? '655px' : '800px'}
        width={isMobile ? '325px' : '420px'}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.default',
          minWidth: 300,
          padding: '10rem',
          p: isMobile ? '7px 16px 24px 16px' : '20px 32px 48px 32px',
          outline: 'none',
          borderRadius: isMobile ? '22.86px' : '40px',
        }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: isMobile ? '4px' : '1px',
            right: isMobile ? '14px' : '18px',
            color: 'text.primary',
            width: isMobile ? '24px' : '32px',
            height: isMobile ? '24px' : '32px',
          }}
        >
          <CloseIcon sx={{ fontSize: isMobile ? '24px' : '24px' }} />
        </IconButton>

        <Image
          src={image}
          alt="GLP-1 Injections"
          width={isMobile ? 288 : 350}
          height={isMobile ? 288 : 330}
        />
        <Typography
          variant="h2"
          style={{
            fontSize: isMobile ? '20px' : '32px',
            lineHeight: isMobile ? '24px' : '38.72px',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          style={{
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: isMobile ? '16px' : '22px',
          }}
        >
          {subtitle}
        </Typography>
        <Button
          style={{ padding: '10px' }}
          fullWidth
          onClick={() => handleLearnMoreClick()}
        >
          {confirmButtonText}
        </Button>
        <Button
          style={{ padding: '10px' }}
          fullWidth
          variant="outlined"
          onClick={onClose}
        >
          {cancelButtonText}
        </Button>
      </Stack>
    </Modal>
  );
};

export default CheckoutPopUpModalGLP1;

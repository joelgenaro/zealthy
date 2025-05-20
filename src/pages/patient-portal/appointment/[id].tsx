import {
  Button,
  Container,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  Modal,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav/PatientPortalNav';
import { ReactElement, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import VisitSummary from '@/components/shared/VisitSummary';
import CloseIcon from '@/components/shared/icons/CloseIcon';
import { Pathnames } from '@/types/pathnames';
import CheckMarkIcon from '@/components/shared/icons/CheckMarkCircleGreen';
import {
  AppointmentPayload,
  AppointmentState,
} from '@/context/AppContext/reducers/types/appointment';
import { mapPayloadToAppointment } from '@/context/AppContext/utils/mapPayloadToAppointment';
import { APPOINTMENT_QUERY } from '@/context/AppContext/query';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Footer from '@/components/shared/layout/Footer';
import { isWithinInterval, subHours } from 'date-fns';

type Patient = {
  id: number;
  canvas_patient_id: string | null | undefined;
};
type PatientPayment = {
  customer_id: string;
  patient: {
    id: number;
  };
};
interface ModalProps {
  handleClose: () => void;
  handleReschedule: () => void;
  handleCancel: () => void;
  open: boolean;
  loading: boolean;
}
interface ChargeModalProps {
  handleCloseModal: () => void;
  handleCancelFee: () => void;
  open: boolean;
  isCancel: boolean;
  loading: boolean;
  error: boolean;
  duration: number;
}
interface SuccessModalProps {
  handleHomeRedirect: () => void;
  open: boolean;
  visitType: AppointmentState['visit_type'];
}
const CancelAppointmentChargeModal = ({
  handleCloseModal,
  handleCancelFee,
  open,
  isCancel,
  loading,
  error,
  duration,
}: ChargeModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mobileSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
    width: '100%',
    height: '100%',
    bgcolor: 'background.default',
    outline: 'none',
  };

  const webSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    p: 4,
    outline: 'none',
  };

  return (
    <Modal onClose={handleCloseModal} open={open}>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={6}
        sx={isMobile ? mobileSx : webSx}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogTitle>
          <Grid
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '58px',
            }}
          >
            <CheckMarkIcon />
          </Grid>

          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            {`You are attempting to ${
              isCancel ? 'cancel' : 'reschedule'
            } your visit within  ${
              duration === 15 && isCancel ? '2' : isCancel ? '24' : '4'
            } hours of the start time. You will be charged $25 for doing so.`}
          </Typography>
        </DialogTitle>
        <Grid container direction="column" gap="24px">
          {error ? (
            <ErrorMessage>
              {'There was an error processing your payment'}
            </ErrorMessage>
          ) : null}
          <LoadingButton
            variant="contained"
            color="primary"
            loading={loading}
            disabled={loading}
            onClick={handleCancelFee}
          >
            {'Accept charge'}
          </LoadingButton>
        </Grid>
      </Stack>
    </Modal>
  );
};

const CancelAppointmentSuccessModal = ({
  handleHomeRedirect,
  open,
  visitType,
}: SuccessModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mobileSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
    width: '100%',
    height: '100%',
    bgcolor: 'background.default',
    outline: 'none',
  };

  const webSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    p: 4,
    outline: 'none',
  };

  return (
    <Modal onClose={handleHomeRedirect} open={open}>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={6}
        sx={isMobile ? mobileSx : webSx}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={handleHomeRedirect}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogTitle>
          <Grid
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: '58px',
            }}
          >
            <CheckMarkIcon />
          </Grid>
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            {`Your ${
              visitType?.toLowerCase() || ''
            } visit was successfully cancelled`}
          </Typography>
        </DialogTitle>
        <Grid container direction="column" gap="24px">
          <Button
            variant="contained"
            color="primary"
            onClick={handleHomeRedirect}
          >
            Go back home
          </Button>
        </Grid>
      </Stack>
    </Modal>
  );
};

const CancelAppointmentModal = ({
  handleClose,
  handleCancel,
  handleReschedule,
  open,
  loading,
}: ModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const mobileSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px',
    width: '100%',
    height: '100%',
    bgcolor: 'background.default',
    outline: 'none',
  };

  const webSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.default',
    minWidth: 300,
    minHeight: 300,
    p: 4,
    outline: 'none',
  };

  return (
    <Modal onClose={handleClose} open={open}>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={6}
        sx={isMobile ? mobileSx : webSx}
      >
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <DialogTitle>
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Are you sure you want to cancel?
          </Typography>
        </DialogTitle>
        <Grid container direction="column" gap="24px">
          <LoadingButton
            variant="contained"
            color="primary"
            loading={loading}
            disabled={loading}
            onClick={handleCancel}
          >
            Yes, I am sure
          </LoadingButton>
          <Button variant="contained" color="grey" onClick={handleReschedule}>
            Reschedule instead
          </Button>
        </Grid>
      </Stack>
    </Modal>
  );
};

const AppointmentPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  const [appointment, setAppointment] = useState<AppointmentState | null>(null);
  const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelSuccessModal, setSuccessModalOpen] = useState(false);
  const [confirmChargeModalOpen, setConfirmChargeModalOpen] =
    useState<boolean>(false);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [isReschedule, setIsReschedule] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const { id } = router.query;
  console.log(appointment, 'app');
  const handleCancelModalClose = () => {
    setCancelModalOpen(false);
  };

  const specialties = appointment?.provider?.specialties
    ? appointment.provider?.specialties
    : appointment?.appointment_type === 'Provider'
    ? '(Provider)'
    : appointment?.appointment_type === 'Coach (Mental Health)'
    ? '(Mental Health Coaching)'
    : '(Weight Loss Coaching)';

  const handleHomeRedirect = () => {
    router.push(Pathnames.PATIENT_PORTAL);
  };

  const handleRescheduleAppointment = async () => {
    if (
      isWithinInterval(new Date(), {
        start: subHours(new Date(appointment?.starts_at || ''), 4),
        end: new Date(appointment?.starts_at || ''),
      })
    ) {
      setIsReschedule(true);
      setConfirmChargeModalOpen(true);
      return;
    }
    router.push(
      `/schedule-appointment?id=${appointment?.provider?.id}&appt-id=${appointment?.id}`
    );
  };

  const handleOpenCancelModal = () => {
    if (
      isWithinInterval(new Date(), {
        start: subHours(new Date(appointment?.starts_at || ''), 24),
        end: new Date(appointment?.starts_at || ''),
      })
    ) {
      setIsCancel(true);
      setConfirmChargeModalOpen(true);
      return;
    }
    setCancelModalOpen(true);
  };

  const handleOpenCancel15MinModal = () => {
    if (
      isWithinInterval(new Date(), {
        start: subHours(new Date(appointment?.starts_at || ''), 2),
        end: new Date(appointment?.starts_at || ''),
      })
    ) {
      setIsCancel(true);
      setConfirmChargeModalOpen(true);
      return;
    }
    setCancelModalOpen(true);
  };

  const handleChargeCancelFee = async () => {
    if (!patientInfo?.id) {
      return;
    }
    setLoading(true);
    const patientPayment = await supabase
      .from('payment_profile')
      .select('customer_id, patient(id)')
      .eq('patient_id', patientInfo?.id)
      .single()
      .then(({ data }) => data as PatientPayment);
    const missedApptFee = await supabase
      .from('subscription')
      .select('price, currency')
      .eq('name', 'Missed Appointment')
      .single()
      .then(({ data }) => data);

    const cancelParams = {
      customerId: patientPayment.customer_id,
      amount: (missedApptFee?.price ?? 0) * 100,
      currency: missedApptFee?.currency.toLowerCase(),
      description: `Cancelled appointment fee ${specialties}`,
      metadata: {
        resource: 'appointment',
        zealthy_patient_id: patientPayment.patient.id,
        zealthy_appointment_id: appointment?.id ? appointment.id : null,
      },
    };

    const appointmentCancelCharge = await axios
      .post('/api/stripe/utils/payment/charge', cancelParams)
      .then(res => res)
      .catch(e => e.response);

    if (appointmentCancelCharge.status === 200 && isCancel) {
      await handleCancelAppointment();
      setLoading(false);
      setConfirmChargeModalOpen(false);
    }
    if (appointmentCancelCharge.status === 200 && isReschedule) {
      router.push(
        `/schedule-appointment?id=${appointment?.provider?.id}&appt-id=${appointment?.id}`
      );
    }
    if (appointmentCancelCharge.status > 400) {
      setError(true);
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment?.id) {
      return;
    }
    setLoading(true);

    await supabase
      .from('appointment')
      .update({
        status: 'Cancelled',
        cancelation_reason: `Patient has canceled appointment`,
        canceled_at: new Date().toISOString(),
      })
      .eq('id', appointment?.id);

    await axios.put('/api/onsched/update-appointment', {
      appointmentId: appointment?.onsched_appointment_id,
      action: 'cancel',
    });
    setLoading(false);
    setCancelModalOpen(false);
    setSuccessModalOpen(true);
  };

  async function fetchPatient() {
    if (!user?.id) {
      return;
    }
    const patient = await supabase
      .from('patient')
      .select('id, canvas_patient_id')
      .eq('profile_id', user?.id)
      .single();

    setPatientInfo(patient.data as Patient);
  }

  useEffect(() => {
    if (!id) {
      return;
    }
    supabase
      .from('appointment')
      .select(APPOINTMENT_QUERY)
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data)
          setAppointment(mapPayloadToAppointment(data as AppointmentPayload));
      });
  }, [id]);

  useEffect(() => {
    if (patientInfo === null && user?.id) {
      fetchPatient();
    }
  }, [patientInfo, user]);

  if (!appointment) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Grid
        container
        direction="column"
        gap={{ sm: '48px', xs: '32px' }}
        sx={{ marginBottom: isMobile ? '60px' : '0' }}
      >
        <Typography variant="h2">{`Upcoming remote ${
          appointment.visit_type || ''
        } visit.`}</Typography>

        <VisitSummary isConfirmed appointment={appointment} />
        {appointment.visit_type === 'Video' ? (
          <>
            <Grid>
              <Typography>
                Please arrive in the visit link 5 minutes before your visit
                start time. If you need to{' '}
                <Link
                  onClick={() => handleRescheduleAppointment()}
                  underline="none"
                  sx={{ cursor: 'pointer' }}
                >
                  reschedule
                </Link>{' '}
                or{' '}
                <Link
                  underline="none"
                  onClick={() =>
                    appointment.duration !== 15
                      ? handleOpenCancelModal()
                      : handleOpenCancel15MinModal()
                  }
                  sx={{ cursor: 'pointer' }}
                >
                  cancel
                </Link>{' '}
                your visit, please do so at least{' '}
                {appointment.duration !== 15 ? '24' : '2'} hours in advance.{' '}
                {appointment.duration !== 15
                  ? 'Zealthy charges patients for no-show appointments.'
                  : 'Zealthy charges patients $25 for no-show appointments.'}
              </Typography>
            </Grid>
          </>
        ) : (
          <Grid item>
            <Typography>
              Please be ready 5 minutes before your visit start time. If you
              need to{' '}
              <Link
                onClick={() => handleRescheduleAppointment()}
                underline="none"
                sx={{ cursor: 'pointer' }}
              >
                reschedule
              </Link>{' '}
              or{' '}
              <Link
                underline="none"
                onClick={() =>
                  appointment.duration !== 15
                    ? handleOpenCancelModal()
                    : handleOpenCancel15MinModal()
                }
                sx={{ cursor: 'pointer' }}
              >
                cancel
              </Link>{' '}
              your visit, please do so at least{' '}
              {appointment.duration !== 15 ? '24' : '2'} hours in advance.{' '}
              {appointment.duration !== 15
                ? 'Zealthy charges patients for no-show appointments.'
                : 'Zealthy charges patients $25 for no-show appointments.'}
            </Typography>
          </Grid>
        )}

        <Button color="grey" onClick={() => handleRescheduleAppointment()}>
          Reschedule
        </Button>
        <Button color="grey" onClick={() => handleCancelAppointment()}>
          Cancel
        </Button>
      </Grid>
      <CancelAppointmentModal
        handleClose={handleCancelModalClose}
        handleReschedule={() =>
          router.push(
            `/schedule-appointment?id=${appointment?.provider?.id}&appt-id=${appointment?.id}`
          )
        }
        handleCancel={handleCancelAppointment}
        open={cancelModalOpen}
        loading={loading}
      />
      <CancelAppointmentChargeModal
        open={confirmChargeModalOpen}
        handleCloseModal={() => {
          setConfirmChargeModalOpen(false);
          setIsCancel(false);
          setIsReschedule(false);
        }}
        handleCancelFee={handleChargeCancelFee}
        isCancel={isCancel}
        loading={loading}
        error={error}
        duration={appointment?.duration}
      />
      <CancelAppointmentSuccessModal
        open={cancelSuccessModal}
        handleHomeRedirect={handleHomeRedirect}
        visitType={appointment.visit_type}
      />
      <Footer />
    </Container>
  );
};
export const getServerSideProps = getAuthProps;

AppointmentPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default AppointmentPage;

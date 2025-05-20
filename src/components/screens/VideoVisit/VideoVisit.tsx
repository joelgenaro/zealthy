import { usePatient, usePatientAppointment } from '@/components/hooks/data';
import { useProfileSelect } from '@/components/hooks/useProfile';
import Loading from '@/components/shared/Loading/Loading';
import { Database } from '@/lib/database.types';
import {
  patientAwaitingIlvEvent,
  patientJoiningRoomEvent,
} from '@/utils/freshpaint/events';
import { useDaily, useParticipantCounts } from '@daily-co/daily-react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Router from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Call from './components/Call';
import HairCheck from './components/HairCheck';
import Tray from './components/Tray';
import { VideoVisitStatus } from './components/VisitRoom';
import { differenceInMinutes } from 'date-fns';
import HelpModal from './components/HelpModal';
import { useAppointmentAsync } from '@/components/hooks/useAppointment';
import axios from 'axios';
import { supabaseClient } from '@/lib/supabaseClient';

interface MessageProps {
  name: string;
  updateAppointment: () => Promise<void>;
}

const Message = ({ name, updateAppointment }: MessageProps) => {
  const { appointment } = Router.query;
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(`Hello ${name}, your provider will be joining the call shortly`);
  }, [name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(
        `<span>We apologize for the delay. It looks like your provider still has not joined your visit, so we would ask you to <a href="/patient-portal/schedule-appointment/${appointment}">reschedule your visit here</a>. There will be no additional charge for rescheduling your visit.</span>`
      );
      updateAppointment();
    }, 1000 * 60 * 5);

    return () => {
      clearTimeout(timer);
    };
  }, [appointment]);

  const component = useMemo(() => {
    return (
      <Box padding="20px">
        <Typography
          textAlign="center"
          variant="h3"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </Box>
    );
  }, [message]);

  return (
    <Stack justifyContent="center" alignItems="center">
      {component}
    </Stack>
  );
};

interface Props {
  status: VideoVisitStatus;
  setStatus: (status: VideoVisitStatus) => void;
  roomUrl: string | null;
  roomId: string;
  appointment: any;
}

const VideoVisit = ({
  status,
  setStatus,
  roomUrl,
  roomId,
  appointment,
}: Props) => {
  const { data: patient } = usePatient();
  const { data: appointmentInfo } = usePatientAppointment(appointment);
  const { updateAppointment } = useAppointmentAsync();
  const callObject = useDaily();
  const first_name = useProfileSelect(profile => profile.first_name);
  const supabase = useSupabaseClient<Database>();
  const { present } = useParticipantCounts();
  const [allParticipantsJoined, setAllParticipantsJoined] =
    useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [showHelpButton, setShowHelpButton] = useState<boolean>(false);

  // Store entry time when user lands on the screen
  const differenceInMin = () => {
    if (!appointmentInfo) return 0;
    // Calculate difference based on encounter type
    if (appointmentInfo?.encounter_type === 'Walked-in') {
      if (!appointmentInfo.patient_joined_at) return 0;
      return differenceInMinutes(
        new Date(),
        new Date(appointmentInfo.patient_joined_at)
      );
    } else {
      return differenceInMinutes(
        new Date(),
        new Date(appointmentInfo?.starts_at || '')
      );
    }
  };

  const name = useMemo(() => {
    return patient?.profiles.first_name || first_name;
  }, [first_name, patient]);

  async function notifyClinician(patientId: number) {
    if (appointmentInfo?.encounter_type === 'Walked-in') {
      const { data: appointmentData } = await supabase
        .from('appointment')
        .select('*, task_queue!inner(assigned_clinician_id)')
        .eq('id', appointmentInfo?.id!)
        .single();

      const { data } = await supabase
        .from('clinician')
        .select('profiles (phone_number, email)')
        .eq('id', appointmentData?.task_queue.assigned_clinician_id!)
        .limit(1)
        .single();

      const { phone_number } = data?.profiles!;
      if (phone_number) {
        await patientAwaitingIlvEvent(phone_number!);
      }
    } else {
      const { data } = await supabase
        .from('clinician')
        .select('profiles (phone_number, email)')
        .eq('id', appointmentInfo?.clinician_id!)
        .limit(1)
        .single();

      const { phone_number, email } = data?.profiles!;
      if (email && phone_number) {
        await patientJoiningRoomEvent(email, phone_number, roomId, patientId);
      }
    }
  }

  useEffect(() => {
    if (present === 2) {
      setAllParticipantsJoined(true);
    }
  }, [present]);

  const joinCall = () => {
    setStatus(VideoVisitStatus.JOINING);
    if (callObject && roomUrl) {
      callObject.join({ url: roomUrl }).then(async () => {
        if (callObject.participantCounts().present === 1) {
          notifyClinician(patient?.id!);
        }
        window?.freshpaint?.track('15-minute-visit-completed');
        await supabase
          .from('appointment')
          .update({ patient_joined_at: new Date().toISOString() })
          .eq('id', appointmentInfo?.id!);
        setStatus(VideoVisitStatus.JOINED);
      });
    }
  };

  const leaveCall = useCallback(() => {
    Router.push('/patient-portal');
    setStatus(VideoVisitStatus.LEAVING);
    callObject?.destroy();
  }, [callObject, setStatus]);

  const showCall = ['JOINED', 'ERROR'].includes(status);
  const showHairCheck = ['HAIR_CHECK', 'JOINING'].includes(status);
  const showWaitingMessage = status === VideoVisitStatus.JOINING;

  const providerNoShowAfter5Min = differenceInMin() >= 5 && present === 1;
  const handleOpenHelpModal = () => {
    setOpenModal(o => !o);
  };

  useEffect(() => {
    if (providerNoShowAfter5Min) {
      const timer = setTimeout(() => {
        setShowHelpButton(true);
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      setShowHelpButton(false);
    }
  }, [providerNoShowAfter5Min]);

  const updateAppointmentStatus = async () => {
    // Will set to no-show BUT a provider can still join
    await updateAppointment(
      appointment,
      {
        status: 'Provider-Noshowed',
      },
      patient!
    );
  };

  useEffect(() => {
    if (!appointmentInfo || !supabase || status !== VideoVisitStatus.JOINED)
      return;
    const timer = setInterval(async () => {
      await supabase
        .from('appointment')
        .update({ patient_left_at: new Date().toISOString() })
        .eq('id', appointmentInfo?.id!);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [appointmentInfo, supabase, status]);

  return (
    <Stack gap="16px">
      <Box
        sx={{
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {appointmentInfo?.status !== 'Completed' && present === 1 ? (
          <Message
            name={name || ''}
            updateAppointment={updateAppointmentStatus}
          />
        ) : null}
        {appointmentInfo?.status !== 'Completed' && showHelpButton ? (
          <Button
            size="small"
            sx={{ width: 'fit-content' }}
            onClick={handleOpenHelpModal}
          >
            Help
          </Button>
        ) : null}
      </Box>
      <Box display="flex" maxWidth="100%" minHeight="0">
        {showCall ? (
          <Call />
        ) : showHairCheck ? (
          <HairCheck joinCall={joinCall} />
        ) : null}
      </Box>
      {showCall && <Tray leaveCall={leaveCall} />}
      {showWaitingMessage && (
        <Box
          top="50%"
          left="50%"
          zIndex="11"
          bgcolor="white"
          borderRadius="5px"
          position="absolute"
          padding="15px"
          style={{
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px',
          }}
        >
          <Stack spacing={2}>
            <Typography textAlign="center" variant="h3">
              Requesting to join visit
            </Typography>
            <Loading />
          </Stack>
        </Box>
      )}
      <HelpModal
        open={openModal}
        onClose={setOpenModal}
        appointment={appointment}
        patient={patient}
        appointmentInfo={appointmentInfo}
      />
    </Stack>
  );
};

export default VideoVisit;

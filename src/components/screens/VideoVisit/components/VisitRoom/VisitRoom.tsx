import Loading from '@/components/shared/Loading/Loading';
import { Endpoints } from '@/types/endpoints';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { DailyProvider } from '@daily-co/daily-react';
import axios from 'axios';
import Router from 'next/router';
import { useCallback, useEffect, useState } from 'react';

export enum VideoVisitStatus {
  IDLE = 'IDLE',
  CREATING = 'CREATING',
  JOINING = 'JOINING',
  JOINED = 'JOINED',
  LEAVING = 'LEAVING',
  ERROR = 'ERROR',
  HAIR_CHECK = 'HAIR_CHECK',
}

interface VisitRoomProps {
  roomId?: string;
  children: (
    status: VideoVisitStatus,
    setStatus: (s: VideoVisitStatus) => void,
    roomUrl: string | null,
    roomId: string
  ) => JSX.Element;
}

const VisitRoom = ({ children, roomId }: VisitRoomProps) => {
  const { id } = Router.query;
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [status, setStatus] = useState<VideoVisitStatus>(VideoVisitStatus.IDLE);

  const initRoom = useCallback(async (id: string, token: string) => {
    const newCallObject = DailyIframe.createCallObject({
      showLeaveButton: false,
    });
    const url = `https://zealthy.daily.co/${id}`;

    setRoomUrl(url);
    setCallObject(newCallObject);
    setStatus(VideoVisitStatus.HAIR_CHECK);

    await newCallObject.preAuth({ token, url, showLeaveButton: false });
    await newCallObject.startCamera();
  }, []);

  const generateDailyToken = useCallback(() => {
    return axios.get<string>(Endpoints.GET_DAILY_TOKEN, {
      params: {
        room_name: id,
      },
    });
  }, [id]);

  useEffect(() => {
    return () => {
      if (callObject) callObject.destroy();
    };
  }, [callObject]);

  useEffect(() => {
    if ((id || roomId) && !callObject) {
      const room = (roomId || id) as string;
      generateDailyToken().then(({ data }) => initRoom(room, data));
    }
  }, [id, roomId, callObject, initRoom, generateDailyToken]);

  if (!callObject) return <Loading />;

  return (
    <>
      <DailyProvider callObject={callObject}>
        {children(status, setStatus, roomUrl, id as string)}
      </DailyProvider>
    </>
  );
};

export default VisitRoom;

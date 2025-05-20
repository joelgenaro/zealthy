import { useLiveVisitAvailability } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import useCountDown from '@/utils/hooks/useCountdown';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useMemo, useState } from 'react';

interface MessagesProps {
  onLeave: () => Promise<void>;
  message: string;
  showSubtext?: boolean;
}

const ILVMessages = ({
  onLeave,
  message,
  showSubtext = true,
}: MessagesProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: available } = useLiveVisitAvailability();
  const count = useCountDown(
    () => setOpen(true),
    available?.estimatedWaitTime || null
  );

  const handleExit = useCallback(async () => {
    setLoading(true);
    return onLeave();
  }, [onLeave]);

  const formattedMessage = useMemo(() => {
    return message.replace('{{TIME}}', String(Number(count.split(':')[0])));
  }, [count, message]);

  return (
    <>
      <Stack alignItems="center" gap="12px">
        <Typography variant="h3" textAlign="center">
          {formattedMessage}
        </Typography>
        {showSubtext ? (
          <Typography
            textAlign="center"
            whiteSpace={isMobile ? 'break-spaces' : 'inherit'}
          >
            Wait time too long? Don’t worry your request has been submitted.
            Explore the Zealthy portal{' '}
            <Link href="#" onClick={handleExit} style={{ color: 'green' }}>
              here.
            </Link>{' '}
          </Typography>
        ) : null}
      </Stack>
    </>
  );
};

export default ILVMessages;

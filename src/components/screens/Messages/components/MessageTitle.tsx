import { useHasUnseenMessages } from '@/components/hooks/data';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MessageItemI } from '@/types/messageItem';

interface MessageTitleProps {
  selectedMessage: MessageItemI | null;
  name: string | null;
  isOutOfOffice: boolean;
  isCoachType: boolean;
  groupId?: number;
  isThreadDisabled: boolean;
}
const MessageTitle = ({
  selectedMessage,
  name,
  isCoachType,
  isOutOfOffice,
  groupId,
  isThreadDisabled,
}: MessageTitleProps) => {
  const { data: unseenMessages } = useHasUnseenMessages();

  const count = (unseenMessages?.data || []).filter(
    message => message.messages_group_id === groupId
  ).length;

  return (
    <Stack alignItems="flex-start" mb="0.5rem" gap="8px">
      <Stack direction="row" gap={1} alignItems="center">
        <Typography sx={{ fontSize: '1rem !important' }}>{name}</Typography>
        {groupId && count > 0 && (
          <Box
            sx={{
              backgroundColor: '#ed6c02',
              color: 'white',
              height: '20px',
              width: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              fontSize: '12px',
            }}
          >
            {count}
          </Box>
        )}
        {isCoachType && (
          <>
            <Box
              sx={{
                color: '#fff',
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: '#535353',
              }}
            >
              <Typography
                fontSize="10px !important"
                fontWeight="700"
                lineHeight="1.5 !important"
              >
                {isThreadDisabled ? 'No Longer Your Coach' : 'Coaching Only'}
              </Typography>
            </Box>
          </>
        )}
      </Stack>
      {isOutOfOffice ? (
        <Box
          sx={{
            color: '#fff',
            padding: '1px 5px',
            borderRadius: '3px',
            backgroundColor: '#f82d34',
          }}
        >
          <Typography
            fontSize="10px !important"
            fontWeight="700"
            lineHeight="1.5 !important"
          >
            {`Out of Office`}
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
};

export default MessageTitle;

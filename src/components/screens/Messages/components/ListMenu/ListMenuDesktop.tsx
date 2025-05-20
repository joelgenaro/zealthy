import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { KeyboardArrowRight } from '@mui/icons-material';
import { careTeamGroups } from '@/utils/careTeamGroups';
import MessageTitle from '../MessageTitle';
import { MessageItemI } from '@/types/messageItem';
import useMessageTitleName from '@/components/hooks/messages/useMessageTitleName';
import useIsOutOfOffice from '@/components/hooks/messages/useIsOutOfOffice';
import { format } from 'date-fns';

interface MessagesContentProps {
  item: MessageItemI; // should this be null or undefined?
  selectedMessage: MessageItemI | null;
  handleOnClick: (item: MessageItemI) => void;
}

export const ListMenuDesktop = ({
  item,
  selectedMessage,
  handleOnClick,
}: MessagesContentProps) => {
  let isCoachType = false;
  const clinician = item?.members[0]?.clinician;
  const messageGroup = item?.messages_group_id;
  const isThreadDisabled = messageGroup.disabled_at !== null;
  const messageGroupName = messageGroup?.name;

  const isGroupMessage = careTeamGroups.includes(messageGroupName!);

  if (!isGroupMessage) {
    const memberTypes = clinician?.type;
    isCoachType = memberTypes?.some((type: any) =>
      type.toLowerCase().includes('coach')
    );
  }
  const isOutOfOffice = useIsOutOfOffice({
    isGroupMessage,
    status: clinician?.status,
  });

  const messageTitleName = useMessageTitleName({
    isGroupMessage,
    members: item?.members,
    messageGroupName,
    clinician,
  });

  if (!messageGroup) {
    return null;
  }

  return (
    <>
      <ListItem
        key={`${messageGroup}`}
        alignItems="flex-start"
        sx={{
          cursor: 'pointer',
          gap: '12px',
          padding: '12px 12px',
          backgroundColor: `${
            selectedMessage?.id === item?.id ? '#F6EFE3' : ''
          }`,
          '&:hover': {
            background: '#F6EFE3',
            cursor: 'pointer',
          },
        }}
        onClick={() => handleOnClick(item)}
      >
        <ListItemText
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '0',
            marginBottom: '0',
            gap: '2px',
            maxHeight: '100px',
            overflow: 'hidden',
            minWidth: '55%',
            height: '100%',
          }}
          primary={
            <>
              <MessageTitle
                selectedMessage={selectedMessage}
                isThreadDisabled={isThreadDisabled}
                name={messageTitleName || ''}
                isCoachType={isCoachType}
                isOutOfOffice={isOutOfOffice}
                groupId={messageGroup?.id}
              />

              <Typography
                sx={{
                  fontSize: '0.75rem !important',
                  display: '-webkit-box',
                  lineHeight: '16px !important',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  overflowWrap: 'break-word',
                  workBreak: 'break-all',
                  maxHeight: '100px',
                }}
                component="span"
                variant="body2"
                color="black"
              >
                {item?.display_at && new Date(item?.display_at!) > new Date()
                  ? null
                  : item?.decrypted_message_encrypted
                      ?.replace(/<[^>]*>/g, '')
                      ?.replace(/&[^;]+;/g, ' ')}
              </Typography>
            </>
          }
          secondary={
            <Typography
              sx={{ display: 'flex' }}
              fontSize="11px !important"
              component="span"
              variant="body2"
              color="#A7A7A7"
              minHeight="11px"
            >
              {item?.display_at && new Date(item?.display_at!) > new Date()
                ? null
                : item?.display_at
                ? format(new Date(item?.display_at), 'h:mma')
                : item?.created_at
                ? format(new Date(item.created_at), 'h:mma')
                : null}
            </Typography>
          }
        />
        <KeyboardArrowRight
          sx={{
            alignSelf: 'center',
          }}
        />
      </ListItem>
      <Divider sx={{ borderColor: '#AFAFAF' }} />
    </>
  );
};

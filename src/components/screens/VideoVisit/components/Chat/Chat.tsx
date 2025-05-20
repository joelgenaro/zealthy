import { ChangeEvent, useCallback, useState, useRef, useEffect } from 'react';
import {
  useAppMessage,
  useDaily,
  useLocalParticipant,
} from '@daily-co/daily-react';

import { Arrow } from './icons/Arrow';
import {
  Box,
  Button,
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface Props {
  showChat: boolean;
  toggleChat: () => void;
}

export default function Chat({ showChat, toggleChat }: Props) {
  const callObject = useDaily();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const localParticipant = useLocalParticipant();
  const [messages, setMessages] = useState<
    { name: string; message: string; isSelf?: boolean }[]
  >([]);
  const [inputValue, setInputValue] = useState('');

  const sendAppMessage = useAppMessage({
    onAppMessage: ev => {
      setMessages(m => [
        ...m,
        { name: ev.data.name, message: ev.data.message },
      ]),
        [];
    },
  });

  const sendMessage = useCallback(
    (message: string) => {
      /* Send the message to all participants in the chat - this does not include ourselves!
       * See https://docs.daily.co/reference/daily-js/events/participant-events#app-message
       */

      const data = {
        name: localParticipant?.user_name || 'Guest',
        message: message,
        event: 'chat-msg',
        room: 'main-room',
      };

      callObject?.sendAppMessage(data, '*');

      /* Since we don't receive our own messages, we will set our message in the messages array.
       * This way _we_ can also see what we wrote.
       */
      setMessages([
        ...messages,
        {
          isSelf: true,
          message: message,
          name: localParticipant?.user_name || 'Guest',
        },
      ]);
    },
    [localParticipant, messages, sendAppMessage]
  );

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (inputValue.length < 256) {
      setInputValue(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (!inputValue) return; // don't allow people to submit empty strings
    sendMessage(inputValue);
    setInputValue('');
  };

  // create a ref for my messages component
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  return (
    <Box
      position="fixed"
      height="100%"
      zIndex="12"
      width={isMobile ? '75%' : '50%'}
      right={showChat ? '0' : '-100%'}
      top="0"
      display="grid"
      gridTemplateRows="auto 1fr auto"
      gridTemplateColumns="1fr"
      bgcolor="white"
      borderLeft="1px solid black"
      boxShadow="5px 3px 20px 20px rgb(0 0 0 / 20%)"
      sx={{ transition: 'right 0.25s ease-in-out' }}
    >
      <Button
        onClick={toggleChat}
        size="small"
        variant="contained"
        color="grey"
        style={{ borderRadius: 0, borderBottom: '1px solid black' }}
        startIcon={<Close />}
      >
        Close Chat
      </Button>
      <Box
        id="messageBox"
        ref={messagesRef}
        overflow="scroll"
        display="flex"
        flexDirection="column-reverse"
      >
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {messages?.map((message, index) => (
            <ListItem
              alignItems="flex-start"
              key={`message-${index}`}
              className="chat-message"
              style={{ flexDirection: 'column' }}
            >
              <Typography variant="h4" paddingLeft="5px">
                {message.isSelf ? `${message?.name} (you)` : message?.name}
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                bgcolor={
                  message.isSelf
                    ? theme.palette.secondary.main
                    : theme.palette.success.light
                }
                width="100%"
                padding="10px"
                borderRadius="10px"
                sx={{ overflowWrap: 'break-word' }}
              >
                <ListItemText primary={message?.message} />
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
      <FormControl variant="filled" fullWidth>
        <InputLabel htmlFor="filled-adornment-password">
          Type a message...
        </InputLabel>
        <FilledInput
          value={inputValue}
          disableUnderline={true}
          autoComplete="current-password"
          onChange={e => onChange(e)}
          id="filled-adornment-password"
          type="text"
          onKeyDownCapture={e => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          style={{ borderRadius: 0 }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleSubmit}
                type="submit"
                edge="end"
                sx={{
                  marginRight: 0,
                }}
              >
                <Arrow />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Box>
  );
}

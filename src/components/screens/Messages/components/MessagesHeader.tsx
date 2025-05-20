import { Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Database } from '@/lib/database.types';
import { MessageItemI } from '@/types/messageItem';
type Profile = Database['public']['Tables']['profiles']['Row'];
type MessageGroup = Database['public']['Tables']['messages_group']['Row'];
interface MessagesContentProps {
  selectedMessage: MessageItemI;
  setSelectedMessages: (value: null) => void;
}

export function MessagesHeader({
  selectedMessage,
  setSelectedMessages,
}: MessagesContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid container>
      <Grid
        container
        sx={{
          // background: "#fffaf2",
          color: 'black',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '20px',
          fontWeight: '700',
          lineHeight: '26px',
          height: `${isMobile ? '50px' : '4.8125rem'}`,
        }}
      >
        <Grid
          item
          xs={4}
          sx={{
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #AFAFAF',
          }}
        >
          <Typography
            component="h3"
            variant="h3"
            sx={{
              cursor: 'pointer',
              fontSize: '20px !important',
              display: 'flex',
              flexDirection: 'row',
            }}
            onClick={() => setSelectedMessages(null)}
          >
            {selectedMessage && isMobile && (
              <ArrowBackIosIcon style={{ fontSize: '20px' }} />
            )}
            Messages
          </Typography>
        </Grid>
        <Grid
          item
          xs={8}
          sx={{
            padding: `${isMobile ? '12px' : '16px'}`,
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: '3rem',
            alignItems: 'center',
            borderBottom: '1px solid #AFAFAF',
          }}
        >
          {selectedMessage && (
            <>
              <Typography component="h3" variant="h3" fontWeight={400}>
                {selectedMessage.messages_group_id?.name}
              </Typography>
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}

import { PatientSubscriptionProps } from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import StrikethroughText from '@/components/shared/StrikethroughText';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import { CalendarToday } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { parseISO, addMonths, format } from 'date-fns';
import Router from 'next/router';

interface FreeMonthProps {
  subscription: PatientSubscriptionProps | undefined;
  handleApplyFreeMonth: () => void;
  loading: boolean;
}

const FreeMonth = ({
  subscription,
  handleApplyFreeMonth,
  loading,
}: FreeMonthProps) => {
  const { id } = Router.query;
  let formattedDate = '';

  if (subscription?.current_period_end) {
    const parsedDate = parseISO(subscription.current_period_end);
    if (!isNaN(parsedDate.getTime())) {
      // parsedDate is a valid date
      const freeMonthRuntime = addMonths(parsedDate, 1);
      formattedDate = format(freeMonthRuntime, 'MMMM dd, yyyy');
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          marginBottom: '1rem',
        }}
      >
        You can get the next month, on us.
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
        We’re sorry if there has been a delay in your care.
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
        Would you like a 1 month extension on your membership and get your next
        month free?
      </Typography>
      <WhiteBox sx={{ padding: '20px', gap: '1.3rem' }}>
        <Typography fontWeight={600}>Free Month</Typography>
        <Divider />
        <Typography fontWeight={600}>Zealthy monthly plan</Typography>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" sx={{ gap: '0.5rem' }}>
            <CalendarToday />
            <Typography>
              Runs through{' '}
              <span style={{ color: '#00531B', fontWeight: 600 }}>
                {formattedDate}
              </span>
            </Typography>
          </Box>
          <StrikethroughText sx={{ fontWeight: 600 }}>
            {`$${subscription?.price}`}
          </StrikethroughText>
        </Box>
        <Divider />
        <Typography fontWeight={600}>Free plan extension</Typography>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" sx={{ gap: '0.5rem', alignItems: 'center' }}>
            <CalendarToday />
            <Typography>
              Valid for{' '}
              <span style={{ color: '#00531B', fontWeight: 600 }}>
                one month
              </span>
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: '#D7FFE4',
              padding: '8px 20px',
              borderRadius: '30px',
            }}
          >
            <Typography color="#005315">FREE</Typography>
          </Box>
        </Box>
        <Divider />
        <Typography>
          Your current plan will resume after your extension.
        </Typography>
      </WhiteBox>
      <br />
      <LoadingButton
        loading={loading}
        fullWidth
        disabled={loading}
        size="small"
        onClick={handleApplyFreeMonth}
        sx={{
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
      >
        {'Get 1 month for free'}
      </LoadingButton>
      <Button
        fullWidth
        color="grey"
        size="small"
        onClick={() => {
          Router.push(
            {
              query: { id, page: 'discount' },
            },
            undefined,
            { shallow: true }
          );
        }}
        sx={{ fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}
      >
        {'Continue unsubscribe'}
      </Button>
    </Box>
  );
};

export default FreeMonth;

import { LabOrder } from '@/components/hooks/data';
import ExperimentIcon from '@/components/shared/icons/ExperimentIcon';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { mapStatusToDetails } from './asset/mapStatusToDetails';
import { format, parseISO } from 'date-fns';

interface LabCardProps {
  lab: LabOrder;
}

const EnclomipheneLabCard = ({ lab }: LabCardProps) => {
  const cardDetails = mapStatusToDetails[lab.status || ''];

  return (
    <Card
      sx={{
        width: '100%',
        marginBottom: '1rem',
        borderRadius: '1rem',
        position: 'relative',
        background: `url(/images/encl-order-bg.png) no-repeat`,
        backgroundSize: '50% auto',
        backgroundPosition: 'bottom right',
        height: '100%',
      }}
    >
      <CardContent
        sx={{
          padding: '25px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          '& p': {
            margin: '3px 0',
          },
        }}
      >
        <Box display="flex" justifyContent="flex-end">
          {lab.date_delivered ? (
            <Typography>
              {format(parseISO(lab.date_delivered), 'MMMM d, yyyy')}
            </Typography>
          ) : lab.date_shipped ? (
            <Typography>
              {format(parseISO(lab.date_shipped), 'MMMM d, yyyy')}
            </Typography>
          ) : (
            <Typography>
              {format(parseISO(lab.created_at || ''), 'MMMM d, yyyy')}
            </Typography>
          )}
        </Box>
        <Stack gap={2}>
          <Box display="flex" alignItems="center" sx={{ gap: '1rem' }}>
            <ExperimentIcon />
            <Typography variant="h3" fontFamily="Georgia">
              {cardDetails.header}
            </Typography>
          </Box>
          <Typography fontWeight={700}>{cardDetails.subheader}</Typography>
          {cardDetails.details.map((text, idx) => (
            <Typography key={idx}>{text}</Typography>
          ))}
        </Stack>
        {lab.tracking_url ? (
          <Button onClick={() => window.open(lab.tracking_url || '', '_blank')}>
            Track Shipment
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default EnclomipheneLabCard;

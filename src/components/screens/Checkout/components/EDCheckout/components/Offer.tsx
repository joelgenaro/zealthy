import { useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface OffersProps {
  hasDiscount?: boolean;
}

const offers = [
  {
    name: 'Provider review',
    price: 'FREE',
  },
  {
    name: 'Medical adjustments',
    price: 'FREE',
  },
  {
    name: 'Ongoing check-ins',
    price: 'FREE',
  },
  {
    name: 'Shipping',
    price: 'FREE',
  },
];

const Offer = ({ hasDiscount }: OffersProps) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        padding: '16px 24px',
        borderRadius: '12px',
        background: '#FFF',
        boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.10)',
        border: '1px solid #D8D8D8',
      }}
    >
      <Stack gap="16px">
        {offers.map(({ name, price }) => (
          <Stack direction="row" justifyContent="space-between" key={name}>
            <Typography>{name}</Typography>
            <Typography>{price}</Typography>
          </Stack>
        ))}

        {hasDiscount ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ color: '#00531B' }}
          >
            <Typography>Limited time new customer promotion</Typography>
            <Typography color={theme.palette.primary.light} fontWeight={600}>
              -$20
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};

export default Offer;

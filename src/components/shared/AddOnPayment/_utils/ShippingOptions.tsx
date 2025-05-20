import { useLanguage } from '@/components/hooks/data';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ShippingOptionsProps {
  selected: string;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ShippingOptions = ({ selected, onSelect }: ShippingOptionsProps) => {
  const lang = useLanguage();

  let shipping = 'Shipping:';
  let fiveToEightDays = 'Usually arrives in 5-8 days';
  let threeToFiveDays = 'Usually arrives in 3-5 days';

  if (lang === 'esp') {
    shipping = 'Envio:';
    fiveToEightDays = 'Normalmente llega entre 5 y 8 días';
    threeToFiveDays = 'Normalmente llega entre 3 y 5 días';
  }

  return (
    <Stack direction="row" gap="8px" width="100%">
      <Typography
        width="75px"
        fontWeight={600}
        sx={{
          lineHeight: '24px !important',
        }}
      >
        {shipping}
      </Typography>

      <RadioGroup
        aria-labelledby="delivery-options"
        defaultValue="standard"
        name="radio-buttons-group"
        value={selected}
        onChange={onSelect}
      >
        <FormControlLabel
          value="1"
          sx={{
            marginBottom: '8px',
            alignItems: 'flex-start',
            paddingLeft: '9px',
            gap: '9px',
          }}
          control={<Radio sx={{ padding: '0' }} />}
          label={
            <>
              <Typography
                fontWeight={600}
                sx={{
                  lineHeight: '20px',
                  letterSpacing: '-0.006em',
                }}
              >
                UPS Mail Innovations - $0
              </Typography>
              <Typography>{fiveToEightDays}</Typography>
            </>
          }
        />
        <FormControlLabel
          value="2"
          sx={{
            alignItems: 'flex-start',
            paddingLeft: '9px',
            gap: '9px',
          }}
          control={<Radio sx={{ padding: '0' }} />}
          label={
            <>
              <Typography
                sx={{
                  fontWeight: '600',
                  lineHeight: '20px',
                  letterSpacing: '-0.006em',
                }}
              >
                UPS Next Day Air Saver - $15
              </Typography>
              <Typography>{threeToFiveDays}</Typography>
            </>
          }
        />
      </RadioGroup>
    </Stack>
  );
};

export default ShippingOptions;

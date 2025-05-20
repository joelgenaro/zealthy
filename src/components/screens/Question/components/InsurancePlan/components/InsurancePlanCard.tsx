import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useVWOVariationName } from '@/components/hooks/data';

interface CardProps {
  option: {
    index: number;
    header: string;
    subText: string[];
    buttonText: string;
  };
  handleContinue: (m: any) => void;
}

const InsurancePlanCard = ({ option, handleContinue }: CardProps) => {
  return (
    <Box
      sx={{
        border: '1px solid #000000',
        borderRadius: '12px',
        padding: '64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <Typography
        fontSize={'1.5rem!important'}
        fontFamily="Gelasio"
        fontWeight={400}
        textAlign="center"
        sx={{ lineHeight: '25px!important' }}
      >
        {option.header}
      </Typography>
      <Stack gap={3}>
        <Typography>{option.subText[0]}</Typography>
        <Typography>{option.subText[1]}</Typography>
      </Stack>
      <Button fullWidth onClick={() => handleContinue(option.index)}>
        {option.buttonText}
      </Button>
    </Box>
  );
};

export default InsurancePlanCard;

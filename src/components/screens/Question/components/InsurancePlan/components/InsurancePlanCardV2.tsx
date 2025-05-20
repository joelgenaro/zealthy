import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmptyCircle from 'public/icons/EmptyCircle';
import Image from 'next/image';
import GreenFilledCircle from 'public/icons/GreenFilledCircle';
import Check from '@mui/icons-material/Check';
import { Clear } from '@mui/icons-material';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface CardProps {
  option: {
    index: number;
    header: string;
    fact?: string;
    percentage?: string;
    list: {
      check: boolean;
      fact: string;
    }[];
    buttonText: string;
    banner: string[];
    image?: string;
  };
  optionIndex: number;
  handleContinue: (m: any) => void;
}

const InsurancePlanCardV2 = ({
  option,
  handleContinue,
  optionIndex,
}: CardProps) => {
  const isMobile = useIsMobile();

  return (
    <Box
      width={isMobile ? '100%' : '480px'}
      sx={{
        // border: '1px solid #000000',
        boxShadow: '0px 5px 13px 2px rgba(0, 0, 0, 0.12)',
        borderRadius: '12px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backgroundColor: optionIndex === 0 ? '#F5FFF8' : '#FFFFFF',
      }}
    >
      <Box display="flex" sx={{ gap: '0.8rem' }}>
        {option.banner.map((b, idx) => (
          <Box
            key={idx}
            display="flex"
            alignItems="center"
            sx={{
              padding: '10px',
              backgroundColor: optionIndex === 0 ? '#CFF6DC' : '#EBEBEB',
              borderRadius: '60px',
              width: 'max-content',
              gap: '0.5rem',
            }}
          >
            {idx === 0 ? (
              optionIndex === 0 ? (
                <GreenFilledCircle />
              ) : (
                <EmptyCircle />
              )
            ) : null}
            <Typography>{b}</Typography>
          </Box>
        ))}
      </Box>

      <Box display="flex">
        <Typography
          fontSize="1.5rem!important"
          fontFamily="Gelasio"
          fontWeight={600}
          textAlign={option.index == 1 ? 'start' : 'center'}
          sx={{ lineHeight: '25px!important' }}
        >
          {option.header}
        </Typography>
        {option.image ? (
          <Image
            src={option.image || ''}
            alt="medications-image"
            height={80}
            width={80}
          />
        ) : null}
      </Box>
      {option.percentage ? (
        <Box display="flex" alignItems="center" sx={{ gap: '0.6rem' }}>
          <Typography
            fontSize={isMobile ? '1.42rem!important' : '2.1rem!important'}
            sx={{ color: '#00872B' }}
          >
            {option.percentage}
          </Typography>
          <Typography variant="h4" sx={{ color: '#000000' }}>
            {option.fact}
          </Typography>
        </Box>
      ) : null}
      <Typography fontSize="1.1rem!important">What you need to know</Typography>
      <Stack gap="0.5rem!important" sx={{ flexGrow: 1 }}>
        {option.list.map((li, idx) => (
          <Box key={idx} display="flex" sx={{ gap: '0.5rem' }}>
            {li.check ? (
              <Check sx={{ fontSize: '1rem!important' }} />
            ) : (
              <Clear sx={{ fontSize: '1rem!important' }} />
            )}
            <Typography>{li.fact}</Typography>
          </Box>
        ))}
      </Stack>
      <Button fullWidth onClick={() => handleContinue(option.index)}>
        {option.buttonText}
      </Button>
    </Box>
  );
};

export default InsurancePlanCardV2;

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface ExplanationProps {
  nextPage: (nextPage?: string) => void;
}

const CompoundSemExplanation = ({ nextPage }: ExplanationProps) => {
  const isMobile = useIsMobile();

  return (
    <Stack gap={3}>
      <Typography fontSize="1.2rem!important" lineHeight="25px!important">
        Did you know that compounded semaglutide is the active ingredient in
        Ozempic?
      </Typography>
      <Typography fontSize="1.2rem!important" lineHeight="25px!important">
        Compounded semaglutide may help you lose weight by
      </Typography>
      <Image
        alt="glp1-process"
        src="https://api.getzealthy.com/storage/v1/object/public/questions/glp1explan.svg"
        height={350}
        width={300}
        style={{ alignSelf: 'center' }}
      />
      <Stack gap={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircleIcon
            sx={{ color: '#097969', fontSize: '2.2rem!important' }}
          />
          <Typography variant="h3" fontWeight={304} fontSize="1.1rem!important">
            <span style={{ fontWeight: '700' }}>
              Slowing down how food moves
            </span>{' '}
            through your stomach and intestines.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircleIcon
            sx={{ color: '#097969', fontSize: '2.2rem!important' }}
          />
          <Typography variant="h3" fontWeight={304} fontSize="1.1rem!important">
            Making you{' '}
            <span style={{ fontWeight: '700' }}>feel full longer</span>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircleIcon
            sx={{ color: '#097969', fontSize: '2.2rem!important' }}
          />
          <Typography variant="h3" fontWeight={304} fontSize="1.1rem!important">
            Helping your body{' '}
            <span style={{ fontWeight: '700' }}>use insulin better</span>
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default CompoundSemExplanation;

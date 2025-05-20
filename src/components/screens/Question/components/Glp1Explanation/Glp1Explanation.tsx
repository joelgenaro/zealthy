import { useAnswerState } from '@/components/hooks/useAnswer';
import { isCodedAnswer } from '@/utils/isCodedAnswer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import { useMemo } from 'react';

interface ExplanationProps {
  nextPage: (nextPage?: string) => void;
}

const Glp1Explanation = ({ nextPage }: ExplanationProps) => {
  const answers = useAnswerState();

  const glp1Knowledge = useMemo(() => {
    const { answer } = answers['WEIGHT_L_Q6'];

    if (answer && isCodedAnswer(answer)) {
      if (answer[0].valueCoding.display.includes('I’m an expert')) {
        return [
          'We know you’re an expert, but just to recap: GLP-1 is a natural hormone that makes you feel full.',
          'These medications work similarly to help you lose weight by:',
        ];
      } else {
        return [
          'GLP-1 is a natural hormone that makes you feel full.',
          'These medications work similarly to help you lose weight by:',
        ];
      }
    }

    return [];
  }, [answers]);

  return (
    <Stack gap={3}>
      <Typography fontSize="1.2rem!important" lineHeight="25px!important">
        {glp1Knowledge?.[0]}
      </Typography>
      <Typography fontSize="1.2rem!important" lineHeight="25px!important">
        {glp1Knowledge?.[1]}
      </Typography>
      <Image
        alt="glp1-process"
        src="https://api.getzealthy.com/storage/v1/object/public/questions/glp1explan.svg"
        height={350}
        width={300}
        style={{ alignSelf: 'center' }}
      />
      <Stack gap={4}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Typography fontSize="2.2rem!important">🦥</Typography>
          <Typography variant="h3" fontWeight={304} fontSize="1.1rem!important">
            <span style={{ fontWeight: '700' }}>Slows down how food moves</span>{' '}
            through the stomach
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Typography fontSize="2.2rem!important">⏳</Typography>
          <Typography variant="h3" fontWeight={304} fontSize="1.1rem!important">
            Helps you{' '}
            <span style={{ fontWeight: '700' }}>feel full longer</span>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Typography fontSize="2.2rem!important">⚙️</Typography>
          <Typography variant="h3" fontWeight={304} fontSize="1.1rem!important">
            Helping your body{' '}
            <span style={{ fontWeight: '700' }}>use insulin better</span>
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
};

export default Glp1Explanation;

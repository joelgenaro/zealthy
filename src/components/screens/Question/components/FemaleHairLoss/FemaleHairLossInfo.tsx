import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { QuestionWithName } from '@/types/questionnaire';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface InfoProps {
  question: QuestionWithName;
}

const FemaleHairLossInfo = ({ question }: InfoProps) => {
  const isMobile = useIsMobile();

  const description =
    question?.name === 'HAIR_LOSS_F_INFO_Q1'
      ? 'A key ingredient that’s clinically proven to regrow hair in as little as 3 to 6 months.'
      : 'Your care team will provide 24/7 support and treatment check-ins. We’ll ensure you’re always growing in the right direction.';

  const image =
    question?.name === 'HAIR_LOSS_F_INFO_Q1'
      ? 'https://api.getzealthy.com/storage/v1/object/public/questions/female_hl_info.svg'
      : 'https://api.getzealthy.com/storage/v1/object/public/questions/female-hl-info2.svg';

  return (
    <Stack gap={3} sx={{ position: 'relative', bottom: '20px' }}>
      <Typography
        variant="body1"
        sx={{
          fontSize: '22px!important',
          width: '85%',
          wordSpacing: '3px',
          lineHeight: '25px!important',
          fontFamily: 'Georgia, serif',
        }}
      >
        {description}
      </Typography>
      <Image
        style={{ alignSelf: 'center' }}
        src={image}
        alt="medication info"
        height={isMobile ? 320 : 450}
        width={isMobile ? 340 : 470}
      />
    </Stack>
  );
};

export default FemaleHairLossInfo;

import FiveStarsGreen from '@/components/shared/icons/FiveStarsGreen';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import React from 'react';
import Box from '@mui/material/Box';
import VerifiedAccount from './VerifiedAccount';
import { useLanguage, usePatient } from '@/components/hooks/data';
import { Container } from '@mui/material';
import getConfig from '../../../../../../config';

const CheckoutReview = () => {
  const { data: patient } = usePatient();

  const language = useLanguage();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  let review = `${siteName} is great and very helpful. I was a size 12 before and now i’m a size 8. I’ve been trying to lose weight for years now and i’m glad ${siteName} has made the process simple. I get semaglutide every 3 months and use their nutrition plan weekly!`;
  let member = `${siteName} Member`;
  let user = 'Emma T.';

  if (patient?.profiles.gender === 'male') {
    review = `${siteName} is amazing and affordable. I’ve been able to lose 22 pounds so far and have my medication shipped every month. I’ve felt more confident and am excited to continue to lose weight.`;
    user = 'Matt S.';

    if (language === 'esp') {
      review = `${siteName} es increíble y asequible. Hasta ahora he podido perder 22 libras y me envían mis medicamentos todos los meses. Me he sentido más seguro y emocionado de seguir perdiendo peso.`;
      user = 'Mateo S.';
    }
  } else if (patient?.profiles.gender === 'female') {
    review = `${siteName} is great and very helpful. I was a size 12 before and now i’m a size 8. I’ve been trying to lose weight for years now and i’m glad ${siteName} has made the process simple. I get semaglutide every 3 months and use their nutrition plan weekly!`;
    user = 'Emma T.';

    if (siteName === 'FitRx') {
      review =
        'I couldn’t be happier with my experience at FitRx. The medical team is so supportive, and they genuinely want you to succeed. My medication arrived quickly in the mail, and I’m thrilled to share that I’ve dropped nearly 30 pounds in just a few months.';
      user = 'Emily P.';
    }

    if (language === 'esp') {
      review = `${siteName} es genial y muy útil. Antes era talla 12 y ahora soy talla 8. He estado tratando de perder peso durante años y me alegro de que ${siteName} haya simplificado el proceso. ¡Recibo semaglutida cada 3 meses y uso su plan de nutrición semanalmente!`;
      user = 'Sara T.';
    }
  }

  return (
    <Container>
      <Stack
        gap={2}
        sx={{
          backgroundColor: '#FFFCF6',
          border: '0.5px',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <FiveStarsGreen />
        <Typography sx={{ letterSpacing: '-0.108px' }}>{review}</Typography>
        <Typography variant="h4">{`-${user}`}</Typography>
        <Box display="flex" sx={{ gap: '0.5rem' }}>
          <VerifiedAccount />
          <Typography variant="h4" sx={{ color: '#000000' }}>
            {member}
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default CheckoutReview;

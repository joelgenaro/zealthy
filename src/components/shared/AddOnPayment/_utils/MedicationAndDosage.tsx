import { useLanguage } from '@/components/hooks/data';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useVWOVariationName, usePatient } from '@/components/hooks/data';
import Router from 'next/router';
import getConfig from '../../../../../config';
import { useVWO } from '@/context/VWOContext';
import { usePathname } from 'next/navigation';

interface MedicationAndDosageProps {
  videoUrl?: string;
  medication: Medication;
  isBulk?: boolean;
  isBundledCheckout?: boolean;
}

const MedicationAndDosage = ({
  videoUrl,
  medication,
  isBulk = false,
  isBundledCheckout = false,
}: MedicationAndDosageProps) => {
  const { data: variation75801 } = useVWOVariationName('75801');
  const { data: variation4798 } = useVWOVariationName('4798');
  const { data: variation9502 } = useVWOVariationName('9502');

  const pathname = usePathname();
  const isCompoundRefill = pathname?.includes('weight-loss-compound-refill');

  const [showVideo, setShowVideo] = useState(false);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (Router.pathname.includes('/post-checkout/questionnaires-v2')) {
      setShowVideo(true);
    }
  }, [Router.pathname]);

  const language = useLanguage();
  let yourMedicationText = 'Your medication';
  let weeklyDosageText = 'Weekly dosage';
  let monthSupplyText = '3 month supply';
  let videoText = `Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director?`;
  let watchVideo = ' Watch this video. ';

  if (language === 'esp') {
    watchVideo = ' Mira este video. ';
    videoText = `¿Quieres aprender más sobre semaglutida y tirzepatida en ${siteName} de parte de nuestro Director Médico?`;
    yourMedicationText = 'Tu medicamento';
    weeklyDosageText = 'Dosis semanal';
    monthSupplyText = 'Suministro para 3 meses';
  }

  const videoPosterLink =
    Router.pathname.includes('post-checkout') ||
    (['Variation-1', 'Variation-2'].includes(
      variation9502?.variation_name || ''
    ) &&
      isCompoundRefill)
      ? ''
      : 'https://api.getzealthy.com/storage/v1/object/public/images/programs/thumbnail.png';

  return (
    <Stack
      gap="16px"
      bgcolor={isBundledCheckout ? '#ffffff' : '#F6EFE3'}
      padding="16px"
      width="100%"
    >
      {/* Your Medication */}
      <Stack gap="8px">
        {isBundledCheckout ? null : (
          <Typography
            variant="h3"
            sx={{
              fontWeight: '600',
              lineHeight: '24px !important',
            }}
          >
            {yourMedicationText}
          </Typography>
        )}
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={isBundledCheckout ? 700 : 400}
          >{`${medication.name}`}</Typography>
          <Typography variant="subtitle1">
            {medication.dosage?.replace('mgs', 'mg')}
          </Typography>
          {isBulk ? (
            <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
              {monthSupplyText}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      <Typography variant="subtitle1">
        {videoText}
        <span
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => setShowVideo(!showVideo)}
        >
          {watchVideo}
        </span>
      </Typography>

      {showVideo && (
        <Box sx={{ marginTop: '1rem' }}>
          <video width="100%" controls preload="auto" poster={videoPosterLink}>
            <source
              src={
                ['Variation-1', 'Variation-2'].includes(
                  variation9502?.variation_name || ''
                ) && isCompoundRefill
                  ? 'https://api.getzealthy.com/storage/v1/object/public/videos//Zealthy%20Klarna%20Wide%202.mp4'
                  : videoUrl
              }
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
      {['Variation-1', 'Variation-2'].includes(
        variation4798?.variation_name ?? ''
      ) && (
        <Box
          sx={{
            bgcolor: '#b7e4c7',
            borderRadius: 2,
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#333333',
            marginTop: -1,
            marginBottom: 1,
          }}
        >
          These prices will never increase, even if your dose does.
        </Box>
      )}
      {/* Dosage */}
      {medication.dose ? (
        <Stack gap="8px">
          {isBundledCheckout ? null : (
            <Typography
              variant="h3"
              sx={{
                fontWeight: '600',
                lineHeight: '24px !important',
              }}
            >
              {weeklyDosageText}
            </Typography>
          )}
          <Typography
            component="div"
            sx={{
              '.subtitle': {
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '1.25rem',
                letterSpacing: '-0.00375rem',
                marginBottom: '3px',
              },
              '>p': {
                marginTop: 0,
                marginBottom: '16px',
                '&:last-child': {
                  marginBottom: '0px',
                },
              },
            }}
            dangerouslySetInnerHTML={{
              __html: String(medication.dose).replace(/"|"/g, '"'),
            }}
          />
        </Stack>
      ) : null}
    </Stack>
  );
};

export default MedicationAndDosage;

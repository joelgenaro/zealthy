import { useLanguage } from '@/components/hooks/data';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import { useVWOVariationName, usePatient } from '@/components/hooks/data';
import getConfig from '../../../../../config';
import { useVWO } from '@/context/VWOContext';
import { usePathname } from 'next/navigation';

interface MedicationAndDosageProps {
  videoUrl?: string;
  medication: Medication;
  isBulk?: boolean;
  isBundledCheckout?: boolean;
  monthsSupply: number;
}

const MedicationAndDosageSixOrTwelveMonth = ({
  videoUrl,
  medication,
  isBulk = false,
  isBundledCheckout = false,
  monthsSupply,
}: MedicationAndDosageProps) => {
  const [showVideo, setShowVideo] = useState(false);
  const [seeMore, setSeeMore] = useState<boolean>(false);
  const language = useLanguage();
  const pathname = usePathname();
  const isCompoundRefill = pathname?.includes('weight-loss-compound-refill');
  const { data: variation9502 } = useVWOVariationName('9502');

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  let yourMedicationText = 'Your medication';
  let weeklyDosageText = 'Weekly dosage';
  let videoText = `Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director?`;
  let watchVideo = ' Watch this video. ';

  if (language === 'esp') {
    watchVideo = ' Mira este video. ';
    videoText = `¿Quieres aprender más sobre semaglutida y tirzepatida en ${siteName} de parte de nuestro Director Médico?`;
    yourMedicationText = 'Tu medicamento';
    weeklyDosageText = 'Dosis semanal';
  }
  const firstThreeMonthsDosage = medication?.dose?.split('---BREAK---')[0];
  const restOfDosage = medication?.dose?.includes('---BREAK---')
    ? medication?.dose?.split('---BREAK---')[1]
    : null;

  const videoPosterLink =
    ['Variation-1', 'Variation-2'].includes(
      variation9502?.variation_name || ''
    ) && isCompoundRefill
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
          <Typography variant="body1" mb={'0.2rem'}>
            {`${medication?.vial_size} (${Math.round(
              monthsSupply / 3
            )} shipments, 3 month supply per shipment)`}
          </Typography>
          {isBulk ? (
            <Typography variant="subtitle1" sx={{ marginBottom: '2px' }}>
              {'{0} month supply'.replace('{0}', String(monthsSupply))}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      {
        <Typography variant="subtitle1">
          {videoText}
          <span
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => setShowVideo(!showVideo)}
          >
            {watchVideo}
          </span>
        </Typography>
      }
      {showVideo && (
        <Box sx={{ marginTop: '1rem' }}>
          <video width="100%" controls preload="auto" poster={videoPosterLink}>
            <source
              src={
                isCompoundRefill &&
                ['Variation-1', 'Variation-2'].includes(
                  variation9502?.variation_name || ''
                )
                  ? 'https://api.getzealthy.com/storage/v1/object/public/videos//Zealthy%20Klarna%20Wide%202.mp4'
                  : videoUrl
              }
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
      {/* Dosage */}
      {medication.dose ? (
        <Stack>
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
              marginTop: '8px',
              '.subtitle': {
                fontStyle: 'normal',
                fontWeight: '700',
                lineHeight: '1.25rem',
                letterSpacing: '-0.00375rem',
                marginBottom: '3px',
              },
              '>p': {
                marginTop: 0,
              },
            }}
            dangerouslySetInnerHTML={{
              __html: String(firstThreeMonthsDosage).replace(/"|"/g, '"'),
            }}
          />
          {restOfDosage && seeMore && (
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
                },
              }}
              dangerouslySetInnerHTML={{
                __html: String(restOfDosage).replace(/"|"/g, '"'),
              }}
            />
          )}
          {restOfDosage && (
            <Typography
              onClick={() => setSeeMore(!seeMore)}
              sx={{
                height: '24px',
                width: '100%',
                justifyContent: 'center',
                display: 'flex',
                cursor: 'pointer',
              }}
              color={'primary'}
              fontWeight={'bold'}
            >
              {seeMore ? 'See less' : 'Learn more'}
            </Typography>
          )}
        </Stack>
      ) : null}
    </Stack>
  );
};

export default MedicationAndDosageSixOrTwelveMonth;

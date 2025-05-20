import { Medication } from '@/context/AppContext/reducers/types/visit';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CardMedia } from '@mui/material';
interface MedicationAndDosageProps {
  medication: Medication;
  isBulk?: boolean;
}

const MedicationAndDosageV2 = ({
  medication,
  isBulk = false,
}: MedicationAndDosageProps) => {
  return (
    <Stack
      width="100%"
      paddingX="19px"
      paddingY="24px"
      border="1px solid #8ACDA0"
      borderRadius="16px"
      gap="12px"
    >
      <Box
        boxShadow="0px 0px 8px 1px #0000001F"
        display="flex"
        alignItems="stretch"
        justifyContent="space-between"
        paddingX="24px"
        bgcolor="#DDEFE3"
        borderRadius="8px"
        height="215px"
      >
        <Stack spacing={1} justifyContent="center" width="100%">
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: '700',
              lineHeight: '28px',
            }}
          >
            {medication.name}
          </Typography>
          <Typography variant="subtitle1">
            {medication.dosage?.replace('mgs', 'mg')}
          </Typography>
          {isBulk && (
            <Typography variant="subtitle1">3 month supply</Typography>
          )}
        </Stack>
        <Box
          display="flex"
          alignItems="center"
          position="relative"
          right="-40px"
        >
          <CardMedia
            component="img"
            image={'/images/injection.png'}
            alt={medication.name}
            sx={{
              objectFit: 'contain',
              height: '100%',
              maxHeight: '180px',
              position: 'absolute',
              right: '25px',
              bottom: '25px',
              zIndex: 1,
            }}
          />
          <CardMedia
            component="img"
            height="100%"
            image={
              medication.name?.toLowerCase().includes('semaglutide')
                ? '/images/semaglutide_bottle.png'
                : '/images/tirzepatide_bottle.png'
            }
            alt={medication.name}
            sx={{
              objectFit: 'fit',
              height: '100%',
              position: 'relative',
              minHeight: '167px',
              zIndex: 2,
            }}
          />
        </Box>
      </Box>

      {medication.dose && (
        <Stack gap="12px">
          <Typography
            sx={{
              fontSize: '18px',
              fontWeight: '700',
              lineHeight: '28px',
            }}
          >
            {'Weekly dosage'}
          </Typography>
          <Typography
            component="div"
            sx={{
              '.subtitle': {
                fontStyle: 'normal',
                fontWeight: '600',
                fontSize: '16px',
                lineHeightStep: '24px',
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
              __html: String(medication.dose),
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default MedicationAndDosageV2;

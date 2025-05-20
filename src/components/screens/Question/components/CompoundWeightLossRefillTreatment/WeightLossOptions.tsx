import {
  useActivePatientSubscription,
  useLanguage,
  useVWOVariationName,
} from '@/components/hooks/data';
import ErrorMessage from '@/components/shared/ErrorMessage';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Radio, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import DOMPurify from 'dompurify';
import { useSearchParams } from 'next/navigation';
import ListItems from '../WeightLossTreatment/components/ListItems';
import { useEffect, useMemo, useState } from 'react';
import { CompoundDetailProps } from './CompoundWeightLossRefillTreatment';
import { calculateSavingsPerMg } from './helpers';
import getConfig from '../../../../../../config';

const videoUrl =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? 'https://api.getzealthy.com/storage/v1/object/public/videos/Dr.M%20Final.mp4?t=2024-09-16T22%3A33%3A45.765Z'
    : 'https://staging.api.getzealthy.com/storage/v1/object/public/videos/Dr.M%20Final.mp4?t=2024-09-16T22%3A12%3A23.609Z';

interface WeightLossOptionsProps {
  videoUrl?: string;
  displayError: boolean;
  compoundDetails: CompoundDetailProps;
  handleChange: (value: string) => void;
  handleConfirmQuantity: () => Promise<void>;
}

const WeightLossOptions = ({
  videoUrl,
  displayError,
  compoundDetails,
  handleChange,
  handleConfirmQuantity,
}: WeightLossOptionsProps) => {
  const searchParams = useSearchParams();
  const medicationSelected = searchParams?.get('med') as string;
  const checked = searchParams?.get('checked') || '';
  const { data: patientSubscriptions = [] } = useActivePatientSubscription();
  const [learnSingleMore, setLearnSingleMore] = useState<boolean>(false);
  const [learnBulkMore, setLearnBulkMore] = useState<boolean>(false);
  const [learnMoreSixMonth, setLearnMoreSixMonth] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [learnMoreTwelveMonth, setLearnMoreTwelveMonth] =
    useState<boolean>(false);
  const language = useLanguage();
  const { data: variation75801 } = useVWOVariationName('75801');
  const { data: variation7746_3 } = useVWOVariationName('7746-3');
  const isVariation7746_3 = variation7746_3?.variation_name === 'Variation-1';

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const isRecurringMedicationSubscription = useMemo(() => {
    return patientSubscriptions.some(sub =>
      sub.product?.toLowerCase().includes('recurring weight loss')
    );
  }, [patientSubscriptions]);

  const { threeMonth } = calculateSavingsPerMg(
    medicationSelected,
    compoundDetails
  );

  useEffect(() => {
    if (checked.length) {
      setShowVideo(true);
    }
  }, [checked]);

  return (
    <Box>
      <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
        {'Tell us how much medication you’d like to receive.'}
      </Typography>
      <Stack spacing={2} mb={3}>
        {isRecurringMedicationSubscription ? (
          <Typography variant="subtitle1">
            For a limited time, {siteName} is offering a 20% discount on your
            medication and the next 2 months of your membership if you get a 3
            month supply. Moving forward we will only be charging and shipping
            compound GLP-1 once you’re prescribed compound GLP-1 by a {siteName}
            provider. This means we will be cancelling your compound GLP-1
            subscription, so you will only pay for compound GLP-1 when you are
            prescribed.
          </Typography>
        ) : (
          <Typography variant="subtitle1">
            {`For a limited time, ${siteName} is offering a 20% discount on your next 3 months of membership if you get a 3 month supply.`}
          </Typography>
        )}
      </Stack>
      {showVideo && (
        <Typography variant="subtitle1">
          {`Want to learn more about semaglutide and tirzepatide at ${siteName} from our Medical Director? Watch this video.`}
        </Typography>
      )}
      {showVideo && (
        <Box sx={{ marginY: '1rem' }}>
          <video
            width="100%"
            controls
            style={{ borderRadius: '10px' }}
            poster={
              'https://api.getzealthy.com/storage/v1/object/public/images/programs/thumbnail.png'
            }
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      )}

      <Box
        sx={{
          padding: '1.5rem',
          borderRadius: '1rem',
          background: '#ffffff',
          boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
          gap: '1.5rem',
          cursor: 'pointer',
        }}
        onClick={() => handleChange('bulk')}
      >
        {compoundDetails[medicationSelected].saving > 0 && threeMonth > 0 && (
          <Box
            sx={{
              borderRadius: '0.75rem',
              background: '#F7F9A5',
              display: 'flex',
              width: 'fit-content',
              height: '3.25rem',
              padding: '1rem 1.25rem',
              justifyContent: 'center',
              alignItems: 'flex-start',
              alignSelf: 'center',
              fontWeight: 600,
            }}
          >
            {`Save $${threeMonth.toFixed(2)} per mg`}
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Radio
            value={checked}
            checked={checked === 'bulk'}
            inputProps={{ 'aria-label': 'controlled' }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body1" mb="1rem">
                {`${compoundDetails[medicationSelected].name} ${compoundDetails[
                  medicationSelected
                ].medBulkData.dosage.replace('mgs', 'mg')}`}
              </Typography>
            </Box>
            <Typography variant="body1" mb="1rem" fontSize="1rem !important">
              {compoundDetails[medicationSelected].medData?.price! >
                compoundDetails[medicationSelected].medBulkData
                  .discounted_price! && (
                <Typography
                  component="span"
                  variant="body1"
                  fontSize="1rem !important"
                  sx={{
                    textDecoration: 'line-through',
                    marginRight: '0.2rem',
                    width: '20px',
                  }}
                >
                  {`$${compoundDetails[medicationSelected].medData.price}/month`}
                </Typography>
              )}

              {`$${Math.ceil(
                compoundDetails[medicationSelected].medBulkData
                  .discounted_price!
              )}/month for ${
                compoundDetails[medicationSelected].name
              } (3 month supply)`}
            </Typography>
            <Typography
              fontWeight={700}
              textAlign="center"
              sx={{
                marginBottom: '1rem',
                fontStyle: 'italic',
                textAlign: 'left',
              }}
            >
              {compoundDetails[medicationSelected].singleDescription
                .toLowerCase()
                .includes('semaglutide')
                ? isVariation7746_3
                  ? `On average, people lose 5% of their weight when taking semaglutide for 3 months**`
                  : `On average, people lose 5% of their weight when taking semaglutide for 3 months**`
                : isVariation7746_3
                ? `On average, people lose 7% of their weight when taking tirzepatide for 3 months**`
                : `On average, people lose 7% of their weight when taking tirzepatide for 3 months**`}
            </Typography>

            {learnBulkMore ? (
              <>
                <Typography
                  variant="body1"
                  mb={'1rem'}
                  fontSize="0.75rem !important"
                >
                  {compoundDetails?.[medicationSelected]?.body1}
                </Typography>
                <Typography
                  variant="body1"
                  fontSize="0.75rem !important"
                  mb="1rem"
                >
                  {compoundDetails?.[medicationSelected]?.body2}
                </Typography>
                <ListItems
                  dosage={`${compoundDetails?.[medicationSelected]?.name} ${compoundDetails?.[medicationSelected]?.medBulkData.dosage}`}
                  isOral={medicationSelected === 'Oral Semaglutide'}
                />
                <Typography
                  variant="body1"
                  fontSize="0.75rem !important"
                  mb="1rem"
                >
                  {medicationSelected === 'Oral Semaglutide'
                    ? 'Instructions:'
                    : `Injection instructions and video will be in your
                          ${siteName} home page once prescribed:`}
                </Typography>
                <Typography
                  component="div"
                  variant="body1"
                  fontSize="0.75rem !important"
                  mb="1rem"
                  sx={{
                    '.subtitle': {
                      color: '#989898',
                      fontFamily: 'Inter',
                      fontSize: '0.625rem',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '1.25rem',
                      letterSpacing: '-0.00375rem',
                      marginBottom: '3px',
                    },
                    '>p': {
                      marginTop: 0,
                      marginBottom: '3px',
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      String(
                        compoundDetails?.[medicationSelected]?.medBulkData?.dose
                      )
                    ),
                  }}
                />
                <Typography
                  fontSize="0.75rem !important"
                  fontStyle="italic"
                  mb="1rem"
                >
                  {medicationSelected.toLowerCase()?.includes('semaglutide')
                    ? language === 'esp'
                      ? `**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad."`
                      : `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity.”`
                    : language === 'esp'
                    ? `**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad."`
                    : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                </Typography>
              </>
            ) : null}
            <Button
              color="grey"
              fullWidth
              onClick={e => {
                e.stopPropagation();
                setLearnBulkMore(more => !more);
              }}
            >
              {learnBulkMore ? 'View less' : 'Learn more'}
              {learnBulkMore ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </Button>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          padding: '1.5rem',
          borderRadius: '1rem',
          background: '#ffffff',
          boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '3rem',
          gap: '1.5rem',
          cursor: 'pointer',
        }}
        onClick={() => handleChange('single')}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Radio
            sx={{ height: 'min-content' }}
            value={checked}
            checked={checked === 'single'}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight="600" mb="0.3rem">
                {compoundDetails[medicationSelected].singleTitle}
              </Typography>

              <Typography variant="body1" mb="1rem">
                {`${compoundDetails[medicationSelected].name} ${compoundDetails[
                  medicationSelected
                ].medData.dosage.replace('mgs', 'mg')}`}
              </Typography>
            </Box>
            <Typography variant="body1" mb="1rem" fontSize="1rem !important">
              {compoundDetails[medicationSelected].singleDescription}
            </Typography>
            <Typography
              fontWeight={700}
              textAlign="center"
              sx={{
                marginBottom: '1rem',
                fontStyle: 'italic',
                textAlign: 'left',
              }}
            >
              {compoundDetails[medicationSelected].singleDescription
                .toLowerCase()
                .includes('semaglutide')
                ? `On average, people lose 2.3% of their weight after 1 month on Semaglutide**`
                : `On average, people lose 2.7% of their weight after 1 month on Tirzepatide**`}
            </Typography>
            {learnSingleMore ? (
              <>
                <ListItems
                  dosage={`${
                    compoundDetails?.[medicationSelected]?.name
                  } ${compoundDetails?.[
                    medicationSelected
                  ]?.medData.dosage.replace('mgs', 'mg')}`}
                  isOral={medicationSelected === 'Oral Semaglutide'}
                />
                <Typography
                  variant="body1"
                  fontSize="0.75rem !important"
                  mb="1rem"
                >
                  {medicationSelected === 'Oral Semaglutide'
                    ? 'Instructions:'
                    : `Injection instructions and video will be in your ${siteName} home page once prescribed:`}
                </Typography>
                <Typography
                  component="div"
                  variant="body1"
                  fontSize="0.75rem !important"
                  mb="1rem"
                  sx={{
                    '.subtitle': {
                      color: '#989898',
                      fontFamily: 'Inter',
                      fontSize: '0.625rem',
                      fontStyle: 'normal',
                      fontWeight: '700',
                      lineHeight: '1.25rem',
                      letterSpacing: '-0.00375rem',
                      marginBottom: '3px',
                    },
                    '>p': {
                      marginTop: 0,
                      marginBottom: '3px',
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      String(
                        compoundDetails?.[medicationSelected]?.medData?.dose
                      )
                    ),
                  }}
                />
                <Typography
                  fontSize="0.75rem !important"
                  fontStyle="italic"
                  mb="1rem"
                >
                  {medicationSelected.toLowerCase()?.includes('semaglutide')
                    ? language === 'esp'
                      ? `**Esto se basa en datos de un estudio de 2022 publicado por la Asociación Médica Americana titulado "Resultados de pérdida de peso asociados con el tratamiento con semaglutida para pacientes con sobrepeso u obesidad."`
                      : `**This is based on data from a 2022 study published in the American Medical Association titled “Weight Loss Outcomes Associated With Semaglutide Treatment for Patients with Overweight or Obesity."`
                    : language === 'esp'
                    ? `**Esto se basa en datos de un estudio de 2022 publicado en el New England Journal of Medicine titulado "Tirzepatida una vez por semana para el tratamiento de la obesidad."`
                    : `**This is based on data from a 2022 study published in the New England Journal of Medicine titled “Tirzepatide Once Weekly for the Treatment of Obesity.”`}
                </Typography>
              </>
            ) : null}
            <Button
              color="grey"
              fullWidth
              onClick={e => {
                e.stopPropagation();
                setLearnSingleMore(more => !more);
              }}
            >
              {learnSingleMore ? 'View less' : 'Learn more'}
              {learnSingleMore ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </Button>

            {/* </Box> */}
          </Box>
        </Box>
      </Box>
      <Button
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={handleConfirmQuantity}
      >
        Continue
      </Button>
      {displayError && (
        <ErrorMessage>
          Please select one of the options above to continue.
        </ErrorMessage>
      )}
    </Box>
  );
};

export default WeightLossOptions;

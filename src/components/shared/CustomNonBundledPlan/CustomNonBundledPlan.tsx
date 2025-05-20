import { useIsMobile } from '@/components/hooks/useIsMobile';
import QuestionHeader from '@/components/screens/Question/components/QuestionHeader';
import { QuestionWithName } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StrikethroughText from '../StrikethroughText';
import Image from 'next/image';
import CustomBundlePlan from 'public/images/semaglutide-bundled-plan.png';
import CustomBundlePlanZP from 'public/images/semaglutide-bundled-plan-zp.png';
import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import { usePatientState } from '@/components/hooks/usePatient';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useTheme } from '@mui/system';
import getConfig from '../../../../config';

type CustomNonBundledPlanProps = {
  question: QuestionWithName;
  onClick: () => void;
  price: number;
  discountedPrice: number;
  listItems: string[];
};

const CustomNonBundledPlan = ({
  question,
  onClick,
  price,
  discountedPrice,
  listItems,
}: CustomNonBundledPlanProps) => {
  const theme = useTheme();
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const isMobile = useIsMobile();
  const patientState = usePatientState();
  const language = useLanguage();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { data: variant5777 } = useVWOVariationName('5777');
  if (variant5777?.variation_name === 'Variation-3') {
    listItems = [
      'Provider review of request for GLP-1s or similar medications and prescription if medically appropriate',
      'Assistance with getting your medications covered by insurance (which can cost over $1,000/month elsewhere); affordable medication without insurance (GLP-1 medications are not included in the membership)',
      'Unlimited messaging with a coach who can help you build a customized plan',
      'Tracking your weight loss progress and goals',
    ];
  }

  const variant6471 =
    variant === '6471' &&
    specificCare === SpecificCareOption.WEIGHT_LOSS &&
    potentialInsurance === null;

  return (
    <Container sx={{ maxWidth: '1000px !important' }}>
      <Stack
        marginTop={isMobile ? '0' : '-48px'}
        direction={isMobile ? 'column' : 'row'}
        gap="20px"
        alignItems="center"
        justifyContent="center"
      >
        {isMobile ? null : (
          <Image
            src={
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? CustomBundlePlan
                : CustomBundlePlanZP
            }
            alt="custom plan"
            width={['Zealthy', 'FitRx'].includes(siteName ?? '') ? 454 : 500}
            height={676}
          />
        )}
        <Stack gap={isMobile ? 4 : 6}>
          <QuestionHeader question={question} />
          <Stack
            alignItems="center"
            padding="24px"
            borderRadius="16px"
            border="1px solid #A3A3A3"
            gap="24px"
          >
            <Typography textTransform="uppercase" variant="h3" fontWeight={500}>
              {language === 'esp' ? 'Precio Especial' : 'Special price'}
            </Typography>
            <Stack direction="row" gap="16px">
              <StrikethroughText
                color={
                  ['Zealthy', 'FitRx'].includes(siteName ?? '')
                    ? '#D71D1D'
                    : theme.palette.primary.main
                }
                fontSize="40px"
                sx={{
                  fontSize: '40px !important',
                }}
              >
                ${price}
              </StrikethroughText>
              {variant6471 ? (
                <Typography
                  color={
                    ['Zealthy', 'FitRx'].includes(siteName ?? '')
                      ? '#2EA956'
                      : theme.palette.primary.light
                  }
                  sx={{
                    fontSize: '40px!important',
                    display: 'flex',
                  }}
                >
                  ${discountedPrice}{' '}
                  <span
                    style={{
                      fontSize: '12px',
                      fontStyle: 'italic',
                      position: 'relative',
                      top: '-15px',
                      right: '-12px',
                      width: '35%',
                      lineHeight: '15px',
                    }}
                  >
                    Only pay if prescribed
                  </span>
                </Typography>
              ) : (
                <Typography
                  color={
                    ['Zealthy', 'FitRx'].includes(siteName ?? '')
                      ? '#2EA956'
                      : theme.palette.primary.light
                  }
                  sx={{
                    fontSize: '40px!important',
                  }}
                >
                  ${discountedPrice}
                </Typography>
              )}
            </Stack>

            <ul>
              {listItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Stack>
          <Button onClick={onClick}>
            {language === 'esp' ? 'Continuar' : 'Continue'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default CustomNonBundledPlan;

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
import { replaceAll } from '@/utils/replaceAll';
import { useMemo } from 'react';
import { useLanguage } from '@/components/hooks/data';
import { useVWOVariationName } from '@/components/hooks/data';
import { useVWO } from '@/context/VWOContext';

type CustomBundledPlanProps = {
  question: QuestionWithName;
  onClick: () => void;
  price: number;
  discountedPrice: number;
  listItems: string[];
  medicationName: string;
};

const CustomBundledPlan = ({
  question,
  onClick,
  price,
  discountedPrice,
  listItems,
  medicationName,
}: CustomBundledPlanProps) => {
  const isMobile = useIsMobile();

  const formattedQuestion = useMemo(
    () => ({
      ...question,
      description: replaceAll(
        question.description || '',
        ['[medication]'],
        [medicationName]
      ),
    }),
    [medicationName, question]
  );
  const language = useLanguage();

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
            src={CustomBundlePlan}
            alt="custom plan"
            width={454}
            height={676}
          />
        )}
        <Stack gap={isMobile ? 4 : 6}>
          <QuestionHeader question={formattedQuestion} />
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
                color="#D71D1D"
                fontSize="40px"
                sx={{
                  fontSize: '40px !important',
                }}
              >
                ${price}
              </StrikethroughText>
              <Typography
                color="#2EA956"
                sx={{
                  fontSize: '40px !important',
                }}
              >
                ${discountedPrice}
              </Typography>
            </Stack>

            <ul>
              {listItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Stack>
          <Button onClick={onClick}>
            {' '}
            {language === 'esp' ? 'Continuar' : 'Continue'}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default CustomBundledPlan;

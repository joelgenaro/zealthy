import {
  useActivePatientSubscription,
  useLanguage,
} from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import CheckMark from '@/components/shared/icons/CheckMark';
import { Questionnaire } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { useVWOVariationName } from '@/components/hooks/data';
import jsonLogic from 'json-logic-js';

type Intro = NonNullable<Questionnaire['intro']>;

interface QuestionIntroProps {
  intro: Intro;
  onClick: () => void;
}

const QuestionIntro = ({ intro, onClick }: QuestionIntroProps) => {
  const { variant } = useIntakeState();
  const { data: patientSubscriptions } = useActivePatientSubscription();
  const language = useLanguage();
  const { data: variant8279_6 } = useVWOVariationName('8279_6');

  const listItems = useMemo(() => {
    if (!intro.listItems) {
      return undefined;
    }

    if (variant === '3055') {
      return intro.listItems.filter(
        item => item !== 'Personalized 1:1 coaching'
      );
    }

    return intro.listItems;
  }, [intro.listItems, variant]);

  const description = useMemo(() => {
    if (!intro.description) {
      return undefined;
    }

    return intro.description;
  }, [intro.description]);

  const header = useMemo(() => {
    if (!intro.header) {
      return undefined;
    }

    return jsonLogic.apply(intro.header, {
      variant8279_6: variant8279_6?.variation_name,
    });
  }, [intro.header, variant8279_6]);

  let continueText = 'Continue';
  if (language === 'esp') {
    continueText = 'Continuar';
  }

  return (
    <Stack gap={6}>
      <Stack gap="30px">
        {intro.header ? <Typography variant="h2">{header}</Typography> : null}
        {description ? <Typography>{description}</Typography> : null}
        {listItems ? (
          <Stack direction="column" gap="10px">
            {listItems.map(item => (
              <Stack key={item} direction="row" gap="16px">
                <Typography paddingTop="2px">
                  <CheckMark width="18px" height="14px" />
                </Typography>
                <Typography>{item}</Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
      <Button onClick={onClick}>{intro.buttonText || continueText}</Button>
      {intro.footnote ? (
        <Typography
          variant="subtitle1"
          color="#747474"
          style={{ fontSize: '12px' }}
        >
          {intro.footnote}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default QuestionIntro;

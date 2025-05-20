import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState, useCallback } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  SpecificCareOption,
  WeightLossOptions,
} from '@/context/AppContext/reducers/types/intake';
import { useVisitActions } from '@/components/hooks/useVisit';
import dynamic from 'next/dynamic';
import Title from '@/components/shared/Title';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useLanguage } from '@/components/hooks/data';

// Dynamically import CheckMark to reduce initial bundle size
const CheckMark = dynamic(() => import('@/components/shared/icons/CheckMark'));

const WeightLossROHome = () => {
  const { addSpecificCare, addVariant } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { specificCare, weightLoss, variant } = useIntakeState();
  const { push, query, isReady } = useRouter();
  const [noneOfAbove, setNoneOfAbove] = useState(false);
  const { addWeightLoss, removeWeightLoss, resetWeightLoss } =
    useIntakeActions();
  const language = useLanguage();

  const answerOptions = [
    WeightLossOptions.RO_LOSE_WEIGHT,
    WeightLossOptions.RO_IMPROVE_HEALTH,
    WeightLossOptions.RO_IMPROVE_CONDITION,
    WeightLossOptions.RO_IMPROVE_CONFIDENCE,
    WeightLossOptions.RO_INCREASE_ACTIVE,
  ];

  useEffect(() => {
    resetQuestionnaires();
    addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    addVariant((query.variant as string) || '0');
    if (specificCare === SpecificCareOption.WEIGHT_LOSS) {
      window.freshpaint?.track('weight-loss-start');
    }
  }, [
    language,
    addSpecificCare,
    addVariant,
    resetQuestionnaires,
    query.variant,
    specificCare,
  ]);

  const handleSelectOption = useCallback(
    (answerOption: WeightLossOptions) => {
      setNoneOfAbove(false);
      weightLoss.includes(answerOption)
        ? removeWeightLoss(answerOption)
        : addWeightLoss(answerOption);
    },
    [weightLoss, addWeightLoss, removeWeightLoss]
  );

  const handleReset = useCallback(() => {
    setNoneOfAbove(true);
    resetWeightLoss();
  }, [resetWeightLoss]);

  const handleContinue = useCallback(() => {
    push(`/weight-loss-ro/bmi?variant=${variant}`);
  }, [push, variant]);

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Grid container direction="column" gap="48px">
          <Grid container direction="column" gap="26px">
            <Title text="What do you want to accomplish with the Zealthy Weight Loss Program" />
            <Typography variant="body2" component="p">
              I want to...
            </Typography>
          </Grid>
          <List
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '0',
            }}
          >
            {answerOptions.map((answerOption, index) => {
              const isSelected = weightLoss.includes(answerOption);
              return (
                <ListItemButton
                  selected={isSelected}
                  key={index}
                  onClick={() => handleSelectOption(answerOption)}
                  sx={{
                    border: `1px solid #00000033`,
                    borderRadius: '12px',
                    padding: '20px 24px',
                    color: '#1B1B1B',
                  }}
                >
                  {answerOption}
                  {isSelected && <CheckMark style={{ marginLeft: 'auto' }} />}
                </ListItemButton>
              );
            })}
            <ListItemButton
              selected={noneOfAbove && !weightLoss.length}
              key={'none'}
              onClick={handleReset}
              sx={{
                border: `1px solid #00000033`,
                borderRadius: '12px',
                padding: '20px 24px',
                color: '#1B1B1B',
              }}
            >
              {language === 'esp'
                ? 'Ninguna de las anteriores'
                : 'None of the above'}
              {noneOfAbove && !weightLoss.length && (
                <CheckMark style={{ marginLeft: 'auto' }} />
              )}
            </ListItemButton>
          </List>
          <Button onClick={handleContinue}>Continue</Button>
        </Grid>
      </Container>
    </>
  );
};

WeightLossROHome.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossROHome;

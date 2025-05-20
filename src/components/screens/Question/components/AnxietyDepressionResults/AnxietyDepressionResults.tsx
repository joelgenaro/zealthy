import React, { useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { Paper, Typography } from '@mui/material';
import Slider from '@/components/shared/Slider';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import { calculateScore, totalScore } from './utils/calculateScore';
import {
  mapGAD7ScoreToDiagnosis,
  mapPHQ9ScoreToDiagnosis,
} from './utils/mapScoreToDiagnosis';
import { replaceAll } from '@/utils/replaceAll';
import { useHandleRefillRequest } from './utils/refillRequestActions';
import { AnswerItem } from '@/context/AppContext/reducers/types/answer';

const phq9Text = `Based on your responses, you are most likely to have [mild/moderate/severe] depression. You probably haven’t felt like yourself lately. The good news is we want to help you feel better, manage your symptoms, and get back to enjoying what you love.`;
const gad7Text = `Your symptoms are consistent with [minimal/mild/moderate/severe] anxiety. There is room to feel calmer and more comfortable every day. Zealthy will support you on this journey by helping you manage your symptoms and get back to thriving.`;
const noDepression = `Great news! Based on your responses, it seems you are not experiencing symptoms of depression. If you haven’t been feeling yourself lately, you can still talk to a Zealthy provider and see how we can help.`;

const AnxietyDepressionResults = () => {
  const allAnswers = useAnswerSelect(answers => Object.values(answers));

  const phqAnswers: AnswerItem[] = useMemo(() => {
    return allAnswers.length === 0
      ? allAnswers.filter(a => a.name.startsWith('44'))
      : allAnswers.filter(a => a.questionnaire === 'phq-9');
  }, [allAnswers]);

  const gadAnswers: AnswerItem[] = useMemo(() => {
    return allAnswers.length === 0
      ? allAnswers.filter(a => a.name.startsWith('6'))
      : allAnswers.filter(a => a.questionnaire === 'gad-7');
  }, [allAnswers]);
  const { handleRefillRequest } = useHandleRefillRequest();

  useEffect(() => {
    if (
      phqAnswers?.[0].questionnaire === 'refill-request-personalized-psychiatry'
    )
      handleRefillRequest();
  }, []);

  const scores = useMemo(() => {
    const phqScore = calculateScore(phqAnswers);
    const gadScore = calculateScore(gadAnswers);

    const phq9Diagnosis = mapPHQ9ScoreToDiagnosis(phqScore);
    const gad7Diagnosis = mapGAD7ScoreToDiagnosis(gadScore);

    return [
      {
        min: 'Mild',
        max: 'Severe',
        text: replaceAll(
          phq9Diagnosis === 'No' ? noDepression : phq9Text,
          ['[mild/moderate/severe]'],
          [phq9Diagnosis.toLowerCase()]
        ),
        diagnosis: `${mapPHQ9ScoreToDiagnosis(phqScore)} depression`,
        percentage: Math.round((phqScore / totalScore['phq-9']) * 100),
      },
      {
        min: 'Minimal',
        max: 'Severe',
        text: replaceAll(
          gad7Text,
          ['[minimal/mild/moderate/severe]'],
          [gad7Diagnosis.toLowerCase()]
        ),
        diagnosis: `${mapGAD7ScoreToDiagnosis(gadScore)} anxiety`,
        percentage: Math.round((gadScore / totalScore['gad-7']) * 100),
      },
    ];
  }, [phqAnswers, gadAnswers]);

  return (
    <>
      {scores.map((score, i) => (
        <Paper key={i} elevation={0} sx={{ borderRadius: 4 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Typography variant="h2">{score.diagnosis}</Typography>
            {score.diagnosis !== 'No depression' ? (
              <Slider
                value={score.percentage}
                marks={[
                  {
                    value: 0,
                    label: score.min,
                  },
                  {
                    value: 100,
                    label: score.max,
                  },
                ]}
                sx={{ pointerEvents: 'none' }}
              />
            ) : null}
            <Typography lineHeight="24px">{score.text}</Typography>
          </Box>
        </Paper>
      ))}
    </>
  );
};

export default AnxietyDepressionResults;

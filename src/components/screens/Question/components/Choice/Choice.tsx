import { useAnswerAction } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import {
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
  QuestionWithName,
} from '@/types/questionnaire';
import {
  Button,
  Box,
  Stack,
  List,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useCallback, useEffect, useMemo } from 'react';
import FollowUpQuestion from '../FollowUpQuestion';
import { useVWOVariationName } from '../../../../hooks/data';
import Router from 'next/router';
import { useSearchParams } from 'next/navigation';
import ChoiceItem from './components/ChoiceItem';
import DosageChoiceItem from './components/DosageChoiceItem';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export const competitorInfoMap = {
  'Hims/Hers': {
    name: 'Hims/Hers',
    title: 'Why Hims/Hers members have switched to Zealthy',
    fm: '$165/month',
    ongoing: '$399/month',
    sema: '$165/month',
    tirz: 'Do not offer',
    coaching: false,
    coverage: false,
    visits: true,
    accessOW: false,
    accessZM: false,
  },
  Ro: {
    name: 'Ro',
    title: 'Why Ro members have switched to Zealthy',
    fm: '$99/month',
    ongoing: '$145/month',
    sema: '$450/month',
    tirz: 'Do not offer',
    coaching: true,
    coverage: true,
    visits: true,
    accessOW: true,
    accessZM: true,
  },
  'Henry Meds': {
    name: 'Henry Meds',
    title: 'Why Henry Meds members have switched to Zealthy',
    fm: '$247/month',
    ongoing: '$249/month',
    sema: '$247/month',
    tirz: 'Do not offer',
    coaching: false,
    coverage: false,
    visits: true,
    accessOW: false,
    accessZM: false,
  },
  IVIM: {
    name: 'IVIM',
    title: 'Why IVIM Health members have switched to Zealthy',
    fm: '$199/month',
    ongoing: '$375/month',
    sema: '$375/month',
    tirz: '$250/month',
    coaching: false,
    coverage: true,
    visits: true,
    accessOW: true,
    accessZM: true,
  },
  'Weight Watchers Clinic': {
    name: 'Weight Watchers Clinic',
    title: 'Why Weight Watchers Clinic members have switched to Zealthy',
    fm: '$49/month',
    sema: 'Do not offer',
    tirz: 'Do not offer',
    coaching: true,
    coverage: true,
    visits: true,
    accessOW: true,
    accessZM: true,
  },
  Noom: {
    name: 'Noom',
    title: 'Why Noom members have switched to Zealthy',
    fm: '$165/month',
    sema: '$165/month',
    tirz: 'Do not offer',
    coaching: true,
    coverage: true,
    visits: true,
    accessOW: true,
    accessZM: true,
  },
  Generic: {
    name: 'Other plans',
    title: 'Why do people switch to Zealthy?',
    fm: 'Up to $247/month',
    ongoing: 'Up to $297/month',
    sema: 'Up to $450/month',
    tirz: 'Do not offer',
    coaching: false,
    coverage: false,
    visits: true,
    accessOW: false,
    accessZM: false,
  },
};

interface ZealthyComparisonProps {
  competitorInfo: {
    name?: string;
    title: string;
    fm?: string;
    ongoing?: string;
    sema?: string;
    tirz?: string;
    coaching?: boolean;
    coverage?: boolean;
    visits?: boolean;
    accessOW?: boolean;
    accessZM?: boolean;
  };
  onClick: () => void;
}

interface CheckOrCrossProps {
  isTrue: boolean;
}

const CheckOrCross = ({ isTrue }: CheckOrCrossProps) => {
  return isTrue ? (
    <CheckIcon sx={{ color: '#008000', fontSize: '24px' }} />
  ) : (
    <CloseIcon sx={{ color: '#FF0000', fontSize: '24px' }} />
  );
};
const ZealthyComparison = ({
  competitorInfo,
  onClick,
}: ZealthyComparisonProps) => {
  return (
    <Box>
      <Typography
        variant="h2"
        sx={{
          fontFamily: 'Gelasio, serif',
          fontWeight: 700,
          textAlign: 'left',
          paddingX: 2,
        }}
      >
        {competitorInfo.title}
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            {/* Blank header for row labels */}
            <TableCell />
            {/* Zealthy Column */}
            <TableCell
              sx={{
                color: '#005315',
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              Zealthy
            </TableCell>
            {/* Competitor Column */}
            <TableCell
              sx={{
                color: '#B90B0E',
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              {competitorInfo.name}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Medical care, First month */}
          {competitorInfo.fm && (
            <TableRow>
              <TableCell>Medical care, First month</TableCell>
              <TableCell sx={{ color: '#005315', fontWeight: 700 }}>
                $39/month
              </TableCell>
              <TableCell sx={{ color: '#B90B0E', fontWeight: 700 }}>
                {competitorInfo.fm}
              </TableCell>
            </TableRow>
          )}

          {/* Medical Care, Ongoing Cost */}
          {competitorInfo.ongoing && (
            <TableRow>
              <TableCell>Medical care, Ongoing Cost</TableCell>
              <TableCell sx={{ color: '#005315', fontWeight: 700 }}>
                $135/month
              </TableCell>
              <TableCell sx={{ color: '#B90B0E', fontWeight: 700 }}>
                {competitorInfo.ongoing}
              </TableCell>
            </TableRow>
          )}

          {/* Access to Compounded Semaglutide */}
          {competitorInfo.sema && (
            <TableRow>
              <TableCell>Access to Compounded Semaglutide</TableCell>
              <TableCell sx={{ color: '#005315', fontWeight: 700 }}>
                As low as $151/month
              </TableCell>
              <TableCell sx={{ color: '#B90B0E', fontWeight: 700 }}>
                {competitorInfo.sema}
              </TableCell>
            </TableRow>
          )}

          {/* Access to Compounded Tirzepatide */}
          {competitorInfo.tirz && (
            <TableRow>
              <TableCell>Access to Compounded Tirzepatide</TableCell>
              <TableCell sx={{ color: '#005315', fontWeight: 700 }}>
                As low as $216/month
              </TableCell>
              <TableCell sx={{ color: '#B90B0E', fontWeight: 700 }}>
                {competitorInfo.tirz}
              </TableCell>
            </TableRow>
          )}

          {/* Weight Loss Coaching */}
          {competitorInfo.coaching !== undefined && (
            <TableRow>
              <TableCell>Weight Loss Coaching</TableCell>
              <TableCell>
                <CheckOrCross isTrue={true} />
              </TableCell>
              <TableCell>
                {' '}
                <CheckOrCross isTrue={competitorInfo.coaching} />
              </TableCell>
            </TableRow>
          )}

          {/* Insurance coverage support */}
          {competitorInfo.coverage !== undefined && (
            <TableRow>
              <TableCell>Insurance coverage support</TableCell>
              <TableCell>
                <CheckOrCross isTrue={true} />
              </TableCell>
              <TableCell>
                {' '}
                <CheckOrCross isTrue={competitorInfo.coverage} />
              </TableCell>
            </TableRow>
          )}

          {/* 100% online, no in-person visits */}
          {competitorInfo.visits !== undefined && (
            <TableRow>
              <TableCell>100% online, no in-person visits</TableCell>
              <TableCell>
                <CheckOrCross isTrue={true} />
              </TableCell>
              <TableCell>
                <CheckOrCross isTrue={competitorInfo.visits} />
              </TableCell>
            </TableRow>
          )}

          {/* Access to Ozempic® and Wegovy® */}
          {competitorInfo.accessOW !== undefined && (
            <TableRow>
              <TableCell>Access to Ozempic® and Wegovy®</TableCell>
              <TableCell>
                <CheckOrCross isTrue={true} />
              </TableCell>
              <TableCell>
                {' '}
                <CheckOrCross isTrue={competitorInfo.accessOW} />
              </TableCell>
            </TableRow>
          )}

          {/* Access to Zepbound® and Mounjaro® */}
          {competitorInfo.accessZM !== undefined && (
            <TableRow>
              <TableCell>Access to Zepbound® and Mounjaro®</TableCell>
              <TableCell>
                <CheckOrCross isTrue={true} />
              </TableCell>
              <TableCell>
                {' '}
                <CheckOrCross isTrue={competitorInfo.accessZM} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box textAlign="center" mt={5}>
        <Button variant="contained" fullWidth onClick={onClick}>
          Continue
        </Button>
      </Box>
    </Box>
  );
};

interface ChoiceProps {
  question: QuestionWithName;
  answer: CodedAnswer[];
  questionnaire: Questionnaire;
  onClick?: (nextPage?: string) => void;
}

const Choice = ({ questionnaire, question, answer, onClick }: ChoiceProps) => {
  const searchParams = useSearchParams();
  const compare = searchParams?.get('compare');
  const { submitMultiSelectAnswer, submitSingleSelectAnswer } = useAnswerAction(
    {
      name: question.name,
      header: question.header,
      questionnaire: questionnaire.name,
      canvas_linkId: question.canvas_linkId,
      codingSystem: question.codingSystem || questionnaire.codingSystem,
      answerOptions: question.answerOptions,
    }
  );
  const handleClick = useCallback(() => onClick && onClick(), [onClick]);

  const handleSelect = () => {
    if (answer[0].valueCoding.display === 'None of the above') {
      handleClick();
      return;
    } else {
      Router.push(
        {
          pathname: '/questionnaires-v2/weight-loss-v2/WEIGHT_L_Q8',
          query: { compare: true },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleAnswer = useCallback(
    (item: QuestionnaireQuestionAnswerOptions) => {
      if (question.type === 'multiple-choice') submitMultiSelectAnswer(item);
      else submitSingleSelectAnswer(item);
    },
    [question.type, submitMultiSelectAnswer, submitSingleSelectAnswer]
  );

  useEffect(() => {
    if (question.name === 'HAIR_LOSS_F_Q1') {
      window?.freshpaint?.track('female-hair-loss-start');
    }
  }, [question.name]);

  const questionData = useMemo(() => {
    let newQuestion = question;
    if (newQuestion.name === 'WEIGHT_L_Q8') {
      newQuestion.answerOptions = [
        { text: 'Hims/Hers', code: 'WEIGHT_L_Q6_A1' },
        { text: 'Ro', code: 'WEIGHT_L_Q6_A2' },
        { text: 'Henry Meds', code: 'WEIGHT_L_Q6_A3' },
        { text: 'IVIM', code: 'WEIGHT_L_Q6_A4' },
        { text: 'Weight Watchers Clinic', code: 'WEIGHT_L_Q6_A5' },
        { text: 'Noom', code: 'WEIGHT_L_Q6_A6' },
        { text: 'None of the above', code: 'WEIGHT_L_Q6_A7' },
      ];
    }
    return newQuestion;
  }, [question, question.answerOptions]);

  type CompetitorKey =
    | 'Hims/Hers'
    | 'Ro'
    | 'Henry Meds'
    | 'IVIM'
    | 'Weight Watchers Clinic'
    | 'Noom'
    | 'Generic';

  const competitorInfo = useMemo(() => {
    let competitor = 'Generic';
    if (answer && answer?.length > 1) {
      return competitorInfoMap[competitor as CompetitorKey];
    } else if (answer && answer[0]) {
      competitor = answer[0].valueCoding.display;
      return competitorInfoMap[competitor as CompetitorKey];
    } else return competitorInfoMap[competitor as CompetitorKey];
  }, [answer, competitorInfoMap]);

  if (compare) {
    return (
      <ZealthyComparison
        competitorInfo={competitorInfo}
        onClick={handleClick}
      />
    );
  }

  return (
    <Stack direction="column" gap="45px">
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '0',
        }}
      >
        {questionData?.name === 'WEIGHT_L_C_REFILL_Q3'
          ? questionData?.answerOptions!.map(a => (
              <DosageChoiceItem
                key={a.code}
                item={a}
                handleItem={handleAnswer}
                answer={answer}
              />
            ))
          : questionData?.answerOptions!.map(a => (
              <ChoiceItem
                key={a.code}
                item={a}
                handleItem={handleAnswer}
                answer={answer}
              />
            ))}
      </List>
      {question.name === 'WEIGHT_L_Q8' && (
        <Button onClick={handleSelect}>Continue</Button>
      )}
      {questionData?.followUp ? (
        <FollowUpQuestion question={questionData!} />
      ) : null}
      {questionData?.followUpAlt ? (
        <FollowUpQuestion isAlt={true} question={questionData!} />
      ) : null}
    </Stack>
  );
};

export default Choice;

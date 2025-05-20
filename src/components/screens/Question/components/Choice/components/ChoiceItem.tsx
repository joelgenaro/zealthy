import Router from 'next/router';
import { useCallback, useMemo } from 'react';
import CheckMark from '@/components/shared/icons/CheckMark';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useVWOVariationName } from '@/components/hooks/data';
import { usePatientActions } from '@/components/hooks/usePatient';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { usePatient } from '@/components/hooks/data';

interface ChoiceItemProps {
  item: QuestionnaireQuestionAnswerOptions;
  handleItem: (item: QuestionnaireQuestionAnswerOptions) => void;
  answer: CodedAnswer[];
}

const ChoiceItem = ({ item, handleItem, answer }: ChoiceItemProps) => {
  const supabase = useSupabaseClient();
  const { updatePatient } = usePatientActions();
  const { data: patient } = usePatient();

  const isSelected = useMemo(
    () => !!answer?.find(ans => ans?.valueCoding?.code === item?.code),
    [answer, item?.code]
  );

  const handleClick = useCallback(async () => {
    handleItem(item);
  }, [handleItem, item]);

  return (
    <ListItemButton
      sx={
        item.color
          ? {
              backgroundColor: item.color.background,
              color: item.color.text,
              display: 'flex',
              justifyContent: 'center',
              '& .MuiTypography-root': {
                fontWeight: 'bold',
              },
              '&.Mui-selected': {
                backgroundColor: `${item.color.background}!important`,
                color: item.color.text,
              },
              '&:hover': {
                backgroundColor: item.color.background,
              },
              border: 'none',
            }
          : {}
      }
      selected={isSelected}
      key={item.text}
      onClick={() => (item.path ? Router.push(item.path) : handleClick())}
    >
      <Box display="flex" flexDirection="column" sx={{ gap: '0.5rem' }}>
        <Typography>{item.text}</Typography>
        {item.subText && <Typography variant="h4">{item.subText}</Typography>}
      </Box>
      {isSelected && !item.color ? (
        <Typography>
          <CheckMark />
        </Typography>
      ) : null}
    </ListItemButton>
  );
};

export default ChoiceItem;

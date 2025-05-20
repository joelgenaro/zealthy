import CheckMark from '@/components/shared/icons/CheckMark';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import { ListItemButton, Typography } from '@mui/material';
import { useCallback } from 'react';

interface ChoiceItemProps {
  item: QuestionnaireQuestionAnswerOptions;
  handleItem: (item: QuestionnaireQuestionAnswerOptions) => void;
  selected: any;
}

const ChoiceItem = ({ item, handleItem, selected }: ChoiceItemProps) => {
  const handleClick = useCallback(() => {
    handleItem(item);
  }, [handleItem, item]);

  return (
    <ListItemButton selected={selected} key={item.text} onClick={handleClick}>
      <Typography>{item.text}</Typography>
      {selected ? (
        <Typography>
          <CheckMark />
        </Typography>
      ) : null}
    </ListItemButton>
  );
};

export default ChoiceItem;

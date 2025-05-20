import { useLanguage } from '@/components/hooks/data';
import CheckMark from '@/components/shared/icons/CheckMark';
import Title from '@/components/shared/Title';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

interface Props {
  showNoneOfAbove?: boolean;
  header: string;
  question: string;
  details?: string;
  answerOptions: string[];
  selectedOptions?: string[];
  onSelect: (payload: any) => void;
  onDeselect: (payload: any) => void;
  onReset: (payload?: any) => void;
  onContinue?: () => void;
}

const IntakeQuestion = ({
  showNoneOfAbove = true,
  header,
  question,
  details,
  answerOptions,
  selectedOptions,
  onSelect,
  onDeselect,
  onReset,
  onContinue,
}: Props) => {
  const [noneOfAbove, setNonOfAbove] = useState(false);
  const language = useLanguage();

  const handleReset = () => {
    setNonOfAbove(true);
    onReset();
  };

  const handleSelectOption = (answerOption: string) => {
    setNonOfAbove(false);

    selectedOptions?.includes(answerOption)
      ? onDeselect(answerOption)
      : onSelect(answerOption);
  };
  return (
    <Grid container direction="column" gap="48px">
      <Grid container direction="column" gap="26px">
        {header ? <Typography variant="h4">{header}</Typography> : null}
        <Title text={question} />
        {details && (
          <Typography variant="body2" component="p">
            {details}
          </Typography>
        )}
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
          const isSelected = selectedOptions?.includes(answerOption);
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
        {showNoneOfAbove ? (
          <ListItemButton
            selected={noneOfAbove && !selectedOptions?.length}
            key={'none'}
            onClick={handleReset}
            sx={{
              border: `1px solid #00000033`,
              borderRadius: '12px',
              padding: '20px 24px',
              color: '#1B1B1B',
            }}
          >
            {'None of the above'}
            {noneOfAbove && !selectedOptions?.length && (
              <CheckMark style={{ marginLeft: 'auto' }} />
            )}
          </ListItemButton>
        ) : null}
      </List>
      <Button onClick={onContinue}>Continue</Button>
    </Grid>
  );
};

export default IntakeQuestion;

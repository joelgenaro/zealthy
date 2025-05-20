import {
  List,
  ListItemButton,
  Typography,
  styled,
  CircularProgress,
} from '@mui/material';
import { FormEvent, useState } from 'react';
import CheckMark from '@/components/shared/icons/CheckMark';
import LoadingButton from '@/components/shared/Button/LoadingButton';

const StyledForm = styled('form')`
  width: 100%;
`;

interface VisitOptionsProps {
  onVisitSelection: (selections: string[]) => void;
  selections: string[];
}

const PrimaryCareVisitsSelectionForm = ({
  onVisitSelection,
  selections,
}: VisitOptionsProps) => {
  const [careSelections, setCareSelections] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectItem = (item: string) => {
    setError('');

    setCareSelections(items => {
      if (items.includes(item)) {
        return items.filter(i => i !== item);
      }

      return items.concat(item);
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!careSelections.length) {
      setError('Please select at least one');
      return;
    }

    setLoading(true);
    onVisitSelection(careSelections);
  };

  return (
    <StyledForm onSubmit={onSubmit}>
      <List
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '48px',
          padding: '0',
        }}
      >
        {selections.map(selection => {
          const isSelected = careSelections.includes(selection);

          return (
            <ListItemButton
              selected={isSelected}
              key={selection}
              onClick={() => selectItem(selection)}
            >
              {selection}
              {isSelected ? <CheckMark style={{ marginLeft: 'auto' }} /> : null}
            </ListItemButton>
          );
        })}
      </List>
      {error ? (
        <Typography color="red" textAlign="center">
          {error}
        </Typography>
      ) : null}
      <LoadingButton
        type="submit"
        loading={loading}
        disabled={!careSelections.length}
        sx={{ width: '100%' }}
      >
        {loading ? (
          <CircularProgress color="inherit" size="1.5em" />
        ) : (
          'Continue to get care'
        )}
      </LoadingButton>
    </StyledForm>
  );
};

export default PrimaryCareVisitsSelectionForm;

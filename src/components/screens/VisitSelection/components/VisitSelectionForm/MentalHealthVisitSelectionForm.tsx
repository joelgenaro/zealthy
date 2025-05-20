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

const MentalHealthVisitsSelectionForm = ({
  onVisitSelection,
  selections,
}: VisitOptionsProps) => {
  const [careSelections, setCareSelections] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectItem = (item: string) => {
    if (isSubmitting) return;

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

    if (isSubmitting) return;

    if (!careSelections.length) {
      setError('Please select at least one');
      return;
    }

    setLoading(true);
    setIsSubmitting(true);

    try {
      onVisitSelection(careSelections);
    } catch (err) {
      console.error('Error submitting selections:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
      setIsSubmitting(false);
    }
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
          opacity: isSubmitting ? 0.7 : 1,
          pointerEvents: isSubmitting ? 'none' : 'auto',
        }}
      >
        {selections.map(selection => {
          const isSelected = careSelections.includes(selection);

          return (
            <ListItemButton
              selected={isSelected}
              key={selection}
              onClick={() => selectItem(selection)}
              disabled={isSubmitting}
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
        disabled={!careSelections.length || isSubmitting}
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

export default MentalHealthVisitsSelectionForm;

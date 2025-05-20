import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect } from 'react';
import { NonGLP1MEdication } from '../data';

interface MedicationProps {
  medication: NonGLP1MEdication;
  onSelect: (med: NonGLP1MEdication) => void;
}

const Medication = ({ medication, onSelect }: MedicationProps) => {
  const handleSelect = useCallback(() => {
    onSelect(medication);
  }, [medication, onSelect]);

  useEffect(() => {}, []);

  return (
    <Box
      sx={{
        padding: '2rem 2.5rem 1rem 2.5rem',
        borderRadius: '1rem',
        background: '#ffffff',
        boxShadow: '0px 8px 16px 4px rgba(81, 76, 40, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
      }}
    >
      <Typography
        sx={{
          fontSize: '1.3rem !important',
          fontWeight: '700',
          lineHeight: '1.75rem',
          letterSpacing: '0.00206',
        }}
      >
        {medication.brand}
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: '500', marginBottom: '1.5rem' }}
      >
        {medication.drug}
      </Typography>
      <Typography
        variant="body1"
        sx={{ marginBottom: '2rem', whiteSpace: 'pre-wrap' }}
      >
        {medication.body1}
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
        {medication.body2}
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
        {medication.body3}
      </Typography>
      <Button onClick={handleSelect}>{'Review treatment'}</Button>
    </Box>
  );
};

export default Medication;

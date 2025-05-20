import CustomText from '@/components/shared/Text/CustomText';
import {
  Box,
  Button,
  FilledInput,
  FormControl,
  InputLabel,
  Stack,
  Typography,
} from '@mui/material';
import { FormType } from '../../RequestRecords';
import { ChangeEvent, useState } from 'react';

interface RecordRangeFormProps {
  type: FormType;
  onSubmit: (date: { start_date: string; end_date: string }) => void;
}

const RecordRangeForm = ({ type, onSubmit }: RecordRangeFormProps) => {
  const [date, setDate] = useState<any | null>({
    start_date: '',
    end_date: '',
  });
  const handleOnChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: string }
    >
  ) => {
    const { name, value } = e.target;
    setDate({
      ...date,
      [name!]: value,
    });
  };
  return (
    <Stack gap={{ md: 5.5, xs: 3 }}>
      <Typography variant="h2">
        {`Date range for medical records to be ${type.value}`}
      </Typography>
      <Stack
        position="relative"
        alignItems="center"
        direction={{ md: 'row', xs: 'column' }}
        gap={2}
      >
        <Box
          sx={{
            width: '100%',
            height: '1px',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#D3D6D8',
            display: { md: 'none' },
          }}
        />
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="start_date">{'MM/YY'}</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={date?.start_date}
            name="start_date"
            id="start-date"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <CustomText
          fontSize="12px"
          color="#777777"
          bgcolor="#FFFAF2"
          px={{ md: 0, xs: 2 }}
          position="relative"
        >
          to
        </CustomText>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="end_date">{'MM/YY'}</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={date?.end_date}
            name="end_date"
            id="end-date"
            onChange={handleOnChange}
            required
          />
        </FormControl>
      </Stack>

      <Button onClick={() => onSubmit(date)}>Continue</Button>
    </Stack>
  );
};

export default RecordRangeForm;

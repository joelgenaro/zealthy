import {
  Button,
  Stack,
  FormControl,
  InputLabel,
  FilledInput,
  Typography,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { FormType } from '../../RequestRecords';

interface RecordNeedFormProps {
  type: FormType;
  onSubmit: (data: { medical_records: string }) => void;
}

const RecordNeedForm = ({ type, onSubmit }: RecordNeedFormProps) => {
  const [records, setRecords] = useState<any | null>(null);

  const handleOnChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: string }
    >
  ) => {
    const { name, value } = e.target;
    setRecords({
      [name!]: value,
    });
  };
  return (
    <Stack gap={{ md: 5.5, xs: 3 }}>
      <Typography variant="h3">
        {`What medical records do you need to ${type.value}?`}
      </Typography>
      <FormControl variant="filled" fullWidth required>
        <InputLabel htmlFor="medical_records">{'Type here...'}</InputLabel>
        <FilledInput
          fullWidth
          disableUnderline={true}
          rows={4}
          value={records?.medical_records}
          name="medical_records"
          id="medical-records"
          onChange={handleOnChange}
          required
        />
      </FormControl>
      <Button onClick={() => onSubmit(records!)}>Continue</Button>
    </Stack>
  );
};

export default RecordNeedForm;

import {
  Button,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  FilledInput,
} from '@mui/material';
import { ChangeEvent, useState } from 'react';
import { FormType } from '../../RequestRecords';

interface FormAddress {
  institution: string | null;
  address: string | null;
  email: string | null;
  phone_number: string | null;
  fax: string | null;
}
interface ObtainAndSendReportFormProps {
  type: FormType;
  onSubmit: (data: FormAddress) => void;
}
const ObtainAndSendReportForm = ({
  type,
  onSubmit,
}: ObtainAndSendReportFormProps) => {
  const [formData, setFormData] = useState<FormAddress>({
    institution: '',
    address: '',
    email: '',
    phone_number: '',
    fax: '',
  });

  const handleOnChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name!]: value,
    }));
  };
  return (
    <Stack gap={{ md: 5.5, xs: 3 }}>
      <Typography variant="h2">{type.desc}</Typography>
      <Stack gap={2}>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="institution">
            {'Institution or individual'}
          </InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.institution}
            name="institution"
            id="institution"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="address">Address</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.address}
            name="address"
            id="address"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="phone_number">Phone number</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.phone_number}
            name="phone_number"
            id="phone-number"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="email">Email</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.email}
            name="email"
            id="email"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="fax">Fax</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            value={formData?.fax}
            name="fax"
            id="fax"
            onChange={handleOnChange}
            required
          />
        </FormControl>
      </Stack>
      <Button onClick={() => onSubmit(formData)}>Continue</Button>
    </Stack>
  );
};

export default ObtainAndSendReportForm;

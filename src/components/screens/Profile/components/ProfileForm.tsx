import LoadingButton from '@/components/shared/Button/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DOMPurify from 'dompurify';
import { ChangeEvent, forwardRef, useMemo, useState } from 'react';
import PhoneInputMask from '@/components/shared/PhoneInputMask/PhoneInputMask';
import { validatePhoneNumber } from '@/utils/phone/validatePhoneNumber';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

type Profile = {
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  email: string | null | undefined;
  phone_number: string | null | undefined;
};

interface ProfileProps {
  data: Profile;
  loading: boolean;
  onSave: (formData: Profile) => void;
  onCancel: () => void;
}

function ProfileForm({ data, loading, onSave, onCancel }: ProfileProps) {
  const [formData, setFormData] = useState(data);
  const handleOnChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: string }
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name!]: DOMPurify.sanitize(value, {
        USE_PROFILES: { html: false },
      }),
    }));
  };

  const allValid = useMemo(() => {
    const validPhone =
      !!formData?.phone_number && validatePhoneNumber(formData?.phone_number);

    return (
      !!formData?.first_name?.trimEnd() &&
      !!formData?.last_name?.trimEnd() &&
      validPhone
    );
  }, [formData?.first_name, formData?.last_name, formData?.phone_number]);

  return (
    <>
      <Typography
        variant="h3"
        sx={{
          fontSize: '18px !important',
          fontWeight: '600',
          lineHeight: '26px !important',
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        {'Account details'}
      </Typography>
      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '24px',
          background: '#FFFFFF',
          border: '1px solid #D8D8D8',
          borderRadius: '16px',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontSize: '16px !important',
            fontWeight: '600',
            lineHeight: '24px !important',
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '16px',
            color: '#989898',
          }}
        >
          {'Personal information'}
        </Typography>

        <FormControl variant="filled" fullWidth required>
          <TextField
            fullWidth
            placeholder="First Name"
            variant="outlined"
            autoComplete="given-name"
            name="first_name"
            id="first-name"
            label="First Name"
            value={formData?.first_name}
            inputProps={{ maxLength: 50 }}
            onChange={handleOnChange}
            disabled
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <TextField
            fullWidth
            placeholder="Last Name"
            variant="outlined"
            autoComplete="family-name"
            name="last_name"
            id="last-name"
            label="Last Name"
            value={formData?.last_name}
            inputProps={{ maxLength: 50 }}
            onChange={handleOnChange}
            disabled
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <TextField
            value={formData?.phone_number}
            required
            fullWidth
            onChange={handleOnChange}
            name="phone_number"
            id="phone-number"
            variant="standard"
            autoComplete="tel"
            type="tel"
            InputLabelProps={{ shrink: true }}
            style={{ border: 'none !important' }}
            InputProps={{
              inputComponent: PhoneInputMask as any,
              disableUnderline: true,
            }}
          />
        </FormControl>

        <LoadingButton
          loading={loading}
          disabled={!allValid || loading}
          fullWidth
          onClick={() => onSave(formData)}
          sx={{
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Confirm changes
        </LoadingButton>
        <Button
          fullWidth
          color="grey"
          sx={{
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
          }}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Box>
    </>
  );
}

export default ProfileForm;

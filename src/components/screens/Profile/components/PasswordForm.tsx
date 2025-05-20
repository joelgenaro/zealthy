import LoadingButton from '@/components/shared/Button/LoadingButton';
import ErrorMessage from '@/components/shared/ErrorMessage';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FilledInput from '@mui/material/FilledInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import { ChangeEvent, useState } from 'react';

interface PasswordProps {
  loading: boolean;
  onSave: (formData: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) => void;
  onCancel: () => void;
  error: string;
}

function PasswordUpdate({ loading, onSave, onCancel, error }: PasswordProps) {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const handleOnChange = (
    e: ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState: any) => ({
      ...prevState,
      [name!]: value,
    }));
  };
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
        {'Password'}
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
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="first-name">Old password</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            type="password"
            value={formData?.old_password}
            name="old_password"
            id="old-password"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="first-name">New password</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            type="password"
            value={formData?.new_password}
            name="new_password"
            id="new-password"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="first-name">Confirm new password</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            type="password"
            value={formData?.confirm_password}
            name="confirm_password"
            id="confirm-password"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        {error ? <ErrorMessage>{error}</ErrorMessage> : null}
        <LoadingButton
          loading={loading}
          disabled={loading}
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

export default PasswordUpdate;

import { useUpdateProfile } from '@/components/hooks/mutations';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import {
  useProfileActions,
  useProfileState,
} from '@/components/hooks/useProfile';
import { Modal, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, forwardRef, useMemo, useState } from 'react';
import PhoneInputMask from '../PhoneInputMask/PhoneInputMask';
import LoadingButton from '../Button/LoadingButton';
import { validatePhoneNumber } from '@/utils/phone/validatePhoneNumber';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

const UpdatePhoneModal = ({ open, setOpen, onConfirm }: Props) => {
  const [loading, setLoading] = useState(false);
  const { phone_number, first_name, last_name } = useProfileState();
  const { addPhone } = useProfileActions();
  const isMobile = useIsMobile();
  const updateProfile = useUpdateProfile();

  const handlePhoneNumber = (e: ChangeEvent<HTMLInputElement>) =>
    addPhone(e.target.value);

  const phoneValid = () => {
    return !!phone_number && validatePhoneNumber(phone_number);
  };

  async function handleContinue() {
    setLoading(true);
    await updateProfile.mutateAsync({
      first_name,
      last_name,
      phone_number,
    });
    await onConfirm();
    setLoading(false);
  }

  const styles = useMemo(
    () => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      bgcolor: 'background.default',
      minWidth: 300,
      minHeight: 300,
      maxWidth: 500,
      outline: 'none',
      borderRadius: 5,
      padding: '40px',
    }),
    [isMobile]
  );

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Stack direction="column" gap="35px" alignItems="center" sx={styles}>
        <Stack gap="0.5rem">
          <Typography variant="h3">Does this look correct?</Typography>
          <Typography variant="h4">
            Confirm your number to schedule a phone visit.
          </Typography>
        </Stack>
        <TextField
          value={phone_number}
          fullWidth
          onChange={handlePhoneNumber}
          placeholder="Phone number"
          label="Phone number"
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
        <LoadingButton
          loading={loading}
          disabled={!phoneValid()}
          fullWidth
          onClick={handleContinue}
        >
          Confirm and continue
        </LoadingButton>
      </Stack>
    </Modal>
  );
};

export default UpdatePhoneModal;

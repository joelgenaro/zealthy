import CustomText from '@/components/shared/Text/CustomText';
import {
  Box,
  Button,
  FilledInput,
  FormControl,
  IconButton,
  InputLabel,
  Modal,
  Stack,
  Typography,
} from '@mui/material';
import { FormType } from '../../RequestRecords';
import { ChangeEvent, Fragment, useState } from 'react';
import Close from '@/components/shared/icons/Close';
import LoadingButton from '@/components/shared/Button/LoadingButton';

interface SubmitRequestFormProps {
  type: FormType;
  onSubmit: () => void;
  onAddSignature: (data: { signature: string }) => void;
  goBack: () => void;
  loading: boolean;
}

const SubmitRequestForm = ({
  onAddSignature,
  goBack,
  loading,
  type,
}: SubmitRequestFormProps) => {
  const [signature, setSignature] = useState<any | null>({
    signature: '',
  });
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  const handleOnChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: string }
    >
  ) => {
    const { name, value } = e.target;
    setSignature({
      [name!]: value,
    });
  };

  return (
    <Fragment>
      <Stack gap={2}>
        <Typography variant="h3">Lastly, submit your request.</Typography>
        <CustomText>
          I agree that my request may be signed electronically and that this
          signature is the same as my handwritten signature (for validity and
          admissibility).
        </CustomText>
        <FormControl variant="filled" fullWidth required>
          <InputLabel htmlFor="signature">{'First & last name'}</InputLabel>
          <FilledInput
            fullWidth
            disableUnderline={true}
            rows={4}
            value={signature?.signature}
            name="signature"
            id="signature"
            onChange={handleOnChange}
            required
          />
        </FormControl>
        <LoadingButton
          loading={loading}
          disabled={loading}
          sx={{ marginTop: { md: '1.75rem', xs: '0.5rem' } }}
          onClick={async () => {
            onAddSignature(signature);
            toggleModal();
          }}
        >
          Submit request
        </LoadingButton>
      </Stack>
      <Modal onClose={goBack} open={showModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            backgroundColor: 'white',
            px: 4,
            py: 12,
            borderRadius: 2,
            maxWidth: '476px',
            width: 'calc(100% - 2rem)',
          }}
        >
          <IconButton
            onClick={toggleModal}
            sx={{ position: 'absolute', top: 20, right: 20 }}
          >
            <Close />
          </IconButton>

          <Stack gap={4}>
            <CustomText
              textAlign="center"
              lineHeight="24px"
              fontSize={20}
              fontWeight={700}
            >
              {type.successMsg}
            </CustomText>
            <Button onClick={goBack}>Go back home</Button>
          </Stack>
        </Box>
      </Modal>
    </Fragment>
  );
};

export default SubmitRequestForm;

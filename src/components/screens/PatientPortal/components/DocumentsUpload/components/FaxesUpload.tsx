import React, { useState, useRef } from 'react';
import { StandardModal } from '@/components/shared/modals';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import {
  Stack,
  FormControl,
  TextField,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAllFaxes, FaxesProps } from '@/components/hooks/data';

const OutboundFax = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [faxNumber, setFaxNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const imageRef = useRef<HTMLInputElement>();
  const theme = useTheme();

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const { data: faxes, refetch } = useAllFaxes();
  const filteredFaxes = faxes?.data.filter(
    fax =>
      fax.direction === 'outbound' &&
      fax.internal_status !== 'ATTACHED' &&
      fax.internal_status !== 'DELTETED'
  );
  const [selectedFax, setSelectedFax] = useState<FaxesProps | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF and image files are allowed.');
        return;
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
    };

  const validateFaxNumber = (faxNumber: string) => {
    const regex = /^\+\d{11,14}$/;
    return regex.test(faxNumber);
  };

  const handleSendFax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !faxNumber || !subject || !fromName || !toName || !message) {
      toast.error('Please fill in all fields and upload a file.');
      return;
    }
    if (!validateFaxNumber(faxNumber)) {
      toast.error('Please enter a valid fax number.');
      return;
    }

    const formData = new FormData();
    formData.append('faxNumber', faxNumber);
    formData.append('callerId', '+18664273798');
    formData.append('subject', subject);
    formData.append('from_name', fromName);
    formData.append('to_name', toName);
    formData.append('message', message);
    formData.append('faxData', file);

    try {
      const response = await axios.post('/api/ifax/send-fax', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Fax sent successfully!');
        closeModal();
      } else {
        toast.error('Failed to send fax.');
      }
    } catch (error) {
      console.error('Error sending fax:', error);
      toast.error('An error occurred while sending the fax.');
    }
  };

  const isSendButtonDisabled =
    !file ||
    !faxNumber ||
    !subject ||
    !fromName ||
    !toName ||
    !message ||
    !validateFaxNumber(faxNumber);

  return (
    <div
      style={{
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        marginBottom: '1rem',
      }}
    >
      <Stack direction="column" gap="16px">
        <WhiteBox padding="24px">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography color={theme.palette.primary.main} fontWeight="600">
              Fax Documents
            </Typography>
            <Button
              component="label"
              variant="rounded"
              size="small"
              onClick={openModal}
            >
              Upload & send
            </Button>
          </Stack>
        </WhiteBox>
      </Stack>

      <StandardModal setModalOpen={setModalIsOpen} modalOpen={modalIsOpen}>
        <Stack spacing={3} padding={3}>
          <Typography variant="h6" component="h2">
            Send Fax
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Example Fax Number: +12345678901
          </Typography>
          <form
            onSubmit={handleSendFax}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <FormControl fullWidth>
              <TextField
                label="Fax Number"
                type="text"
                value={faxNumber}
                onChange={handleInputChange(setFaxNumber)}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="Subject"
                type="text"
                value={subject}
                onChange={handleInputChange(setSubject)}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="From Name"
                type="text"
                value={fromName}
                onChange={handleInputChange(setFromName)}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="To Name"
                type="text"
                value={toName}
                onChange={handleInputChange(setToName)}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="Message"
                type="text"
                value={message}
                onChange={handleInputChange(setMessage)}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <Button variant="contained" component="label">
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept="application/pdf,image/*"
                />
              </Button>
              {file ? (
                <Typography variant="body2">{file.name}</Typography>
              ) : null}
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSendButtonDisabled}
            >
              Send
            </Button>
            <Button variant="outlined" color="secondary" onClick={closeModal}>
              Close
            </Button>
          </form>
        </Stack>
      </StandardModal>
    </div>
  );
};

export default OutboundFax;

import { useVisitActions } from '@/components/hooks/useVisit';
import CloseIcon from '@/components/shared/icons/CloseIcon';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionnaireQuestionAnswerOptions } from '@/types/questionnaire';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

type Option = {
  answer: QuestionnaireQuestionAnswerOptions;
  label: string;
  value: Medication;
  alternative?: {
    medication: Medication;
    pricePerUnit: number;
    unit: string;
    image: string;
  };
  subLabel: string;
  pricePerUnit: number;
  unit: string;
  image: string;
};

interface EDModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (answer: QuestionnaireQuestionAnswerOptions) => void;
  option: Option;
}

const EDModal = ({ open, onClose, onConfirm, option }: EDModalProps) => {
  const [medication, setMedication] = useState(option.value);
  const { addMedication } = useVisitActions();

  console.log({ option });

  const handleChange = useCallback((medication: Medication) => {
    setMedication(medication);
  }, []);

  const handleConfirm = useCallback(() => {
    addMedication(medication);
    onConfirm(option.answer);
  }, [addMedication, medication, onConfirm, option.answer]);

  useEffect(() => {
    setMedication(option.value);
  }, [option]);

  return (
    <Modal open={open} onClose={onClose}>
      <Stack
        justifyContent="center"
        alignItems="center"
        spacing={3}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.default',
          maxWidth: 500,
          minWidth: 337,
          minHeight: 300,
          width: '100%',
          p: 4,
          outline: 'none',
          borderRadius: '8px',
          padding: '25px',
        }}
      >
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Typography textAlign="center" variant="h3">
            You can pay less
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: theme => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <Button
          onClick={() => handleChange(option.value)}
          fullWidth
          variant="outlined"
          sx={{
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '16px',
          }}
        >
          <Stack direction="row" alignItems="center" width="100%">
            <Radio checked={medication.name === option.value.name} />
            <Stack alignItems="baseline">
              <Typography>Your current selection</Typography>
              <Typography color="#1b1b1b" fontWeight={600}>
                {option.value.display_name}
              </Typography>
              <Typography color="#1b1b1b">
                From <b>{`$${option.pricePerUnit}/${option.unit}`}</b>
              </Typography>
            </Stack>
            <Image
              src={option.image}
              alt="pill"
              height="72"
              width="72"
              style={{ marginLeft: 'auto' }}
            />
          </Stack>
        </Button>

        {option.alternative ? (
          <Button
            onClick={() => handleChange(option.alternative?.medication!)}
            fullWidth
            variant="outlined"
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
            }}
          >
            <Stack direction="row" alignItems="center" width="100%">
              <Radio
                checked={medication.name === option.alternative.medication.name}
              />
              <Stack alignItems="baseline">
                <Typography color="#1b1b1b" fontWeight={600}>
                  {option.alternative.medication.display_name}
                </Typography>
                <Typography color="#1b1b1b">
                  From{' '}
                  <b
                    style={{ color: '#00531B' }}
                  >{`$${option.alternative.pricePerUnit}/${option.alternative.unit}`}</b>
                </Typography>
              </Stack>
              <Image
                src={option.alternative.image}
                alt="pill"
                height="72"
                width="72"
                style={{ marginLeft: 'auto' }}
              />
            </Stack>
          </Button>
        ) : null}
        <Button fullWidth onClick={handleConfirm}>
          Select treatment
        </Button>
      </Stack>
    </Modal>
  );
};

export default memo(EDModal);

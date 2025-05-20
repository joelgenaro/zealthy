import { usePatient, usePatientDocuments } from '@/components/hooks/data';
import {
  Box,
  Button,
  Container,
  Modal,
  Stack,
  Typography,
} from '@mui/material';
import DocumentCards from '@/components/shared/DocumentCards';
import { useEffect, useMemo, useState } from 'react';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import Router from 'next/router';
interface InsuranceInformationProps {
  nextPage: (nextPage?: string) => void;
}
const InsuranceInformation = ({ nextPage }: InsuranceInformationProps) => {
  const { data: patient } = usePatient();
  const { data: documents, refetch } = usePatientDocuments();
  const [openModal, setOpenModal] = useState(false);
  const { specificCare } = useIntakeState();
  const calculatedSpecificCare = useCalculateSpecificCare();

  useEffect(() => {
    if (
      specificCare == 'Weight loss' ||
      calculatedSpecificCare == 'Weight loss'
    ) {
      window.freshpaint?.track('weight-loss-post-checkout-insurance');
    }
  }, [calculatedSpecificCare, specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-insurance');
  }, []);

  const insuranceAndPharmacy = useMemo(() => {
    if (!patient) return [];
    return [
      {
        label: 'Insurance card',
        folder: `patient-${patient.id}/insurance-card`,
        items: [
          {
            label: 'Insurance card front',
            fileName: 'front',
          },
          {
            label: 'Insurance card back',
            fileName: 'back',
          },
        ],
      },
      {
        label: 'Pharmacy benefits card',
        folder: `patient-${patient.id}/pharmacy-card`,
        items: [
          {
            label: 'Pharmacy benefits card front',
            fileName: 'front',
          },
          {
            label: 'Pharmacy benefits card back',
            fileName: 'back',
          },
        ],
      },
    ];
  }, [patient]);

  async function handleContinue() {
    if (!documents?.find(d => d.name.includes('front'))) {
      setOpenModal(true);
    } else {
      nextPage();
    }
  }

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '3rem',
        }}
      >
        <Typography variant="h2">
          {'Confirm your insurance information.'}
        </Typography>
        <Typography variant="body1">
          {
            'Please confirm that your insurance information is accurate and up to date. If you have a separate pharmacy benefits card, please confirm that information as well.'
          }
        </Typography>
        <Typography variant="body1">
          {
            'Please make sure that your Rx BIN, PCN, and Group ID (or Rx Group) numbers are clearly visible.'
          }
        </Typography>
        {(specificCare == 'Weight loss' ||
          calculatedSpecificCare == 'Weight loss') && (
          <Typography variant="body1">
            {
              'Remember that if you have government insurance, such as Medicare, Medicaid, or Tricare, you will not be eligible for the Zealthy Weight Loss program.'
            }
          </Typography>
        )}
        <Typography variant="body1" sx={{ fontWeight: '700' }}>
          {
            'Blurry photos or incorrect insurance or pharmacy benefits information may delay receiving a prescription.'
          }
        </Typography>
        <Typography variant="body1">
          {'If everything looks accurate, click “Continue” below.'}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        {insuranceAndPharmacy.map(document => (
          <DocumentCards
            key={document.label}
            refetch={refetch}
            document={document}
          />
        ))}
      </Box>
      <Button
        type="button"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={handleContinue}
      >
        Continue
      </Button>
      <Button
        type="button"
        color="grey"
        fullWidth
        sx={{ marginBottom: '1rem' }}
        onClick={() => Router.back()}
      >
        Go back without adding insurance
      </Button>
      <Modal open={openModal}>
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
            minWidth: 300,
            minHeight: 300,
            p: 4,
            outline: 'none',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h4">
            {
              'Proceeding without uploading your insurance card may lead to a delay with Zealthy getting a GLP-1, such as Ozempic, Mounjaro, or Wegovy, covered by your insurance so that you can pay as little as $0 for your Rx.'
            }
          </Typography>
          <Typography variant="h4">
            {
              'We recommend you go back to add insurance if you’d like us to help get your insurance to cover a GLP-1 without a delay.'
            }
          </Typography>
          <Stack width="100%" gap="1rem">
            <Button fullWidth onClick={() => setOpenModal(false)}>
              {'Go back to add insurance'}
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </Container>
  );
};

export default InsuranceInformation;

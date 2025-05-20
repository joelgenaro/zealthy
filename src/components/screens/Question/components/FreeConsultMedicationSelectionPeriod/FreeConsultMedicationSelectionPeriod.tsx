import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  styled,
  Divider,
  Modal,
  Card,
} from '@mui/material';
import { useAnswerState } from '@/components/hooks/useAnswer';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import { useVisitActions } from '@/components/hooks/useVisit';
import Router from 'next/router';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import Image from 'next/image';

const treatmentOptions = {
  Semaglutide: {
    '3 Month': { medicationPrice: 125, duration: 3, showKlarna: true },
  },
  Tirzepatide: {
    '3 Month': { medicationPrice: 250, duration: 3, showKlarna: true },
  },
};

const subscriptionOptions = {
  Semaglutide: {
    '3 Month': {
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      medication_quantity_id: 98,
      name: '3 Month Semaglutide Jumpstart',
      price: 375,
      display_name: 'Semaglutide',
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
  },
  Tirzepatide: {
    '3 Month': {
      type: MedicationType.WEIGHT_LOSS_GLP1_INJECTABLE,
      medication_quantity_id: 98,
      name: '3 Month Tirzepatide Jumpstart',
      price: 750,
      display_name: 'Tirzepatide',
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
    },
  },
};

const StyledCard = styled(Card)({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  background: '#FFFFFF',
  border: '1px solid #E5DDD1',
  borderRadius: '10px',
});

interface FreeConsultMedicationSelectionPeriodProps {
  nextPage: (nextPage?: string, selectedBoxId?: number) => void;
}

const KlarnaLabel = styled(Box)({
  backgroundColor: '#2E7D32',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '12px',
  padding: '4px 8px',
  borderTopLeftRadius: '10px',
  borderTopRightRadius: '10px',
  textTransform: 'none',
  display: 'inline-block',
  textAlign: 'left',
  alignSelf: 'flex-start',
});
const HeaderTypography = styled(Typography)({
  fontFamily: 'Helvetica',
  fontStyle: 'bold',
  fontWeight: 1000,
  letterSpacing: '0.0015em',
  color: '#1B1B1B',
});

const RowContainer = styled(Box)({
  display: 'flex',
  width: '100%',
});

const FreeConsultMedicationSelectionPeriod = ({
  nextPage,
}: FreeConsultMedicationSelectionPeriodProps) => {
  const isMobile = useIsMobile();
  const answers = useAnswerState();
  const { resetCoaching } = useCoachingActions();
  const { addMedication } = useVisitActions();
  const selectedMedication =
    answers.MEDICATION_SELECTION.answer?.[0]?.valueCoding?.display;
  const selectedTreatmentOptions =
    treatmentOptions[selectedMedication as 'Semaglutide' | 'Tirzepatide'];

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOptionClick = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleNext = () => {
    const subscription =
      subscriptionOptions[selectedMedication as 'Semaglutide' | 'Tirzepatide'][
        selectedPeriod as '3 Month'
      ];
    resetCoaching();
    addMedication(subscription);
    return Router.push('/checkout');
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
      {Object.entries(selectedTreatmentOptions).map(([period, details]) => (
        <Box
          key={period}
          display="flex"
          flexDirection="column"
          onClick={() => handleOptionClick(period)}
        >
          {details.showKlarna && (
            <KlarnaLabel>Buy now pay later with Klarna</KlarnaLabel>
          )}
          <Box
            padding="16px"
            border="2px solid"
            borderColor={selectedPeriod === period ? 'green' : 'lightgrey'}
            boxShadow={
              selectedPeriod === period
                ? '0 4px 12px rgba(0, 128, 0, 0.4)'
                : 'none'
            }
            sx={{
              cursor: 'pointer',
              marginBottom: '16px',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              borderBottomLeftRadius: '8px',
              borderTopLeftRadius: details.showKlarna ? '' : '8px',
            }}
          >
            <Typography variant="h6" fontWeight="bold" textAlign="left">
              {`3 Month Jump Start Program`}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography>{`Compounded ${selectedMedication}`}</Typography>
              <Typography>{`$${
                Number(details.medicationPrice.toFixed(2)) * 3
              }`}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" py={0.5}>
              <Typography>Zealthy Membership</Typography>
              <Typography>$74.99 / mo</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              py={0.5}
              fontWeight="bold"
            >
              <Typography>Total due today:</Typography>
              <Typography>{`$${
                details.medicationPrice * details.duration + 74.99
              }`}</Typography>
            </Box>
          </Box>
        </Box>
      ))}

      <Typography
        onClick={() => setModalOpen(true)}
        textAlign="left"
        sx={{
          cursor: 'pointer',
          color: '#0056b3',
          marginLeft: 1,
        }}
      >
        What&apos;s included in my membership?
      </Typography>

      <Button
        variant="contained"
        fullWidth
        disabled={!selectedPeriod}
        onClick={handleNext}
        sx={{
          fontWeight: 'bold',
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          bgcolor: { bgcolor: '#1B5E20' },
          '&:hover': '#2E7D32',
        }}
      >
        Continue
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : '620px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '8px',
            padding: isMobile ? '24px 16px' : '32px 24px',
            outline: 'none',
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={isMobile ? '16px' : '24px'}
            width="100%"
          >
            <HeaderTypography
              variant="h3"
              sx={{
                fontSize: isMobile ? '20px' : '22px',
                lineHeight: isMobile ? '26px' : '28px',
              }}
            >
              Continuous support from Zealthy
            </HeaderTypography>
            <RowContainer
              sx={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '16px' : '24px',
              }}
            >
              <Image
                src="/whatsNextCalendar.png"
                alt="calendar"
                width={isMobile ? 150 : 200}
                height={isMobile ? 150 : 200}
              />
              <Typography>
                You will be invited to complete a check-in with your doctor to
                initiate an auto-ship plan before you finish your first
                shipment.
              </Typography>
            </RowContainer>
            <RowContainer
              sx={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '16px' : '24px',
              }}
            >
              <Image
                src="/whatsNextIdea.png"
                alt="Thinking face"
                width={isMobile ? 150 : 200}
                height={isMobile ? 150 : 200}
              />
              <Typography>
                Have questions or concerns about your treatment? You can check
                in with your provider through the secure messaging portal in
                your account.
              </Typography>
            </RowContainer>
            <RowContainer
              sx={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '16px' : '24px',
              }}
            >
              <Image
                src="/whatsNextCall.png"
                alt="Active support"
                width={isMobile ? 150 : 200}
                height={isMobile ? 150 : 200}
              />
              <Typography>
                Any other questions? Contact your Zealthy Care Team.
              </Typography>
            </RowContainer>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default FreeConsultMedicationSelectionPeriod;

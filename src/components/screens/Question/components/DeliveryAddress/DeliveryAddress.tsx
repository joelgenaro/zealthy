import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVisitSelect } from '@/components/hooks/useVisit';
import { DeliveryAddressForm } from '@/components/shared/DeliveryAddress';
import { Container, Typography, Stack } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';

export interface FormAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
}

interface DeliveryAddressProps {
  nextPage: (nextPage?: string) => void;
}

const DeliveryAddress = ({ nextPage }: DeliveryAddressProps) => {
  const isMobile = useIsMobile();
  const isSync = useVisitSelect(visit => visit.isSync);
  const visitSelection = useVisitSelect(visit =>
    visit.selectedCare.careSelections.find(v => v.reason === 'Weight loss')
  );
  const language = useLanguage();
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();
  const calculatedSpecificCare = useCalculateSpecificCare();

  const onSuccess = useCallback(() => {
    nextPage();
  }, [nextPage]);

  useEffect(() => {
    if (
      specificCare == 'Weight loss' ||
      calculatedSpecificCare == 'Weight loss'
    ) {
      window.freshpaint?.track('weight-loss-post-checkout-delivery-address');
    }
  }, [calculatedSpecificCare, specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-delivery-address');
  }, []);

  const title =
    isSync || visitSelection
      ? language === 'esp'
        ? 'Dirección de casa'
        : 'Home address'
      : 'What is your delivery address?';
  const descriptions = isSync
    ? [
        specificCare === 'Anxiety or depression'
          ? 'If you’re prescribed medication, you may have the option of having it sent to your home in discreet packaging or to a local pharmacy for pickup. This is included in your membership if you choose to have it sent to your home.'
          : 'If you’re prescribed medication, you may have the option of having it sent to your home in discreet packaging or to a local pharmacy for pickup.',
        'If you choose delivery for any medication, this address will be used by default.',
      ]
    : language === 'esp'
    ? [
        'Si se le receta medicación GLP-1, es posible que tenga la opción de que le envíen su medicamento a casa.',
        'Si elige la entrega para cualquier medicamento, esta dirección se utilizará por defecto.',
      ]
    : visitSelection
    ? [
        'If you’re prescribed GLP-1 medication, you may have the option to have your medication sent to your home.',
        'If you choose delivery for any medication, this address will be used by default.',
      ]
    : [
        `If your provider approves your prescription request, your medication
    will be sent to your doorstep. Your order will be shipped in
    discreet packaging that never references Zealthy, pharmacies, or
    your prescription.`,
      ];

  return (
    <Container maxWidth="xs">
      <Stack gap={isMobile ? '1.5rem' : '1rem'}>
        <Typography variant="h2">{title}</Typography>
        {descriptions.map(description => (
          <Typography key={description}>{description}</Typography>
        ))}
        <Stack gap={isMobile ? '1.5rem' : '3rem'}>
          {patient ? (
            <DeliveryAddressForm onSuccess={onSuccess} patient={patient} />
          ) : null}
        </Stack>
      </Stack>
    </Container>
  );
};

export default DeliveryAddress;

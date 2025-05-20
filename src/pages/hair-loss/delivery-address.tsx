import { usePatient } from '@/components/hooks/data';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { DeliveryAddressForm } from '@/components/shared/DeliveryAddress';
import { ReactElement, useCallback } from 'react';

import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import Head from 'next/head';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface FormAddress {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
}

const DeliveryAddress = () => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();

  const onSuccess = useCallback(() => {
    Router.push(Pathnames.CHECKOUT);
  }, []);

  const descriptions = [
    `If your provider approves your prescription request, your medication
    will be sent to your doorstep. Your order will be shipped in
    discreet packaging that never references Zealthy, pharmacies, or
    your prescription.`,
  ];

  return (
    <>
      <Head>
        <title>Delivery Address | Hair Loss | Zealthy</title>
      </Head>
      <Container maxWidth="xs">
        <Stack gap={isMobile ? '1.5rem' : '1rem'}>
          <Typography variant="h2">What is your delivery address?</Typography>
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
    </>
  );
};

DeliveryAddress.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default DeliveryAddress;

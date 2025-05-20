import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  styled,
  Button,
  Container,
  Divider,
} from '@mui/material';
import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useAllPatientPrescriptionRequest } from '@/components/hooks/data';
import Router from 'next/router';

const StyledCard = styled(Card)({
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  background: '#FFFFFF',
  border: '1px solid #E5DDD1',
  borderRadius: '10px',
});

const HeaderTypography = styled(Typography)({
  fontFamily: 'Helvetica',
  fontStyle: 'bold',
  fontWeight: 1000,
  letterSpacing: '0.0015em',
  color: '#1B1B1B',
});

const ImageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
});

interface FreeConsultPrecheckoutProps {
  nextPage: (nextPage?: string) => void;
}

const FreeConsultPrecheckout = ({ nextPage }: FreeConsultPrecheckoutProps) => {
  const isMobile = useIsMobile();
  const { data: prescriptionRequests } = useAllPatientPrescriptionRequest();
  const dummyPrescriptionRequest = prescriptionRequests?.find(
    p => p.note === 'Approve or Deny, DO NOT PRESCRIBE'
  );

  const handleRejected = () => {
    Router.replace('https://www.getzealthy.com/');
    return;
  };

  return (
    <>
      {dummyPrescriptionRequest?.status === 'APPROVED' ||
      !dummyPrescriptionRequest ? (
        <Container
          maxWidth={false}
          sx={{
            width: {
              xs: '85%',
              sm: '80%',
              md: '40%',
            },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={isMobile ? 1 : 2}
            px="0.8rem"
          >
            <StyledCard
              sx={{
                display: 'flex',
                padding: isMobile ? 'px 16px' : '32px 24px',
                gap: isMobile ? '24px' : '32px',
                width: isMobile ? '100%' : '620px',
                marginBottom: isMobile ? '24px' : '32px',
                alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <HeaderTypography
                  variant="h3"
                  sx={{
                    alignSelf: 'start',
                    fontSize: isMobile ? '20px' : '22px',
                    lineHeight: isMobile ? '26px' : '28px',
                  }}
                >
                  Now what?
                </HeaderTypography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: 5,
                  }}
                >
                  <svg
                    width="250"
                    height="30"
                    viewBox="0 0 117 15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.10352 0.683594H13.623V3.54492L5.5957 11.9238H13.916V15H0.332031V12.0312L8.27148 3.74023H1.10352V0.683594ZM17.9082 0.683594H29.7637V3.74023H22.3418V6.01562H29.2266V8.93555H22.3418V11.7578H29.9785V15H17.9082V0.683594ZM43.1797 12.6367H38.1406L37.4473 15H32.9258L38.3066 0.683594H43.1309L48.5117 15H43.8828L43.1797 12.6367ZM42.252 9.54102L40.6699 4.39453L39.0977 9.54102H42.252ZM51.9375 0.683594H56.3613V11.4746H63.2656V15H51.9375V0.683594ZM66.2715 0.683594H79.7188V4.21875H75.207V15H70.7832V4.21875H66.2715V0.683594ZM83.75 0.683594H88.1738V5.69336H93.0078V0.683594H97.4512V15H93.0078V9.20898H88.1738V15H83.75V0.683594ZM100.945 0.683594H105.857L108.748 5.51758L111.639 0.683594H116.521L110.955 9.00391V15H106.521V9.00391L100.945 0.683594Z"
                      fill="currentColor"
                    />
                  </svg>
                </Box>
                <Divider
                  sx={{
                    my: 5,
                    width: '100%',
                  }}
                />
                <Box
                  display="flex"
                  flexDirection="column"
                  alignSelf="center"
                  gap={isMobile ? '16px' : '24px'}
                  width="85%"
                >
                  <Typography variant="h2">Build your order.</Typography>
                  <Typography>
                    Continue on to customize and complete your order, including
                    selecting medications and reviewing details before checking
                    out.
                  </Typography>
                  <ImageContainer
                    sx={{
                      padding: isMobile ? '12px 0' : '16px 0',
                      gap: isMobile ? '12px' : '16px',
                    }}
                  >
                    <Image
                      src="/whatsNextDoctor.png"
                      alt="Medicine illustration"
                      width={isMobile ? 250 : 294}
                      height={isMobile ? 250 : 294}
                    />
                  </ImageContainer>
                  <Typography>
                    Zealthy is dedicated to helping individuals achieve their
                    weight loss goals through convenient, accessible, and
                    personalized services.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  sx={{ marginTop: 5 }}
                  onClick={() => nextPage()}
                >
                  Next
                </Button>
              </CardContent>
            </StyledCard>
          </Box>
        </Container>
      ) : null}
      {dummyPrescriptionRequest?.status === 'REJECTED' ? (
        <Container
          maxWidth={false}
          sx={{
            width: {
              xs: '85%',
              sm: '80%',
              md: '40%',
            },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={isMobile ? 1 : 2}
            px="0.8rem"
          >
            <Box
              border="1px solid lightgrey"
              marginBottom={3}
              borderRadius="10px"
              sx={{
                padding: isMobile ? 'px 16px' : '32px 24px',
                gap: isMobile ? '24px' : '32px',
                width: isMobile ? '100%' : '620px',
              }}
            >
              <Typography fontWeight="bold" marginBottom={1}>
                Thank You
              </Typography>
              <Typography>
                The answers from your online visit have been sent to your care
                team via our secure electronic medical record system. Your care
                team will review your medical history.
              </Typography>
            </Box>
            <StyledCard
              sx={{
                display: 'flex',
                padding: isMobile ? 'px 16px' : '32px 24px',
                gap: isMobile ? '24px' : '32px',
                width: isMobile ? '100%' : '620px',
                marginBottom: isMobile ? '24px' : '32px',
                alignContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <HeaderTypography
                  variant="h3"
                  sx={{
                    alignSelf: 'start',
                    fontSize: isMobile ? '20px' : '22px',
                    lineHeight: isMobile ? '26px' : '28px',
                  }}
                >
                  Now what?
                </HeaderTypography>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignSelf="center"
                  gap={isMobile ? '16px' : '24px'}
                  width="85%"
                >
                  <ImageContainer
                    sx={{
                      padding: isMobile ? '12px 0' : '16px 0',
                      gap: isMobile ? '12px' : '16px',
                    }}
                  >
                    <Image
                      src="/whatsNextDoctor.png"
                      alt="Medicine illustration"
                      width={isMobile ? 250 : 294}
                      height={isMobile ? 250 : 294}
                    />
                  </ImageContainer>
                  <Typography variant="h2">
                    Your care team will review your medical history.
                  </Typography>
                  <Typography>
                    Zealthy is dedicated to helping individuals achieve their
                    weight loss goals through convenient, accessible, and
                    personalized services.
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  sx={{ marginTop: 5 }}
                  onClick={() => handleRejected()}
                >
                  Back to Zealthy
                </Button>
              </CardContent>
            </StyledCard>
          </Box>
        </Container>
      ) : null}
    </>
  );
};

export default FreeConsultPrecheckout;

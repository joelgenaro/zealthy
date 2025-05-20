import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  styled,
  Button,
} from '@mui/material';
import Image from 'next/image';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVWOVariationName } from '@/components/hooks/data';

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

const RowContainer = styled(Box)({
  display: 'flex',
  width: '100%',
});

const NowWhatCard: React.FC = () => {
  const variant5867 = useVWOVariationName('5867');
  const isMobile = useIsMobile();

  const handleRouteToPortal = () => {
    Router.push(Pathnames.PATIENT_PORTAL);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={isMobile ? 3 : 4}
      px="0.8rem"
    >
      {' '}
      <StyledCard
        sx={{
          padding: isMobile ? '24px 16px' : '32px 24px',
          gap: isMobile ? '24px' : '32px',
          width: isMobile ? '100%' : '620px',
          marginBottom: isMobile ? '24px' : '32px',
        }}
      >
        <CardContent>
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
              Thank You
            </HeaderTypography>
            <Typography>
              The answers from your online visit have been sent to your provider
              via our secure electronic medical record system.
            </Typography>
            {variant5867?.data?.variation_name === 'Variation-2' ? (
              <Typography>
                It generally takes 1-3 business days for your Zealthy provider
                to review your responses and refill your medication.
              </Typography>
            ) : null}
          </Box>
        </CardContent>
      </StyledCard>
      <StyledCard
        sx={{
          display: 'flex',
          padding: isMobile ? '24px 16px' : '32px 24px',
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
            width="80%"
            // paddingLeft="20%"
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
              Your provider will review your medical history.
            </Typography>
            <Typography>
              Zealthy is dedicated to helping individuals achieve their weight
              loss goals through convenient, accessible, and personalized
              services.
            </Typography>
            <ImageContainer
              sx={{
                padding: isMobile ? '12px 0' : '16px 0',
                gap: isMobile ? '12px' : '16px',
              }}
            >
              <Image
                src="/whatsNextZealthyWelcome.png"
                alt="Calendar"
                width={isMobile ? 300 : 500}
                height={isMobile ? 180 : 300}
              />
            </ImageContainer>
          </Box>
        </CardContent>
      </StyledCard>
      <StyledCard
        sx={{
          padding: isMobile ? '24px 16px' : '32px 24px',
          gap: isMobile ? '24px' : '32px',
          width: isMobile ? '100%' : '620px',
          marginBottom: isMobile ? '24px' : '32px',
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
              src="/whatsNextIdea.png"
              alt="Thinking face"
              width={isMobile ? 150 : 200}
              height={isMobile ? 150 : 200}
            />
            <Typography>
              You will be invited to complete a check-in with your doctor to
              initiate an auto-ship plan before you finish your first shipment.
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
              src="/whatsNextCalendar.png"
              alt="calendar"
              width={isMobile ? 150 : 200}
              height={isMobile ? 150 : 200}
            />
            <Typography>
              Have questions or concerns about your treatment? You can check in
              with your provider through the secure messaging portal in your
              account.
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
          <Button onClick={handleRouteToPortal}>Next</Button>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default NowWhatCard;

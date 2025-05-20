import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  styled,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Router from 'next/router';
// import { Pathnames } from '@/types/pathnames';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useVWOVariationName } from '@/components/hooks/data';
import { useSearchParams } from 'next/navigation';
import { useIntakeState } from '@/components/hooks/useIntake';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import { HorizontalRule } from '@mui/icons-material';
import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import { Container } from '@mui/system';
import { Pathnames } from '@/types/pathnames';

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

interface NowWhatCardProps {
  nextPage?: (nextPage?: string) => void;
}

const NowWhatCard = ({ nextPage }: NowWhatCardProps) => {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  const med = searchParams?.get('med');
  const checked = searchParams?.get('checked');
  const review = searchParams?.get('review');
  const { potentialInsurance } = useIntakeState();

  const variant5867 = useVWOVariationName('5867');
  const { data: variant7380 } = useVWOVariationName('7380');
  const isMobile = useIsMobile();

  const handleNextPage = () => {
    // Variation 2
    if (variant7380?.variation_name === 'Variation-2' && nextPage) {
      nextPage();
      // post-checkout/questionnaires-v2/identity-verification/IDENTITY-V-Q1
      return;
    }

    // Variation 1
    Router.push(
      {
        pathname:
          '/post-checkout/questionnaires-v2/weight-loss-treatment/WEIGHT-LOSS-TREATMENT-A-Q1',
        query: {
          id: id,
          med: med,
          checked: checked,
          review: review,
        },
      },
      undefined,
      { shallow: true }
    );
    window.scrollTo({ top: 0, left: 0 });
  };

  if (
    potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
  ) {
    return (
      <Container
        maxWidth="xs"
        sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <Box
          sx={{
            border: '1px solid #dedede',
            borderRadius: 2,
            padding: 8,
          }}
        >
          <Typography variant="h3" sx={{ marginBottom: 2 }}>
            Thank You
          </Typography>
          <Typography>
            The answers from your online visit have been sent to your provider
            via our secure electronic medical record system.
          </Typography>
        </Box>

        <Box
          sx={{
            border: '1px solid #dedede',
            borderRadius: 2,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <Typography variant="h3">Now what?</Typography>
          <Image
            src="/images/Medicine-bro-1.png"
            alt="Now what?"
            width={200}
            height={200}
            style={{ alignSelf: 'center' }}
          />
          <Typography variant="h2">
            Your provider will review your medical history.
          </Typography>
          <Typography>
            Zealthy is dedicated to helping individuals achieve their weight
            loss goals through convenient, accessible, and personalized
            services.
          </Typography>

          <HorizontalRule sx={{ width: '100%' }} />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ZealthyLogo />
          </Box>

          <Typography variant="h2">
            Welcome to the Zealthy community!
          </Typography>
          <Typography>
            Zealthy was created to help empower and support people just like you
            to take control of their metabolic health.
          </Typography>
        </Box>

        <Box
          sx={{
            border: '1px solid #dedede',
            borderRadius: 2,
            padding: 8,
            gap: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h3">Your membership includes...</Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              columnGap: 2,
            }}
          >
            <Image
              src="/images/Active-Support-bro.png"
              alt="Active Support"
              width={100}
              height={100}
            />
            <Typography>
              Call or chat with your provider and coach to support your journey
              and get your questions answered through the secure messaging
              portal in your account.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              columnGap: 2,
            }}
          >
            <Image
              src="/images/Thinking-face-bro.png"
              alt="Explore Care"
              width={100}
              height={100}
            />
            <Typography>
              Explore personalized care options for other treatment categories
              and get prescriptions delivered seamlessly from your portal.
            </Typography>
          </Box>

          <Button
            sx={{ width: '100%', marginTop: 8 }}
            variant="contained"
            onClick={() =>
              nextPage ? nextPage() : Router.push(Pathnames.PATIENT_PORTAL)
            }
          >
            Next
          </Button>
        </Box>
      </Container>
    );
  }

  // Variation 1 Card
  if (variant7380?.variation_name === 'Variation-1') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={isMobile ? 3 : 4}
        px="0.8rem"
      >
        {' '}
        <StyledCard
          sx={{
            padding: isMobile ? '0px 0px' : '0px 8px',
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
                The answers from your online visit are ready to send to your
                provider via our secure electronic medical record system, but
                you need to finalize your request first.
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
        <StyledCard
          sx={{
            display: 'flex',
            padding: isMobile ? '0 0px' : '0px 8px',
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
              padding={isMobile ? '16px 0' : '24px 40px'}
              // width="80%"
              // paddingLeft="20%"
            >
              <ImageContainer
                sx={{
                  padding: isMobile ? '12px 0' : '16px 0',
                }}
              >
                <Image
                  src="/Zealthy.png"
                  alt="Zealthy"
                  width={isMobile ? 165 : 250}
                  height={isMobile ? 20 : 30}
                />
              </ImageContainer>
              <Typography variant="h2" fontSize={32} lineHeight={'38px'}>
                Welcome to the Zealthy community!
              </Typography>
              <Typography lineHeight={'22px'}>
                Zealthy was created to help empower and support people just like
                you to take control of their metabolic health.
              </Typography>
              <Typography
                variant="h2"
                marginTop={'40px'}
                fontSize={32}
                lineHeight={'38px'}
              >
                Finalize your prescription request on the next page.
              </Typography>
              <Typography lineHeight={'22px'}>
                Review your medication preferences and finalize your order so
                that we share the information to your provider.
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
              <Typography variant="h2" fontSize={32} lineHeight={'38px'}>
                Your provider will review your medical history.
              </Typography>
              <Typography lineHeight={'22px'}>
                Zealthy is dedicated to helping individuals achieve their weight
                loss goals through convenient, accessible, and personalized
                services.
              </Typography>
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
              <Box
                sx={{
                  alignSelf: 'center',
                }}
              >
                <Image
                  src="/whatsNextCalendar.png"
                  alt="calendar"
                  width={200}
                  height={200}
                />
              </Box>
              <Typography lineHeight={'22px'}>
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
              <Box
                sx={{
                  alignSelf: 'center',
                }}
              >
                <Image
                  src="/whatsNextIdea.png"
                  alt="Thinking face"
                  width={200}
                  height={200}
                />
              </Box>

              <Typography lineHeight={'22px'}>
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
              <Box
                sx={{
                  alignSelf: 'center',
                }}
              >
                <Image
                  src="/whatsNextCall.png"
                  alt="Active support"
                  width={200}
                  height={200}
                />
              </Box>
              <Typography lineHeight={'22px'}>
                Any other questions? Contact your Zealthy Care Team.
              </Typography>
            </RowContainer>
            <Button onClick={handleNextPage}>Next</Button>
          </Box>
        </StyledCard>
      </Box>
    );
  }

  // Variation 2 Card
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={isMobile ? 3 : 4}
      px="0.8rem"
    >
      <StyledCard
        sx={{
          padding: isMobile ? '24px 16px' : '0px 8px',
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
            <Typography lineHeight={'22px'}>
              The answers from your online visit have been sent to your provider
              via our secure electronic medical record system, but you need to
              use a government issued ID to verify your identity first.
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
      <StyledCard
        sx={{
          display: 'flex',
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
          }}
        >
          <HeaderTypography
            variant="h3"
            sx={{
              padding: isMobile ? '0 16px' : '0px 8px',

              alignSelf: 'start',
              fontSize: '22px',
              lineHeight: '28px',
            }}
          >
            Now what?
          </HeaderTypography>
          <Box
            display="flex"
            flexDirection="column"
            // alignSelf="center"
            gap={'24px'}
            padding={isMobile ? '16px 16px' : '24px 40px'}
            // width="80%"
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
            <Typography
              variant="h2"
              fontSize={isMobile ? 32 : ''}
              lineHeight={isMobile ? '38px' : ''}
            >
              Your provider will review your medical history.
            </Typography>
            <Typography lineHeight={'22px'}>
              Zealthy is dedicated to helping individuals achieve their weight
              loss goals through convenient, accessible, and personalized
              services.
            </Typography>
            <ImageContainer
              sx={{
                padding: isMobile ? '12px 0' : '16px 0',
                marginTop: '40px',
              }}
            >
              <Image
                src="/Zealthy.png"
                alt="Zealthy"
                width={isMobile ? 165 : 250}
                height={isMobile ? 20 : 30}
              />
            </ImageContainer>
            <Typography
              variant="h2"
              fontSize={isMobile ? 32 : ''}
              lineHeight={isMobile ? '38px' : ''}
            >
              Welcome to the Zealthy community!
            </Typography>
            <Typography lineHeight={'22px'}>
              Zealthy was created to help empower and support people just like
              you to take control of their metabolic health.
            </Typography>
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
              fontSize: '22px',
              lineHeight: '28px',
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
            <Box
              sx={{
                alignSelf: 'center',
              }}
            >
              <Image
                src="/whatsNextCalendar.png"
                alt="calendar"
                width={200}
                height={200}
              />
            </Box>
            <Typography lineHeight={'22px'}>
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
            <Box
              sx={{
                alignSelf: 'center',
              }}
            >
              <Image
                src="/whatsNextIdea.png"
                alt="Thinking face"
                width={200}
                height={200}
              />
            </Box>

            <Typography lineHeight={'22px'}>
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
            <Box
              sx={{
                alignSelf: 'center',
              }}
            >
              <Image
                src="/whatsNextCall.png"
                alt="Active support"
                width={200}
                height={200}
              />
            </Box>
            <Typography lineHeight={'22px'}>
              Any other questions? Contact your Zealthy Care Team.
            </Typography>
          </RowContainer>
          <Button onClick={handleNextPage}>Next</Button>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default NowWhatCard;

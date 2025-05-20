import * as React from 'react';
import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Button from '@mui/material/Button';
import SignUpForm from './SignUpForm';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import {
  Box,
  Typography,
  List,
  ListItem,
  alpha,
  Container,
  useMediaQuery,
} from '@mui/material';
import AnalyzeWeightLossResultsV2 from '@/components/screens/Question/components/AnalyzeWeightLossResultsV2';
import {
  QuestionnaireQuestionType,
  QuestionWithName,
} from '@/types/questionnaire';
import { styled, useTheme } from '@mui/material/styles';
import Loading from '@/components/shared/Loading/Loading';
import { usePatientState } from '@/components/hooks/usePatient';
import CheckMarkCircleThinGreen from '@/components/shared/icons/CheckMarkCircleThinGreen';
import { useUser } from '@supabase/auth-helpers-react';
import { useIsMobile } from '@/components/hooks/useIsMobile';

declare module '@mui/material/styles' {
  interface MUIStyledCommonProps<Theme> {
    isBlurred?: boolean;
  }
}

interface Item {
  text: string;
}

const AnimationContainer: React.FC<{
  heightFt: any;
  heightIn: any;
  weight: any;
  setCalculationComplete: (val: boolean) => void;
}> = ({ heightFt, heightIn, weight, setCalculationComplete }) => {
  const [activeItem, setActiveItem] = React.useState(0);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    timeoutIds.push(setTimeout(() => handleItemAnimation(0), 0));
    timeoutIds.push(setTimeout(() => handleItemAnimation(1), 1000));
    timeoutIds.push(setTimeout(() => handleItemAnimation(2), 2000));
    timeoutIds.push(setTimeout(() => setCalculationComplete(true), 4500));
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []);

  const handleItemAnimation = (index: number) => {
    setActiveItem(index);
  };

  const itemStyle = (isActive: boolean) => {
    return {
      opacity: isActive ? 1 : 0.7,
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      fontWeight: isActive ? 'bold' : 'normal',
      color: isActive ? '#000' : alpha('#000', 0.6),
      transition: 'all 0.5s ease',
      '&:hover': {
        backgroundColor: alpha('#FFF', 0.1),
      },
    };
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="h1"
        sx={{ marginBottom: { xs: 4, sm: 8 }, textAlign: 'center' }}
      >
        Calculating your expected weight loss
      </Typography>
      <List>
        <ListItem sx={itemStyle(activeItem === 0)}>
          <Typography variant="h3">
            {`Your height ${heightFt}'${heightIn}"`}
          </Typography>
        </ListItem>
        <ListItem sx={itemStyle(activeItem === 1)}>
          <Typography variant="h3">{`Your weight ${weight} lbs`}</Typography>
        </ListItem>
        <ListItem sx={itemStyle(activeItem === 2)}>
          <Typography variant="h3">
            Calculating based on clinical data
          </Typography>
        </ListItem>
      </List>
    </Box>
  );
};

const WeightLossROChartAnimation = () => {
  const router = useRouter();
  const { push, query } = router;
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [patientDataLoaded, setPatientDataLoaded] = useState(false);

  const type: QuestionnaireQuestionType = 'analyze-weight-loss-results';
  const question: QuestionWithName = {
    type,
    hideFooter: true,
    hideHeader: true,
    index: 0,
    header: '',
    name: '',
    questionnaire: '',
  };

  const patientState = usePatientState();
  const user = useUser();

  const [weight, setWeight] = useState(patientState.weight);
  const [heightFt, setHeightFt] = useState(patientState.height_ft);
  const [heightIn, setHeightIn] = useState(patientState.height_in);

  useEffect(() => {
    if (
      patientState.weight &&
      patientState.height_ft &&
      patientState.height_in
    ) {
      setWeight(patientState.weight);
      setHeightFt(patientState.height_ft);
      setHeightIn(patientState.height_in);
      setPatientDataLoaded(true);
    } else {
      const storedWeight = sessionStorage.getItem('patientWeight');
      const storedHeightFt = sessionStorage.getItem('patientHeightFt');
      const storedHeightIn = sessionStorage.getItem('patientHeightIn');

      if (storedWeight && storedHeightFt && storedHeightIn) {
        setWeight(JSON.parse(storedWeight));
        setHeightFt(JSON.parse(storedHeightFt));
        setHeightIn(JSON.parse(storedHeightIn));
        setPatientDataLoaded(true);
      } else {
        setPatientDataLoaded(false);
      }
    }
  }, [patientState]);

  // Adjusted useEffect hook to scroll on calculationComplete and on page load
  useEffect(() => {
    if (!user && calculationComplete) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Scroll on page load if user is not logged in and calculation is already complete
    if (!user && calculationComplete && typeof window !== 'undefined') {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [user, calculationComplete]);

  if (!patientDataLoaded) {
    return <Loading />;
  }

  const goToWeightLoss = () => {
    push({
      pathname: '/weight-loss-ro/create-patient',
      query: {
        variant: query.variant || '0',
        care: query.care || '',
      },
    });
  };

  const BlurredOverlay = styled('div')(
    ({ isBlurred, theme }: { isBlurred: boolean; theme: any }) => ({
      position: 'relative',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: isBlurred ? 2 : 1,
      filter: isBlurred ? `blur(12px)` : 'none',
      transition: theme.transitions.create(['filter', 'z-index'], {
        duration: 500,
      }),
    })
  );

  const BottomBox = styled(Box)(({ theme }) => ({
    left: 0,
    right: 0,
    height: 'fit-content',
    zIndex: 1,
    backgroundColor: '#fff',
    boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)', // Adjust as needed
  }));

  const BoxWrapper = styled(Box)(
    ({ isBlurred, theme }: { isBlurred: boolean; theme: any }) => ({
      minHeight: 'calc(100vh - 9vh)',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
    })
  );

  const isBlurred = !user;

  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy</title>
      </Head>

      {!calculationComplete &&
      !user &&
      patientState.weight &&
      patientState.height_ft ? (
        <Container
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingY: isMobile ? 2 : 4,
          }}
        >
          <CheckMarkCircleThinGreen
            height={isMobile ? '100' : '200'}
            width={isMobile ? '100' : '200'}
            color="#8ACDA0"
            style={{ marginBottom: isMobile ? '30px' : '60px' }}
          />
          <AnimationContainer
            heightFt={heightFt}
            heightIn={heightIn}
            weight={weight}
            setCalculationComplete={setCalculationComplete}
          />
        </Container>
      ) : (
        <BoxWrapper isBlurred={isBlurred} theme={theme}>
          <Container maxWidth="sm" sx={{ flex: 1 }}>
            <BlurredOverlay
              sx={{ marginBottom: { xs: 2, sm: 3 } }}
              theme={theme}
              isBlurred={isBlurred}
            >
              <AnalyzeWeightLossResultsV2
                question={question}
                onNext={() => {}}
              />
            </BlurredOverlay>
          </Container>

          <BottomBox>
            {!user ? (
              <Container
                maxWidth="sm"
                sx={{
                  paddingTop: isMobile ? 2 : 4,
                  paddingBottom: isMobile ? 2 : 4,
                }}
              >
                <Typography
                  variant={isMobile ? 'h4' : 'h2'}
                  sx={{ marginBottom: isMobile ? 2 : 4 }}
                >
                  See your expected weight loss with the Zealthy Weight Loss
                  Program
                </Typography>
                <SignUpForm isSignUp={true} nextRoute={router.asPath} />
              </Container>
            ) : (
              <Container
                maxWidth="sm"
                sx={{
                  paddingTop: isMobile ? 2 : 4,
                  paddingBottom: isMobile ? 2 : 4,
                }}
              >
                <Typography
                  variant={'h3'}
                  sx={{ marginBottom: isMobile ? 1 : 2 }}
                >
                  Your treatment options
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    // marginBottom: isMobile ? 0.5 : 1,
                  }}
                >
                  <Box
                    component="sup"
                    sx={{
                      marginRight: '4px',
                      marginLeft: '-12px',
                    }}
                  >
                    &#8478;
                  </Box>
                  <Typography variant="body1">
                    Ozempic, Wegovy, Zepbound, compounded GLP-1
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ marginBottom: isMobile ? 2 : 4 }}
                >
                  Certain meds are available for pickup/delivery within 1-2 days
                  if prescribed.
                </Typography>
                <Button
                  onClick={goToWeightLoss}
                  sx={{
                    width: '100%',
                    marginBottom: isMobile ? 2 : 3,
                  }}
                >
                  Continue
                </Button>
                <Typography
                  variant="h4"
                  fontSize={isMobile ? '0.75rem' : '1rem'}
                >
                  *This estimate derives from Eli Lilly&#x27;s SURMOUNT-4
                  clinical trial results which showed 20% average weight loss
                  over 36 weeks among people who utilized a maximum tolerated
                  dose of 10 mg or 15 mg once-weekly. The starting dose of 2.5
                  mg Zepbound was increased by 2.5 mg every four weeks until the
                  maximum tolerated dose was achieved. Treatment was given in
                  addition to diet and exercise.
                </Typography>
              </Container>
            )}
          </BottomBox>
        </BoxWrapper>
      )}
    </>
  );
};

WeightLossROChartAnimation.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossROChartAnimation;

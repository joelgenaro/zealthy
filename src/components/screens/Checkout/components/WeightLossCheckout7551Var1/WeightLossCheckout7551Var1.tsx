import {
  Box,
  capitalize,
  Container,
  Divider,
  Stack,
  Typography,
  Link,
} from '@mui/material';
import { usePatient, useVWOVariationName } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { useSelector } from '@/components/hooks/useSelector';
import WLGraph from 'public/images/wl-graph-pre-checkout.svg';
import SemaglutideBottleImage from 'public/images/semaglutide_light.png';
import IdentityCard from 'public/icons/id-card.svg';
import MessageBoxes from 'public/icons/message-boxes.svg';
import HeartSmile from 'public/icons/heart-smile.svg';
import PestleMortar from 'public/icons/pestle-mortar.svg';
import Checkboard from 'public/icons/checkboard.svg';
import harvard from 'public/images/institutions/harvard.png';
import stanford from 'public/images/institutions/stanford.png';
import mayoclinic from 'public/images/institutions/mayoclinic.png';
import nih from 'public/images/institutions/nih.png';
import webmd from 'public/images/institutions/webmd.png';

import Image from 'next/image';
import { useIsMobile } from '@/components/hooks/useIsMobile';

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import StrikethroughText from '@/components/shared/StrikethroughText';
import CheckoutTestimonial from '../../CheckoutV2/asset/CheckoutTestimonial';
import PaymentForm from '../PaymentForm';
import PhoneWithGLP1Vials from 'public/images/phone_with_glp1_vials.png';
import BottlePhone from '../../CheckoutV2/asset/BottlePhone';

import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import ReactPlayer from 'react-player';
import { add } from 'date-fns';

let DiscountedPrice = 39;
const RegularPrice = 135;

type Stat = {
  value: string;
  description: ReactNode;
};

const StatItem = ({ stat }: { stat: Stat }) => {
  const isMobile = useIsMobile();
  return (
    <Box
      display="grid"
      gridTemplateColumns="100px 1fr"
      gap={isMobile ? 1 : 5}
      alignItems="center"
      alignSelf="stretch"
      width="100%"
      marginLeft={isMobile ? '' : '-16px'}
    >
      <Typography
        sx={{
          fontSize: isMobile ? '24px !important' : '36px !important',
          fontWeight: 'bold',
          color: '#005315',
          textAlign: 'right',
          fontFamily: 'Georgia, serif',
          paddingRight: '24px',
        }}
      >
        {stat.value}
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        gap={isMobile ? 2 : 4}
        justifyContent={'center'}
        width="100%"
        sx={{ minWidth: 0 }}
      >
        <Typography
          width={'100%'}
          fontSize={isMobile ? '14px' : '16px'}
          textAlign={'left'}
        >
          {stat.description}
        </Typography>
        <Divider sx={{ width: '100%' }} color="#1B1B1B" />
      </Box>
    </Box>
  );
};

const Stats = ({ stats }: { stats: Stat[] }) => (
  <Box
    display="flex"
    width="100%"
    flexDirection="column"
    gap={4}
    alignSelf="center"
  >
    {stats.map((stat, index) => (
      <StatItem key={index} stat={stat} />
    ))}
  </Box>
);

const FIFTEEN_MINUTES = 15 * 60;

const WeightLossCheckout7551Var1 = () => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const coaching = useSelector(store => store.coaching);
  const { discounted_price, name } = coaching[0];
  if (name === 'Zealthy Weight Loss Flexible' && discounted_price) {
    DiscountedPrice = discounted_price;
  }

  const storageKey = useMemo(() => {
    // use patient ID for session-specific storage
    return `countdown-date-${patient?.id}`;
  }, [patient?.id]);

  const currentDate = useMemo(() => {
    const storedDate = window.localStorage.getItem(storageKey);
    if (!storedDate) {
      const newDate = new Date();
      window.localStorage.setItem(storageKey, newDate.toISOString());
      return newDate;
    }
    return new Date(storedDate);
  }, [storageKey]);

  const targetDate = useMemo(() => {
    return add(currentDate, { minutes: 15, seconds: 1 });
  }, [currentDate]);

  const countdown = useCountdown({
    initialSeconds: FIFTEEN_MINUTES,
    shouldReset: true,
  });

  const weight = patient?.weight;
  const goal_weight = weight ? Math.round(weight * 0.8) : undefined;

  const { midDate, startDate, endDate } = useMemo(() => {
    if (!weight || !goal_weight) return { start: '', mid: '', end: '' };
    const lossPercentage = 1 - (weight - goal_weight) / weight;

    const today = new Date();
    let endDate = new Date(today);

    if (lossPercentage < 0.85) {
      endDate.setMonth(today.getMonth() + 12);
    } else if (lossPercentage < 0.9) {
      endDate.setMonth(today.getMonth() + 9);
    } else if (lossPercentage < 0.95) {
      endDate.setMonth(today.getMonth() + 3);
    } else {
      endDate.setMonth(today.getMonth() + 1);
    }

    const midDate = new Date(today);
    midDate.setMonth(
      today.getMonth() +
        Math.round(
          (endDate.getTime() - today.getTime()) /
            (2 * 30.44 * 24 * 60 * 60 * 1000)
        )
    );

    return {
      startDate: today.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
      midDate: midDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
      endDate: endDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }),
    };
  }, [weight, goal_weight]);

  const stats = [
    {
      value: '92%',
      description: 'Patients have achieved lasting weight loss',
    },
    {
      value: '15%',
      description: 'Average reduction in body weight',
    },
    {
      value: '6"',
      description: 'Average decrease in waist size',
    },
    {
      value: '4/5',
      description: (
        <>
          Patients say this is the most effective {isMobile ? '' : <br />}{' '}
          method they&apos;ve tried
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="sm">
      <Heading />
      <Stack gap="32px" mt="32px">
        <PersonalStats
          age={getAge(patient?.profiles.birth_date)}
          gender={capitalize(patient?.profiles.gender ?? '')}
          goal_weight={goal_weight ?? 0}
        />
        <SubHeading />
        <WeightLossGraph
          weight={weight ?? 0}
          goal_weight={goal_weight ?? 0}
          goalEnd={{
            startDate: startDate ?? '',
            midDate: midDate ?? '',
            endDate: endDate ?? '',
          }}
        />
        <SuccessRate />
        <Stack mt={isMobile ? 1 : 2}>
          <Typography
            sx={{
              fontSize: '24px !important',
              lineHeight: '30px',
              fontWeight: '600',
            }}
          >
            What{' '}
            <Typography
              fontWeight="600"
              color="primary"
              sx={{ textDecoration: 'underline' }}
              display="inline"
              fontSize="24px !important"
              lineHeight="30px !important"
            >
              you&apos;ll accomplish
            </Typography>{' '}
            with your plan
          </Typography>

          <AccomplishmentsList
            weight={weight ?? 0}
            goal_weight={goal_weight ?? 0}
          />
        </Stack>

        <Box
          display="flex"
          sx={{
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <BottlePhone />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Typography fontSize="20px" fontWeight="600" mb={1}>
              {`${patient?.profiles.first_name?.trim()}'s plan`}
            </Typography>
            <Typography>
              You&apos;ll get{' '}
              <i style={{ fontWeight: 'bold' }}>everything you need</i> <br />{' '}
              to drop those {Math.round(weight! - goal_weight!)} lbs <br /> and
              keep them off.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              padding: isMobile ? '12px 8px' : '24px 16px',
              backgroundColor: '#04581D',
              borderRadius: '12px',
              color: '#FFFFFF',
              gap: '0.5rem',
              width: 'fit-content',
            }}
          >
            <Typography
              fontWeight={600}
              fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
            >
              {`$${DiscountedPrice}`}
            </Typography>

            {/*  */}

            <StrikethroughText
              fontSize={isMobile ? '1rem!important' : '1.7rem!important'}
            >
              {`$${RegularPrice}`}
            </StrikethroughText>

            {/*  */}
          </Box>
        </Box>
        <Box bgcolor="#fff">
          <Stack gap={1.5}>
            <Typography
              fontFamily="Georgia, serif"
              fontSize={isMobile ? '20px !important' : '32px !important'}
              textAlign="center"
              fontWeight="700"
              mb={isMobile ? 1 : 3}
            >
              What’s included?
            </Typography>
            <Box
              border="1px solid lightgrey"
              borderRadius="1rem"
              padding="24px"
              display="flex"
              flexDirection="column"
              gap={3}
            >
              <Stack direction="row" gap={2} alignItems="center">
                <Image src={Checkboard} alt="Trophy Icon" width="24" />
                <Typography lineHeight="18px !important">
                  Provider reviews your medical history and writes prescription
                  for GLP-1, if appropriate
                </Typography>
              </Stack>
              <Stack direction="row" gap={2} alignItems="center">
                <Image src={IdentityCard} alt="Trophy Icon" width="24" />
                <Typography lineHeight="18px !important">
                  Zealthy will work with your insurance so that they will pay
                  for your weight loss medication (if prescribed), including
                  GLP-1s
                </Typography>
              </Stack>
              <Stack direction="row" gap={2} alignItems="center">
                <Image src={PestleMortar} alt="Trophy Icon" width="24" />
                <Typography lineHeight="18px !important">
                  Access to affordable compound GLP-1 medications without
                  insurance required, as little as $151/month (compare to
                  $1,000+ elsewhere)
                </Typography>
              </Stack>
              <Stack direction="row" gap={2} alignItems="center">
                <Image src={HeartSmile} alt="Trophy Icon" width="24" />
                <Typography lineHeight="18px !important">
                  You will be matched to a coach to build an individualized
                  weight loss program to supplement your medication
                </Typography>
              </Stack>
              <Stack direction="row" gap={2} alignItems="center">
                <Image src={MessageBoxes} alt="Trophy Icon" width="24" />
                <Typography lineHeight="18px !important">
                  Unlimited messaging with coach and progress tracking
                </Typography>
              </Stack>
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                justifyContent={'center'}
                textAlign={'center'}
              >
                <Typography lineHeight="14px !important">
                  <i>+ an active like minded community!</i>
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>
        <TimeLeftMessage countdown={countdown} />
        <PaymentForm
          amount={DiscountedPrice}
          buttonText={`Get started for $${DiscountedPrice}`}
        />

        <Disclaimer />
        <Divider />
        <Stack
          gap={10}
          textAlign="center"
          justifyContent="center"
          alignItems="center"
        >
          <ResearchLogos />

          <Box
            display="flex"
            bgcolor="#E7F8ED"
            paddingY={isMobile ? '16px' : '32px'}
            paddingX={isMobile ? '16px' : '32px'}
            borderRadius={isMobile ? '16px' : '32px'}
            gap={4}
            flexDirection="column"
          >
            <StatsHeader />
            <Stats stats={stats} />
          </Box>
          <PatientTestimonialVideos />

          <CheckoutTestimonial />
          <GetStartedMessageWithCountdown countdown={countdown} />
          <Box
            width={'100%'}
            display={'flex'}
            alignItems={'center'}
            flexDirection={'column'}
          >
            <Box
              bgcolor={'#008A2E'}
              color={'white'}
              borderRadius={'8px 8px 0 0'}
              px={1}
              py={isMobile ? 0.5 : 1}
              fontWeight={'bold'}
              fontSize={isMobile ? '10px !important' : '16px !important'}
              width="80%"
            >{`Start now for just $${DiscountedPrice} - no insurance needed!`}</Box>
            <Box
              border="1px solid green"
              borderRadius={4}
              padding={'24px'}
              width="100%"
              display={'flex'}
              flexDirection={'column'}
              gap={2}
            >
              <Typography
                fontWeight="bold"
                fontSize={isMobile ? '20px !important' : '32px !important'}
                color="primary"
              >
                What&apos;s included?
              </Typography>

              <CheckmarkList />
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
};

const ResearchLogos = () => {
  const isMobile = useIsMobile();
  return (
    <Stack
      gap={3}
      padding={isMobile ? '16px 0' : '16px'}
      borderRadius="32px"
      alignItems="center"
      bgcolor="#F3F3F3"
      width="100%"
    >
      <Typography
        fontWeight="600"
        color="primary"
        variant="h4"
        sx={{ textTransform: 'uppercase' }}
      >
        Backed by research from
      </Typography>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Image
            src={nih}
            alt="NIH"
            width={isMobile ? 160 : 150}
            height={isMobile ? 80 : 75}
            style={{
              objectFit: 'contain',
              marginLeft: isMobile ? '-20px' : '0',
              marginTop: isMobile ? '0' : '10px',
              marginBottom: isMobile ? '0' : '-10px',
            }}
          />
          <Image
            src={mayoclinic}
            alt="Mayo Clinic"
            width={isMobile ? 160 : 150}
            height={isMobile ? 80 : 75}
            style={{
              objectFit: 'contain',
              margin: isMobile ? '0 -20px' : '0',
            }}
          />
          <Image
            src={webmd}
            alt="WebMD"
            width={isMobile ? 160 : 150}
            height={isMobile ? 80 : 75}
            style={{
              objectFit: 'contain',
              marginRight: isMobile ? '-20px' : '0',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: isMobile ? 0 : 12,
            alignItems: 'center',
          }}
        >
          <Image
            src={stanford}
            alt="Stanford Medicine"
            width={isMobile ? 210 : 240}
            height={isMobile ? 105 : 120}
            style={{
              objectFit: 'contain',
              marginLeft: isMobile ? '-30px' : '-15px',
              marginRight: isMobile ? '-20px' : '-25px',
              marginTop: isMobile ? '0' : '-10px',
              transform: isMobile ? 'translateY(-8px)' : 'none',
            }}
          />
          <Image
            src={harvard}
            alt="Harvard University"
            width={isMobile ? 160 : 150}
            height={isMobile ? 80 : 75}
            style={{ objectFit: 'contain' }}
          />
        </Box>
      </Box>
    </Stack>
  );
};

const GetStartedMessageWithCountdown = ({
  countdown,
}: {
  countdown: string;
}) => {
  const isMobile = useIsMobile();
  return (
    <Box display="flex" flexDirection="row" justifyContent="center" gap={2}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems={'flex-start'}
        gap={2}
        py={6}
        alignSelf={'flex-end'}
      >
        <Box
          borderRadius={6}
          bgcolor="#DDFFE5"
          paddingY={2}
          paddingX={2}
          display="flex"
          justifyContent="center"
        >
          <Typography fontWeight={'bold'} color="primary">
            We&apos;re Ready
          </Typography>
        </Box>
        <Typography
          fontWeight="600"
          fontFamily="Georgia, serif"
          fontSize={isMobile ? '20px !important' : '32px !important'}
          lineHeight={isMobile ? '24px !important' : '38px !important'}
          textAlign="center"
          color="primary"
        >
          Let&apos;s get started!
        </Typography>
        <Typography
          fontSize={isMobile ? '14px !important' : '20px !important'}
          display="inline"
        >
          You&apos;re approved for{' '}
          <Typography
            fontSize={isMobile ? '14px !important' : '20px !important'}
            fontWeight={'bold'}
            color="primary"
            display="inline"
          >
            {countdown}
          </Typography>
        </Typography>
      </Box>
      <Image src={PhoneWithGLP1Vials} alt="Phone with GLP-1 vials" />
    </Box>
  );
};

const StatsHeader = () => {
  const isMobile = useIsMobile();
  return (
    <Typography
      marginX={isMobile ? '' : '-16px'}
      fontWeight="700"
      fontFamily="Georgia, serif"
      fontSize={isMobile ? '20px !important' : '28px !important'}
      lineHeight={isMobile ? '24px !important' : '38px !important'}
      textAlign="left"
      color="primary"
    >
      What makes the Zealthy weight loss program more effective than anything
      else?
    </Typography>
  );
};

const Disclaimer = () => {
  return (
    <Typography fontSize="12px !important" textAlign="center">
      By clicking &quot;Confirm&quot; you agree to having reviewed and agreed to
      <br />
      Zealthy&apos;s{' '}
      <Link
        href="https://www.getzealthy.com/terms-of-use"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'inherit' }}
      >
        <Typography
          component="span"
          color="primary"
          fontWeight="bold"
          fontSize="12px !important"
          display="inline"
          textAlign="center"
        >
          Terms of Use
        </Typography>
      </Link>
      . <br /> <br />
      By providing your card information, you allow Zealthy to charge $
      {DiscountedPrice} for your first month and ${RegularPrice} for every month
      after unless you cancel your membership. You can cancel your membership by
      logging into your Zealthy account and clicking &quot;Profile&quot; in the
      top right corner and selecting &quot;Manage Membership&quot; in the
      program details section. Your monthly membership fees are non-refundable
      and you can cancel up to 36 hours before any future billing period.
    </Typography>
  );
};

const TimeLeftMessage = ({ countdown }: { countdown: string }) => {
  const isMobile = useIsMobile();

  return (
    <Typography
      fontSize={isMobile ? '14px !important' : '20px !important'}
      fontWeight={600}
      textAlign="center"
      width="100%"
    >
      Your approval is reserved for{' '}
      <Typography
        color="red"
        display="inline"
        fontSize={isMobile ? '14px !important' : '20px !important'}
        fontWeight={600}
      >
        {countdown}
      </Typography>
    </Typography>
  );
};

const Heading = () => {
  const { data: patient } = usePatient();

  return (
    <Typography variant="h2">
      {`${patient?.profiles.first_name?.trim()}'s prescription plan has been `}
      <Typography
        variant="h2"
        component="span"
        color="primary"
        display="inline"
      >
        <i>approved</i>
      </Typography>
      !
    </Typography>
  );
};

const SubHeading = () => {
  return (
    <Typography marginLeft={'auto'} marginRight={'auto'}>
      You&apos;ll get personalized care for your unique biology with{' '}
      <b>prescribed medication</b>, 1:1 coaching guidance,{' '}
      <b>expert-designed meal plan</b>, and community support.
    </Typography>
  );
};

const OutlinedBox = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  width?: string;
}) => {
  return (
    <Box
      bgcolor="#fff"
      border="1px solid green"
      borderRadius={4}
      py="13px"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
      width="171px"
      {...props}
    >
      {children}
    </Box>
  );
};

const OutlinedBoxHeader = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  return (
    <Typography
      fontSize={isMobile ? '11px !important' : '14px !important'}
      fontWeight="bold"
      color="primary"
    >
      {children}
    </Typography>
  );
};

const OutlinedBoxValue = ({
  children,
  ...restProps
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => {
  return <Typography {...restProps}>{children}</Typography>;
};

const getAge = (birthDate: string | null | undefined) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const PersonalStats = ({
  age,
  goal_weight,
  gender,
}: {
  age: number;
  goal_weight: number;
  gender: string;
}) => {
  return (
    <Stack width="100%" justifyContent="space-between" direction="row" gap={1}>
      <OutlinedBox>
        <OutlinedBoxHeader>Age</OutlinedBoxHeader>
        <OutlinedBoxValue>{age}</OutlinedBoxValue>
      </OutlinedBox>
      <OutlinedBox>
        <OutlinedBoxHeader>Weight Loss Goal</OutlinedBoxHeader>
        <OutlinedBoxValue>{goal_weight}</OutlinedBoxValue>
      </OutlinedBox>
      <OutlinedBox>
        <OutlinedBoxHeader>Sex</OutlinedBoxHeader>
        <OutlinedBoxValue>{gender}</OutlinedBoxValue>
      </OutlinedBox>
    </Stack>
  );
};

const WeightLossGraph = ({
  weight,
  goal_weight,
  goalEnd,
}: {
  weight: number;
  goal_weight: number;
  goalEnd: { startDate: string; midDate: string; endDate: string };
}) => {
  const isMobile = useIsMobile();

  return (
    <Box position="relative">
      <Box
        bgcolor="#B8F5CC"
        padding="12px"
        sx={{
          position: 'absolute',
          fontWeight: 'bold',
          fontSize: '15px',
          top: '0',
          left: '-10px',
          borderRadius: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '88px',
          height: '84px',
        }}
      >
        {weight} <br /> lbs.
      </Box>
      <Box
        sx={{
          position: 'absolute',
          fontWeight: 'bold',
          fontSize: '15px',
          bottom: '80px',
          right: '-10px',
          lineHeight: '1',
        }}
      >
        <OutlinedBox width={isMobile ? '125px' : '171px'}>
          <OutlinedBoxHeader>Goal Weight</OutlinedBoxHeader>
          <OutlinedBoxValue
            sx={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#005315',
            }}
          >
            {goal_weight}
            {isMobile && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '5px',
                  fontSize: '20px',
                }}
              >
                🎊
              </Box>
            )}
          </OutlinedBoxValue>
        </OutlinedBox>
        <Box>
          {!isMobile && (
            <Box
              sx={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '20px',
              }}
            >
              🎊
            </Box>
          )}
        </Box>
      </Box>

      <Image
        src={WLGraph}
        alt="Weight Loss Graph"
        sizes="100vw"
        style={{
          width: '100%',
          height: 'auto',
        }}
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        position="absolute"
        width="100%"
        bottom="5px"
      >
        <Typography>{goalEnd.startDate}</Typography>
        <Typography>{goalEnd.midDate}</Typography>
        <Typography>{goalEnd.endDate}</Typography>
      </Stack>
    </Box>
  );
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const SuccessRate = () => {
  const isMobile = useIsMobile();
  return (
    <Box
      bgcolor="primary.main"
      border="1px solid lightgrey"
      borderRadius={4}
      display="flex"
      justifyContent="space-between"
      height="100px"
      overflow="hidden"
    >
      <Stack direction="row" height="inherit">
        <Box
          sx={{
            overflow: 'hidden',
            position: 'relative',
            width: '150px',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '-10px',
          }}
        >
          <Image
            src={SemaglutideBottleImage}
            alt="Semaglutide Bottle"
            width={450}
            height={450}
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
            }}
          />
        </Box>
      </Stack>
      <Typography
        position={'relative'}
        fontWeight="bold"
        alignSelf={'center'}
        color="white"
        width={'fit-content'}
        sx={{ fontWeight: 500 }}
        marginLeft={'-20px'}
        fontSize={isMobile ? '11px' : '16px'}
      >
        You have a <i style={{ fontWeight: 600 }}>very high</i> <br />
        chance of success with <br />
        GLP-1/GIN Medications
      </Typography>
      <Stack
        flex={1}
        direction="column"
        alignSelf="center"
        justifySelf="flex-end"
        textAlign="right"
        marginRight={'20px'}
        gap={2}
        color="#B8F5CC"
      >
        <Typography
          fontFamily="Georgia, serif"
          fontWeight="bold"
          fontSize={isMobile ? '20px !important' : '33px !important'}
        >
          93.6%
        </Typography>
        <Typography
          textTransform="uppercase"
          fontSize={isMobile ? '14px' : '16px'}
        >
          very high
        </Typography>
      </Stack>
    </Box>
  );
};

const BulletPoint = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  return (
    <li
      style={{
        listStyleType: 'none',
        margin: 0,
        padding: 0,
        position: 'relative',
        paddingLeft: '36px',
        marginLeft: '-40px',
      }}
    >
      <Typography fontSize={isMobile ? '14px' : '20px'}>
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: 0,
            width: '19px',
            height: '19px',
            borderRadius: '50%',
            backgroundColor: '#B8F5CC',
          }}
        />
        {children}
      </Typography>
    </li>
  );
};

const AccomplishmentsList = ({
  weight,
  goal_weight,
}: {
  weight: number;
  goal_weight: number;
}) => {
  const isMobile = useIsMobile();
  return (
    <ul
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        fontSize: isMobile ? '14px' : '16px',
      }}
    >
      <BulletPoint>
        Lose <b>{weight - goal_weight}</b> pounds
      </BulletPoint>
      <BulletPoint>
        Reset your &quot;set point&quot; so your body wants to naturally stay at{' '}
        <b>{Math.round(weight * 0.8)}</b> lbs
      </BulletPoint>
      <BulletPoint>Look and feel healthier</BulletPoint>
    </ul>
  );
};

const useCountdown = ({
  initialSeconds,
  shouldReset,
}: {
  initialSeconds: number;
  shouldReset: boolean;
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  const formatTime = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prev: number) => {
        if (prev <= 0) {
          return shouldReset ? initialSeconds : 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [initialSeconds, shouldReset]);

  return formatTime(seconds);
};

interface CheckmarkItemProps {
  description: ReactNode;
}

export const CheckmarkItem = ({ description }: CheckmarkItemProps) => {
  return (
    <Box display={'flex'} gap={2} justifyContent={'center'}>
      <Box
        padding={2}
        bgcolor={'#DDFFE5'}
        height={'24px'}
        width={'24px'}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={'50%'}
      >
        <CheckCircleOutlineOutlined color="primary" />
      </Box>
      <Typography textAlign={'left'} fontWeight={'bold'}>
        {description}
      </Typography>
    </Box>
  );
};

export const CheckmarkList = () => {
  const items = [
    <Typography fontWeight={'bold'} key="prescription">
      Prescription to GLP-1 medications and access to affordable compounded
      semaglutide or tirzepatide *
      <Typography fontWeight={'300'}>
        *cost of medication not included in membership
      </Typography>
    </Typography>,
    'Support with insurance and prior-authorizations',
    'Telehealth appointments with licensed providers',
    'Lifestyle & nutrition guidance',
    'Ongoing treatment updates based on your progress',
  ];

  return (
    <Stack direction="column" alignItems="start" spacing={2}>
      {items.map((item, index) => (
        <CheckmarkItem key={index} description={item} />
      ))}
    </Stack>
  );
};

const PatientTestimonialVideos = () => {
  const { data: patient } = usePatient();
  const isMale = patient?.profiles.gender?.toLowerCase() === 'male';

  const videos = isMale
    ? ['https://vimeo.com/930010687']
    : ['https://vimeo.com/899660835/68e7a5afe0', 'https://vimeo.com/988955574'];

  const isMobile = useIsMobile();

  return (
    <Box>
      <Typography
        fontWeight="700"
        fontFamily="Georgia, serif"
        fontSize={isMobile ? '20px !important' : '32px !important'}
        lineHeight={isMobile ? '24px !important' : '38px !important'}
        textAlign="left"
        color="primary"
        mb={2}
      >
        Patients like you have achieved amazing results
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'center',
          width: '100%',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}
      >
        {videos.map((video, index) => (
          <Box
            key={index}
            sx={{
              aspectRatio: '16/9',
              width: '275px',
              height: '496px',
            }}
          >
            <ReactPlayer
              url={video}
              width="100%"
              height="100%"
              frameBorder={0}
              controls
              pip
              allowFullScreen
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WeightLossCheckout7551Var1;
export {};

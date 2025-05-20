import {
  Box,
  Container,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import semaglutide from '/public/images/trending/trending2.png';
import {
  useActivePatientSubscription,
  useAllVisiblePatientSubscription,
  useAudits,
  usePatient,
  usePatientAppointments,
  usePatientCompoundOrders,
  usePatientOrders,
  usePatientPrescriptionRequest,
  usePatientZealthyRating,
} from '@/components/hooks/data';
import { useCallback, useEffect, useMemo, useState } from 'react';
import RedditPopUp from '../PatientPortal/components/RedditPopUp';
import isRating5Stars from '@/utils/isRating5Stars';
import {
  birthControlPrograms,
  edPrograms,
  femaleHairLossPrograms,
  hairLossPrograms,
  menopausePrograms,
  mentalHealthPrograms,
  performancePrograms,
  skincarePrograms,
  weightLossPrograms,
  womenMentalHealthPrograms,
  prepPrograms,
  sleepPrograms,
} from './components/programs-data';
import ProgramsCarousel from './components/ProgramsCarousel';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import Image from 'next/image';
import { ChevronRight } from '@mui/icons-material';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import Router from 'next/router';
import EverydayFavoritesCarousel from './components/EverydayFavoritesCarousel';
import { usePatientIntakes } from '@/components/hooks/data';
import getConfig from '../../../../config';
import { useTheme } from '@mui/system';

function getAgeFromBirthDate(birthDateStr?: string | null): number {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age;
}

const DiscoverCare = () => {
  const isMobile = useIsMobile();
  const { data: subscriptions } = useActivePatientSubscription();
  const { data: allSubscriptions } = useAllVisiblePatientSubscription();
  const { data: compoundOrders = [] } = usePatientCompoundOrders();
  const { data: patient } = usePatient();
  const { data: orders } = usePatientOrders();
  const { data: patientZealthyRating = [] } = usePatientZealthyRating();
  const { data: patientAppointments = [] } = usePatientAppointments();
  const { data: patientCoachRatings = [] } = useAudits();
  const { data: patientIntakes = [] } = usePatientIntakes();
  const { addSpecificCare, addVariant } = useIntakeActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const [loading, setLoading] = useState(false);

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();

  const hasCompletedFreeConsultVisit = useMemo(() => {
    return !!patientIntakes?.find(
      i =>
        i.specific_care === 'Weight Loss Free Consult' &&
        i.status === 'Completed'
    );
  }, [patientIntakes]);

  const weightLossSubscription = useMemo(() => {
    // If allSubscriptions is undefined, we're still loading
    if (allSubscriptions === undefined) {
      return undefined;
    }

    const weightlossSubs = allSubscriptions?.filter(s =>
      s.subscription.name.includes('Weight Loss')
    );

    return (
      weightlossSubs?.find(
        s =>
          s.status === 'active' ||
          s.status === 'scheduled_for_cancelation' ||
          s.status === 'past_due'
      ) || null
    );
  }, [allSubscriptions]);

  const cancelledWeightLossSubscription = useMemo(() => {
    return allSubscriptions?.find(
      sub =>
        ['canceled', 'scheduled_for_cancelation'].includes(sub.status) &&
        sub.subscription_id === 4
    );
  }, [allSubscriptions]);

  const personalizedPsychiatrySubscription = useMemo(() => {
    return subscriptions?.find(s =>
      s.subscription.name.includes('Personalized Psychiatry')
    );
  }, [subscriptions]);

  const hairLossSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('hair loss')
    );
  }, [subscriptions]);

  const edSubscription = useMemo(() => {
    return subscriptions?.some(
      p =>
        p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
          ?.toLowerCase()
          .replace(/\bgeneric\b|\bmedication\b/g, '')
          .trim() === 'ed'
    );
  }, [subscriptions]);

  const birthControlSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('birth control')
    );
  }, [subscriptions]);

  const enclomipheneSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('enclomiphene')
    );
  }, [subscriptions]);

  const preworkoutSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('preworkout')
    );
  }, [subscriptions]);

  const skincareSubscription = useMemo(() => {
    return subscriptions?.some(
      p =>
        p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
          ?.toLowerCase()
          .replace(/\bgeneric\b|\bmedication\b/g, '')
          .includes('acne') ||
        p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
          ?.toLowerCase()
          .replace(/\bgeneric\b|\bmedication\b/g, '')
          .includes('rosacea') ||
        p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
          ?.toLowerCase()
          .replace(/\bgeneric\b|\bmedication\b/g, '')
          .includes('melasma') ||
        p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
          ?.toLowerCase()
          .replace(/\bgeneric\b|\bmedication\b/g, '')
          .includes('anti-aging')
    );
  }, [subscriptions]);

  const menopauseSubscription = useMemo(() => {
    return subscriptions?.some(p =>
      p?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
        ?.toLowerCase()
        .replace(/\bgeneric\b|\bmedication\b/g, '')
        .includes('menopause')
    );
  }, [subscriptions]);

  const [hasPendingRosaceaRequest, setHasPendingRosaceaRequest] =
    useState<boolean>(false);
  const [hasPendingMelasmaRequest, setHasPendingMelasmaRequest] =
    useState<boolean>(false);
  const [hasPendingAcneRequest, setHasPendingAcneRequest] =
    useState<boolean>(false);
  const [hasPendingAntiAgingRequest, setHasPendingAntiAgingRequest] =
    useState<boolean>(false);

  const { data: requests } = usePatientPrescriptionRequest();
  const updateData = useCallback(() => {
    if (Array.isArray(requests)) {
      let hasWeightLossRequest = false;
      requests
        ?.filter(r => r.status !== 'PRE_INTAKES')
        .forEach(request => {
          const medication =
            request?.medication_quantity?.medication_dosage?.medication;

          if (medication?.display_name?.toLowerCase().includes('rosacea')) {
            setHasPendingRosaceaRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('acne')) {
            setHasPendingAcneRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('melasma')) {
            setHasPendingMelasmaRequest(true);
          }
          if (medication?.display_name?.toLowerCase().includes('anti-aging')) {
            setHasPendingAntiAgingRequest(true);
          }
        });
    }
  }, [requests]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  const isOrderRatedBelow5 = orders?.every((order: any) =>
    isRating5Stars(order?.feedback?.rating)
  );
  const isAppointmentRatedBelow5 = patientAppointments?.every((app: any) =>
    isRating5Stars(app?.feedback?.rating)
  );
  const isZealthyRatedBelow5 = patientZealthyRating?.every((rating: any) =>
    isRating5Stars(rating?.score)
  );
  const isCoachRatedBelow5 = patientCoachRatings?.every((rating: any) =>
    isRating5Stars(rating?.review_score)
  );

  const isOrderRated = orders?.some((order: any) => order?.feedback?.rating);
  const isAppointmentRated = patientAppointments?.some(
    (app: any) => app?.feedback?.rating
  );
  const isZealthyRated = patientZealthyRating?.some(
    (rating: any) => rating?.score
  );
  const isCoachRated = patientCoachRatings?.some(
    (rating: any) => rating?.review_score
  );
  const isAnyRated5 =
    isOrderRatedBelow5 &&
    isAppointmentRatedBelow5 &&
    isZealthyRatedBelow5 &&
    isCoachRatedBelow5 &&
    (isOrderRated || isAppointmentRated || isZealthyRated || isCoachRated);

  const handleClick = useCallback(
    async (specificCare: SpecificCareOption) => {
      if (!patient) return;

      if (
        [
          'Rosacea',
          'Hyperpigmentation Dark Spots',
          'Acne',
          'Fine Lines & Wrinkles',
        ]?.includes(specificCare)
      ) {
        addVariant('trending-card-skincare');
        addSpecificCare(specificCare);
      }

      if (specificCare === 'Enclomiphene') {
        addVariant('trending-card-enclomiphene');
        addSpecificCare(specificCare);
      }

      if (specificCare === 'Hair loss') {
        addVariant('trending-card-hair-loss');
        addSpecificCare(specificCare);
      }

      if (specificCare === 'Hair Loss') {
        addVariant('trending-card-hair-loss-f');
        addSpecificCare(specificCare);
      }

      setLoading(true);

      addSpecificCare(specificCare);
      createVisitAndNavigateAway([specificCare]);

      return;
    },
    [addSpecificCare, addVariant, createVisitAndNavigateAway, patient]
  );

  const handleNavigate = useCallback(() => {
    return Router.push('/patient-portal/weight-loss-treatment/compound');
  }, []);

  const userAge = useMemo(
    () => getAgeFromBirthDate(patient?.profiles?.birth_date),
    [patient?.profiles?.birth_date]
  );

  return (
    <Container
      maxWidth="md"
      sx={{
        marginBottom: isMobile ? '60px' : '',
        position: isMobile ? '' : 'relative',
        right: isMobile ? '' : '100px',
      }}
    >
      <Box
        display={isMobile ? '' : 'flex'}
        sx={{ gap: isMobile ? '' : '0.6rem' }}
      >
        <Typography
          variant={isMobile ? 'h1' : 'h2'}
          fontWeight={700}
          sx={{
            fontSize: isMobile ? '32px!important' : '35px!important',
          }}
        >
          {isMobile ? 'Personalized Care' : 'Personalized care'}
        </Typography>
        <Typography
          variant={isMobile ? 'h1' : 'h2'}
          fontWeight={700}
          sx={{
            color: `var(--secondary-contrast, ${
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#008A2E'
                : theme.palette.primary.main
            })`,
            fontSize: isMobile ? '32px!important' : '35px!important',
          }}
        >
          From anywhere
        </Typography>
      </Box>
      <br />
      <Typography
        variant="subtitle1"
        sx={{
          lineHeight: '20px',
          color: ['Zealthy', 'FitRx'].includes(siteName ?? '')
            ? '#00531B'
            : theme.palette.primary.light,
          fontSize: isMobile ? '' : '22px!important',
        }}
      >
        How can we help you?
      </Typography>
      <br />
      <Stack gap="1.5rem">
        {weightLossSubscription ===
        undefined ? null : weightLossSubscription === null &&
          !hasCompletedFreeConsultVisit ? (
          // No active weight loss subscription, show the programs
          <ProgramsCarousel
            content={weightLossPrograms}
            hasActiveWeightLoss={!!weightLossSubscription}
            cancelledWeightLossSubscription={cancelledWeightLossSubscription}
          />
        ) : null}

        {patient?.profiles?.gender === 'male' ? (
          <>
            {edSubscription ? null : (
              <ProgramsCarousel content={edPrograms(patient)} />
            )}
            {enclomipheneSubscription ||
            preworkoutSubscription ? null : patient?.region === 'CA' ? null : (
              <ProgramsCarousel content={performancePrograms} />
            )}
            {personalizedPsychiatrySubscription ? null : (
              <ProgramsCarousel content={mentalHealthPrograms(patient)} />
            )}
          </>
        ) : null}

        {patient?.profiles?.gender === 'female' &&
        !personalizedPsychiatrySubscription ? (
          <ProgramsCarousel content={womenMentalHealthPrograms(patient)} />
        ) : null}
        {!skincareSubscription ? (
          <ProgramsCarousel
            content={skincarePrograms.filter(item => {
              if (item.specificCare === SpecificCareOption.ACNE) {
                return !hasPendingAcneRequest;
              }
              if (item.specificCare === SpecificCareOption.ROSACEA) {
                return !hasPendingRosaceaRequest;
              }
              if (item.specificCare === SpecificCareOption.MELASMA) {
                return !hasPendingMelasmaRequest;
              }
              if (item.specificCare === SpecificCareOption.ANTI_AGING) {
                return !hasPendingAntiAgingRequest;
              }
              return true;
            })}
          />
        ) : null}
        {patient?.profiles?.gender === 'male' && !hairLossSubscription ? (
          <ProgramsCarousel content={hairLossPrograms} />
        ) : null}
        {patient?.profiles?.gender === 'female' && !hairLossSubscription ? (
          <ProgramsCarousel content={femaleHairLossPrograms} />
        ) : null}
        {!menopauseSubscription &&
          patient?.profiles?.gender === 'female' &&
          (userAge > 45 ? (
            <ProgramsCarousel content={menopausePrograms} />
          ) : (
            !birthControlSubscription && (
              <ProgramsCarousel content={birthControlPrograms} />
            )
          ))}
        <ProgramsCarousel content={sleepPrograms} />
        {patient?.profiles.gender === 'male' ? (
          <ProgramsCarousel content={prepPrograms} />
        ) : null}
      </Stack>
      <br />
      <br />
      <Box>
        <Typography
          variant={isMobile ? 'h1' : 'h2'}
          fontWeight={700}
          sx={{
            color: `var(--secondary-contrast, ${
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#008A2E'
                : theme.palette.primary.light
            })`,
            fontSize: isMobile ? '32px!important' : '',
            paddingBottom: '17px',
          }}
        >
          {"Let's Get Started"}
        </Typography>
        <Grid
          container
          direction={isMobile ? 'column' : 'row'}
          spacing={2}
          sx={{ width: isMobile ? '' : '800px' }}
        >
          {weightLossSubscription ? null : (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '0px 10px 0px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() =>
                  !!weightLossSubscription
                    ? handleNavigate()
                    : handleClick(SpecificCareOption.WEIGHT_LOSS)
                }
              >
                <Typography fontWeight={600} fontSize="20px!important">
                  Shed <span style={{ color: '#008A2E' }}>weight</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src={semaglutide}
                    style={{
                      width: '130px',
                      height: '40%',
                    }}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          )}
          {patient?.profiles?.gender === 'male' && !edSubscription ? (
            <Grid item xs={2} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '30px 10px 30px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() =>
                  handleClick(SpecificCareOption.ERECTILE_DYSFUNCTION)
                }
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  sx={{ lineHeight: '25px!important' }}
                >
                  Improve{' '}
                  <span style={{ color: '#5D1BC7' }}>your sex life</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/viagra_pill.svg"
                    style={{
                      width: '130px',
                      height: '80px',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          ) : null}
          {patient?.profiles?.gender === 'male' && !preworkoutSubscription ? (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '7px 10px 16px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() => handleClick(SpecificCareOption.PRE_WORKOUT)}
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  lineHeight="24px!important"
                >
                  Boost <span style={{ color: '#E73939' }}>performance</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/pre-workout-bottle.svg"
                    style={{
                      width: '130px',
                      height: '40%',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          ) : null}
          {patient?.profiles?.gender === 'male' &&
          !enclomipheneSubscription &&
          patient?.region !== 'CA' ? (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '0px 10px 0px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() => handleClick(SpecificCareOption.ENCLOMIPHENE)}
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  sx={{ lineHeight: '25px!important' }}
                >
                  Double your{' '}
                  <span style={{ color: '#137232' }}>testosterone</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/enclom-pill.svg"
                    style={{
                      width: '130px',
                      height: '40%',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          ) : null}
          {personalizedPsychiatrySubscription ? null : (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '0px 10px 0px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() =>
                  handleClick(SpecificCareOption.ASYNC_MENTAL_HEALTH)
                }
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  sx={{ lineHeight: '25px!important' }}
                >
                  Improve{' '}
                  <span style={{ color: '#E38869' }}>mental health</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/fluoxtine-pill.svg"
                    style={{
                      width: '130px',
                      height: '40%',
                      padding: '5px',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          )}
          {!skincareSubscription ? (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '0px 10px 0px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() => handleClick(SpecificCareOption.SKINCARE)}
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  sx={{ textWrap: 'nowrap' }}
                >
                  Get better <span style={{ color: '#1838DE' }}>skin</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/acne-cream.svg"
                    style={{
                      width: '130px',
                      height: '40%',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          ) : null}
          {hairLossSubscription ? null : (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '10px 10px 10px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() =>
                  handleClick(
                    patient?.profiles?.gender === 'male'
                      ? SpecificCareOption.HAIR_LOSS
                      : SpecificCareOption.FEMALE_HAIR_LOSS
                  )
                }
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  sx={{ textWrap: 'nowrap' }}
                >
                  Get fuller <span style={{ color: '#D34343' }}>hair</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="care-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/hair-cream2.svg"
                    style={{
                      width: '140px',
                      height: '110px',
                      position: 'relative',
                      left: '7%',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          )}
          {patient?.profiles?.gender === 'female' &&
            userAge > 45 &&
            !menopauseSubscription && (
              <Grid item xs={6} sm={6}>
                <WhiteBox
                  sx={{
                    justifyContent: 'space-between',
                    height: 'fit-content',
                    alignItems: 'center',
                    padding: '0px 10px 0px 40px',
                    cursor: 'pointer',
                  }}
                  programs={true}
                  compact={true}
                  onClick={() => handleClick(SpecificCareOption.MENOPAUSE)}
                >
                  <Typography
                    fontWeight={600}
                    fontSize="20px!important"
                    sx={{ lineHeight: '25px!important' }}
                  >
                    Personalized{' '}
                    <span style={{ color: '#FFC0CB' }}>menopause</span>
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Image
                      alt="care-image"
                      src="https://api.getzealthy.com/storage/v1/object/public/images/programs/sprintec_pack.svg"
                      style={{
                        width: '120px',
                        height: '130px',
                        marginRight: '20px',
                      }}
                      width={0}
                      height={0}
                    />
                    <IconButton
                      sx={{
                        color: '#777777',
                        padding: '0',
                      }}
                      edge="start"
                    >
                      <ChevronRight fontSize={'large'} />
                    </IconButton>
                  </Box>
                </WhiteBox>
              </Grid>
            )}

          {patient?.profiles?.gender === 'female' &&
            userAge <= 45 &&
            !birthControlSubscription && (
              <Grid item xs={6} sm={6}>
                <WhiteBox
                  sx={{
                    justifyContent: 'space-between',
                    height: 'fit-content',
                    alignItems: 'center',
                    padding: '0px 10px 0px 40px',
                    cursor: 'pointer',
                  }}
                  programs={true}
                  compact={true}
                  onClick={() => handleClick(SpecificCareOption.BIRTH_CONTROL)}
                >
                  <Typography
                    fontWeight={600}
                    fontSize="20px!important"
                    sx={{ lineHeight: '25px!important' }}
                  >
                    Personalized{' '}
                    <span style={{ color: '#CA86DB' }}>birth control</span>
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Image
                      alt="care-image"
                      src="https://api.getzealthy.com/storage/v1/object/public/images/programs/minoxidil-pill.svg"
                      style={{
                        width: '130px',
                        height: '40%',
                      }}
                      width={0}
                      height={0}
                    />
                    <IconButton
                      sx={{
                        color: '#777777',
                        padding: '0',
                      }}
                      edge="start"
                    >
                      <ChevronRight fontSize={'large'} />
                    </IconButton>
                  </Box>
                </WhiteBox>
              </Grid>
            )}
          <Grid item xs={6} sm={6}>
            <WhiteBox
              sx={{
                justifyContent: 'space-between',
                height: 'fit-content',
                alignItems: 'center',
                padding: '0px 10px 0px 40px',
                cursor: 'pointer',
              }}
              programs={true}
              compact={true}
              onClick={() => handleClick(SpecificCareOption.PREP)}
            >
              <Typography
                fontWeight={600}
                fontSize="20px!important"
                sx={{ lineHeight: '25px!important' }}
              >
                <span style={{ color: '#794CAC' }}>Sleep</span> Better
              </Typography>
              <Box display="flex" alignItems="center">
                <Image
                  alt="sleep-image"
                  src="https://api.getzealthy.com/storage/v1/object/public/images/programs/sleep-bottle.svg"
                  style={{ width: '130px', height: '40%' }}
                  width={0}
                  height={0}
                />
                <IconButton
                  sx={{
                    color: '#777777',
                    padding: '0',
                  }}
                  edge="start"
                >
                  <ChevronRight fontSize={'large'} />
                </IconButton>
              </Box>
            </WhiteBox>
          </Grid>
          {patient?.profiles.gender === 'male' && (
            <Grid item xs={6} sm={6}>
              <WhiteBox
                sx={{
                  justifyContent: 'space-between',
                  height: 'fit-content',
                  alignItems: 'center',
                  padding: '0px 10px 0px 40px',
                  cursor: 'pointer',
                }}
                programs={true}
                compact={true}
                onClick={() => handleClick(SpecificCareOption.PREP)}
              >
                <Typography
                  fontWeight={600}
                  fontSize="20px!important"
                  sx={{ lineHeight: '25px!important' }}
                >
                  Get <span style={{ color: '#2C4BA3' }}>PrEP</span>
                </Typography>
                <Box display="flex" alignItems="center">
                  <Image
                    alt="prep-image"
                    src="https://api.getzealthy.com/storage/v1/object/public/images/programs/prep-bottle.svg"
                    style={{
                      width: '130px',
                      height: '40%',
                    }}
                    width={0}
                    height={0}
                  />
                  <IconButton
                    sx={{
                      color: '#777777',
                      padding: '0',
                    }}
                    edge="start"
                  >
                    <ChevronRight fontSize={'large'} />
                  </IconButton>
                </Box>
              </WhiteBox>
            </Grid>
          )}
        </Grid>
      </Box>

      <br />
      <br />
      <Stack gap="1.5rem">
        <Typography
          variant={isMobile ? 'h1' : 'h2'}
          fontWeight={700}
          sx={{
            color: `var(--secondary-contrast, ${
              ['Zealthy', 'FitRx'].includes(siteName ?? '')
                ? '#008A2E'
                : theme.palette.primary.light
            })`,
            fontSize: isMobile ? '32px!important' : '',
          }}
        >
          {'Everyday Favorites'}
        </Typography>
        <EverydayFavoritesCarousel />
      </Stack>
      <br></br>
      {isAnyRated5 ? <RedditPopUp /> : null}
    </Container>
  );
};

export default DiscoverCare;

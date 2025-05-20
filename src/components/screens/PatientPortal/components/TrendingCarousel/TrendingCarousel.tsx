import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import TrendingCard from '../TrendingCard';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import trending1 from '/public/images/trending/trending1.png';
import trending2 from '/public/images/trending/trending2.png';
import trending3 from '/public/images/trending/trending3.png';
import trending4 from '/public/images/trending/trending4.png';
import trending5 from '/public/images/trending/trending5.png';
import trending6 from '/public/images/trending/trending6.png';
import trending7 from '/public/images/trending/trending7.png';
import trending8 from '/public/images/trending/trending8.png';
import trending9 from '/public/images/trending/trending9.png';
import trending10 from '/public/images/trending/trending10.png';
import trending11 from '/public/images/trending/trending11.png';
import trending12 from '/public/images/trending/trending12.png';
import trending13 from 'public/images/trending/trending13';
import trending14 from 'public/images/trending/trending14';
import trending15 from 'public/images/trending/trending15';
import Acne_cream from '/public/images/trending/Acne_cream.png';
import Acne_oral from '/public/images/trending/Acne_oral.png';
import anti_aging from '/public/images/trending/anti-aging.png';
import enclomiphene from 'public/images/trending/enclomiphene.png';
import melasma from 'public/images/trending/Melsma.png';
import Rosacea_cream from 'public/images/trending/roscea.png';
import Rosacea_oral from 'public/images/trending/Rosacea_oral.png';
import citalBottle from 'public/images/trending/cital-bottle.jpg';
import paroxBottle from 'public/images/trending/parox-bottle.jpg';
import escitalBottle from 'public/images/trending/escita-bottle.jpg';
import prepBottle from 'public/images/trending/prep.png';
import ramelteonBottle from 'public/images/trending/ramelteon.png';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { usePatient } from '@/components/hooks/data';
import menopauseGeneric from 'public/images/menopause-generic.png';
import { Pathnames } from '@/types/pathnames';
import { PatientSubscriptionProps } from '@/lib/auth';

interface Props {
  patientRegion: string | null;
  gender?: string | null;
  sfcWeightLoss: boolean;
  cancelledWeightLoss: boolean;
  hasActivePsychiatry: boolean;
  hasBirthControlRequest: boolean;
  hasMenopauseRequest: boolean;
  hasEdRequest: boolean;
  hasHairLossRequest: boolean;
  isBundledWeightLoss: boolean;
  weightLossSubs: PatientSubscriptionProps[];
  weightLossOrders: any;
  hasAcneRequest: boolean;
  hasMelasmaRequest: boolean;
  hasRosaceaRequest: boolean;
  hasAntiAgingRequest: boolean;
  hasEnclomipheneRequest: boolean;
  hasPendingPreworkoutRequest: boolean;
  hasHairLossFRequest: boolean;
}

const onboardingAMHFlow: string[] = ['FL', 'CA', 'PA'];
const isPersonalizedPsychiatryState: string[] = [
  'IL',
  'LA',
  'MN',
  'MO',
  'NC',
  'SC',
  'TX',
  'WI',
  'AL',
  'AZ',
  'CO',
  'CT',
  'GA',
  'NJ',
  'NV',
  'OH',
  'OR',
  'VA',
  'WA',
  'TN',
];

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

const TrendingCarousel = ({
  patientRegion,
  gender,
  sfcWeightLoss,
  cancelledWeightLoss,
  weightLossSubs,
  hasActivePsychiatry,
  hasPendingPreworkoutRequest,
  hasBirthControlRequest,
  hasMenopauseRequest,
  hasEdRequest,
  hasHairLossRequest,
  isBundledWeightLoss,
  weightLossOrders,
  hasAcneRequest,
  hasMelasmaRequest,
  hasRosaceaRequest,
  hasAntiAgingRequest,
  hasEnclomipheneRequest,
  hasHairLossFRequest,
}: Props) => {
  const isMobile = useIsMobile();
  let slides: any = [];
  const { data: patient } = usePatient();

  !(sfcWeightLoss || cancelledWeightLoss) &&
    (!isBundledWeightLoss ||
      (isBundledWeightLoss && weightLossSubs.find(sub => sub.price === 297))) &&
    slides.push({
      header: 'Semaglutide (Active Ingredient in Wegovy)',
      body: `As little as $${isBundledWeightLoss ? '149' : '151'}/mo`,
      img: trending1,
      specificCare: SpecificCareOption.WEIGHT_LOSS,
      path:
        weightLossOrders && weightLossOrders.length > 0 && !isBundledWeightLoss
          ? Pathnames.WL_REFILL_TREATMENT
          : isBundledWeightLoss
          ? `${Pathnames.WL_BUNDLED_TREATMENT}Semaglutide`
          : `${Pathnames.WL_NONBUNDLED_TREATMENT}?med=Semaglutide&quantity=true`,
      isWeightLoss: true,
    });

  !(sfcWeightLoss || cancelledWeightLoss) &&
    (!isBundledWeightLoss ||
      (isBundledWeightLoss && weightLossSubs.find(sub => sub.price === 449))) &&
    slides.push({
      header: 'Tirzepatide (Active Ingredient in Zepbound)',
      body: `As little as $${isBundledWeightLoss ? '239' : '216'}/mo`,
      img: trending2,
      specificCare: SpecificCareOption.WEIGHT_LOSS,
      path:
        weightLossOrders && weightLossOrders.length > 0 && !isBundledWeightLoss
          ? Pathnames.WL_REFILL_TREATMENT
          : isBundledWeightLoss
          ? `${Pathnames.WL_BUNDLED_TREATMENT}Tirzepatide`
          : `${Pathnames.WL_NONBUNDLED_TREATMENT}?med=Tirzepatide&quantity=true`,
      isWeightLoss: true,
    });

  !(sfcWeightLoss || cancelledWeightLoss) &&
    isBundledWeightLoss &&
    weightLossSubs.find(sub => sub.price === 249) &&
    slides.push({
      header: 'Oral Semaglutide (Active Ingredient in Wegovy)',
      body: 'As little as $133/mo',
      img: 'https://api.getzealthy.com/storage/v1/object/public/images/programs/oral_semaglutide.svg',
      isHardie: true, // yes i know its not a hardie but it works :)
      specificCare: SpecificCareOption.WEIGHT_LOSS,
      path: `${Pathnames.WL_BUNDLED_TREATMENT}Oral Semaglutide`,
      isWeightLoss: true,
    });

  const getPsychiatryFlow = (patientRegion: any) => {
    if (isPersonalizedPsychiatryState.includes(patientRegion)) {
      return 'PERSONALIZED_PSYCHIATRY_FLOW';
    } else if (onboardingAMHFlow.includes(patientRegion)) {
      return 'AMH_ONBOARDING_FLOW';
    } else {
      null;
    }
  };

  const userAge = useMemo(
    () => getAgeFromBirthDate(patient?.profiles?.birth_date),
    [patient?.profiles?.birth_date]
  );

  const flow = getPsychiatryFlow(patientRegion);

  const specifiedCareOption =
    flow === 'PERSONALIZED_PSYCHIATRY_FLOW'
      ? SpecificCareOption.ANXIETY_OR_DEPRESSION
      : flow === 'AMH_ONBOARDING_FLOW'
      ? SpecificCareOption.ASYNC_MENTAL_HEALTH
      : null;

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion !== 'CA' &&
    patientRegion !== 'SC' &&
    slides.push({
      header: 'Sildenafil + Tadalafil Hardies',
      body: 'As little as $9/troche',
      img: 'https://api.getzealthy.com/storage/v1/object/public/questions/s-t-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      isWeightLoss: false,
      isHardie: true,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion !== 'CA' &&
    patientRegion !== 'SC' &&
    slides.push({
      header: 'Tadalafil + Vardenafil Hardies',
      body: 'As little as $9/troche',
      img: 'https://api.getzealthy.com/storage/v1/object/public/images/programs/t+v-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      isWeightLoss: false,
      isHardie: true,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion !== 'CA' &&
    patientRegion !== 'SC' &&
    slides.push({
      header: 'Sildenafil + Oyxtocin Hardies',
      body: 'As little as $11/troche',
      img: 'https://api.getzealthy.com/storage/v1/object/public/questions/s-o-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      isWeightLoss: false,
      isHardie: true,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion !== 'CA' &&
    patientRegion !== 'SC' &&
    slides.push({
      header: 'Tadalafil + Oxytocin Hardies',
      body: 'As little as $11/troche',
      img: 'https://api.getzealthy.com/storage/v1/object/public/questions/t-o-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      isWeightLoss: false,
      isHardie: true,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion === 'CA' &&
    slides.push({
      header: 'Sildenafil Hardies',
      body: 'As little as $9/troche',
      img: 'https://api.getzealthy.com/storage/v1/object/public/images/programs/dark-blue-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      isWeightLoss: false,
      isHardie: true,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion === 'CA' &&
    slides.push({
      header: 'Tadalafil Hardies',
      body: 'As little as $9/troche',
      img: 'https://api.getzealthy.com/storage/v1/object/public/images/programs/beige-hardies.svg',
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      potentialInsurance: PotentialInsuranceOption.ED_HARDIES,
      isWeightLoss: false,
      isHardie: true,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion !== 'SC' &&
    slides.push({
      header: 'Sildenafil (Generic Viagra)',
      body: 'As little as $2/pill',
      img: trending8,
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      isWeightLoss: false,
    });

  gender === 'male' &&
    !hasEdRequest &&
    patientRegion !== 'SC' &&
    slides.push({
      header: 'Tadalafil (Generic Cialis)',
      body: 'As little as $2/pill',
      img: trending9,
      specificCare: SpecificCareOption.ERECTILE_DYSFUNCTION,
      isWeightLoss: false,
    });

  !hasActivePsychiatry &&
    slides.push({
      header: 'Fluoxetine (Generic Prozac)',
      body: 'Included in psychiatry membership',
      img: trending3,
      specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
      isWeightLoss: false,
    });

  !hasActivePsychiatry &&
    slides.push({
      header: 'Escitalopram (Generic Lexapro®)',
      body: 'Included in psychiatry membership',
      img: escitalBottle,
      specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
      isWeightLoss: false,
    });

  !hasActivePsychiatry &&
    slides.push({
      header: 'Citalopram (Generic Celexa®)',
      body: 'Included in psychiatry membership',
      img: citalBottle,
      specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
      isWeightLoss: false,
    });

  !hasActivePsychiatry &&
    slides.push({
      header: 'Paroxetine (Generic Paxil®)',
      body: 'Included in psychiatry membership',
      img: paroxBottle,
      specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
      isWeightLoss: false,
    });

  !hasActivePsychiatry &&
    slides.push({
      header: 'Sertraline (Generic Zoloft)',
      body: 'Included in psychiatry membership',
      img: trending4,
      specificCare: SpecificCareOption.ASYNC_MENTAL_HEALTH,
      isWeightLoss: false,
    });

  gender === 'female' &&
    userAge < 45 &&
    !hasBirthControlRequest &&
    slides.push({
      header: 'Sprintec',
      body: 'from $15/month',
      img: trending5,
      specificCare: SpecificCareOption.BIRTH_CONTROL,
      isWeightLoss: false,
    });

  gender === 'female' &&
    userAge < 45 &&
    !hasBirthControlRequest &&
    slides.push({
      header: 'Simpesse',
      body: 'from $15/month',
      img: trending6,
      specificCare: SpecificCareOption.BIRTH_CONTROL,
      isWeightLoss: false,
    });

  gender === 'female' &&
    userAge < 45 &&
    !hasBirthControlRequest &&
    slides.push({
      header: 'blisovi-fe',
      body: 'from $15/month',
      img: trending7,
      specificCare: SpecificCareOption.BIRTH_CONTROL,
      isWeightLoss: false,
    });

  gender === 'female' &&
    userAge >= 45 &&
    !hasMenopauseRequest &&
    slides.push({
      header: 'Menopause (pills, patches, or gel options available)',
      body: 'As little as $1.32/pill',
      img: menopauseGeneric,
      specificCare: SpecificCareOption.MENOPAUSE,
      isWeightLoss: false,
    });

  gender === 'male' &&
    !hasHairLossRequest &&
    slides.push({
      header: 'Finasteride (Generic Propecia)',
      body: 'As little as $1.70/pill',
      img: trending10,
      specificCare: SpecificCareOption.HAIR_LOSS,
      isWeightLoss: false,
    });

  gender === 'male' &&
    !hasHairLossRequest &&
    slides.push({
      header: 'Minoxidil (Generic Rogaine)',
      body: 'As little as $1.50/pill',
      img: trending11,
      specificCare: SpecificCareOption.HAIR_LOSS,
      isWeightLoss: false,
    });

  gender === 'male' &&
    !hasEnclomipheneRequest &&
    patientRegion !== 'CA' &&
    slides.push({
      header: 'Enclomiphene',
      body: 'As little as $3.30/pill',
      img: enclomiphene,
      specificCare: SpecificCareOption.ENCLOMIPHENE,
      isWeightLoss: false,
    });

  gender === 'male' &&
    !hasPendingPreworkoutRequest &&
    slides.push({
      header: 'Performance Protocol',
      body: 'As little as $3.33/troche',
      img: trending12,
      specificCare: SpecificCareOption.PRE_WORKOUT,
      isWeightLoss: false,
      isBottle: true,
    });

  gender === 'male' &&
    !hasHairLossRequest &&
    slides.push({
      header: 'Hair Restore Ultra Scalp Solution',
      body: 'As little as $40/month',
      img: trending13,
      specificCare: SpecificCareOption.HAIR_LOSS,
      isWeightLoss: false,
      isBottle: true,
    });

  gender === 'male' &&
    !hasHairLossRequest &&
    slides.push({
      header: 'Hair Restore Foam Solution',
      body: 'As little as $40/month',
      img: trending14,
      specificCare: SpecificCareOption.HAIR_LOSS,
      isWeightLoss: false,
      isBottle: true,
    });

  !hasAcneRequest &&
    slides.push(
      {
        header: 'Oral Acne treatment',
        body: 'As little as $25/month',
        img: Acne_oral,
        specificCare: SpecificCareOption.ACNE,
        isWeightLoss: false,
      },
      {
        header: 'Prescription Acne cream',
        body: 'As little as $25/month',
        img: Acne_cream,
        specificCare: SpecificCareOption.ACNE,
        isWeightLoss: false,
      }
    );

  !hasAntiAgingRequest &&
    slides.push({
      header: 'Prescription Anti-aging cream',
      body: 'As little as $25/month',
      img: anti_aging,
      specificCare: SpecificCareOption.ANTI_AGING,
      isWeightLoss: false,
    });

  !hasRosaceaRequest &&
    slides.push(
      {
        header: 'Oral Rosacea treatment',
        body: 'As little as $25/month',
        img: Rosacea_oral,
        specificCare: SpecificCareOption.ROSACEA,
        isWeightLoss: false,
      },
      {
        header: 'Prescription Rosacea cream',
        body: 'As little as $25/month',
        img: Rosacea_cream,
        specificCare: SpecificCareOption.ROSACEA,
        isWeightLoss: false,
      }
    );

  !hasMelasmaRequest &&
    slides.push({
      header: 'Prescription Melasma cream',
      body: 'As little as $25/month',
      img: melasma,
      specificCare: SpecificCareOption.MELASMA,
      isWeightLoss: false,
    });

  gender === 'female' &&
    !hasHairLossFRequest &&
    slides.push({
      header: 'Minoxidil (enhances hair regrowth)',
      body: 'As little as $1.50/pill',
      img: trending15,
      specificCare: 'Hair Loss',
      isWeightLoss: false,
    });

  gender === 'female' &&
    !hasHairLossFRequest &&
    slides.push({
      header: 'Hair Strengthening Foam',
      body: 'As little as $90/month',
      img: trending14,
      specificCare: 'Hair Loss',
      isWeightLoss: false,
      isBottle: true,
    });

  gender === 'female' &&
    !hasHairLossFRequest &&
    slides.push({
      header: 'Hair Restore Solution',
      body: 'As little as $90/month',
      img: trending13,
      specificCare: 'Hair Loss',
      isWeightLoss: false,
      isBottle: true,
    });

  slides.push({
    header: 'Ramelteon',
    body: 'As little as $1.95/month',
    img: ramelteonBottle,
    specificCare: SpecificCareOption.SLEEP,
    isWeightLoss: false,
    isBottle: true,
  });

  gender === 'male' &&
    slides.push({
      header: 'PrEP',
      body: 'As little as $0/month',
      img: prepBottle,
      specificCare: SpecificCareOption.PREP,
      isWeightLoss: false,
      isBottle: true,
    });

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        py: 1,
        overflow: 'auto',
        width: `${isMobile ? '340px' : '480px'}`,
        scrollSnapType: 'x mandatory',
        '& > *': {
          scrollSnapAlign: 'center',
        },
        '::-webkit-scrollbar': {
          display: isMobile ? 'none' : '',
          color: 'black',
        },
      }}
    >
      {slides.map((item: any, i: number) => (
        <TrendingCard
          src={item}
          key={i}
          specificCare={item.specificCare}
          newWindow={false}
          hasActiveWeightLoss={weightLossSubs.length > 0}
          isWeightLoss={item.isWeightLoss}
          isBottle={item.isBottle}
          potentialInsurance={item.potentialInsurance}
        />
      ))}
    </Box>
  );
};

export default TrendingCarousel;

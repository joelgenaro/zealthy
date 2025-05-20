import { Container, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import PatientProfileForm from './components/PatientProfileForm';
import { ProfileInfo, useProfileAsync } from '@/components/hooks/useProfile';
import { PatientInfo, usePatientAsync } from '@/components/hooks/usePatient';
import UsStates from '@/constants/us-states';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useVisitActions } from '@/components/hooks/useVisit';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { usePayment } from '@/components/hooks/usePayment';
import {
  useLanguage,
  usePatient,
  usePatientIntakes,
} from '@/components/hooks/data';
import { useIdentityEvent } from '@/components/hooks/useIdentityEvent';
import ZealthyGLP1 from 'public/images/ZealthyGLP1.png';
import Image from 'next/image';
import { useVWO } from '@/context/VWOContext';
import { shouldActivate6031 } from '@/utils/vwo-utils/activationCondition';
import { useABTest } from '@/context/ABZealthyTestContext';
import { WeightLossSpanishStartEvent } from '@/utils/freshpaint/events';
import { useVWOVariationName } from '@/components/hooks/data';
import VWOClient from '@/lib/vwo/client';

export default function PatientProfile() {
  const [error, setError] = useState('');
  const { data: patient } = usePatient();

  const updateProfile = useProfileAsync();
  const { updatePatient } = usePatientAsync();
  const { ilvEnabled, specificCare, potentialInsurance, variant } =
    useIntakeState();
  const { addSpecificCare, addVariant } = useIntakeActions();
  const { resetQuestionnaires } = useVisitActions();
  const { createStripeCustomer } = usePayment();
  const sendIdentity = useIdentityEvent();
  const vwo = useVWO();
  const language = useLanguage();
  const { data: patientIntakes } = usePatientIntakes();
  const { data: variation8201 } = useVWOVariationName('8201');

  const ABZTest = useABTest();

  const isActive = patient?.status === 'ACTIVE';

  const hasWeightLossIntakes = patientIntakes?.some(
    i =>
      i.specific_care?.toLowerCase().includes('weight loss') &&
      i.status === 'Completed'
  );

  useEffect(() => {
    if (!specificCare) {
      const storedSpecificCare = localStorage.getItem('specificCare');
      if (storedSpecificCare) {
        addSpecificCare(storedSpecificCare as SpecificCareOption);
      } else {
      }
    } else {
    }
  }, [specificCare, addSpecificCare]);

  useEffect(() => {
    if (specificCare && specificCare == 'Weight loss') {
      window.freshpaint?.track('weight-loss-complete-profile-page');
    }
  }, [specificCare]);

  useEffect(() => {
    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT &&
      process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ) {
      window.freshpaint?.track('wl-free-consult-lead');
    }
  }, [specificCare]);

  useEffect(() => {
    window.freshpaint?.track('complete-profile-page');
  }, []);

  const state = useMemo(
    () => UsStates.find(s => s.abbreviation === patient?.region),
    [patient?.region]
  );

  const title = useMemo(() => {
    if (isActive) {
      return "Let's confirm your personal details.";
    }

    if (specificCare === SpecificCareOption.WEIGHT_LOSS && variant === '2410') {
      return 'Congratulations! Our GLP-1 prescription plan is available in your area.';
    }
    if (language === 'esp') {
      return '¡Estamos disponibles en tu área!';
    }
    return 'We’re available in your area!';
  }, [isActive, specificCare, variant, language]);

  const description = useMemo(() => {
    if (isActive) {
      return 'To continue, we need you to confirm your personal details so that you can get started on a new treatment plan.';
    }

    if (specificCare === SpecificCareOption.WEIGHT_LOSS && variant === '2410') {
      return 'Enter your info to get your results & get started now.';
    }

    if (potentialInsurance === PotentialInsuranceOption.BLUE_CROSS_ILLINOIS) {
      return 'We are available to provide in-network care for Blue Cross Blue Shield of Illinois members. Next, we’ll need some personal information to get you started.';
    }

    if (language === 'esp') {
      return `¡Buenas noticias! Estamos disponibles para brindar atención en ${state?.name}. Necesitaremos algunos datos personales antes de comenzar.`;
    } else {
      return `Good news! We are available to provide care in ${state?.name}. Next, we’ll need some personal information to get you started.`;
    }
  }, [
    isActive,
    potentialInsurance,
    specificCare,
    state?.name,
    variant,
    language,
  ]);

  useEffect(() => {
    const isBundled = [
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT);

    sessionStorage.setItem('isBundled', isBundled.toString());
  }, [potentialInsurance]);

  const updateUser = useCallback(
    async (profileInfo: ProfileInfo, patientInfo: PatientInfo) => {
      if (!profileInfo.first_name || !profileInfo.last_name) {
        setError('Please enter your first and last name.');
        return;
      }

      const promises: Promise<any>[] = [
        updateProfile(profileInfo),
        sendIdentity(profileInfo, patientInfo.text_me_update),
        updatePatient(patientInfo),
      ];

      if (
        patient &&
        specificCare &&
        specificCare == 'Weight loss' &&
        language === 'esp'
      ) {
        WeightLossSpanishStartEvent(
          patient?.profiles?.first_name,
          patient?.profiles?.last_name,
          patient?.profiles?.phone_number,
          patient?.profiles?.email
        );
      }

      if (patient) {
        promises.push(
          createStripeCustomer({
            id: patient.id,
            region: patient.region!,
            fullName: `${profileInfo.first_name} ${profileInfo.last_name}`,
            email: profileInfo.email!,
          })
        );
        ABZTest.assignVariation(
          '99',
          patient.profile_id,
          profileInfo.first_name!,
          profileInfo.last_name!
        );
      }

      if (
        patient &&
        ['IN', 'NC', 'NV'].includes(patient.region || '') &&
        language !== 'esp' &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        await vwo.activateBefore('Clone_6775', {
          userId: patient?.profile_id || '',
          patientId: patient?.id,
          firstName: profileInfo.first_name!,
          lastName: profileInfo.last_name!,
        });
      }

      if (
        patient &&
        ['CT', 'MN', 'NV'].includes(patient.region || '') &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        await vwo.activateBefore('7895', {
          userId: patient?.profile_id || '',
          patientId: patient?.id,
          firstName: profileInfo.first_name!,
          lastName: profileInfo.last_name!,
        });
      }

      if (
        patient &&
        ['MO', 'MT', 'OR', 'SC', 'AL', 'ID'].includes(patient.region || '') &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('8201', {
            userId: patient.profile_id || '',
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        language === 'esp' &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        vwo.activateBefore('Clone_6775_2', {
          userId: patient?.profile_id || '',
          patientId: patient?.id,
          firstName: profileInfo.first_name!,
          lastName: profileInfo.last_name!,
        });
      }

      if (patient && ['MO'].includes(patient.region || '')) {
        promises.push(
          vwo.activateBefore('Clone_4687', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['CA', 'FL', 'TX'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('4624', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.PRIMARY_CARE &&
        !specificCare?.toLowerCase().includes('weight loss') &&
        !hasWeightLossIntakes
      ) {
        promises.push(
          vwo.activateBefore('6822-3', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['MD', 'MI', 'MN', 'MO', 'MT', 'NC'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('8284', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['FL', 'KS', 'OR', 'AZ', 'IA', 'TX', 'PA', 'OH'].includes(
          patient.region || ''
        )
      ) {
        promises.push(
          vwo.activateBefore('7752', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['IL', 'TX', 'VA', 'WI'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('5483', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.ERECTILE_DYSFUNCTION &&
        ['OK', 'OR', 'SC', 'TN', 'TX', 'UT', 'VA', 'WA', 'WI'].includes(
          patient.region || ''
        )
      ) {
        promises.push(
          vwo.activateBefore('5483-2', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        !['FL', 'TX'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('7050', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['FL', 'TX'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('6888', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['OR', 'SC', 'TN', 'CA', 'CT', 'GA', 'IN'].includes(
          patient.region || ''
        )
      ) {
        promises.push(
          vwo.activateBefore('8288', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['CA', 'MN'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('5777', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        [
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        [
          'MO',
          'NC',
          'NJ',
          'OH',
          'OR',
          'PA',
          'SC',
          'TN',
          'UT',
          'TX',
          'VA',
          'WA',
        ].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('7742', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT) &&
        ['NC', 'VA', 'WA'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('4601', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (patient && specificCare === SpecificCareOption.SLEEP) {
        promises.push(
          vwo.activateBefore('7766', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }
      if (
        patient &&
        potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED
      ) {
        promises.push(
          vwo.activateBefore('4004', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          }),
          vwo.activateBefore('4313', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (patient?.region === 'CA') {
        promises.push(
          vwo.activateBefore('3596', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        patient?.region !== 'CA'
      ) {
        promises.push(
          vwo.activateBefore('4022', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient?.region &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        !['OH', 'IN', 'IL', 'TX', 'FL'].includes(patient.region)
      ) {
        promises.push(
          vwo.activateBefore('4287', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        ['CA', 'OR', 'WA']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('4918', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        shouldActivate6031({
          patientRegion: patient?.region!,
          careOption: specificCare,
          insuranceOption: potentialInsurance,
        })
      ) {
        promises.push(
          vwo.activateBefore('6031', {
            userId: patient?.profile_id || '',
            patientId: patient?.id || 0,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['LA', 'WI']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('5071', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }
      if (
        patient &&
        ['KY']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('5751', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['SC', 'NV', 'OR', 'CT', 'CO']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('4935', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }
      if (
        patient &&
        ['VA', 'WA']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('5484', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['TN', 'FL', 'OH', 'OK', 'OR']?.includes(patient.region || '') &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('6140', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['IL', 'KY']?.includes(patient.region || '') &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('4798', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['IL'].includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('6826', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['IN', 'NC', 'GA', 'AZ', 'MN', 'TX']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo
            .activateBefore('6792', {
              userId: patient?.profile_id || '',
              patientId: patient?.id,
              firstName: profileInfo.first_name!,
              lastName: profileInfo.last_name!,
            })
            .then(v => {
              if (v) addVariant(`6792-${v}`);
            })
        );
      }

      if (
        patient &&
        ['IA', 'NV', 'NM']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('7743', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['TN', 'GA', 'AZ', 'MN']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS
      ) {
        promises.push(
          vwo.activateBefore('5867', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['CA', 'TX']?.includes(patient?.region!) &&
        [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED].includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      ) {
        promises.push(
          vwo.activateBefore('5481', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['FL', 'CO', 'IL', 'KS', 'LA']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS
      ) {
        promises.push(
          vwo.activateBefore('7458', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['SC', 'TN', 'TX', 'NJ', 'PA', 'WA', 'OR']?.includes(
          patient?.region!
        ) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED
      ) {
        promises.push(
          vwo.activateBefore('7930', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['GA', 'IN', 'KS']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('7935', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['KY', 'WI', 'FL']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('6337', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        !['CA', 'FL', 'IL', 'MN', 'SC']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION
      ) {
        promises.push(
          vwo.activateBefore('7153_01', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.ENCLOMIPHENE &&
        profileInfo.gender === 'male' &&
        ![
          'TX',
          'IL',
          'PA',
          'GA',
          'SC',
          'OK',
          'LA',
          'MA',
          'MD',
          'MI',
          'MN',
          'MO',
        ]?.includes(patient?.region!)
      ) {
        promises.push(
          vwo.activateBefore('8205', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['AZ', 'CO', 'WA', 'KY', 'NV', 'CT', 'FL']?.includes(
          patient?.region!
        ) &&
        specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION
      ) {
        promises.push(
          vwo.activateBefore('7865_2', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['TX', 'IL', 'PA', 'GA', 'SC', 'OK']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.ENCLOMIPHENE
      ) {
        promises.push(
          vwo.activateBefore('7865_3', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['PA', 'SC', 'TN']?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        const varName = await vwo.activateBefore('5871_new', {
          userId: patient?.profile_id || '',
          patientId: patient?.id,
          firstName: profileInfo.first_name!,
          lastName: profileInfo.last_name!,
        });
        if (varName === 'Control') {
          await ABZTest.assignVariation(
            '5871_new',
            patient.profile_id,
            'zTEST',
            'zzzTEST'
          );
        } else if (varName === 'Variation-1') {
          await ABZTest.assignVariation(
            '5871_new',
            patient.profile_id,
            'zzTEST',
            'zzzTEST'
          );
        }
      }

      if (
        patient &&
        ['CO', 'IN', 'LA', 'NJ', 'SC', 'WI', 'TN', 'CT']?.includes(
          patient?.region!
        ) &&
        [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED].includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      ) {
        promises.push(
          vwo.activateBefore('15685', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('7960', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['MA', 'MD', 'MS'].includes(patient.region || '') &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        ![
          PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
          PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
        ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
      ) {
        promises.push(
          vwo.activateBefore('7380', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['TX', 'CA', 'IA', 'SC', 'UT', 'OH'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('7746-2', {
            userId: patient?.profile_id,
            patientId: patient.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['AK', 'AR', 'AZ', 'CA', 'CO', 'CT', 'FL', 'GA', 'IA', 'IL']?.includes(
          patient?.region!
        ) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        [PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED].includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      ) {
        promises.push(
          vwo.activateBefore('8676', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['TX', 'UT', 'VA', 'WA', 'WI'].includes(patient.region || '')
      ) {
        promises.push(
          vwo.activateBefore('8552', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        [
          'FL',
          'GA',
          'IA',
          'IL',
          'IN',
          'KS',
          'KY',
          'LA',
          'MA',
          'MD',
          'MI',
          'MN',
          'TN',
          'TX',
          'UT',
          'VA',
          'WA',
          'WI',
        ]?.includes(patient?.region!) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        [PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED].includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      ) {
        promises.push(
          vwo.activateBefore('9057_1', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['TN', 'TX', 'UT', 'VA', 'WA', 'WI', 'WV']?.includes(
          patient?.region!
        ) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        [PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED].includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      ) {
        promises.push(
          vwo.activateBefore('9057_2', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      if (
        patient &&
        ['FL', 'GA', 'IA', 'IL', 'IN', 'KS', 'KY']?.includes(
          patient?.region!
        ) &&
        specificCare === SpecificCareOption.WEIGHT_LOSS &&
        [PotentialInsuranceOption.TIRZEPATIDE_BUNDLED].includes(
          potentialInsurance || PotentialInsuranceOption.DEFAULT
        )
      ) {
        promises.push(
          vwo.activateBefore('9057_3', {
            userId: patient?.profile_id || '',
            patientId: patient?.id,
            firstName: profileInfo.first_name!,
            lastName: profileInfo.last_name!,
          })
        );
      }

      await Promise.all(promises).catch(error => {
        console.error('update_user_err', error);
        setError('Something went wrong, please try again.');
      });
    },
    [
      createStripeCustomer,
      patient,
      potentialInsurance,
      sendIdentity,
      specificCare,
      updatePatient,
      updateProfile,
      vwo,
    ]
  );
  console.log('specificCarde======', specificCare);
  console.log('potentialInsuarance====', potentialInsurance);

  useEffect(() => {
    if (
      !ilvEnabled &&
      specificCare === SpecificCareOption.VIRTUAL_URGENT_CARE
    ) {
      resetQuestionnaires();
      addSpecificCare(SpecificCareOption.PRIMARY_CARE);
    }
  }, [addSpecificCare, ilvEnabled, resetQuestionnaires, specificCare]);

  return (
    <Container maxWidth="sm">
      <Grid container direction="column" gap={{ sm: '48px', xs: '32px' }}>
        <Grid container direction="column" gap="16px" alignItems="center">
          <Typography variant="h2">{title}</Typography>
          {specificCare === SpecificCareOption.WEIGHT_LOSS &&
            variant === '2410' && (
              <Image src={ZealthyGLP1} alt="Zealthy GLP1" width="297" />
            )}
          <Typography alignSelf="flex-start">{description}</Typography>
        </Grid>
        <PatientProfileForm
          updateUser={updateUser}
          error={error}
          setError={setError}
          isActive={isActive}
        />
      </Grid>
    </Container>
  );
}

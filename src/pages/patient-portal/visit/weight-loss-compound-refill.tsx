import Head from 'next/head';
import { ReactElement, useEffect } from 'react';
import Loading from '@/components/shared/Loading/Loading';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import {
  useVisitActions,
  useVisitAsync,
  useVisitState,
} from '@/components/hooks/useVisit';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import Router from 'next/router';
import { Pathnames } from '@/types/pathnames';
import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import {
  SpecificCareOption,
  PotentialInsuranceOption,
} from '@/context/AppContext/reducers/types/intake';
import { getAuthProps } from '@/lib/auth';
import { useIsBundled, usePatient } from '@/components/hooks/data';
import { useVWO } from '@/context/VWOContext';
import { useABTest } from '@/context/ABZealthyTestContext';
import React from 'react';

const WeightLossRefillPage = () => {
  const { id: visitID, questionnaires } = useVisitState();
  const { createOnlineVisit } = useVisitAsync();
  const { specificCare, potentialInsurance } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();
  const { data: patient } = usePatient();
  const { data: isBundled } = useIsBundled();
  const ABZTest = useABTest();
  const vwo = useVWO();

  useEffect(() => {
    if (isBundled) {
      resetQuestionnaires();

      Router.push('/patient-portal/visit/weight-loss-refill');
    }
  }, [isBundled]);

  useEffect(() => {
    if (isBundled === false) {
      resetQuestionnaires();
      addCare({
        care: {
          careSelections: [],
          other: '',
        },
      });
      addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    }
  }, []);

  async function createVisit() {
    await createOnlineVisit(false);
    addQuestionnaires(mapCareToQuestionnaires(['Weight Loss Compound Refill']));
  }

  async function addABUser() {
    if (
      isBundled === false &&
      patient &&
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      ![
        PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
        PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
        PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
      ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
    ) {
      await ABZTest.assignVariation(
        '6465_new',
        patient.profile_id,
        patient.profiles.first_name!,
        patient.profiles.last_name!
      );
    }
  }

  useEffect(() => {
    addABUser();
  }, []);

  useEffect(() => {
    if (
      isBundled === false &&
      !questionnaires.length &&
      specificCare === SpecificCareOption.WEIGHT_LOSS
    ) {
      createVisit();
    }
  }, [questionnaires, specificCare, isBundled]);

  useEffect(() => {
    if (
      isBundled === false &&
      visitID &&
      questionnaires.length > 0 &&
      specificCare === SpecificCareOption.WEIGHT_LOSS
    ) {
      Router.push(Pathnames.PATIENT_PORTAL_QUESTIONNAIRES);
    }
  }, [visitID, specificCare, questionnaires, isBundled]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Loading />
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLossRefillPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossRefillPage;

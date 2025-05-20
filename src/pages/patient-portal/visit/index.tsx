import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useEffect } from 'react';
import { useIntakeSelect } from '@/components/hooks/useIntake';
import { Pathnames } from '@/types/pathnames';
import Loading from '@/components/shared/Loading/Loading';
import { useReasonForVisit } from '@/components/hooks/useReasonForVisit';
import {
  useVisitActions,
  useVisitAsync,
  useVisitSelect,
} from '@/components/hooks/useVisit';
import {
  IntakeState,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { VisitState } from '@/context/AppContext/reducers/types/visit';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import getConfig from '../../../../config';

const selectQuestionnaire = (visit: VisitState) => visit.questionnaires[0];
const selectIsSync = (visit: VisitState) => visit.isSync;
const selectSpecificCare = (intake: IntakeState) => intake.specificCare;

const Visit = () => {
  const specificCare = useIntakeSelect(selectSpecificCare);
  const reasons = useReasonForVisit();
  const questionnaire = useVisitSelect(selectQuestionnaire);
  const isSync = useVisitSelect(selectIsSync);
  const { createOnlineVisit } = useVisitAsync();
  const { addCare } = useVisitActions();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (
      !specificCare ||
      specificCare === SpecificCareOption.ANXIETY_OR_DEPRESSION ||
      specificCare === SpecificCareOption.PRIMARY_CARE
    ) {
      Router.push(Pathnames.PATIENT_PORTAL_CARE_SELECTION);
      return;
    }

    if (!reasons.length) return;

    const careSelected = reasons.find(
      r => r.reason.toLocaleLowerCase() === specificCare.toLocaleLowerCase()
    );

    if (careSelected) {
      addCare({ care: { careSelections: [careSelected], other: '' } });
    } else {
      Router.push(Pathnames.CARE_SELECTION);
      return;
    }
  }, [addCare, reasons, reasons.length, specificCare]);

  useEffect(() => {
    if (questionnaire) {
      createOnlineVisit().then(() => {
        if (isSync) {
          Router.push(Pathnames.PATIENT_PORTAL_SCHEDULE_VISIT);
          return;
        } else if (!!questionnaire) {
          Router.push(
            `${Pathnames.PATIENT_PORTAL_QUESTIONNAIRES}/${questionnaire.name}`
          );
          return;
        } else {
          Router.push(Pathnames.WHAT_NEXT);
          return;
        }
      });
    }
  }, [questionnaire, createOnlineVisit, isSync]);

  return (
    <>
      <Head>
        <title>{siteName} Visit</title>
      </Head>
      <Loading />
    </>
  );
};

Visit.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default Visit;

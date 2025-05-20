import { useIntakeActions, useIntakeState } from '@/components/hooks/useIntake';
import { useVisitActions, useVisitAsync } from '@/components/hooks/useVisit';
import InformationModal from '@/components/shared/InformationModal';
import Loading from '@/components/shared/Loading/Loading';
import { PatientStatus } from '@/context/AppContext/reducers/types/patient';
import { ReasonForVisit } from '@/context/AppContext/reducers/types/visit';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { getAuthProps } from '@/lib/auth';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import { mapCareToQuestionnaires } from '@/utils/mapCareToQuestionnaire';
import { postCheckoutNavigation } from '@/utils/postCheckoutNavigation';
import { preCheckoutNavigation } from '@/utils/precheckoutNavigation';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import Router from 'next/router';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  AnswerItem,
  AnswerState,
} from '@/context/AppContext/reducers/types/answer';
import { useAnswerActions } from '@/components/hooks/useAnswer';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { PatientSubscriptionProps } from '@/components/hooks/data';
import { CoachingType } from '@/context/AppContext/reducers/types/coaching';
import { useCoachingActions } from '@/components/hooks/useCoaching';
import { JumpAheadModal } from '@/components/shared/modals';
import { differenceInDays } from 'date-fns';
import { usePatientAsync } from '@/components/hooks/usePatient';
import WeightLossRedirectPopup from '@/components/screens/PatientPortal/components/WeightLossRedirectPopup';
import getConfig from '../../config';
import axios from 'axios';
import { useProfileState } from '@/components/hooks/useProfile';
import { useVWOVariationName } from '@/components/hooks/data';

const calculateCare = (
  care: string[],
  potentialInsurance: PotentialInsuranceOption
) => {
  if (
    care.includes('Weight loss') &&
    [
      PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
      PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
      PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
    ].includes(potentialInsurance)
  ) {
    return ['Weight loss bundled'];
  }

  if (
    care.includes('Erectile dysfunction') &&
    [PotentialInsuranceOption.ED_HARDIES].includes(potentialInsurance)
  ) {
    return ['ED hardies'];
  }

  return care;
};

const activeIshStatuses = ['ACTIVE', 'SUSPENDED'];

const siteName = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
).name;

const mapStatusToPath: { [key in PatientStatus]: Pathnames } = {
  [PatientStatus.LEAD]:
    siteName === 'Zealthy' || siteName === 'FitRx'
      ? Pathnames.REGION_SCREEN
      : Pathnames.REGION_SCREEN_ZP,
  [PatientStatus.PROFILE_CREATED]: Pathnames.COMPLETE_PROFILE,
  [PatientStatus.PAYMENT_SUBMITTED]: Pathnames.POST_CHECKOUT_INTAKES,
  [PatientStatus.ACTIVE]: Pathnames.PATIENT_PORTAL,
  [PatientStatus.SUSPENDED]: Pathnames.PATIENT_PORTAL,
};

type Patient = Database['public']['Tables']['patient']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ActivePrescriptions = {
  order: {
    prescription: {
      medication_quantity: {
        medication_dosage: {
          medication: {
            display_name: string;
          };
        };
      };
    };
  };
};

type OnlineVisit = {
  id: number;
  status: Database['public']['Tables']['online_visit']['Row']['status'];
  isSync: boolean;
  careSelected: ReasonForVisit[];
  intakes: IntakeType[];
  potential_insurance?: PotentialInsuranceOption;
  specific_care?: SpecificCareOption;
  variant?: string;
  paid_at: string;
};

const VISIT_QUERY = `
  id,
  status,
  isSync: synchronous,
  careSelected: reason_for_visit(id, reason, synchronous),
  intakes,
  potential_insurance,
  specific_care,
  variant,
  paid_at
`;

type AnswerResponse = {
  created_at: string | null;
  questionnaire_name: string;
  response: {
    canvas_id: string;
    codingSystem: string;
    items: AnswerItem[];
  };
  submitted: boolean;
  submitted_by: string | null;
  visit_id: number;
};

interface AuthTransitionProps {
  patient: Patient | null;
  profile: Profile | null;
}

const AuthTransition = ({ patient, profile }: AuthTransitionProps) => {
  const supabase = useSupabaseClient<Database>();
  // const { data: wlSub, status: subStatus } = useActiveWeightLossSubscription();
  // const { data: intakes, status: intakeStatus } = usePatientIntakes();
  const { specificCare, potentialInsurance, variant } = useIntakeState();
  const { setAnswers } = useAnswerActions();
  const { addCoaching } = useCoachingActions();
  const [visit, setVisit] = useState<OnlineVisit | null>(null);
  const [title, setTitle] = useState('');
  const { updateVisit } = useVisitActions();
  const { addPotentialInsurance, addSpecificCare, addVariant } =
    useIntakeActions();
  const { updatePatient } = usePatientAsync();
  const redirect = Router.query.redirect;
  const [openPendingVisitModal, setOpenPendingVisitModal] = useState(false);
  const [openCompletedVisitModal, setOpenCompletedVisitModal] = useState(false);
  const [openCompletedAsyncModal, setOpenCompletedAsyncModal] = useState(false);
  const [openPaidWeightLossModal, setOpenPaidWeightLossModal] = useState(false);
  const [showWlRedirectPopup, setShowWlRedirectPopup] = useState(false);
  const { first_name, last_name } = useProfileState();
  const { data: variation8201 } = useVWOVariationName('8201');

  // const queryParamSpecificCare = Array.isArray(Router.query.specificCare)
  //   ? Router.query.specificCare[0]
  //   : Router.query.specificCare || '';

  // const freeConsultIntake = useMemo(() => {
  //   return intakes?.find((i) => i.specific_care === 'Weight Loss Free Consult');
  // }, [intakes]);

  // useEffect(() => {
  //   if (
  //     specificCare === SpecificCareOption.WEIGHT_LOSS &&
  //     !!freeConsultIntake
  //   ) {
  //     Router.push(Pathnames.PATIENT_PORTAL);
  //     return;
  //   } else if (
  //     ['Weight loss', 'Weight Loss Free Consult'].includes(
  //       specificCare || queryParamSpecificCare || ''
  //     ) &&
  //     wlSub
  //   ) {
  //     sessionStorage.setItem('showWlRedirectPopup', 'true');
  //     Router.push(Pathnames.PATIENT_PORTAL);
  //     return;
  //   }
  // }, [subStatus, intakeStatus, wlSub, freeConsultIntake, specificCare]);

  const handleAnswers = useCallback(
    async (visitId: number) => {
      const responses = await supabase
        .from('questionnaire_response')
        .select('*')
        .eq('visit_id', visitId)
        .then(({ data }) => (data || []) as unknown as AnswerResponse[]);

      const answers = responses
        .map(r => r.response.items)
        .flat()
        .reduce((acc, item) => {
          acc[item.name] = item;
          return acc;
        }, {} as AnswerState);
      setAnswers(answers);
      return answers;
    },
    [setAnswers, supabase]
  );

  const { updateOnlineVisit } = useVisitAsync();

  const handlePaidVisit = useCallback(async () => {
    if (!visit) return;

    const firstIntake = visit.intakes.filter(i => i.entry !== null)[0];
    await handleAnswers(visit.id);
    addPotentialInsurance(visit?.potential_insurance || null);
    addSpecificCare(visit?.specific_care || null);
    addVariant(visit?.variant || null);
    updateVisit({
      isSync: visit.isSync,
      id: visit.id,
      intakes: visit.intakes,
      questionnaires: [],
      selectedCare: {
        careSelections: visit.careSelected,
        other: '',
      },
    });

    const nextPage = postCheckoutNavigation(firstIntake);

    if (nextPage.includes('weight-loss-4758-post/WEIGHT_L_POST_Q20')) {
      return Router.push(
        '/post-checkout/questionnaires-v2/weight-loss-post/WEIGHT_L_POST_Q20'
      );
    }

    return Router.push(nextPage);
  }, [handleAnswers, updateVisit, visit]);

  const handleCompletedVisit = useCallback(() => {
    return Router.push(Pathnames.MESSAGES);
  }, []);

  const handleWeightLossComplete = useCallback(async () => {
    if (!visit) return;
    await Promise.all([
      updateOnlineVisit({
        status: 'Completed',
        completed_at: new Date().toISOString(),
      }),

      updatePatient({
        status: 'ACTIVE',
        has_completed_onboarding: true,
      }),
    ]);
    return Router.push(Pathnames.PATIENT_PORTAL);
  }, [updateOnlineVisit, visit]);

  const calculatePotentialInsurance = useCallback(
    (patient: Patient, weightLossSub: PatientSubscriptionProps | undefined) => {
      if (patient?.region === 'OH') {
        addPotentialInsurance(PotentialInsuranceOption.OH);
        return;
      }

      if (weightLossSub?.price === 297) {
        addPotentialInsurance(PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED);
        return;
      }

      if (weightLossSub?.price === 449) {
        addPotentialInsurance(PotentialInsuranceOption.TIRZEPATIDE_BUNDLED);
        return;
      }

      if (weightLossSub?.price === 249) {
        addPotentialInsurance(
          PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED
        );
      }

      return;
    },
    [addPotentialInsurance]
  );

  const calculateWeightLossName = useCallback(
    (weightLossSub: PatientSubscriptionProps) => {
      if (weightLossSub.price === 297) {
        return 'Zealthy Weight Loss + Semaglutide Program';
      }

      if (weightLossSub.price === 449) {
        return 'Zealthy Weight Loss + Tirzepatide Program';
      }

      return weightLossSub.subscription.name;
    },
    []
  );

  const getVisits = useCallback(
    async (patient: Patient) => {
      return supabase
        .from('online_visit')
        .select(VISIT_QUERY)
        .eq('patient_id', patient!.id)
        .neq('status', 'Canceled')
        .order('created_at', { ascending: false })
        .then(({ data }) => (data || []) as OnlineVisit[]);
    },
    [supabase]
  );
  const getPrescriptions = useCallback(
    async (patient: Patient) => {
      return supabase
        .from('patient_prescription')
        .select(
          `order(prescription(medication_quantity(medication_dosage(medication(*)))))`
        )
        .eq('patient_id', patient!.id)
        .or('status.eq.active, status.eq.scheduled_for_cancelation')
        .then(
          ({ data }) =>
            (data as ActivePrescriptions[]) || ([] as ActivePrescriptions[])
        );
    },
    [supabase]
  );
  const getSubscriptions = useCallback(
    async (patient: Patient) => {
      return supabase
        .from('patient_subscription')
        .select(`*, subscription!inner(*)`)
        .eq('patient_id', patient.id)
        .or('status.eq.active, status.eq.scheduled_for_cancelation')
        .then(({ data }) => (data || []) as PatientSubscriptionProps[]);
    },
    [supabase]
  );

  useEffect(() => {
    async function redirectUser() {
      // got to region page to create patient
      if (!patient)
        return Router.push(
          siteName === 'Zealthy' || siteName === 'FitRx'
            ? Pathnames.REGION_SCREEN
            : Pathnames.REGION_SCREEN_ZP
        );

      const patientEmail = await supabase
        .from('profiles')
        .select('email')
        .eq('id', patient.profile_id)
        .single()
        .then(({ data }) => data?.email);

      await axios.post(`/api/cio/merge-duplicate`, {
        profileId: patient.profile_id,
        email: patientEmail,
      });

      const visits = await getVisits(patient);

      const activePrescriptions = await getPrescriptions(patient);
      const activeSubscriptions = await getSubscriptions(patient);

      const weightLossSub = activeSubscriptions.find(s =>
        s.subscription.name.includes('Weight Loss')
      );

      if (
        ['erectile dysfunction', 'birth control', 'hair loss'].includes(
          specificCare?.toLowerCase() || ''
        )
      ) {
        if (
          activePrescriptions.some((p: ActivePrescriptions) =>
            p.order?.prescription?.medication_quantity?.medication_dosage?.medication?.display_name
              ?.toLowerCase()
              .replace(/\bgeneric\b|\bmedication\b/g, '')
              .includes(specificCare?.toLowerCase() || '')
          )
        ) {
          setOpenCompletedAsyncModal(true);
          return;
        }
      }

      const completedVisits = visits.filter(v => v.status === 'Completed');
      const createdVisits = visits.filter(v => v.status === 'Created');
      const paidVisits = visits.filter(v => v.status === 'Paid');

      // prevent users from creating multiple subscriptions of the same type
      // Example: user has weight loss subscription and trying to sign up with the same one
      // Show them existing subscription page with navigation to patient portal
      const specificCareVisitCompleted = completedVisits.find(v =>
        v.careSelected.find(
          care =>
            care.reason.toLowerCase() === specificCare?.toLowerCase() ||
            (care.reason.toLowerCase().includes('weight loss') &&
              specificCare?.toLowerCase().includes('weight loss'))
        )
      );

      if (
        specificCareVisitCompleted &&
        (weightLossSub ||
          specificCareVisitCompleted.specific_care ===
            SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT)
      ) {
        setShowWlRedirectPopup(true);
        return;
      }

      // has paid incomplete visit and trying to select different care
      if (specificCare && paidVisits[0]) {
        // if subscriptions have all been canceled or pending cancellation, redirect to patient portal
        const cancelledSubscriptions = activeSubscriptions.filter(
          subscription => {
            return subscription.status === 'scheduled_for_cancelation';
          }
        );
        if (
          cancelledSubscriptions.length !== 0 ||
          activeSubscriptions.length === 0
        ) {
          return Router.push(Pathnames.PATIENT_PORTAL);
        }

        const answers = await handleAnswers(paidVisits[0].id);
        setTitle('Action Item Pending: Complete your visit');

        setVisit(paidVisits[0]);
        if (potentialInsurance) {
          addPotentialInsurance(potentialInsurance);
        } else if (paidVisits[0].potential_insurance) {
          addPotentialInsurance(paidVisits[0].potential_insurance || null);
        } else {
          calculatePotentialInsurance(patient, weightLossSub);
        }
        addSpecificCare(paidVisits[0].specific_care || null);
        addVariant(paidVisits[0].variant || null);
        if (openPaidWeightLossModal) return;

        if (
          answers.WEIGHT_L_POST_Q11 &&
          differenceInDays(new Date(), new Date(paidVisits[0].paid_at)) >= 4
        ) {
          return setOpenPaidWeightLossModal(true);
          // enables modal to remain on screen without redirecting to questionnaire, and only after all other info has been set.
        }
        setOpenPendingVisitModal(true);
        if (weightLossSub) {
          addCoaching({
            type: CoachingType.WEIGHT_LOSS,
            name: calculateWeightLossName(weightLossSub),
            id: weightLossSub.subscription.id,
            planId: weightLossSub.reference_id,
            recurring: {
              interval: weightLossSub.interval || 'month',
              interval_count: weightLossSub.interval_count || 1,
            },
            price: weightLossSub.price!,
            discounted_price:
              weightLossSub.subscription.name === 'Zealthy 3-Month Weight Loss'
                ? 264
                : 88,
          });
        }

        return;
      }

      // has paid but incomplete visit
      if (paidVisits[0]) {
        const firstIntake = paidVisits[0].intakes.filter(
          i => i.entry !== null
        )[0];

        const answers = await handleAnswers(paidVisits[0].id);

        updateVisit({
          isSync: paidVisits[0].isSync,
          id: paidVisits[0].id,
          intakes: paidVisits[0].intakes,
          questionnaires: [],
          selectedCare: {
            careSelections: paidVisits[0].careSelected,
            other: '',
          },
        });

        if (paidVisits[0].potential_insurance) {
          addPotentialInsurance(paidVisits[0].potential_insurance || null);
        } else {
          calculatePotentialInsurance(patient, weightLossSub);
        }

        addSpecificCare(paidVisits[0].specific_care || null);

        addVariant(paidVisits[0].variant || null);
        if (!specificCare) return;
        if (openPaidWeightLossModal) return;
        if (
          answers.WEIGHT_L_POST_Q11 &&
          differenceInDays(new Date(), new Date(paidVisits[0].paid_at)) >= 4
        ) {
          // enables modal to remain on screen without redirecting to questionnaire, and only after all other info has been set.
          return setOpenPaidWeightLossModal(true);
        }
        if (weightLossSub) {
          addCoaching({
            type: CoachingType.WEIGHT_LOSS,
            name: calculateWeightLossName(weightLossSub),
            id: weightLossSub.subscription.id,
            planId: weightLossSub.reference_id,
            recurring: {
              interval: weightLossSub.interval || 'month',
              interval_count: weightLossSub.interval_count || 1,
            },
            price: weightLossSub.price!,
            discounted_price:
              weightLossSub.subscription.name === 'Zealthy 3-Month Weight Loss'
                ? 264
                : 88,
          });
        }

        const nextPage = postCheckoutNavigation(firstIntake);
        return openPaidWeightLossModal ? null : Router.push(nextPage);
      }

      // specific care and visit with this specific care exist - use this visit
      // instead of creating new one
      const specificCareVisitCreated = createdVisits.find(
        (v: any) =>
          v.careSelected.length &&
          v.careSelected.every(
            (care: any) =>
              care.reason.toLowerCase() === specificCare?.toLowerCase()
          )
      );

      if (specificCare && specificCareVisitCreated) {
        const answers = await handleAnswers(specificCareVisitCreated.id);

        const calculatedCare = calculateCare(
          specificCareVisitCreated.careSelected.map((c: any) => c.reason),
          potentialInsurance ||
            specificCareVisitCreated.potential_insurance ||
            PotentialInsuranceOption.DEFAULT
        );

        const questionnaires = mapCareToQuestionnaires(calculatedCare);

        const formattedAnswers =
          Object.keys(answers).length > 0
            ? {
                created_at: null,
                patient_id: null,
                questionnaire_name: questionnaires[0]?.name || '',
                response: { items: Object.values(answers) },
                submitted: true,
                submitted_by: null,
                visit_id: specificCareVisitCreated.id,
                retry_submission_at: null,
              }
            : null;

        if (!potentialInsurance) {
          addPotentialInsurance(
            specificCareVisitCreated?.potential_insurance || null
          );
        }

        if (!specificCare) {
          addSpecificCare(specificCareVisitCreated?.specific_care || null);
        }

        addVariant(specificCareVisitCreated?.variant || null);

        updateVisit({
          isSync: specificCareVisitCreated.isSync,
          id: specificCareVisitCreated.id,
          intakes: specificCareVisitCreated.intakes,
          selectedCare: {
            careSelections: specificCareVisitCreated.careSelected,
            other: '',
          },
          questionnaires,
        });
        if (variation8201?.variation_name === 'Variation-1') {
          const nextPage = preCheckoutNavigation(
            questionnaires[0],
            specificCare,
            formattedAnswers
          );
          if (nextPage) return Router.push(nextPage);
        }

        const nextPage = preCheckoutNavigation(questionnaires[0], specificCare);

        if (nextPage) return Router.push(nextPage);
      }

      // no specific care selected but the visit is created????

      // get most recent created visit and use to set specific care and potential insurance
      const mostRecentCreatedVisit = createdVisits[0];
      addSpecificCare(
        mostRecentCreatedVisit?.specific_care || specificCare || null
      );
      addPotentialInsurance(
        mostRecentCreatedVisit?.potential_insurance ||
          potentialInsurance ||
          null
      );
      addVariant(mostRecentCreatedVisit?.variant || variant || null);

      // Handle new patients with specific care selected but no created visits and status lead
      if (
        createdVisits.length === 0 &&
        patient?.status === 'LEAD' &&
        specificCare
      ) {
        // First check site name to determine which region screen to use
        if (
          (siteName === 'Zealthy' || siteName === 'FitRx') &&
          !patient?.region
        ) {
          return Router.push(Pathnames.REGION_SCREEN);
        } else {
          return Router.push(Pathnames.REGION_SCREEN_ZP);
        }
      }

      if (patient?.region && profile && !profile.birth_date) {
        return Router.push(Pathnames.AGE_SCREEN);
      }

      if (patient?.region && profile && !profile.first_name) {
        return Router.push(Pathnames.COMPLETE_PROFILE);
      }

      if (
        (mostRecentCreatedVisit && mostRecentCreatedVisit.specific_care) ||
        (specificCare && sessionStorage.getItem('weight-loss-flow') !== 'ro')
      ) {
        return;
      }

      // if active
      if (activeIshStatuses.includes(patient.status)) {
        // or redirect presented
        if (redirect) {
          return Router.push(`/${redirect}`);
        }

        // otherwise go to portal

        return Router.push(Pathnames.PATIENT_PORTAL);
      }

      // select from the map
      return Router.push(mapStatusToPath[patient.status as PatientStatus]);
    }

    // if (subStatus !== 'success' || intakeStatus !== 'success') {
    //   return;
    // }

    // if (
    //   specificCare === SpecificCareOption.WEIGHT_LOSS &&
    //   !!freeConsultIntake
    // ) {
    //   return;
    // }

    // if (
    //   ['Weight loss', 'Weight Loss Free Consult'].includes(
    //     specificCare ?? ''
    //   ) &&
    //   wlSub
    // ) {
    //   return;
    // }

    redirectUser();
  }, [
    getVisits,
    patient,
    redirect,
    specificCare,
    supabase,
    updateVisit,
    first_name,
    last_name,
    variation8201,
  ]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Loading />
      <InformationModal
        open={openCompletedAsyncModal}
        title={`You've already signed up for Zealthy ${specificCare?.toLowerCase()} treatment(s).`}
        description="Select below to manage your treatment plan, where you can request a refill sooner, suggest an adjustment to your dosage, or message with your care team."
        buttonText="Manage treatment plan"
        onClose={() => Router.push(Pathnames.PATIENT_PORTAL)}
        onConfirm={() => Router.push(Pathnames.VIEW_SUBSCRIPTIONS)}
      />
      <InformationModal
        open={openPendingVisitModal}
        title={title}
        description="Complete your current visit before proceeding to new care options."
        buttonText="Complete previous visit"
        onClose={handlePaidVisit}
        onConfirm={handlePaidVisit}
      />
      <InformationModal
        open={openCompletedVisitModal}
        title={title}
        description="Select below to re-enter your patient portal, where you can message your care team if you have follow-up questions."
        buttonText="Message your care team"
        onClose={handleCompletedVisit}
        onConfirm={handleCompletedVisit}
      />
      <JumpAheadModal
        open={openPaidWeightLossModal}
        title="You can skip this section and go right to your Zealthy portal."
        description="If you don’t select your preferred treatment, your Zealthy provider will find a clinically appropriate treatment plan for you."
        buttonText="Skip to Zealthy portal"
        buttonTextTwo="Go back and add my preferred treatment"
        onJump={handleWeightLossComplete}
        onClose={handlePaidVisit}
      />
      {showWlRedirectPopup ? (
        <WeightLossRedirectPopup isOpen={showWlRedirectPopup} />
      ) : null}
    </>
  );
};

export const getServerSideProps = getAuthProps;

AuthTransition.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AuthTransition;

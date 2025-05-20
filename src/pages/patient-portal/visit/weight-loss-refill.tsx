import Head from 'next/head';
import { ReactElement, useCallback, useEffect, useState } from 'react';
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
import { ProfileInfo, useProfileAsync } from '@/components/hooks/useProfile';

import { getAuthProps } from '@/lib/auth';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import { isWeightLossMed } from '@/utils/isWeightLossMed';
import { differenceInDays } from 'date-fns';
import { OrderStatus } from '@/types/orderStatus';
import { Button, Container, Stack, Typography } from '@mui/material';
import { getShipmentStatus, orderStatusMap } from '@/utils/orderStatus';
import {
  useActivePatientSubscription,
  useAllVisiblePatientSubscription,
} from '@/components/hooks/data';
import { OrderProps } from '@/components/screens/Prescriptions/OrderHistoryContent';
import { usePatient } from '@/components/hooks/data';
import { useABTest } from '@/context/ABZealthyTestContext';
import { useVWO } from '@/context/VWOContext';
import { useIdentityEvent } from '@/components/hooks/useIdentityEvent';
import { PatientInfo, usePatientAsync } from '@/components/hooks/usePatient';

interface Props {
  patient: Database['public']['Tables']['patient']['Row'];
}

const WeightLossRefillPage = ({ patient }: Props) => {
  const supabase = useSupabaseClient<Database>();
  const [showError, setShowError] = useState(false);
  const { id: visitID, questionnaires } = useVisitState();
  const updateProfile = useProfileAsync();
  const sendIdentity = useIdentityEvent();
  const { updatePatient } = usePatientAsync();
  const vwo = useVWO();
  const { createOnlineVisit } = useVisitAsync();
  const { specificCare, potentialInsurance } = useIntakeState();
  const { addSpecificCare } = useIntakeActions();
  const { resetQuestionnaires, addQuestionnaires, addCare } = useVisitActions();
  const { data: patientSubscriptions } = useActivePatientSubscription();
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();
  const { data: patientInfo } = usePatient();
  const ABZTest = useABTest();

  const recurringSub = visibleSubscriptions?.find(
    s => s.product === 'Recurring Weight Loss Medication'
  );

  async function addABUser() {
    if (
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
        patientInfo?.profile_id!,
        patientInfo?.profiles?.first_name!,
        patientInfo?.profiles?.last_name!
      );
    }
  }

  useEffect(() => {
    addABUser();
  }, []);

  useEffect(() => {
    resetQuestionnaires();
    addCare({
      care: {
        careSelections: [],
        other: '',
      },
    });

    if (!specificCare) {
      addSpecificCare(SpecificCareOption.WEIGHT_LOSS);
    }
  }, [specificCare]);

  const updateUser = useCallback(
    async (profileInfo: ProfileInfo, patientInfo: PatientInfo) => {
      try {
        const promises: Promise<any>[] = [
          updateProfile(profileInfo),
          sendIdentity(profileInfo, patientInfo.text_me_update),
          updatePatient(patientInfo),
        ];

        await Promise.all(promises);
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
    [
      patient,
      potentialInsurance,
      sendIdentity,
      specificCare,
      updatePatient,
      updateProfile,
      vwo,
    ]
  );

  async function createVisitOrRedirect() {
    let allowRefill = true;
    const { data } = await supabase
      .from('order')
      .select(`*, prescription(medication, medication_quantity_id, pharmacy)`)
      .eq('patient_id', patient.id)
      .neq('order_status', 'CANCELLED')
      .neq('order_status', 'Cancelled')
      .neq('order_status', 'Order Canceled')
      .order('created_at', { ascending: false });

    const requests = await supabase
      .from('prescription_request')
      .select(`*`)
      .eq('patient_id', patient.id)
      .in('status', [
        'REQUESTED',
        'REQUESTED-FORWARDED',
        'REQUESTED - ID must be uploaded',
      ])
      .then(({ data }) => data);

    const bundlePlan = visibleSubscriptions?.filter(
      s =>
        (s.price === 297 || s.price === 449 || s.price === 249) &&
        (s.status === 'active' ||
          s.status === 'scheduled_for_cancelation' ||
          s.status === 'past_due')
    );
    const mostRecent = data?.find(d => {
      let prescription = d?.prescription;
      if (Array.isArray(prescription)) {
        prescription = prescription[0];
      }
      return isWeightLossMed(prescription?.medication || '');
    });

    if (mostRecent) {
      allowRefill = true;
      let prescription = mostRecent?.prescription;

      let status;
      const shipmentStatus = getShipmentStatus(mostRecent as OrderProps);
      const orderStatus = orderStatusMap[mostRecent?.order_status || ''];

      if (orderStatus === OrderStatus.CANCELED) {
        status = OrderStatus.CANCELED;
      } else if (shipmentStatus) {
        status = shipmentStatus;
      } else {
        status = orderStatus;
      }

      if (Array.isArray(prescription)) {
        prescription = prescription[0];
      }
      let medicationQuantityId = prescription?.medication_quantity_id;
      if (Array.isArray(medicationQuantityId)) {
        medicationQuantityId = medicationQuantityId[0];
      }

      if (medicationQuantityId == 98 && !bundlePlan?.length) {
        allowRefill = true;
        if (
          [
            OrderStatus.CANCELED,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.OUT_FOR_DELIVERY,
          ].includes(status)
        ) {
          allowRefill = true;
        }

        // If previous order has not been shipped
        const hasRecentWeightLossRequest = requests?.some(request => {
          const daysSinceRequest = differenceInDays(
            new Date(),
            new Date(request.created_at || '')
          );
          return (
            isWeightLossMed(request.specific_medication || '') &&
            daysSinceRequest < 5
          );
        });
        if (!hasRecentWeightLossRequest) allowRefill = true;

        if (allowRefill) {
          if (
            patient &&
            [
              'AZ',
              'CO',
              'CT',
              'IN',
              'KS',
              'TX',
              'AL',
              'ME',
              'MI',
              'UT',
              'CA',
              'FL',
              'NY',
              'NV',
              'OH',
              'OK',
              'OR',
              'PA',
              'VA',
              'WA',
              'NJ',
              'NC',
              'SC',
            ]?.includes(patient?.region!) &&
            specificCare === SpecificCareOption.WEIGHT_LOSS &&
            ![
              PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED,
              PotentialInsuranceOption.TIRZEPATIDE_BUNDLED,
              PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED,
            ].includes(potentialInsurance || PotentialInsuranceOption.DEFAULT)
          ) {
            await vwo.activateBefore('9502', {
              userId: patientInfo?.profile_id || '',
              patientId: patientInfo?.id!,
              firstName: patientInfo?.profiles.first_name!,
              lastName: patientInfo?.profiles.last_name!,
            });
          }
          return Router.push(
            `/patient-portal/visit/weight-loss-compound-refill`
          );
        }
      } else {
        if (status === OrderStatus.SENT_TO_LOCAL_PHARMACY) {
          allowRefill = true;
        }
      }
    }

    if (bundlePlan?.length ?? 0 > 0) {
      allowRefill = false;
      const hasRecentWeightLossRequest = requests?.some(request => {
        const daysSinceRequest = differenceInDays(
          new Date(),
          new Date(request.created_at || '')
        );
        return (
          isWeightLossMed(request.specific_medication || '') &&
          daysSinceRequest < 5
        );
      });
      if (!hasRecentWeightLossRequest) allowRefill = true;
      if (allowRefill) {
        await createOnlineVisit(false);
        return addQuestionnaires(
          mapCareToQuestionnaires(['Weight Loss Bundle Reorder'])
        );
      }
    }

    if (allowRefill) {
      const visits = await supabase
        .from('online_visit')
        .select('*, questionnaire_response!inner(*)')
        .eq('patient_id', patient?.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .then(({ data }) => data);

      const questionnaires = visits?.map(v => v.questionnaire_response)?.flat();

      const hasRefillAdditional = questionnaires?.find(
        q => q?.questionnaire_name === 'weight-loss-refill-additional'
      );

      const hasInitialWL = questionnaires?.find(
        q => q?.questionnaire_name === 'weight-loss'
      );

      const isOverSixMonths =
        hasRefillAdditional &&
        differenceInDays(
          new Date(),
          new Date(hasRefillAdditional?.created_at || '')
        ) > 71
          ? true
          : hasInitialWL &&
            !hasRefillAdditional &&
            differenceInDays(
              new Date(),
              new Date(hasInitialWL?.created_at || '')
            ) > 71
          ? true
          : false;

      await createOnlineVisit(false);
      addQuestionnaires(
        mapCareToQuestionnaires([
          isOverSixMonths
            ? 'Weight Loss Refill Additional'
            : 'Weight Loss Refill',
        ])
      );
    } else {
      return setShowError(true);
    }
  }

  useEffect(() => {
    if (
      !questionnaires.length &&
      [
        SpecificCareOption.WEIGHT_LOSS,
        SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT,
      ].includes(specificCare ?? SpecificCareOption.DEFAULT) &&
      visibleSubscriptions?.length
    ) {
      createVisitOrRedirect();
    }
  }, [questionnaires, specificCare, visibleSubscriptions?.length]);

  useEffect(() => {
    if (
      visitID &&
      questionnaires.length > 0 &&
      specificCare === SpecificCareOption.WEIGHT_LOSS
    ) {
      Router.push(Pathnames.PATIENT_PORTAL_QUESTIONNAIRES);
    }
  }, [questionnaires]);

  return (
    <>
      <Head>
        <title>Zealthy</title>
      </Head>
      <Container maxWidth="xs">
        {showError ? (
          <Stack gap={4}>
            <Typography variant="h2">
              You are unable to complete a refill request for weight loss since
              you already have a pending prescription being sent to a pharmacy
              or being shipped to you.
            </Typography>
            <Typography variant="h2">
              If you have questions about your prescription request, select
              below to message your care team.
            </Typography>
            <Button
              onClick={() =>
                Router.push(`${Pathnames.MESSAGES}?complete=weight-loss`)
              }
            >
              Message your care team
            </Button>
          </Stack>
        ) : (
          <Loading />
        )}
      </Container>
    </>
  );
};

export const getServerSideProps = getAuthProps;

WeightLossRefillPage.getLayout = (page: ReactElement) => {
  return <PatientPortalNav>{page}</PatientPortalNav>;
};

export default WeightLossRefillPage;

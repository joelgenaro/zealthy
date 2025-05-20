import Head from 'next/head';
import { ReactElement, useCallback, useMemo } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { usePatient } from '@/components/hooks/data';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import Button from '@mui/material/Button';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useAnswerSelect } from '@/components/hooks/useAnswer';
import { CodedAnswer } from '@/context/AppContext/reducers/types/answer';
import { useVisitActions } from '@/components/hooks/useVisit';
import { MedicationType } from '@/context/AppContext/reducers/types/visit';
import TreatmentPlan from '@/components/shared/icons/TreatmentPlan';
import IntroductoryDose from '@/components/shared/icons/IntroductoryDose';
import { useFetchMedication } from '@/components/hooks/useFetchMedication';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { useSelector } from '@/components/hooks/useSelector';
import { useAllVisiblePatientSubscription } from '@/components/hooks/data';

const SaveOnFirstOrder = () => {
  return (
    <svg
      width={26}
      height={24}
      viewBox="0 0 26 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.7144 22.8934C12.7926 22.9715 12.8952 23.0108 12.9977 23.0108C13.1003 23.0108 13.2029 22.9715 13.2811 22.8934L22.8913 13.2832C24.251 11.9235 25 10.1165 25 8.19454C25 6.27258 24.2514 4.46563 22.8913 3.1059C21.5332 1.74779 19.7262 1 17.8027 1C16.0101 1 14.319 1.6496 12.9977 2.83741C11.6765 1.6496 9.98496 1 8.19284 1C6.26927 1 4.46192 1.74819 3.1042 3.1059C0.2986 5.91191 0.2986 10.4772 3.1042 13.2832L12.7144 22.8934ZM3.67085 3.67256C4.91756 2.42584 6.555 1.80229 8.19284 1.80229C9.83067 1.80229 11.4677 2.42584 12.7144 3.67256C12.8711 3.82925 13.1244 3.82925 13.2811 3.67256C15.7749 1.17873 19.8312 1.17953 22.3246 3.67256C23.5333 4.8808 24.1985 6.48657 24.1985 8.19454C24.1985 9.90251 23.5333 11.5083 22.3246 12.7165L12.9977 22.0434L3.67085 12.7161C1.17743 10.2227 1.17743 6.16598 3.67085 3.67256Z"
        fill="black"
        stroke="black"
        strokeWidth={0.3}
      />
      <path
        d="M17.8071 15.3686C17.9097 15.3686 18.0123 15.3293 18.0904 15.2512L18.5168 14.8248C18.6735 14.6681 18.6735 14.4148 18.5168 14.2581C18.3601 14.1015 18.1069 14.1015 17.9502 14.2581L17.5238 14.6845C17.3671 14.8412 17.3671 15.0945 17.5238 15.2512C17.6019 15.3293 17.7045 15.3686 17.8071 15.3686Z"
        fill="black"
        stroke="black"
        strokeWidth={0.3}
      />
      <path
        d="M19.5883 13.5842C19.6909 13.5842 19.7935 13.5449 19.8717 13.4668L21.4714 11.867C22.4525 10.886 22.9931 9.58195 22.9931 8.19538C22.9931 6.8088 22.4525 5.50479 21.4714 4.52377C21.3147 4.36708 21.0615 4.36708 20.9048 4.52377C20.7481 4.68046 20.7481 4.93373 20.9048 5.09042C21.7343 5.92036 22.1916 7.0228 22.1916 8.19538C22.1916 9.36795 21.7343 10.4708 20.9048 11.3003L19.305 12.9001C19.1483 13.0564 19.1483 13.3101 19.305 13.4668C19.3832 13.5449 19.4858 13.5842 19.5883 13.5842Z"
        fill="black"
        stroke="black"
        strokeWidth={0.3}
      />
    </svg>
  );
};

const OngoingTreatment = () => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.048 2.0587H7.35066C7.27647 1.80359 7.15073 1.57953 6.98879 1.40463C6.76896 1.16701 6.47887 1.02166 6.16435 1.02166C5.83173 1.02166 5.52536 1.18661 5.3001 1.45198C5.15806 1.61964 5.04709 1.82651 4.97894 2.059L5.048 2.0587ZM8.39674 2.0587H9.77002C9.86078 1.5729 10.0704 1.13655 10.3611 0.793386C10.7769 0.303362 11.3574 0 12.0033 0C12.6119 0 13.1634 0.271096 13.5741 0.714681C13.9022 1.06961 14.1386 1.53611 14.236 2.0587H15.609C15.6995 1.5729 15.9093 1.13655 16.2003 0.793386C16.6156 0.303664 17.1967 0 17.8426 0C18.4511 0 19.0024 0.271096 19.4131 0.714681C19.7686 1.09916 20.0159 1.61451 20.0964 2.19048C21.0279 2.4082 21.862 2.88556 22.5176 3.54114C23.4322 4.45575 24 5.71835 24 7.1067V18.6354C24 20.0237 23.4322 21.2863 22.5176 22.2009C21.603 23.1155 20.3404 23.6834 18.952 23.6834H5.048C3.65965 23.6834 2.39704 23.1155 1.48243 22.2009C0.567824 21.2863 0 20.0237 0 18.6354V7.1067C0 5.71835 0.567824 4.45575 1.48243 3.54114C2.13922 2.88435 2.97603 2.40609 3.90963 2.18897C3.98472 1.6513 4.20516 1.16671 4.52209 0.793386C4.93733 0.303664 5.51842 0 6.16435 0C6.77288 0 7.32412 0.271096 7.73483 0.714681C8.06292 1.06961 8.29934 1.53611 8.39674 2.0587ZM10.8182 2.0587H13.1899C13.1157 1.80359 12.99 1.57953 12.8281 1.40463C12.6082 1.16701 12.3178 1.02166 12.0033 1.02166C11.6707 1.02166 11.3643 1.18631 11.1391 1.45198C10.997 1.61934 10.8864 1.82621 10.8182 2.0587ZM16.6575 2.0587H18.952L19.0289 2.05931C18.9544 1.80389 18.829 1.57953 18.667 1.40463C18.4472 1.16701 18.1571 1.02166 17.8426 1.02166C17.51 1.02166 17.2036 1.18661 16.9783 1.45198C16.8363 1.61964 16.7256 1.82621 16.6575 2.0587ZM17.8426 4.17802C18.1245 4.17802 18.3534 4.4069 18.3534 4.68885C18.3534 4.9708 18.1245 5.19968 17.8426 5.19968C17.1967 5.19968 16.6162 4.89632 16.2003 4.40629C15.897 4.04895 15.6823 3.59029 15.5984 3.08036H10.8016C10.8674 3.33759 10.985 3.56586 11.1391 3.7477C11.3643 4.01337 11.6707 4.17802 12.0033 4.17802C12.2853 4.17802 12.5141 4.4069 12.5141 4.68885C12.5141 4.9708 12.2853 5.19968 12.0033 5.19968C11.3574 5.19968 10.7769 4.89632 10.3611 4.40629C10.0583 4.04895 9.84329 3.59029 9.75946 3.08036H5.048L4.96266 3.08127C5.0284 3.33789 5.146 3.56586 5.3001 3.7477C5.52536 4.01337 5.83173 4.17802 6.16435 4.17802C6.4463 4.17802 6.67518 4.4069 6.67518 4.68885C6.67518 4.9708 6.4463 5.19968 6.16435 5.19968C5.51842 5.19968 4.93793 4.89632 4.52209 4.40629C4.24949 4.08514 4.04865 3.68196 3.94974 3.23355C3.2821 3.42444 2.68322 3.78419 2.20435 4.26306C1.4749 4.99251 1.02166 5.9997 1.02166 7.1067V18.6354C1.02166 19.7424 1.4749 20.7496 2.20435 21.479C2.93381 22.2085 3.941 22.6617 5.048 22.6617H18.952C20.059 22.6617 21.0662 22.2085 21.7956 21.479C22.5251 20.7496 22.9783 19.7424 22.9783 18.6354V7.1067C22.9783 5.9997 22.5251 4.99251 21.7956 4.26306C21.0662 3.5336 20.059 3.08036 18.952 3.08036H16.6406C16.7066 3.33759 16.8239 3.56556 16.9783 3.7477C17.2036 4.01337 17.51 4.17802 17.8426 4.17802ZM2.66301 7.47882C2.38106 7.47882 2.15218 7.24994 2.15218 6.96799C2.15218 6.68603 2.38106 6.45716 2.66301 6.45716H21.3367C21.6186 6.45716 21.8475 6.68603 21.8475 6.96799C21.8475 7.24994 21.6186 7.47882 21.3367 7.47882H2.66301Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.8646 9.41797H20.4481C20.9402 9.41797 21.3416 9.81934 21.3416 10.3115V10.5192C21.3416 11.0114 20.9402 11.4127 20.4481 11.4127H19.8646C19.3724 11.4127 18.9711 11.0114 18.9711 10.5192V10.3115C18.9711 9.81934 19.3724 9.41797 19.8646 9.41797ZM15.7885 9.41797H16.372C16.8641 9.41797 17.2655 9.81934 17.2655 10.3115V10.5192C17.2655 11.0114 16.8641 11.4127 16.372 11.4127H15.7885C15.2963 11.4127 14.895 11.0114 14.895 10.5192V10.3115C14.895 9.81934 15.2963 9.41797 15.7885 9.41797ZM11.7121 9.41797H12.2956C12.7877 9.41797 13.1891 9.81934 13.1891 10.3115V10.5192C13.1891 11.0114 12.7877 11.4127 12.2956 11.4127H11.7121C11.2199 11.4127 10.8186 11.0114 10.8186 10.5192V10.3115C10.8186 9.81934 11.2199 9.41797 11.7121 9.41797ZM7.63569 9.41797H8.21919C8.71133 9.41797 9.1127 9.81934 9.1127 10.3115V10.5192C9.1127 11.0114 8.71133 11.4127 8.21919 11.4127H7.63569C7.14355 11.4127 6.74219 11.0114 6.74219 10.5192V10.3115C6.74219 9.81934 7.14355 9.41797 7.63569 9.41797Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.55756 13.6289H4.14107C4.6332 13.6289 5.03457 14.0303 5.03457 14.5224V14.7302C5.03457 15.2223 4.6332 15.6237 4.14107 15.6237H3.55756C3.06543 15.6237 2.66406 15.2223 2.66406 14.7302V14.5224C2.66406 14.0303 3.06543 13.6289 3.55756 13.6289ZM19.8628 13.6289H20.4463C20.9385 13.6289 21.3398 14.0303 21.3398 14.5224V14.7302C21.3398 15.2223 20.9385 15.6237 20.4463 15.6237H19.8628C19.3707 15.6237 18.9693 15.2223 18.9693 14.7302V14.5224C18.9693 14.0303 19.3707 13.6289 19.8628 13.6289ZM15.7867 13.6289H16.3702C16.8624 13.6289 17.2638 14.0303 17.2638 14.5224V14.7302C17.2638 15.2223 16.8624 15.6237 16.3702 15.6237H15.7867C15.2946 15.6237 14.8932 15.2223 14.8932 14.7302V14.5224C14.8932 14.0303 15.2946 13.6289 15.7867 13.6289ZM11.7104 13.6289H12.2939C12.786 13.6289 13.1874 14.0303 13.1874 14.5224V14.7302C13.1874 15.2223 12.786 15.6237 12.2939 15.6237H11.7104C11.2182 15.6237 10.8168 15.2223 10.8168 14.7302V14.5224C10.8168 14.0303 11.2182 13.6289 11.7104 13.6289ZM7.63396 13.6289H8.21746C8.7096 13.6289 9.11096 14.0303 9.11096 14.5224V14.7302C9.11096 15.2223 8.7096 15.6237 8.21746 15.6237H7.63396C7.14182 15.6237 6.74046 15.2223 6.74046 14.7302V14.5224C6.74046 14.0303 7.14182 13.6289 7.63396 13.6289Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.55756 17.8398H4.14107C4.6332 17.8398 5.03457 18.2412 5.03457 18.7333V18.9411C5.03457 19.4333 4.6332 19.8346 4.14107 19.8346H3.55756C3.06543 19.8346 2.66406 19.4333 2.66406 18.9411V18.7333C2.66406 18.2412 3.06543 17.8398 3.55756 17.8398ZM11.7104 17.8398H12.2939C12.786 17.8398 13.1874 18.2412 13.1874 18.7333V18.9411C13.1874 19.4333 12.786 19.8346 12.2939 19.8346H11.7104C11.2182 19.8346 10.8168 19.4333 10.8168 18.9411V18.7333C10.8168 18.2412 11.2182 17.8398 11.7104 17.8398ZM7.63396 17.8398H8.21746C8.7096 17.8398 9.11096 18.2412 9.11096 18.7333V18.9411C9.11096 19.4333 8.7096 19.8346 8.21746 19.8346H7.63396C7.14182 19.8346 6.74046 19.4333 6.74046 18.9411V18.7333C6.74046 18.2412 7.14182 17.8398 7.63396 17.8398Z"
        fill="black"
      />
    </svg>
  );
};

const PrescriptionPlan = () => <TreatmentPlan width={24} height={34} />;

const headerStyles = (fontSize: string) => ({
  fontSize: `${fontSize} !important`,
  fontStyle: 'normal',
  fontWeight: '500',
  lineHeight: '28px',
  letterSpacing: '0.033px',
});

const treatmentPlan = [
  {
    Icon: PrescriptionPlan,
    header: 'Free personalized prescription plan',
    description:
      'Your provider will create a customized Rx treatment plan to get you started and make adjustments at no additional cost.',
  },
  {
    Icon: IntroductoryDose,
    header: 'Continuing Dose',
    description:
      'We’ll make sure you get started on an introductory dose to help you ease into treatment. Your provider can help you ease into a larger dose if appropriate over time.',
  },
  {
    Icon: OngoingTreatment,
    header: 'Ongoing treatment',
    description:
      'We’ll make sure you are supported. You will have unlimited messages with your psychiatric provider as well as regular adjustments & medication adjustments.',
  },
  {
    Icon: SaveOnFirstOrder,
    header: 'LIMITED TIME: Save 20% on your first order',
    description: 'Save $30 on your first three months of Rx treatment.',
  },
];

const starterPlan = [
  {
    Icon: PrescriptionPlan,
    header: 'Free Provider Diagnosis',
    description:
      'Your provider will create a customized Rx treatment plan to get you started and make adjustments at no additional cost.',
  },
  {
    Icon: IntroductoryDose,
    header: 'Introductory dose',
    description:
      'We’ll make sure you get started on an introductory dose to help you ease into treatment. Your provider can help you ease into a larger dose over time.',
  },
  {
    Icon: OngoingTreatment,
    header: 'Ongoing treatment',
    description:
      'We’ll make sure you are supported. You will have unlimited messages with your psychiatric provider, regular check-ins, and medication adjustments.',
  },
  {
    Icon: SaveOnFirstOrder,
    header: 'LIMITED TIME: Save 20% on your first order',
    description: 'Save on your first three months of Rx treatment.',
  },
];

const AsyncMentalHealthWhatNext = () => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const { addMedication } = useVisitActions();
  const answerForQ11 = useSelector(
    store => store.answer['ASYNC_MH_MQ_Q11']?.answer as CodedAnswer[]
  );
  const {
    data: visibleSubscriptions = [],
    isLoading: visibleSubscriptionsLoading = true,
  } = useAllVisiblePatientSubscription();

  const answerMap = {
    ASYNC_MH_MQ_Q11_A1: 'Buproprion',
    ASYNC_MH_MQ_Q11_A2: 'Buspirone',
    ASYNC_MH_MQ_Q11_A3: 'Citalopram',
    ASYNC_MH_MQ_Q11_A4: 'Duloxetine',
    ASYNC_MH_MQ_Q11_A5: 'Escitalopram',
    ASYNC_MH_MQ_Q11_A6: 'Fluoxetine',
    ASYNC_MH_MQ_Q11_A7: 'Hydroxyzine',
    ASYNC_MH_MQ_Q11_A8: 'Propranolol',
    ASYNC_MH_MQ_Q11_A9: 'Sertraline',
    ASYNC_MH_MQ_Q11_A10: 'Trazodone',
    ASYNC_MH_MQ_Q11_A11: 'Venlafaxine',
  } as const;

  // answerForQ11 may be value other than key in answer map, or is possibly undefined, so need to default to Mental Health Medication for both cases

  const mappedAnswer = useMemo(() => {
    return Array.isArray(answerForQ11) && answerForQ11.length > 0
      ? answerMap[
          answerForQ11[0]?.valueCoding?.code as keyof typeof answerMap
        ] || answerMap?.ASYNC_MH_MQ_Q11_A6
      : answerMap?.ASYNC_MH_MQ_Q11_A6;
  }, [answerForQ11]);

  const hasMatchingMentalHealthSubscription = visibleSubscriptions.some(
    subscription =>
      subscription?.order?.prescription?.medication_quantity?.medication_dosage?.medication?.name?.toLowerCase() ===
      mappedAnswer?.toLowerCase()
  );

  const { medication } = useFetchMedication(mappedAnswer, undefined, 90);

  const answerFirstTime = useAnswerSelect(
    answer => answer['ASYNC_MH_MQ_Q12']?.answer?.[0]
  );

  const answerCurrentlyTaking = useAnswerSelect(
    answer => answer['ASYNC_MH_MQ_Q13']?.answer?.[0]
  );

  const handleClick = useCallback(() => {
    if (!medication) return;

    //create medication
    addMedication({
      type: MedicationType.MENTAL_HEALTH,
      discounted_price: hasMatchingMentalHealthSubscription ? undefined : 116,
      name: '3 Month Psychiatry Plan',
      quantity: 90,
      medication_quantity_id: medication.medication_quantity_id,
      price: medication.price,
      recurring: {
        interval: 'month',
        interval_count: 3,
      },
      note: 'Patient requested Mental Health Medication',
    });

    Router.push(Pathnames.CHECKOUT);
  }, [addMedication, medication]);

  const styles = useMemo(() => {
    return headerStyles(isMobile ? '20px' : '22px');
  }, [isMobile]);

  const isFirstTime =
    (answerFirstTime as CodedAnswer).valueCoding.display === 'Yes' ||
    (answerCurrentlyTaking as CodedAnswer).valueCoding.display === 'No';
  console.log({ isFirstTime }, 'ift');

  const plan = useMemo(() => {
    return isFirstTime ? starterPlan : treatmentPlan;
  }, [isFirstTime]);

  const { header, description } = useMemo(() => {
    return {
      header: isFirstTime
        ? `${patient?.profiles?.first_name}'s Starter Plan`
        : `${patient?.profiles?.first_name}'s Treatment Plan`,
      description: isFirstTime
        ? 'Before we finish, let’s review what you’ll get with Zealthy’s mental health plan. This plan was designed for those who are new to or re-starting mental health medication.'
        : 'Before we finish, let’s review what you’ll get with Zealthy’s mental health plan. This plan was designed for those who are currently taking psychiatric medication and need ongoing treatment.',
    };
  }, [isFirstTime, patient?.profiles?.first_name]);

  return (
    <>
      <Head>
        <title>Async Mental Health with Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm" gap="16px">
        <Stack gap="48px">
          <Stack gap="24px">
            <Typography variant="h2">{header}</Typography>
            <Typography>{description}</Typography>
            {!isFirstTime ? (
              <Typography>Learn more about this plan below. </Typography>
            ) : null}
          </Stack>

          <Paper sx={{ borderRadius: '16px' }}>
            <Stack padding="26px 24px" gap="24px">
              {plan.map(({ Icon, header, description }) => (
                <Stack gap="16px" direction="row" key={header}>
                  <Typography>
                    <Icon />
                  </Typography>
                  <Stack gap="16px">
                    <Typography sx={styles}>{header}</Typography>
                    <Typography>{description}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Button onClick={handleClick}>Continue</Button>
        </Stack>
      </CenteredContainer>
    </>
  );
};

AsyncMentalHealthWhatNext.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default AsyncMentalHealthWhatNext;

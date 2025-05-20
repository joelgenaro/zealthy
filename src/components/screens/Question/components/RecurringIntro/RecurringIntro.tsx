import { useEffect } from 'react';
import Router from 'next/router';

interface RequestWeightLossRefillProps {
  nextPath: (nextPage?: string) => void;
}

// no more wl med subs so this component just redirects now. keeping around until we know med subs arent coming back
type RefillProps = {
  created_at: string;
  order_status: string;
  prescription: {
    medication: string;
    medication_quantity_id: number;
    duration_in_days: number;
    count_of_refills_allowed: number;
  };
};

const RecurringIntro = ({ nextPath }: RequestWeightLossRefillProps) => {
  useEffect(() => {
    Router.push('/patient-portal/visit/weight-loss-refill');
  }, []);
  return <div>...</div>;
  // const { data: patientSubscriptions } = useAllVisiblePatientSubscription();
  // const recurringPrescription = patientSubscriptions?.find(
  //   (s) => s.product === 'Recurring Weight Loss Medication'
  // );
  // const { id, last_refill_request } = usePatientState();
  // const supabase = useSupabaseClient();

  // const medName = recurringPrescription?.order?.total_dose
  //   ?.split(' ')[0]
  //   ?.toLowerCase();

  // const isMonthlyRecurring = recurringPrescription?.interval_count === 30;

  // const isCanceledRecurring = recurringPrescription?.status === 'canceled';

  //   const handleClick = useCallback(() => {
  //     nextPath();
  //   }, [nextPath]);

  //   return (
  //     <Container style={{ maxWidth: '450px' }}>
  //       <Stack gap={4}>
  //         <>
  //           <Typography variant="h3">You are in the right place.</Typography>
  //           <Typography variant="h3">
  //             {isCanceledRecurring
  //               ? `By responding to the following questions, you will be able to check in with your Zealthy provider re-activate your medication subscription & have your ${medName} shipped to you again.`
  //               : `By responding to the following questions, you will be able to check in
  //           with your Zealthy provider, who can update your dosage and injection
  //           instructions.`}
  //           </Typography>
  //           <Typography variant="h3">
  //             {isCanceledRecurring
  //               ? ''
  //               : isMonthlyRecurring
  //               ? 'If you’d like, you can also request your medication sooner or get a discount by opting for the 3 month supply.'
  //               : 'If you’d like, you can also request your medication sooner.'}
  //           </Typography>
  //           <Button onClick={handleClick}>Continue</Button>
  //         </>
  //       </Stack>
  //     </Container>
  //   );
  // };
};
export default RecurringIntro;

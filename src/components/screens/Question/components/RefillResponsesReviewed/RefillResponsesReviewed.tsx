import { useEffect, useMemo, useState } from 'react';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Button, Container, List, ListItem, Typography } from '@mui/material';
import { useCalculateSpecificCare } from '@/components/hooks/useCalculateSpecificCare';
import { useVisitState } from '@/components/hooks/useVisit';
import { useAppointmentSelect } from '@/components/hooks/useAppointment';

import MarketingQuestion from '../MarketingQuestion';
import {
  useActivePatientSubscription,
  usePatient,
  usePatientPrescriptionRequest,
} from '@/components/hooks/data';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';

interface ResponsesReviewedProps {
  nextPage: (nextPage?: string) => void;
}

function getHeader(care?: SpecificCareOption) {
  switch (care) {
    case SpecificCareOption.WEIGHT_LOSS_ACCESS_V2:
      return 'Congratulations! Your visit is confirmed and your responses have been recorded.';
    default:
      return 'Your responses are being reviewed!';
  }
}

function getBody(care?: SpecificCareOption) {
  switch (care) {
    case SpecificCareOption.WEIGHT_LOSS_ACCESS_V2:
      return 'Here’s what’s next:';
    default:
      return 'Your Zealthy Provider may reach out to you if they have any additional questions. Here’s what’s next:';
  }
}

function getListItems(
  isQuarterlyCompound?: boolean,
  weightLossRequestType?: string,
  region?: string,
  isBundled?: boolean
) {
  if (weightLossRequestType === 'CHECK_IN_ONLY' && !isBundled) {
    return [
      {
        title: 'Provider review: ',
        body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and provide your updated dosage instructions.',
      },
      {
        title: 'Check your email and SMS:',
        body: 'We’ll send you a message if your Provider has any questions or when your updated dosage instructions are ready.',
      },
      {
        body: 'While you wait, chat with your coordinator if you have questions about what to expect with your dosage update request.',
      },
    ];
  }
  if (weightLossRequestType === 'REGULAR_ONLY' && !isBundled) {
    return [
      {
        title: 'Provider review: ',
        body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, it will be sent to your local pharmacy listed in your profile.',
      },
      {
        title: 'Check your email and SMS:',
        body: 'We’ll send you a message if your Provider has any questions or when your refill has been submitted to your pharmacy.',
      },
      {
        body: (
          <>
            While you wait, chat with your coach or coordinator if you have
            questions about what to expect with your refill. If you would prefer
            to have your Rx sent to a different pharmacy then update it using
            this{' '}
            <a href="https://app.getzealthy.com/patient-portal/profile?page=pharmacy">
              link
            </a>
          </>
        ),
      },
    ];
  } else if (weightLossRequestType === 'REGULAR_ONLY' && isBundled) {
    return [
      {
        title: 'Provider review: ',
        body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, you will receive your fill shipped to your home. Your Rx is included in your membership.',
      },
      {
        title: 'Check your email and SMS:',
        body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
      },
      {
        body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
      },
    ];
  } else if (weightLossRequestType === 'COMPOUND_ONLY') {
    if (!isQuarterlyCompound && !isBundled) {
      return [
        {
          title: 'Provider review: ',
          body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive your fill shipped to your home.',
        },
        {
          title: 'Check your email and SMS:',
          body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
        },
        {
          body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
        },
      ];
    } else if (isBundled && !isQuarterlyCompound) {
      return [
        {
          title: 'Provider review: ',
          body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, you will receive your fill shipped to your home. Your Rx is included in your membership.',
        },
        {
          title: 'Check your email and SMS:',
          body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
        },
        {
          body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
        },
      ];
    } else if (isBundled && isQuarterlyCompound && region !== 'CA') {
      return [
        {
          title: 'Provider review: ',
          body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, you will receive 3 vials (1 vial per month) in 1 package shipped to your home.',
        },
        {
          title: 'Rx shipped:',
          body: 'You will receive 1 shipment with 3 vials shipped directly to your home. Your Rx charge is included in your membership.',
        },
        {
          title: 'Check your email and SMS:',
          body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
        },
        {
          body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
        },
      ];
    } else if (isBundled && isQuarterlyCompound && region === 'CA') {
      return [
        {
          title: 'Provider review: ',
          body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, you will receive 3 packages (1 vial per month) shipped to your home.',
        },
        {
          title: 'Rx shipped:',
          body: 'Your first month of medication will arrive at your door if prescribed, and then you will receive another shipment a month later with your second month’s supply and an additional month later with your third month’s supply. Your payment was for all 3 shipments, which is included in your membership.',
        },
        {
          title: 'Check your email and SMS:',
          body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed. You will receive an email for each package (each month for 3 months) once it’s been processed, shipped, and delivered.',
        },
      ];
    } else if (isQuarterlyCompound && region !== 'CA') {
      return [
        {
          title: 'Provider review: ',
          body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive 3 vials (1 vial per month) in 1-3 shipments.',
        },
        {
          title: 'Rx shipped:',
          body: ' If prescribed, you will be charged and will receive 1-3 shipments with your 3-month supply of Rx. Your payment will be for all 3 vials.',
        },
        {
          title: 'Check your email and SMS:',
          body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed.',
        },
      ];
    } else if (isQuarterlyCompound && region === 'CA') {
      return [
        {
          title: 'Provider review: ',
          body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication. If your Rx is refilled, your payment method will be charged and you will receive 3 packages (1 vial / package per month) shipped to your home.',
        },
        {
          title: 'Rx shipped:',
          body: 'Your first month of medication will arrive at your door if prescribed, and then you will receive another shipment a month later with your second month’s supply and an additional month later with your third month’s supply. Your payment will be for all 3 shipments.',
        },
        {
          title: 'Check your email and SMS:',
          body: 'We’ll send you a message if your Provider has any questions or when your refill has been processed. You will receive an email for each package (each month for 3 months) once it’s been processed, shipped, and delivered.',
        },
      ];
    }
  } else {
    return [
      {
        title: 'Provider review: ',
        body: 'It generally takes 1-3 business days for your Zealthy provider to review your responses and refill your medication.',
      },
      {
        title: 'Check your email and SMS:',
        body: 'We’ll send you a message if your Provider has any questions or when your refill is ready at your pharmacy.',
      },
      {
        body: 'While you wait, chat with your coordinator if you have questions about what to expect with your refill.',
      },
    ];
  }
}

const RefillResponsesReviewed = ({ nextPage }: ResponsesReviewedProps) => {
  const { data: patient } = usePatient();
  const { data: prescriptionRequests } = usePatientPrescriptionRequest();
  const { data: patientSubscriptions } = useActivePatientSubscription();
  const { specificCare } = useIntakeState();
  const isPatientPortal =
    window && window.location.pathname.includes('patient-portal');
  const [showMarketingQuestion, setShowMarketingQuestion] = useState(
    !isPatientPortal
  );
  const { medications, questionnaires } = useVisitState();
  const appointment = useAppointmentSelect(appointments =>
    appointments.find(a => a.appointment_type === 'Provider')
  );

  const weightLossRequestType = useMemo(() => {
    if (!prescriptionRequests) {
      return undefined;
    }
    if (
      prescriptionRequests.some(
        p =>
          (p.medication_quantity_id === 98 &&
            p.status === 'REQUESTED' &&
            p?.specific_medication?.toLowerCase()?.includes('semaglutide')) ||
          p?.specific_medication?.toLowerCase()?.includes('tirzepatide')
      )
    ) {
      return 'COMPOUND_ONLY';
    }
    if (
      questionnaires?.some(q => q?.name === 'weight-loss-quarterly-checkin')
    ) {
      return 'CHECK_IN_ONLY';
    }
    return 'REGULAR_ONLY';
  }, [prescriptionRequests]);

  const isBundled = useMemo(() => {
    if (!patientSubscriptions) {
      return undefined;
    }
    return patientSubscriptions?.some(s =>
      [297, 449, 891].includes(s.price || 0)
    );
  }, [patientSubscriptions]);

  const listItems = getListItems(
    medications[0]?.recurring?.interval_count === 3,
    weightLossRequestType,
    patient?.region!,
    isBundled
  );
  const calculatedSpecificCare = useCalculateSpecificCare();

  useEffect(() => {
    if (
      specificCare == 'Weight loss' ||
      calculatedSpecificCare == 'Weight loss'
    ) {
      window.freshpaint?.track('weight-loss-post-checkout-responses-reviewed');
    }
  }, [calculatedSpecificCare, specificCare]);

  useEffect(() => {
    window.freshpaint?.track('post-checkout-responses-reviewed');
  }, []);
  useEffect(() => {
    // Prevent navigating back using browser's back button
    const handlePopstate = () => {
      // Revert the navigation attempt by going forward again
      window.history.forward();
    };

    // Attach the event listener when the component mounts
    window.addEventListener('popstate', handlePopstate);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);
  return (
    <Container maxWidth="xs">
      {showMarketingQuestion ? (
        <MarketingQuestion onContinue={() => setShowMarketingQuestion(false)} />
      ) : (
        <>
          <Typography variant="h2" sx={{ marginBottom: '1rem' }}>
            {getHeader(specificCare || SpecificCareOption.DEFAULT)}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: '2rem' }}>
            {getBody(specificCare || SpecificCareOption.DEFAULT)}
          </Typography>
          <List
            sx={{
              listStyleType: 'disc',
              pl: 3,
              marginBottom: '3rem',
            }}
            disablePadding
          >
            {listItems?.map((item, index) => (
              <ListItem key={index} sx={{ display: 'list-item', padding: 0 }}>
                <Typography>
                  {item.title && <b>{`${item.title} `}</b>}
                  {item.body}
                </Typography>
              </ListItem>
            ))}
          </List>
          <Button
            type="button"
            fullWidth
            onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
          >
            Continue
          </Button>
        </>
      )}
    </Container>
  );
};

export default RefillResponsesReviewed;

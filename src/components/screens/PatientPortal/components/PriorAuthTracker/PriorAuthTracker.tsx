import { Stack, Typography, Box, Collapse, Icon } from '@mui/material';
import { usePatientPriorAuths } from '@/components/hooks/data';
import PriorAuthCard from './components/PriorAuthCard';
import { useState } from 'react';
import {
  Add,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Remove,
} from '@mui/icons-material';
import { PatientSubscriptionProps } from '@/lib/auth';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';

import { PriorAuth } from '@/components/hooks/data';

interface Props {
  subscriptions?: PatientSubscriptionProps[];
  bundle: boolean;
}

const PriorAuthTracker = ({ subscriptions, bundle = false }: Props) => {
  const { data: priorAuths } = usePatientPriorAuths();
  const [displayPrior, setDisplayPrior] = useState<boolean>(false);
  const [displayAnswer, setDisplayAnswer] = useState(null);

  if (!priorAuths) return null;

  const recentPriorAuth: PriorAuth = priorAuths[0];

  const filteredPriorAuths = priorAuths?.filter((item: PriorAuth) => {
    if (item) {
      const daysDifference = differenceInDays(
        new Date(),
        new Date(item?.date_approved || '')
      );

      return (
        ['PA Approved']?.includes(item?.status || '') && daysDifference <= 180
      );
    }
    return false;
  });

  function filteredOldPriorAuths(
    priorAuths: PriorAuth[],
    approved: PriorAuth[]
  ) {
    const newPAs = priorAuths?.filter((pa: any) => {
      // Filter based on existence of id
      if (pa?.id) {
        // Check if there's no matching approved item with the same id
        const daysDifference = differenceInDays(
          new Date(),
          new Date(pa.date_approved)
        );
        return (
          (approved?.length === 0 && pa.id !== recentPriorAuth.id) ||
          (approved?.some((apa: any) => apa.id !== pa.id) &&
            pa.id !== recentPriorAuth.id)
        );
      }
      return true; // Include items without id
    });

    return newPAs || [];
  }

  const olderPriorAuths = filteredOldPriorAuths(priorAuths, filteredPriorAuths);

  const handleDisplay = () => {
    setDisplayPrior(displayPrior => !displayPrior);
  };
  const handleDisplayAnswer = (question: any) => {
    setDisplayAnswer(displayAnswer =>
      displayAnswer === question ? null : question
    );
  };

  const hasActiveSubscription: any = subscriptions?.some(
    subscription => subscription.status === 'active'
  );

  const scheduledForCancelationSub = subscriptions?.find(
    subscription => subscription.status === 'scheduled_for_cancelation'
  );

  let daysUntilCancellation = 0;

  if (scheduledForCancelationSub && scheduledForCancelationSub?.cancel_at) {
    const currentDate = new Date();
    daysUntilCancellation = differenceInDays(
      new Date(scheduledForCancelationSub?.cancel_at),
      currentDate
    );
  }

  const commonQuestions = [
    {
      question: 'What is a PA?',
      answer:
        'A prior authorization (PA) is paperwork that your coordination team at Zealthy files with your insurance company to request coverage for a medication that is not typically covered. What insurance calls “medical necessity” needs to be met for them to cover the service or medication, which is why it is important to share as much information in your intake as possible and share any supplemental information requested by the Zealthy team. Zealthy works hard to get your PA for GLP-1 medications like Wegovy that often aren’t covered by insurance.',
    },
    {
      question: 'How long will it take to hear back for a PA?',
      answer:
        'We hate this answer, but it depends! It is typically 2-14 business days, and we will push for sooner.',
    },
    {
      question: 'Where does a PA go and who reviews it?',
      answer:
        'Your Zealthy coordination team will send your PA to your insurance to review. Some insurers review these themselves, whereas others will contract with a Pharmacy Benefits Manager to review.',
    },
    {
      question: 'How does insurance decide on “medical necessity”?',
      answer: (
        <>
          Medical necessity, as defined by health insurers, typically requires
          clinical evidence, including clinical/chart notes, labs, or diagnosis
          codes that show the service or medication is “necessary” treatment for
          according to the policies defined by that insurer. If your Zealthy
          care team deems that the treatment is clinically appropriate, your
          Zealthy coordination team will work hard to ensure that your insurer
          understands the “medical necessity”. If we are unsuccessful, we also
          have options to order compound semaglutide, the active ingredient in
          Wegovy and Ozempic, for as little as $151/month, or compound
          tirzepatide, the active ingredient in Mounjaro and Zepbound, for as
          little as $216/month. You can use this{' '}
          <Link href="/patient-portal/weight-loss-treatment/compound">
            link
          </Link>{' '}
          to request compound semaglutide and tirzepatide.
        </>
      ),
    },
    {
      question:
        'What if my insurance refuses to approve a PA for GLP-1 medication?',
      answer: (
        <>
          We have other options for you! While we will work hard to help you get
          GLP-1 covered by your insurance (if clinically appropriate), Zealthy
          members also have access to compound semaglutide, the active
          ingredient in Wegovy and Ozempic, for as little as $151/month, or
          compound tirzepatide, the active ingredient in Mounjaro and Zepbound,
          for as little as $216/month. You can use this{' '}
          <Link href="/patient-portal/weight-loss-treatment/compound">
            link
          </Link>{' '}
          to request compound semaglutide or tirzepatide.
        </>
      ),
    },
  ];

  return (
    <>
      <Stack gap="2rem">
        {recentPriorAuth && (
          <PriorAuthCard
            priorAuth={recentPriorAuth}
            hasActiveSubscription={hasActiveSubscription}
            daysUntilCancellation={daysUntilCancellation}
          />
        )}
        {filteredPriorAuths &&
          filteredPriorAuths.some(
            (fpa: PriorAuth) => fpa.id !== recentPriorAuth.id
          ) &&
          filteredPriorAuths.map((priorAuth: PriorAuth) => (
            <PriorAuthCard
              key={priorAuth.id}
              priorAuth={priorAuth}
              hasActiveSubscription={hasActiveSubscription}
              daysUntilCancellation={daysUntilCancellation}
            />
          ))}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: '#777777',
          }}
          onClick={handleDisplay}
        >
          <Typography sx={{ fontWeight: '600' }}>
            View prior PA statuses
          </Typography>
          <Icon sx={{ color: '#777777' }}>
            {displayPrior ? <Remove /> : <Add />}
          </Icon>
        </Box>
        <Collapse in={displayPrior} timeout="auto" unmountOnExit>
          <Stack sx={{ gap: '2rem' }}>
            {olderPriorAuths &&
              olderPriorAuths.some(
                (opa: PriorAuth) => opa.id !== recentPriorAuth.id
              ) &&
              olderPriorAuths.map((priorAuth: PriorAuth) => (
                <PriorAuthCard
                  key={priorAuth.id}
                  priorAuth={priorAuth}
                  hasActiveSubscription={hasActiveSubscription}
                  daysUntilCancellation={daysUntilCancellation}
                />
              ))}
          </Stack>
        </Collapse>
      </Stack>
      <Stack sx={{ gap: '1rem' }}>
        <Typography fontWeight="600">Common Questions</Typography>
        <Stack sx={{ gap: '0.5rem' }}>
          {commonQuestions &&
            commonQuestions.map((cq, i) => (
              <>
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <Stack sx={{ gap: '0.5rem' }}>
                    <Typography
                      variant="h6"
                      onClick={() => handleDisplayAnswer(cq.question)}
                    >
                      {cq.question}
                    </Typography>
                    <Collapse
                      in={displayAnswer === cq.question}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Typography variant="subtitle2" sx={{ color: '#535353' }}>
                        {cq.answer}
                      </Typography>
                    </Collapse>
                  </Stack>
                  <Icon onClick={() => handleDisplayAnswer(cq.question)}>
                    {displayAnswer === cq.question ? (
                      <KeyboardArrowUp />
                    ) : (
                      <KeyboardArrowDown />
                    )}
                  </Icon>
                </Box>
                <hr
                  style={{
                    borderTop: '1px solid #bbb',
                    width: '100%',
                  }}
                />
              </>
            ))}
        </Stack>
      </Stack>
    </>
  );
};

export default PriorAuthTracker;

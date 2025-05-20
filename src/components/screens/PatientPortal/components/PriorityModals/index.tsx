import { useEffect, useState, useCallback, useRef } from 'react';
import VerifyIDModal from '@/components/shared/layout/PatientPortalNav/components/VerifyIDModal';
import { Database } from '@/lib/database.types';
import { UnseenMessagesModal } from '../UnseenMessagesModal';
import RateGoogleModal from '../RateGoogleModal';
import MobileDownloadPopup from '@/components/screens/Question/components/MobileAppDownload/MobileDownloadPopup';
import RateBBBModal from '../RateBBBModal';
import RateTrustpilotModal from '../RateTrustpilotModal';
import RateZealthyModal from '../RateZealthyModal';
import { differenceInMonths } from 'date-fns';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import {
  PatientSubscriptionProps,
  useHasUnseenMessages,
} from '@/components/hooks/data';
import { ApptProps, Order } from '../../PatientPortal';

type Patient = Database['public']['Tables']['patient']['Row'];

export type ModalQueueType =
  | 'VID'
  | 'UnseenMessages'
  | 'Google'
  | 'BBB'
  | 'TP'
  | 'MobileDownload'
  | 'RateZealthy'
  | 'RateZealthyGeneric'
  | null;

const DELAY_BETWEEN_MODALS = 3 * 60 * 1000; // 3 minutes in milliseconds
const CHECK_INTERVAL = 30 * 1000; // 30 seconds between checks
const MODALS_BEFORE_DELAY = 3; // Number of modals to show before adding delay
const POST_DELAY = 60 * 1000; // 1 minute delay after first 3 modals
const INITIAL_LOAD_DELAY = 2000; // 2 seconds delay after page load
const ACTIVE_RATING_KEY = 'zealthy_active_rating_modal';

type Props = {
  patient: Patient;
  allVisibleSubs: PatientSubscriptionProps[] | undefined;
  hasActiveSub: boolean;
  refetchSubs?: () => void;
};

export default function PriorityModals({
  patient,
  allVisibleSubs,
  hasActiveSub,
  refetchSubs,
}: Props) {
  const supabase = useSupabaseClient<Database>();
  const [currentModal, setCurrentModal] = useState<ModalQueueType>(null);
  const { data: unseenMessages } = useHasUnseenMessages();
  const [rateModals, setRateModals] = useState<ModalQueueType[]>([]);
  const [lastModalClosedTime, setLastModalClosedTime] = useState<number>(
    Date.now()
  );
  const lastShownUnseenMessagesCount = useRef<number | null>(null);
  const hasShownVIDModal = useRef<boolean>(false);
  const modalsShownInSession = useRef<number>(0);
  const shownModalsInSession = useRef<Set<ModalQueueType>>(new Set());
  const [feedbackChecked, setFeedbackChecked] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const initialLoadTimeout = useRef<NodeJS.Timeout>();

  // Reset feedback checked state on mount to ensure modals show after logout/login
  useEffect(() => {
    setFeedbackChecked(false);
  }, []);

  const pushToRateModals = useCallback((modalName: ModalQueueType) => {
    setRateModals(prevModals => {
      const newModals = [...prevModals, modalName];
      return newModals;
    });
  }, []);

  const closeCurrentModal = useCallback(() => {
    if (currentModal === 'RateZealthy') {
      localStorage.removeItem(ACTIVE_RATING_KEY);
    }
    const newLastModalClosedTime = Date.now();
    setLastModalClosedTime(newLastModalClosedTime);
    localStorage.setItem(
      'lastModalClosedTime',
      newLastModalClosedTime.toString()
    );
    setCurrentModal(null);
    modalsShownInSession.current += 1;
    shownModalsInSession.current.add(currentModal);
  }, [currentModal]);

  const checkNextModal = useCallback(() => {
    const activeRatingModal = localStorage.getItem(ACTIVE_RATING_KEY);
    if (activeRatingModal && activeRatingModal !== 'RateZealthy') {
      return;
    }

    const timeElapsed = Date.now() - lastModalClosedTime;
    const shouldDelay = modalsShownInSession.current >= MODALS_BEFORE_DELAY;
    const requiredDelay = shouldDelay ? POST_DELAY : 0;

    if (currentModal !== null) {
      return;
    }

    if (shouldDelay && timeElapsed < requiredDelay) {
      return;
    }

    if (
      !patient.has_verified_identity &&
      !hasShownVIDModal.current &&
      !shownModalsInSession.current.has('VID')
    ) {
      hasShownVIDModal.current = true;
      setCurrentModal('VID');
      return;
    }

    if (
      Boolean(unseenMessages?.data?.length) &&
      (lastShownUnseenMessagesCount.current === null ||
        unseenMessages?.data?.length !== lastShownUnseenMessagesCount.current)
    ) {
      setCurrentModal('UnseenMessages');
      lastShownUnseenMessagesCount.current = unseenMessages?.data?.length ?? 0;
      return;
    }

    if (
      allVisibleSubs?.[0]?.created_at &&
      !shownModalsInSession.current.has('RateZealthy') &&
      timeElapsed >= DELAY_BETWEEN_MODALS // Make sure 3 minutes have passed
    ) {
      const subAgeInMonths = differenceInMonths(
        new Date(),
        new Date(allVisibleSubs[0].created_at)
      );
      const shouldShowRateZealthy =
        [1, 2, 3, 4, 5, 6, 9, 12].includes(subAgeInMonths) ||
        (subAgeInMonths > 12 && subAgeInMonths % 3 === 0);

      if (shouldShowRateZealthy && patient?.id) {
        setFeedbackChecked(true);
        localStorage.setItem(ACTIVE_RATING_KEY, 'RateZealthy');
        const checkFeedback = async () => {
          try {
            const { data: feedback, error: feedbackError } = await supabase
              .from('subscriber_feedback')
              .select('*')
              .eq('patient_id', patient.id)
              .eq('month_interval', subAgeInMonths)
              .single();

            const hasRating =
              feedback?.score !== null && feedback?.score !== undefined;
            const hasMaxSkips = (feedback?.skip_count ?? 0) >= 3;
            const hasSkips = (feedback?.skip_count ?? 0) > 0;

            // Get lastSkipTime from localStorage
            const storedLastSkipTime = localStorage.getItem('lastSkipTime');
            const timeSinceLastSkip = storedLastSkipTime
              ? Date.now() - parseInt(storedLastSkipTime, 10)
              : null;

            const shouldWait =
              hasSkips &&
              timeSinceLastSkip &&
              timeSinceLastSkip < DELAY_BETWEEN_MODALS;

            if (hasRating || hasMaxSkips) {
              return;
            }

            if (shouldWait) {
              return;
            }

            setCurrentModal('RateZealthy');
          } catch (error) {
            console.error('Error checking feedback in PriorityModals:', error);
          }
        };
        void checkFeedback();
      }
      return;
    }

    if (rateModals.length > 0 && hasActiveSub) {
      const nextModal = rateModals[0];
      if (!shownModalsInSession.current.has(nextModal)) {
        if (nextModal === 'RateZealthy') {
          const checkRateZealthy = async () => {
            try {
              const subAgeInMonths = differenceInMonths(
                new Date(),
                new Date(allVisibleSubs?.[0]?.created_at ?? '')
              );
              const { data: feedback } = await supabase
                .from('subscriber_feedback')
                .select('*')
                .eq('patient_id', patient.id)
                .eq('month_interval', subAgeInMonths)
                .single();

              const hasRating = feedback?.score !== null;
              const hasMaxSkips = (feedback?.skip_count ?? 0) >= 3;
              const hasSkips = (feedback?.skip_count ?? 0) > 0;

              // Get lastSkipTime from localStorage
              const storedLastSkipTime = localStorage.getItem('lastSkipTime');
              const timeSinceLastSkip = storedLastSkipTime
                ? Date.now() - parseInt(storedLastSkipTime, 10)
                : null;

              const shouldWait =
                hasSkips &&
                timeSinceLastSkip &&
                timeSinceLastSkip < DELAY_BETWEEN_MODALS;

              if (hasRating || hasMaxSkips) {
                setRateModals(prev => prev.slice(1));
                return;
              }

              if (shouldWait) {
                return;
              }

              setCurrentModal(nextModal);
              setRateModals(prev => prev.slice(1));
            } catch (error) {
              console.error(
                'Error checking feedback for queued RateZealthy modal:',
                error
              );
            }
          };
          void checkRateZealthy();
        } else {
          setCurrentModal(nextModal);
          setRateModals(prev => prev.slice(1));
        }
      }
    }
  }, [
    currentModal,
    lastModalClosedTime,
    patient,
    unseenMessages,
    allVisibleSubs,
    rateModals,
    hasActiveSub,
    supabase,
    feedbackChecked,
  ]);

  useEffect(() => {
    initialLoadTimeout.current = setTimeout(() => {
      setIsInitialLoad(false);
    }, INITIAL_LOAD_DELAY);

    return () => {
      if (initialLoadTimeout.current) {
        clearTimeout(initialLoadTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    checkNextModal();
    const intervalId = setInterval(checkNextModal, CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [checkNextModal]);

  useEffect(() => {
    const storedLastModalClosedTime = localStorage.getItem(
      'lastModalClosedTime'
    );
    if (storedLastModalClosedTime) {
      const parsedTime = parseInt(storedLastModalClosedTime, 10);
      if (!isNaN(parsedTime)) {
        setLastModalClosedTime(parsedTime);
      }
    } else {
      const fourMinutesAgo = Date.now() - 4 * 60 * 1000;
      setLastModalClosedTime(fourMinutesAgo);
    }
  }, []);

  return (
    <>
      <VerifyIDModal
        isOpen={currentModal === 'VID'}
        setClose={closeCurrentModal}
      />
      <UnseenMessagesModal
        isOpen={currentModal === 'UnseenMessages'}
        count={unseenMessages?.data?.length || 0}
        onClose={closeCurrentModal}
      />
      {allVisibleSubs?.[0]?.created_at && (
        <RateZealthyModal
          createdAt={allVisibleSubs?.[0]?.created_at}
          refetch={refetchSubs}
          isOpen={currentModal === 'RateZealthy'}
          onClose={closeCurrentModal}
          addToQueue={pushToRateModals}
        />
      )}
      <RateGoogleModal
        isOpen={currentModal === 'Google'}
        onClose={closeCurrentModal}
        addToQueue={pushToRateModals}
      />
      <RateBBBModal
        isOpen={currentModal === 'BBB'}
        onClose={closeCurrentModal}
        addToQueue={pushToRateModals}
      />
      <RateTrustpilotModal
        isOpen={currentModal === 'TP'}
        onClose={closeCurrentModal}
        addToQueue={pushToRateModals}
      />
      <MobileDownloadPopup
        open={currentModal === 'MobileDownload'}
        onClose={closeCurrentModal}
        addToQueue={pushToRateModals}
      />
    </>
  );
}

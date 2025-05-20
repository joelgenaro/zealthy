import { useState, useEffect } from 'react';

type ModalQueueItem = string[];

// Modal priorities (lower value = higher priority)
const modalPriorities: Record<string, number> = {
  VIDModal: 1,
  UnseenMessagesModal: 2,
  RateModal: 3,
  DownloadAppModal: 4,
};

// Utility function to get the last closed time from localStorage
const getLastClosedTime = (): number | null => {
  const storedTime = localStorage.getItem('lastClosedTime');
  return storedTime ? parseInt(storedTime, 10) : null;
};

// Utility function to set the last closed time in localStorage
const setLastClosedTime = (time: number) => {
  localStorage.setItem('lastClosedTime', time.toString());
};

// Custom Hook to manage the modal queue
export const useModalQueue = () => {
  const [modalQueue, setModalQueue] = useState<ModalQueueItem>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Function to add a modal to the queue and check if it should be opened
  const addToModalQueue = (modalName: string) => {
    setModalQueue(prevQueue => {
      if (!prevQueue.includes(modalName)) {
        const newQueue = [...prevQueue, modalName].sort(
          (a, b) => modalPriorities[a] - modalPriorities[b]
        );
        console.log(
          `[ModalQueue] Added ${modalName}. Updated queue:`,
          newQueue
        );
        return newQueue;
      }
      console.log(`[ModalQueue] ${modalName} is already in the queue.`);
      return prevQueue;
    });
  };

  // Effect to handle modal display based on the queue
  useEffect(() => {
    if (modalQueue.length > 0) {
      const currentModal = modalQueue[0];
      console.log(`[ModalQueue] Processing modal: ${currentModal}`);
      const shouldOpen = checkShouldOpenModal(currentModal);

      if (shouldOpen) {
        console.log(`[ModalQueue] Opening modal: ${currentModal}`);
        setActiveModal(currentModal);
        setIsOpen(true);
      } else {
        const lastClosedTime = getLastClosedTime();
        const now = Date.now();
        const timePassed = lastClosedTime ? now - lastClosedTime : 0;

        if (timePassed < 3 * 60 * 1000) {
          const timeRemaining = 100;
          console.log(
            `[ModalQueue] Timer set for ${timeRemaining} ms for modal: ${currentModal}`
          );

          const timer = setTimeout(() => {
            console.log(`[ModalQueue] Opening delayed modal: ${currentModal}`);
            setActiveModal(currentModal);
            setIsOpen(true);
          }, timeRemaining);

          return () => clearTimeout(timer); // Cleanup the timer
        }
      }
    } else {
      console.log('[ModalQueue] No modals to process, clearing state.');
      setIsOpen(false);
      setActiveModal(null);
      console.log('[ModalQueue]', modalQueue);
    }
  }, [modalQueue]);

  // Function to check if the modal should be opened immediately
  const checkShouldOpenModal = (modalName: string): boolean => {
    const now = Date.now();
    const lastClosedTime = getLastClosedTime();

    if (!lastClosedTime || now - lastClosedTime > 3 * 60 * 1000) {
      console.log(
        `[ModalQueue] Enough time has passed, opening modal: ${modalName}`
      );
      return true;
    }

    console.log(
      `[ModalQueue] Not enough time has passed since last modal closed for: ${modalName}`
    );
    return false;
  };

  // Function to close the modal and move the queue
  const closeModal = (modalName: string) => {
    setModalQueue(prevQueue => prevQueue.filter(modal => modal !== modalName));
    const now = Date.now();
    setLastClosedTime(now); // Store the last closed time in localStorage
    console.log(`[ModalQueue] Closed ${modalName}. Modal closed at ${now}.`);
    console.log(`[ModalQueue] Updated queue:`, modalQueue);
    setIsOpen(false);
    setActiveModal(null);
  };

  // Log the state of the queue and active modal for debugging purposes
  useEffect(() => {
    console.log(`[ModalQueue] Current queue:`, modalQueue);
    console.log(`[ModalQueue] Active modal:`, activeModal);
    console.log(`[ModalQueue] Modal isOpen:`, isOpen);
  }, [modalQueue, activeModal, isOpen]);

  return {
    modalQueue,
    addToModalQueue,
    closeModal,
    isOpen,
    activeModal,
  };
};

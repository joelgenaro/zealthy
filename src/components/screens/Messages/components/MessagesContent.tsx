import DOMPurify from 'dompurify';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { Database } from '@/lib/database.types';
import {
  useMarkMessagesRead,
  useSendMessage,
} from '@/components/hooks/mutations';
import {
  PatientProps,
  useMessagesByGroup,
  useWeightLossSubscription,
  usePatientAuthorizeOrders,
} from '@/components/hooks/data';
import {
  useReactivateSubscription,
  useUpdateMessageHelpful,
} from '@/components/hooks/mutations';
import { MobileContent } from './MobileContent';
import { DesktopContent } from './DesktopContent';
import { MessageItemI } from '@/types/messageItem';

interface MessagesContentProps {
  allMessages: any;
  patient: PatientProps | null;
  selectedMessage: MessageItemI | null;
  handleOnClick: (item: MessageItemI) => void;
}

export function MessagesContent({
  selectedMessage,
  allMessages,
  patient,
  handleOnClick,
}: MessagesContentProps) {
  allMessages = allMessages?.sort(
    (a: MessageItemI, b: MessageItemI) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  allMessages = allMessages?.sort((a: MessageItemI, b: MessageItemI) => {
    const aDisabled = a.messages_group_id?.disabled_at ? 1 : 0;
    const bDisabled = b.messages_group_id?.disabled_at ? 1 : 0;
    return aDisabled - bDisabled;
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const updateMessageHelpful = useUpdateMessageHelpful();
  const { data: weightLossSubscriptions, refetch } =
    useWeightLossSubscription();
  const { data: pendingOrders, refetch: refetchPendingOrders } =
    usePatientAuthorizeOrders();
  const {
    data: messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessagesByGroup(selectedMessage?.messages_group_id.id);
  const { mutate: markMessagesRead } = useMarkMessagesRead();

  const [loading, setLoading] = useState(false);
  const [messageContent, setMessageContent] = useState<string>('');
  const [canvasPractitionerId, setCanvasPractitionerId] = useState<string>('');
  const [showReactivateSubscriptionModal, setShowReactivateSubscriptionModal] =
    useState<boolean>(false);
  const supabase = useSupabaseClient<Database>();
  const canceledWeightLoss = weightLossSubscriptions?.status === 'canceled';
  const activeWeightLoss = weightLossSubscriptions?.status === 'active';

  const reactivateSubscription = useReactivateSubscription();
  const sendMessageMutation = useSendMessage();

  const handleReactivation = useCallback(async () => {
    await reactivateSubscription.mutateAsync(
      weightLossSubscriptions?.reference_id || ''
    );
  }, [reactivateSubscription, weightLossSubscriptions?.reference_id]);

  const lastMessage =
    messages?.pages[messages?.pages?.length - 1]?.slice(-1)[0];
  const patientSentLastMessage =
    lastMessage?.sender?.id === patient?.profile_id;

  const handleSendMessage = async () => {
    if (messageContent.trim().length === 0) {
      return setMessageContent('');
    }
    setLoading(true);
    //illusion of speed.
    setTimeout(() => setLoading(false), 600);
    if (canceledWeightLoss) {
      setShowReactivateSubscriptionModal(true);
    } else {
      sendMessageMutation
        .mutateAsync({
          data: {
            message: DOMPurify.sanitize(messageContent.trim()),
            sender: `Patient/${patient?.profile_id}`,
            recipient: `Practitioner/${
              selectedMessage?.members.find((m: any) => m.clinician?.id)
                .clinician.profile_id
            }`,
            groupId: selectedMessage?.messages_group_id?.id,
            notify: false,
            messageToSkipId,
          },
        })
        .then(() => setMessageContent(''));

      //toast error will display if message send fails from mutation hook
    }
  };

  let currentTime = new Date();
  let automatedMessage = null;
  let messageToSkipId = 0;

  if (selectedMessage?.display_at !== null) {
    automatedMessage = selectedMessage;
  }
  if (automatedMessage) {
    const displayAtDate = new Date(automatedMessage?.display_at);
    if (displayAtDate > currentTime) {
      messageToSkipId = automatedMessage.id;
    }
  }

  const handleClose = useCallback(() => {
    refetch();
    setShowReactivateSubscriptionModal(false);
  }, [refetch]);

  async function updateMessage(id: number, was_helpful: boolean) {
    const updated = await updateMessageHelpful.mutateAsync({
      id,
      was_helpful,
    });

    if (updated.status === 204) {
      if (!was_helpful) {
        const addToQueue = await supabase
          .from('task_queue')
          .insert({
            provider_type: 'Lead Coordinator',
            task_type: 'UNHELPFUL_MESSAGE',
            patient_id: patient?.id,
            queue_type: 'Lead Coordinator',
          })
          .select()
          .single()
          .then(({ data }) => data);

        await supabase
          .from('messages-v2')
          .update({ queue_id: addToQueue?.id })
          .eq('id', id);
      }
    }

    return updated;
  }

  useEffect(() => {
    // Select all li elements with class "ql-indent-1" within the rendered component
    const liElements = document.querySelectorAll('.ql-indent-1');

    // Apply custom styles to each selected li element
    liElements.forEach((liElement: any) => {
      liElement.style.marginLeft = '1em';
      liElement.style.listStyleType = 'disc';
    });
    const liElementsTwo = document.querySelectorAll('.ql-indent-2');

    // Apply custom styles to each selected li element
    liElementsTwo.forEach((liElement: any) => {
      liElement.style.marginLeft = '2em';
    });

    // Mark new messages as unread
    const flattenedMessages = messages?.pages?.flat() ?? [];
    const newMessages = flattenedMessages.filter(
      (message: any) => message.has_seen === false
    );

    if (newMessages.length === 0) return;

    const messageIds = newMessages.map((message: any) => message.id);

    markMessagesRead({ messageIds });
  }, [messages]);

  //Pagination functions and variables for messages
  const paginationFunctionalities = {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  };

  return isMobile ? (
    <MobileContent
      selectedMessage={selectedMessage}
      allMessages={allMessages}
      patient={patient}
      handleOnClick={handleOnClick}
      canceledWeightLoss={canceledWeightLoss}
      handleSendMessage={handleSendMessage}
      loading={loading}
      updateMessage={updateMessage}
      messages={messages}
      messageContent={messageContent}
      setMessageContent={setMessageContent}
      patientSentLastMessage={patientSentLastMessage}
      pendingOrders={pendingOrders}
      open={showReactivateSubscriptionModal}
      onClose={handleClose}
      onConfirm={handleReactivation}
      refetchPendingOrders={refetchPendingOrders}
      onPagination={paginationFunctionalities}
    />
  ) : (
    <DesktopContent
      selectedMessage={selectedMessage}
      allMessages={allMessages}
      patient={patient}
      handleOnClick={handleOnClick}
      canceledWeightLoss={canceledWeightLoss}
      activeWeightLoss={activeWeightLoss}
      handleSendMessage={handleSendMessage}
      loading={loading}
      updateMessage={updateMessage}
      messages={messages}
      messageContent={messageContent}
      setMessageContent={setMessageContent}
      patientSentLastMessage={patientSentLastMessage}
      pendingOrders={pendingOrders}
      open={showReactivateSubscriptionModal}
      onClose={handleClose}
      onConfirm={handleReactivation}
      refetchPendingOrders={refetchPendingOrders}
      onPagination={paginationFunctionalities}
    />
  );
}

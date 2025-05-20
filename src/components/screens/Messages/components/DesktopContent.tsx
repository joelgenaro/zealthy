import { useEffect, useState, useRef, Fragment } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ListMenuDesktop } from './ListMenu';
import {
  OrderPrescriptionProps,
  PatientProps,
  useAllClinicians,
  usePatientCoach,
} from '@/components/hooks/data';
import { ExpectedResponseTime } from './ExpectedResponseTime';
import { careTeamGroups } from '@/utils/careTeamGroups';
import ReactivateSubscriptionModal from '@/components/shared/ReactivateSubscriptionModal/ReactivateSubscriptionModal';
import toast from 'react-hot-toast';
import { StandardModal } from '@/components/shared/modals';
import Spinner from '@/components/shared/Loading/Spinner';
import ReactivateWeightLossModal from '@/components/shared/ReactivateWeightLossModal';
import { useIntersectionObserver } from '@/components/hooks/useIntersectionObserver';
import { DesktopMessageItem } from './DesktopMessageItem';
import { MessageItemI } from '@/types/messageItem';
import DOMPurify from 'dompurify';
import { format } from 'date-fns';

interface DesktopContentProps {
  messages: any;
  allMessages: any;
  loading: boolean;
  messageContent: string;
  canceledWeightLoss: boolean;
  activeWeightLoss: boolean;
  patient: PatientProps | null;
  patientSentLastMessage: boolean;
  pendingOrders?: OrderPrescriptionProps[];
  selectedMessage: MessageItemI | null;
  open: boolean;
  handleSendMessage: () => void;
  setMessageContent: (message: string) => void;
  handleOnClick: (item: MessageItemI) => void;
  updateMessage: (id: number, was_helpful: boolean) => void;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  refetchPendingOrders: () => void;
  onPagination: {
    fetchNextPage: () => void;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    isLoading: boolean;
  };
}

export function DesktopContent({
  selectedMessage,
  allMessages,
  patient,
  handleOnClick,
  canceledWeightLoss,
  activeWeightLoss,
  handleSendMessage,
  loading,
  updateMessage,
  messages,
  messageContent,
  setMessageContent,
  patientSentLastMessage,
  pendingOrders,
  open,
  onClose,
  onConfirm,
  refetchPendingOrders,
  onPagination,
}: DesktopContentProps) {
  const zealthyIcon = '/favicon_cream_black_256x256.png';
  const [loadingApproval, setLoadingApproval] = useState(false);
  const [showReactivateWLModal, setShowReactivateWLModal] = useState(false);
  const { data: clinicians } = useAllClinicians();
  const loadMoreRef = useRef();
  const { fetchNextPage, isFetchingNextPage, hasNextPage, isLoading } =
    onPagination;
  const [initialLoad, setInitialLoad] = useState<boolean>(!selectedMessage);
  const { data: patientCoach } = usePatientCoach();
  const patientCoachName = `${patientCoach?.first_name} ${patientCoach?.last_name}`;

  useEffect(() => {
    if (selectedMessage) {
      setInitialLoad(true);
    }
  }, [selectedMessage]);

  const chatBoxRef = useRef(null);
  const [userScrolledUp, setUserScrolledUp] = useState<boolean>(false);

  const isThreadDisabled = !!selectedMessage?.messages_group_id?.disabled_at;

  const handleScroll = () => {
    if (chatBoxRef?.current) {
      const chatBox = chatBoxRef.current as HTMLDivElement;
      const difference = chatBox.scrollHeight - chatBox.clientHeight;

      const isScrolledUp =
        chatBox.scrollTop < difference - 0.5 * chatBox.clientHeight;

      setUserScrolledUp(isScrolledUp);
    }
  };

  useEffect(() => {
    if (initialLoad && chatBoxRef?.current) {
      (chatBoxRef.current as HTMLDivElement).scrollTo({
        top: (chatBoxRef.current as HTMLDivElement).scrollHeight,
        behavior: 'smooth',
      });
      setInitialLoad(false);
    }
    // scroll to bottom on message send and don't scroll to bottom when fetching old messages,
    else if (chatBoxRef?.current && !userScrolledUp) {
      (chatBoxRef.current as HTMLDivElement).scrollTop = (
        chatBoxRef.current as HTMLDivElement
      ).scrollHeight;
    }
  }, [messages, userScrolledUp]);

  useEffect(() => {
    //smooth infinite scroll scroll while
    if (isFetchingNextPage && chatBoxRef?.current) {
      const chatBox = chatBoxRef.current as HTMLDivElement;
      chatBox.scrollTop = chatBox.clientHeight;
    }
  }, [isFetchingNextPage, chatBoxRef]);

  const showExpectedResponseTime =
    careTeamGroups.includes(selectedMessage?.messages_group_id?.name!) &&
    (!!(messageContent.length > 0) || patientSentLastMessage);

  async function handleReactivate(event: any) {
    event.preventDefault();
    setShowReactivateWLModal(true);
  }

  async function handleApprove(event: any) {
    event.preventDefault();
    if (!pendingOrders?.length)
      return toast.error('This order has already been completed');
    setLoadingApproval(true);
    // Update the pathname without reloading the page for authorize action
    await fetch(`/api/authorize_med/${patient?.id}?action=approve`)
      .then(async res => {
        // Handle success (you may want to display a success message)
        const resp = await res.json();
        if (resp.status === 500) {
          toast.error('Error processing payment');
        } else
          toast.success(
            'Your response has been submitted and you will get the higher dosage of your Rx.'
          );
      })
      .catch(error => {
        // Handle error (you may want to display an error message)
        toast.error(error);
      })
      .finally(() => {
        refetchPendingOrders();
        setLoadingApproval(false);
      });
  }
  async function handleDeny(event: any) {
    event.preventDefault();
    // Update the pathname without reloading the page for deny action
    if (!pendingOrders?.length)
      return toast.error('This order has already been completed');
    setLoadingApproval(true);
    await fetch(`/api/authorize_med/${patient?.id}?action=deny`)
      .then(async res => {
        const resp = await res.json();
        if (resp.status === 500) {
          toast.error('Error processing payment');
        } else
          toast.success(
            'Your response has been submitted and you will get the lower dosage of your Rx.'
          );
      })
      .catch(error => {
        // Handle error (you may want to display an error message)
        toast.error(error);
      })
      .finally(() => {
        refetchPendingOrders();
        setLoadingApproval(false);
      });
  }

  useEffect(() => {
    if (messages?.length) {
      // Get all elements with id "deny"
      const denyElements = document.querySelectorAll('.denyLink') || [];
      let latestDenyElement: any;
      if (denyElements?.length > 0) {
        latestDenyElement = denyElements[denyElements.length - 1];
        latestDenyElement?.addEventListener('click', handleDeny);
      }
      const approveElements = document?.querySelectorAll('.authorizeLink');
      let latestApproveElement: any;
      if (approveElements) {
        latestApproveElement = approveElements[approveElements.length - 1];
        latestApproveElement?.addEventListener('click', handleApprove);
      }
      const reactivateElements = document?.querySelectorAll(
        '.reactivateWeightLossLink'
      );
      reactivateElements?.forEach(element => {
        element?.addEventListener('click', handleReactivate);
      });

      return () => {
        latestApproveElement?.removeEventListener('click', handleApprove);
        latestDenyElement?.removeEventListener('click', handleDeny);
        reactivateElements?.forEach(element => {
          element?.removeEventListener('click', handleReactivate);
        });
      };
    }
  }, [messages?.length, pendingOrders]);

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  function customSort(a: any, b: any) {
    if (a.display_at && b.display_at) {
      // If both have display_at, compare them
      return b.display_at.localeCompare(a.display_at);
    } else if (a.display_at) {
      // If only 'a' has display_at, 'a' comes first
      return b.created_at.localeCompare(a.display_at);
    } else if (b.display_at) {
      // If only 'b' has display_at, 'b' comes first
      return b.display_at.localeCompare(a.created_at);
    } else {
      // If neither has display_at, compare by created_at
      return b.created_at.localeCompare(a.created_at);
    }
  }

  const selectedMessageGroupName = selectedMessage?.messages_group_id?.name;

  return (
    <Grid
      container
      sx={{
        minHeight: '70vh',
        height: '70vh',
        maxHeight: '70vh',
      }}
    >
      <Grid
        item
        xs={5}
        sx={{
          // background: "#fffaf2",
          borderRadius: '0 0 0 4px',
          borderRight: '1px solid #AFAFAF',
          paddingBottom: '0px',
        }}
      >
        <List
          sx={{
            width: '100%',
            color: 'black',
            padding: '0px',
            overflowX: 'hidden',
          }}
        >
          {allMessages !== null &&
            allMessages?.map((item: any, idx: number) => (
              <ListMenuDesktop
                key={idx}
                item={item}
                handleOnClick={handleOnClick}
                selectedMessage={selectedMessage}
              />
            ))}
        </List>
      </Grid>
      <Grid
        item
        xs={7}
        sx={{
          // background: "#fffaf2",
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: '0 0 4px 0',
          minHeight: '70vh',
          height: '70vh',
          maxHeight: '70vh',
          marginTop: '15px',
        }}
      >
        {selectedMessageGroupName &&
        careTeamGroups.includes(selectedMessageGroupName) ? (
          <Box
            sx={{
              textAlign: 'center',
              marginBottom: '10px',
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'center',
                alignSelf: 'center',
                color: 'black',
              }}
            >{`Chat with your Zealthy ${
              selectedMessageGroupName !== 'Other'
                ? selectedMessageGroupName
                : ''
            } care team`}</Typography>
          </Box>
        ) : null}
        <Grid
          item
          xs={12}
          sx={{
            color: 'white',
            padding: '16px',
            paddingBottom: '0px',
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'scroll',
            overflowX: 'hidden',
            maxHeight: '70vh',
          }}
          ref={chatBoxRef}
          onScroll={handleScroll}
        >
          {allMessages?.length > 0 ? (
            <></>
          ) : (
            <Box sx={{ margin: '48px auto' }}>
              <Typography
                sx={{
                  fontWeight: '400',
                  display: 'flex',
                  fontSize: '16px',
                  justifyContent: 'center',
                  textAlign: 'center',
                  alignSelf: 'center',
                  color: 'black',
                }}
              >
                You have no messages. <br />
                <br />
                Any messages between you and your <br />
                care team will appear here.
              </Typography>
            </Box>
          )}

          {selectedMessageGroupName &&
          careTeamGroups.includes(selectedMessageGroupName) ? (
            <Typography color="black" textAlign="center" mb="1rem">
              This is the start of your conversation with your care team.
            </Typography>
          ) : null}
          <Box ref={loadMoreRef}>
            {(isFetchingNextPage || isLoading) && <Spinner />}
          </Box>
          {selectedMessage &&
            messages?.pages
              ?.flat()
              .sort(customSort)
              .reverse()
              .map((message: any) => (
                <Fragment key={message.id}>
                  {message.sender.id !== patient?.profile_id ? (
                    <DesktopMessageItem
                      updateMessage={updateMessage}
                      clinicians={clinicians}
                      selectedMessage={selectedMessage}
                      message={message}
                      careTeamGroupName={selectedMessageGroupName ?? ''}
                    />
                  ) : (
                    <Box
                      component="div"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box sx={{ alignSelf: 'flex-end' }}>
                        {' '}
                        <Typography
                          component="p"
                          variant="body1"
                          sx={{
                            fontWeight: '700',
                            fontSize: '11px !important',
                            color: '#000000',
                            marginTop: '0px',
                            paddingRight: '0.5rem',
                          }}
                        >
                          You
                        </Typography>
                      </Box>
                      <Box
                        component="div"
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          background: '#64B5F6',
                          alignSelf: 'flex-end',
                          minWidth: '10%',
                          maxWidth: '70%',
                          color: '#FFFFFF',
                          borderRadius: '16px',
                          padding: '1rem 1.5rem',
                        }}
                      >
                        {message.image_url && (
                          <img src={message.image_url} alt="Sent Image" />
                        )}
                        <Typography
                          component="p"
                          variant="body2"
                          sx={{
                            fontSize: '12px !important',
                            lineHeight: '16px !important',
                            overflowWrap: 'anywhere',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              String(message.decrypted_message_encrypted ?? '')
                                ?.replace(/<p>&nbsp;<\/p>/g, '')
                                .replace(/\n/g, '<br>')
                            ),
                          }}
                        />
                      </Box>
                      <Box sx={{ alignSelf: 'flex-end' }}>
                        {' '}
                        <Typography
                          component="p"
                          variant="body1"
                          sx={{
                            fontWeight: '400',
                            fontSize: '11px !important',
                            color: '#484848',
                            marginTop: '0px',
                            fontStyle: 'italic',
                          }}
                        >
                          {message?.display_at
                            ? format(
                                new Date(message?.display_at),
                                `MMM d yyyy 'at' h:mm a`
                              )
                            : format(
                                new Date(message.created_at),
                                `MMM d yyyy 'at' h:mm a`
                              )}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Fragment>
              ))}

          {isThreadDisabled ||
          (canceledWeightLoss &&
            !activeWeightLoss &&
            !careTeamGroups
              .filter(group => group.toLowerCase() !== 'weight loss')
              .includes(selectedMessageGroupName!) &&
            selectedMessage) ? (
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                padding: '1rem',
                background: 'grey',
                zIndex: 1,
                color: '#ffffff',
                borderRadius: '1rem',
              }}
            >
              This is no longer your coach. Please see your{' '}
              <Link
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  fontSize: '1rem',
                }}
                href={`/messages?complete=${patientCoachName}`}
              >
                coaching thread
              </Link>{' '}
              {`with ${patientCoachName} to message with your current coach. You will not be able to message in this thread, since you have been reassigned to your new coach.`}
            </Box>
          ) : null}
        </Grid>

        {selectedMessage && (
          <Grid
            item
            sx={{
              background: 'transparent',
              width: '100%',
              padding: '16px',
              paddingTop: '0px',
            }}
          >
            <ExpectedResponseTime show={showExpectedResponseTime} />
            <OutlinedInput
              disabled={isThreadDisabled}
              id="outlined-adornment"
              type="text"
              multiline
              maxRows={10}
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              placeholder="Message..."
              sx={{
                background: '#FFFFFF',
                border: '1px solid #ffffff',
                borderRadius: '10px',
                width: '100%',
                color: '#000',
                gap: '1rem',
                padding: '10px 15px',
              }}
              endAdornment={
                <Button
                  disabled={
                    (canceledWeightLoss &&
                      !careTeamGroups.includes(
                        selectedMessage?.messages_group_id?.name!
                      )) ||
                    loading ||
                    !messageContent
                  }
                  style={{
                    height: '34px',
                    fontSize: '12px',
                    fontWeight: '600',
                    lineHeight: '1rem',
                    borderRadius: '100px',
                    background: '#ffffff',
                    padding: '9px 16px',
                    cursor: 'pointer',
                    border: 0,
                    color:
                      canceledWeightLoss &&
                      !careTeamGroups.includes(selectedMessageGroupName!)
                        ? 'grey'
                        : '#00872B',
                  }}
                  onClick={handleSendMessage}
                >
                  {loading ? 'Sending' : 'Send'}
                </Button>
              }
            />
          </Grid>
        )}
      </Grid>
      <StandardModal
        setModalOpen={setLoadingApproval}
        modalOpen={loadingApproval}
      >
        <Stack width="100%" alignItems="center">
          <Spinner />
        </Stack>
      </StandardModal>
      <ReactivateSubscriptionModal
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
      />
      <ReactivateWeightLossModal
        open={showReactivateWLModal}
        onClose={() => setShowReactivateWLModal(false)}
      />
    </Grid>
  );
}

import React, { useState, useCallback, useEffect } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { ThumbUpOutlined, ThumbDownOutlined } from '@mui/icons-material';
import { ClinicianProps, usePatient } from '@/components/hooks/data';
import { format, isAfter, parseISO } from 'date-fns';
import {
  getClinicianAlias,
  getClinicianAliasInitials,
} from '@/utils/getClinicianAlias';
import {
  thumbsUpOnMessageEvent,
  thumbsDownOnMessageEvent,
} from '@/utils/freshpaint/events';
import { createRateLimiter } from '@/utils/createRateLimiter';

import { MessageItemI } from '@/types/messageItem';
import DOMPurify from 'dompurify';
import RateBBBModal from '@/components/screens/PatientPortal/components/RateBBBModal';

interface MobileMessageItemProps {
  updateMessage: (id: number, was_helpful: boolean) => void;
  clinicians: ClinicianProps[] | undefined;
  selectedMessage: MessageItemI;
  message: MessageItemI & { was_helpful: boolean };
  careTeamGroupName: string;
}

const REVIEW_MODAL_DELAY = 60 * 60 * 1000 * 24; // 1 day delay

export const MobileMessageItem = ({
  updateMessage,
  clinicians,
  selectedMessage,
  message,
  careTeamGroupName,
}: MobileMessageItemProps) => {
  const [messageThumbsUp, setMessageThumbsUp] = useState<boolean>(false);
  const [messageThumbsDown, setMessageThumbsDown] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [reviewModalClosedAt, setReviewModalClosedAt] = useState<number>(0);
  const { data: patient } = usePatient();

  useEffect(() => {
    const lastClosedAt = localStorage.getItem('bbbModalClosedAt');
    if (lastClosedAt) {
      setReviewModalClosedAt(parseInt(lastClosedAt, 10));
    }
  }, []);

  const onRatingRedirect = () => {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      window.freshpaint.track('bbb-share-experience-clicked', {
        care_team_group_name: careTeamGroupName,
        sender_id: selectedMessage?.sender?.id,
        sender_name: `${selectedMessage?.sender?.first_name} ${selectedMessage?.sender?.last_name}`,
        sender_type: getSenderType(selectedMessage?.sender?.id),
        message_id: selectedMessage?.id.toString(),
        email: patient?.profiles?.email,
        received_at: Date.now(),
      });
    }
  };

  const rateLimitedThumbsUp = useCallback(
    createRateLimiter(thumbsUpOnMessageEvent, 3, 60 * 60 * 1000),
    []
  );

  const rateLimitedThumbsDown = useCallback(
    createRateLimiter(thumbsDownOnMessageEvent, 3, 60 * 60 * 1000),
    []
  );

  const closeCurrentModal = useCallback(() => {
    const newLastModalClosedTime = Date.now();
    setReviewModalClosedAt(newLastModalClosedTime);
    localStorage.setItem('bbbModalClosedAt', newLastModalClosedTime.toString());
    setReviewModalOpen(false);
  }, []);

  // we want thumbs up to be highlighted immediately on click,
  // and if API call fails, it should revert to original value
  const setMessageThumbs = async (id: number, wasHelpful: boolean) => {
    if (wasHelpful) {
      setMessageThumbsUp(true);
      setMessageThumbsDown(false);
      const resultThumbsUp = await rateLimitedThumbsUp(
        patient?.profiles?.email,
        careTeamGroupName,
        selectedMessage?.sender?.id,
        selectedMessage?.sender?.first_name,
        getSenderType(selectedMessage?.sender?.id),
        selectedMessage?.id.toString(),
        selectedMessage?.decrypted_message_encrypted.replace(/<[^>]*>/g, '')
      );

      const timeElapsed = Date.now() - reviewModalClosedAt;

      if (timeElapsed > REVIEW_MODAL_DELAY) {
        setTimeout(() => {
          setReviewModalOpen(true);
          if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
            window.freshpaint.track('bbb-share-experience', {
              care_team_group_name: careTeamGroupName,
              sender_id: selectedMessage?.sender?.id,
              sender_name: `${selectedMessage?.sender?.first_name} ${selectedMessage?.sender?.last_name}`,
              sender_type: getSenderType(selectedMessage?.sender?.id),
              message_id: selectedMessage?.id.toString(),
              email: patient?.profiles?.email,
              received_at: Date.now(),
            });
          }
        }, 5000);
      }
      if (resultThumbsUp === null) {
        console.log('Rate limit exceeded for thumbs up event');
        return;
      }
    } else {
      setMessageThumbsDown(true);
      setMessageThumbsUp(false);
      const resultThumbsDown = await rateLimitedThumbsDown(
        patient?.profiles?.email,
        careTeamGroupName,
        selectedMessage?.sender?.id,
        selectedMessage?.sender?.first_name,
        getSenderType(selectedMessage?.sender?.id),
        selectedMessage?.id.toString(),
        selectedMessage?.decrypted_message_encrypted.replace(/<[^>]*>/g, '')
      );
      if (resultThumbsDown === null) {
        console.log('Rate limit exceeded for thumbs down event');
        return;
      }
    }
    let response: any = await updateMessage(id, wasHelpful);
    if (response.status !== 204) {
      setMessageThumbsUp(false);
      setMessageThumbsDown(false);
    }
  };

  const getSenderId = (senderId: string) => {
    const matchingClinician = clinicians?.find(
      (c: ClinicianProps) => c?.profile_id === senderId
    );
    return matchingClinician?.id;
  };

  const isAliasedSender = (message: MessageItemI) => {
    // only generate coordinator aliases for new messages after implementation.
    const createdAtDate = parseISO(message?.created_at);
    const isAfterFeb26 = isAfter(createdAtDate, new Date('2024-02-26'));

    if (!isAfterFeb26) {
      return false;
    }

    // don't alias if thread name is coordinator's name
    if (
      `${message.sender?.prefix ? `${message.sender?.prefix} ` : ''}${
        message?.sender?.first_name
      } ${message?.sender?.last_name}` ===
      selectedMessage?.messages_group_id?.name
    )
      return false;

    const types =
      clinicians?.find(
        (c: ClinicianProps) => c?.profile_id === message?.sender?.id
      )?.type || [];

    const unaliasedCoordinators = [
      'lead coordinator',
      'order support',
      'provider support',
    ];

    return (
      types.some(type => type.toLowerCase().includes('coordinator')) &&
      types.every(type => !unaliasedCoordinators.includes(type.toLowerCase()))
    );
  };

  const getSenderType = (senderId: string) => {
    const matchingClinician = clinicians?.find(
      (c: ClinicianProps) => c?.profile_id === senderId
    );

    if (matchingClinician) {
      if (
        matchingClinician.type.some((type: string) =>
          type.includes('Weight Loss')
        )
      ) {
        return `Weight Loss Coach`;
      } else if (
        matchingClinician.type.some((type: string) =>
          type.includes('Mental Health')
        )
      ) {
        return `Mental Health Coach`;
      } else if (
        matchingClinician.type.some((type: string) =>
          type.toLowerCase().includes('coordinator')
        )
      ) {
        return `Care Coordinator`;
      } else if (
        matchingClinician.type.some((type: string) =>
          type.toLowerCase().includes('provider')
        )
      ) {
        return 'Provider';
      } else if (matchingClinician.type.length === 0) {
        return '';
      } else {
        return matchingClinician.type?.[0]?.replace(/ *\([^)]*\) */g, '');
      }
    } else {
      return '';
    }
  };

  return (
    <>
      <Box>
        <Box sx={{ display: 'flex', gap: '0.3rem' }}>
          <Box
            component="div"
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              component="p"
              variant="body1"
              sx={{
                display: 'flex',
                gap: '12px',
                fontWeight: '700',
                fontSize: '11px !important',
                color: '#000000',
                // marginLeft: "5px",
                paddingLeft: '0.5rem',
              }}
            >
              {getSenderType(message?.sender?.id)}
            </Typography>
            <Box
              component="div"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                background: getSenderType(message?.sender?.id).includes(
                  'Provider'
                )
                  ? '#B3ECC6'
                  : '#FAFAFA',
                alignSelf: 'flex-start',
                width: '300px',
                color: '#000000',
                borderRadius: '16px',
                padding: '12px 12px',
              }}
            >
              <Typography
                component="p"
                variant="body1"
                sx={{
                  display: 'flex',
                  fontWeight: '400',
                  fontSize: '12px !important',
                  lineHeight: '16px !important',
                  alignItems: 'flex-start',
                  margin: '0px',
                  flexDirection: 'column',
                  overflowWrap: 'anywhere',
                  '& p': { margin: '5px' },
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    String(message.decrypted_message_encrypted)?.replace(
                      /<p>&nbsp;<\/p>/g,
                      ''
                    )
                  ),
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  position: 'relative',
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontStyle: 'italic',
                    fontSize: '12px !important',
                    marginLeft: '5px',
                  }}
                >
                  {'Did we answer your question?'}
                </Typography>
                <Box sx={{ display: 'flex', gap: '1rem' }}>
                  <ThumbUpOutlined
                    onClick={() => setMessageThumbs(message.id, true)}
                    fontSize={'small'}
                    sx={{
                      cursor: 'pointer',
                      fill:
                        messageThumbsUp ||
                        (!(
                          message?.was_helpful === null ||
                          message?.was_helpful === undefined
                        ) &&
                          message?.was_helpful &&
                          !messageThumbsDown)
                          ? 'green'
                          : '',
                    }}
                  />
                  <ThumbDownOutlined
                    onClick={() => setMessageThumbs(message.id, false)}
                    fontSize={'small'}
                    sx={{
                      cursor: 'pointer',
                      fill:
                        messageThumbsDown ||
                        (!(
                          message?.was_helpful === null ||
                          message?.was_helpful === undefined
                        ) &&
                          !message?.was_helpful &&
                          !messageThumbsUp)
                          ? 'red'
                          : '',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', marginTop: '6px' }}>
          <Avatar
            alt={
              isAliasedSender(message)
                ? getClinicianAlias(getSenderId(message?.sender?.id)!)
                : `${
                    selectedMessage?.sender?.prefix
                      ? `${selectedMessage?.sender?.prefix} `
                      : ''
                  }${selectedMessage?.sender?.first_name} ${
                    selectedMessage?.sender?.last_name
                  }`
            }
            sx={{
              width: '30px',
              height: '30px',
              marginBottom: '10px',
              backgroundColor: '#D7CEC0',
              fontSize: '15px',
            }}
          >
            {isAliasedSender(message)
              ? `${getClinicianAliasInitials(
                  getSenderId(message?.sender?.id)!
                )}`
              : `${message?.sender?.first_name?.slice(
                  0,
                  1
                )}${message?.sender?.last_name?.slice(0, 1)}`}
          </Avatar>
          <Typography
            component="p"
            variant="body1"
            sx={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginLeft: '10px',
              fontWeight: '400',
              fontSize: '11px !important',
              color: '#484848',
              marginBottom: '10px',
            }}
          >
            {isAliasedSender(message) ? (
              <>{`${getClinicianAlias(getSenderId(message?.sender?.id)!)}`}</>
            ) : (
              `${message?.sender?.prefix ? `${message?.sender?.prefix} ` : ''}${
                message?.sender?.first_name
              } ${message?.sender?.last_name?.slice(0, 1)}.`
            )}
            <Typography
              component="p"
              variant="body1"
              sx={{
                fontWeight: '400',
                fontSize: '11px !important',
                color: '#484848',
                marginLeft: '70px',
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
          </Typography>
        </Box>
      </Box>
      <RateBBBModal
        isOpen={reviewModalOpen}
        onClose={closeCurrentModal}
        addToQueue={() => {}}
        onRedirectFromMessage={onRatingRedirect}
      />
    </>
  );
};

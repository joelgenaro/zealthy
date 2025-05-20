import React from 'react';
import Router from 'next/router';
import BasicModal from '@/components/shared/BasicModal';
import { Stack, IconButton, Button, Typography, Icon } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface Props {
  isOpen: boolean;
  count: number;
  onClose: () => void;
}

export const UnseenMessagesModal = ({ isOpen, count, onClose }: Props) => {
  const messageString = count === 1 ? 'message' : 'messages';
  const isMobile = useIsMobile();

  if (count === 0) return null;

  return (
    <BasicModal isOpen={isOpen} onClose={onClose} useMobileStyle={false}>
      <Stack flexDirection="row" justifyContent="flex-end">
        <IconButton aria-label="Close modal" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Stack alignItems="center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          style={{ marginBottom: '8px', marginTop: '-32px' }}
        >
          <g clip-path="url(#clip0_2920_7434)">
            <path
              d="M78.9693 63.4991L46.1546 9.07844C44.8618 6.93454 42.5035 5.60266 39.9999 5.60266C37.4963 5.60266 35.138 6.93454 33.8451 9.0786L1.03054 63.4991C-0.305556 65.715 -0.345087 68.4913 0.927256 70.7444C2.19991 72.9975 4.59773 74.3972 7.18523 74.3972H72.8146C75.4021 74.3972 77.8001 72.9975 79.0727 70.7442C80.3451 68.4909 80.3055 65.7147 78.9693 63.4991ZM74.5374 68.1831C74.1871 68.8033 73.5269 69.1888 72.8146 69.1888H7.18523C6.47288 69.1888 5.81273 68.8034 5.46257 68.1833C5.11226 67.563 5.12319 66.7986 5.49085 66.1888L38.3057 11.7681C38.6616 11.178 39.3108 10.8113 40.0001 10.8113C40.6891 10.8113 41.3383 11.178 41.6943 11.7681L74.5088 66.1888C74.8768 66.7988 74.8877 67.563 74.5374 68.1831Z"
              fill="#E38869"
            />
            <path
              d="M40.0236 27.032C38.0423 27.032 36.4961 28.0951 36.4961 29.9798C36.4961 35.7301 37.1725 43.9932 37.1725 49.7437C37.1727 51.2417 38.4775 51.8698 40.0237 51.8698C41.1834 51.8698 42.8264 51.2417 42.8264 49.7437C42.8264 43.9934 43.5028 35.7303 43.5028 29.9798C43.5028 28.0953 41.9083 27.032 40.0236 27.032Z"
              fill="#E38869"
            />
            <path
              d="M40.0725 55.2041C37.9464 55.2041 36.3516 56.8954 36.3516 58.925C36.3516 60.9063 37.9462 62.646 40.0725 62.646C42.0537 62.646 43.7452 60.9063 43.7452 58.925C43.7452 56.8954 42.0536 55.2041 40.0725 55.2041Z"
              fill="#E38869"
            />
          </g>
          <defs>
            <clipPath id="clip0_2920_7434">
              <rect width="80" height="80" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <Typography component="p">{`You have ${count} unread ${messageString}.`}</Typography>
      </Stack>
      <Button onClick={() => Router.push('/messages')}>
        {isMobile ? 'Respond' : 'Respond to your care team'}
      </Button>
    </BasicModal>
  );
};

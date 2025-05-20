import { useIsMobile } from '@/components/hooks/useIsMobile';
import { IconButton, Modal } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface InjectionVideoModalProps {
  open: boolean;
  onClose: () => void;
}

const InjectionVideoModal = ({ open, onClose }: InjectionVideoModalProps) => {
  const isMobile = useIsMobile();

  const styles = isMobile
    ? {
        borderStyle: 'none',
        position: 'absolute',
        height: 'auto',
        width: 'auto',
        right: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 300,
        minHeight: 200,
        maxHeight: '90%',
        padding: '25px',
        postion: 'relative',
      }
    : {
        borderStyle: 'none',
        position: 'absolute',
        height: 'auto',
        width: 'auto',
        right: 'auto',
        transition: 'none',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: 500,
        minHeight: 300,
        maxHeight: '90%',
        padding: '25px',
        postion: 'relative',
      };

  {
    /* <iframe src="https://player.vimeo.com/video/899963569?h=7ab0c001dc&title=0&byline=0" width="640" height="384" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
    <p><a href="https://vimeo.com/899963569">GLP-1 Injection Instructions</a> from <a href="https://vimeo.com/user211183001">Zealthy</a> on <a href="https://vimeo.com">Vimeo</a>.</p> */
  }
  return (
    <></>
    // <Modal open={open} disableAutoFocus>
    //   <Box sx={styles}>
    //     <IconButton
    //       sx={{
    //         color: "#FFFFFF",
    //         padding: "0",
    //         position: "relative",
    //         bottom: `${isMobile ? "110px" : "0"}`,
    //       }}
    //       edge="start"
    //       onClick={onClose}
    //     >
    //       <CloseIcon fontSize={"large"} />
    //     </IconButton>
    //     <Box sx={{ aspectRatio: "16/9", width: "200%", height: "200%" }}>
    //       <iframe
    //         src="https://player.vimeo.com/video/899963569"
    //         width={isMobile ? "" : "50%"}
    //         height="100%"
    //         frameBorder="0"
    //         allow="autoplay; fullscreen; picture-in-picture"
    //         allowFullScreen
    //       />
    //     </Box>
    //   </Box>
    // </Modal>
  );
};

export default InjectionVideoModal;

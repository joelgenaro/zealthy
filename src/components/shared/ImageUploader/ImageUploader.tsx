import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Box, Button } from '@mui/material';
import styled from '@emotion/styled';
import { resizeImage } from '@/utils/resizeImage';
import FilePreview from './components/FilePreview';
import Uploaders from './components/Uploaders';
import { useRouter } from 'next/router';

const videoConstraints = {
  facingMode: 'user',
};

export const ImageCol = styled.div`
  position: relative;
  width: 100%;
`;

const buttonStyles = {
  height: '52px',
  padding: { sm: '0 32px', xs: '0 8px' },
  textTransform: 'none',
  borderRadius: '12px',
  border: '1px solid #000000',
  color: '#1B1B1B',
  fontSize: { sm: '1rem', xs: '0.75rem' },
};

export type FileType = {
  fileToUpload: string;
  type: string;
  name: string;
};

interface UploaderProps {
  title: string | null;
  subtitle: string | null;
  name?: string;
  showConfirmationText?: boolean;
  setFilePath: (file: FileType | null) => void;
  uploadedPhoto: FileType | null;
  subImageTextOne?: string | null;
  subImageTextTwo?: string | null;
  isFullBodyVerification?: boolean;
}

const ImageUploader = ({
  title,
  subtitle,
  setFilePath,
  name,
  showConfirmationText = true,
  uploadedPhoto = null,
  subImageTextOne = null,
  subImageTextTwo = null,
  isFullBodyVerification,
}: UploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [takingWebcamPhoto, setTakingWebcamPhoto] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [file, setFile] = useState<FileType | null>(uploadedPhoto);
  const fileName = name || title?.split(' ')?.join('-') || '';
  const router = useRouter();
  console.log('ROUTER', router.asPath.includes('FEMALE_HAIR_L_SELECT'));

  useEffect(() => {
    setFile(null);
  }, [title, name]);
  useEffect(() => {
    if (file) {
      setFilePath(file);
    }
  }, [file, setFilePath]);

  const capture = useCallback(() => {
    return webcamRef.current?.getScreenshot();
  }, [webcamRef]);

  const activateWebcam = () => {
    setTakingWebcamPhoto(true);
  };

  const disableWebcam = () => {
    setTakingWebcamPhoto(false);
  };

  const deleteFile = () => {
    setFile(null);
    setFilePath(null);
  };

  const captureWebcamPhoto = () => {
    const screenshot = capture();
    resizeImage(screenshot!, 1024).then(resizedImage => {
      setFile({
        fileToUpload: resizedImage,
        type: 'image/jpeg',
        name: fileName,
      });
      disableWebcam();
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach(async currentFile => {
        let imageToUpload: File | Blob = currentFile;

        if (['image/heic', 'image/heif'].includes(currentFile.type)) {
          //convert to jpeg
          const heic2any = require('heic2any');
          setIsLoading(true);

          imageToUpload = await heic2any({
            blob: currentFile,
            toType: 'image/jpeg',
          });
        }
        if (
          imageToUpload.type === 'image/png' ||
          imageToUpload.type === 'image/jpeg' ||
          imageToUpload.type === 'image/webp'
        ) {
          resizeImage(imageToUpload).then(resizedImage => {
            setFile({
              fileToUpload: resizedImage,
              type: imageToUpload.type,
              name: fileName,
            });
            setIsLoading(false);
          });
        } else if (imageToUpload.type === 'application/pdf') {
          const fileUrl = URL.createObjectURL(imageToUpload);
          setFile({
            fileToUpload: fileUrl,
            type: imageToUpload.type,
            name: fileName,
          });
        }
      });
    },
    [fileName]
  );

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <Box display="flex" gap="16px" alignItems="center" flexDirection="column">
        <ImageCol>
          <Box>
            {takingWebcamPhoto ? (
              <Box
                overflow="hidden"
                borderRadius="24px"
                maxWidth="464px"
                width="100%"
                height="260px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                margin="auto"
                border="1px dashed #1B1B1B"
                sx={{ cursor: 'pointer' }}
                onClick={activateWebcam}
              >
                <Webcam
                  style={{
                    width: 'fit-content',
                    height: 'inherit',
                  }}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                />
              </Box>
            ) : file ? (
              <FilePreview
                showConfirmationText={showConfirmationText}
                onRemove={deleteFile}
                file={file.fileToUpload}
                title={title || ''}
                fileType={file.type || ''}
              />
            ) : (
              <Uploaders
                title={title}
                subtitle={subtitle}
                activateWebcam={activateWebcam}
                onDrop={onDrop}
                subImageTextOne={subImageTextOne}
                subImageTextTwo={subImageTextTwo}
                isLoading={isLoading}
                isFullBodyVerification={isFullBodyVerification}
              />
            )}
          </Box>
        </ImageCol>
        <Box display="flex" gap="16px" justifyContent="center" width="100%">
          {takingWebcamPhoto && !file && (
            <Box display="flex" gap="16px" justifyContent="center" width="100%">
              <Button
                fullWidth
                variant="outlined"
                onClick={captureWebcamPhoto}
                sx={buttonStyles}
              >
                Take a Photo
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={disableWebcam}
                sx={buttonStyles}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageUploader;

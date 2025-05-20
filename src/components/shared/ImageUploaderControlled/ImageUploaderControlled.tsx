import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Box, Button } from '@mui/material';
import styled from '@emotion/styled';
import { resizeImage } from '@/utils/resizeImage';
import FilePreview from './components/FilePreview';
import Uploaders from './components/Uploaders';
import { usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';

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
  fileToUpload: string | File | Blob;
  type: string;
  name: string;
};

interface UploaderProps {
  title: string | null;
  subtitle: string | null;
  name?: string;
  file: FileType | null;
  setFile: (file: FileType | null) => void;
  showConfirmationText?: boolean;
  setFilePath: (file: FileType | null) => void;
  subImageTextOne?: string | null;
  subImageTextTwo?: string | null;
  subImageTextMobile?: string | null;
  nextPage?: () => void;
}

const ImageUploader = ({
  title,
  subtitle,
  file,
  setFile,
  setFilePath,
  name,
  showConfirmationText = true,
  subImageTextOne = null,
  subImageTextTwo = null,
  subImageTextMobile = null,
  nextPage,
}: UploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [takingWebcamPhoto, setTakingWebcamPhoto] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileName = name || title?.split(' ')?.join('-') || '';
  const { data: patient } = usePatient();
  const { specificCare } = useIntakeState();

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

  const handleSkipIdUpload = () => {
    if (
      specificCare === SpecificCareOption.WEIGHT_LOSS &&
      patient &&
      !patient.has_verified_identity &&
      !patient.vouched_verified
    ) {
      window?.freshpaint?.track('weight-loss-skipped-ID');
      console.log('skipped ID upload');
    }

    if (nextPage) {
      nextPage();
    }
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
          if ('name' in imageToUpload) {
            setFile({
              fileToUpload: imageToUpload,
              type: imageToUpload.type,
              name: imageToUpload.name,
            });
          }
          setIsLoading(false);
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
              />
            ) : (
              <Uploaders
                title={title}
                subtitle={subtitle}
                activateWebcam={activateWebcam}
                onDrop={onDrop}
                subImageTextOne={subImageTextOne}
                subImageTextTwo={subImageTextTwo}
                subImageTextMobile={subImageTextMobile}
                isLoading={isLoading}
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
        {!file && nextPage && !takingWebcamPhoto && (
          <Button fullWidth onClick={handleSkipIdUpload}>
            Skip ID Upload
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ImageUploader;

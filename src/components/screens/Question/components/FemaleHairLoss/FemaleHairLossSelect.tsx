import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {
  QuestionWithName,
  Questionnaire,
  QuestionnaireQuestionAnswerOptions,
} from '@/types/questionnaire';
import HairLossSelect1 from 'public/images/female-hair-loss/HairLossSelect1';
import HairLossSelect2 from 'public/images/female-hair-loss/HairLossSelect2';
import HairLossSelect3 from 'public/images/female-hair-loss/HairLossSelect3';
import HairLossSelect4 from 'public/images/female-hair-loss/HairLossSelect4';
import Box from '@mui/material/Box';
import { useAnswerAction, useAnswerAsync } from '@/components/hooks/useAnswer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddPhoto from 'public/images/female-hair-loss/AddPhoto';
import FilePreview from '@/components/shared/ImageUploader/components/FilePreview';
import FemaleHairLossImageUploader from './components/FemaleHairLossImageUploader';
import { imageToBlob } from '@/utils/imageToBlob';
import { useUploadDocument } from '@/components/hooks/useUploadDocument';
import { usePatient } from '@/components/hooks/data';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useIsMobile } from '@/components/hooks/useIsMobile';

const hairLossSelectOptions = [
  {
    image: <HairLossSelect1 />,
    header: 'General thinning or shedding',
    description: 'May notice a widening hair par',
  },
  {
    image: <HairLossSelect2 />,
    header: 'Thinning at temples',
  },
  {
    image: <HairLossSelect3 />,
    header: 'Bald spots or areas',
    description: 'May be found anywhere on the scalp',
  },
  {
    image: <HairLossSelect4 />,
    header: 'Redness and crusting',
    description: 'Found at sites of hair loss',
  },
  {
    image: <AddPhoto />,
    header: 'I’m not sure, I’ll submit a photo',
  },
];

interface FemaleHairLossSelectProps {
  question: QuestionWithName;
  questionnaire: Questionnaire;
  nextPage: (nextPage?: string) => void;
}

type OptionType = {
  answer: QuestionnaireQuestionAnswerOptions;
  header: string;
  description?: string;
  image: any;
};

type FileType = {
  fileToUpload: string;
  type: string;
  name: string;
};

const FemaleHairLossSelect = ({
  question,
  questionnaire,
  nextPage,
}: FemaleHairLossSelectProps) => {
  const { submitAnswer } = useAnswerAsync(questionnaire);
  const { submitFreeTextAnswer, submitMultiSelectAnswer } = useAnswerAction({
    name: question.name,
    header: question.header,
    questionnaire: questionnaire.name,
    canvas_linkId: question.canvas_linkId,
    codingSystem: question.codingSystem || questionnaire.codingSystem,
  });
  const { uploadFile } = useUploadDocument();
  const { data: patient } = usePatient();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<any>([]);
  const [openWebcam, setOpenWebcam] = useState<boolean>(false);
  const [file, setFile] = useState<FileType | null>(null);
  const [image, setImage] = useState<FileType | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file) {
      handleImage(file);
    }
  }, [file]);

  const currentOptions = useMemo(() => {
    return question.answerOptions!.map(
      (aO, i) =>
        ({
          answer: aO,
          ...hairLossSelectOptions[i],
        } as OptionType)
    );
  }, [question]);

  console.log('CURRENT OPTIONS: ', currentOptions);
  const handleSelect = useCallback(
    (option: OptionType) => {
      const isCurrentlySelected = selected.some(
        (item: OptionType) => item.header === option.header
      );
      if (option.header === 'I’m not sure, I’ll submit a photo') {
        // Check if the special option is already selected
        if (
          selected.some(
            (item: OptionType) =>
              item.header === 'I’m not sure, I’ll submit a photo'
          )
        ) {
          // If already selected, clear all selections (toggle off completely)
          setSelected([]);
          setOpenWebcam(false);
        } else {
          // If not selected, clear all other selections and add this option only
          setSelected([option]);
          setOpenWebcam(true);
        }
      } else {
        // For all other options

        if (isCurrentlySelected) {
          // If the option is already selected, remove it from the array
          setSelected(
            selected.filter((item: OptionType) => item.header !== option.header)
          );
          // If the removed option was the last one, ensure webcam is closed
          if (selected.length === 1 && setOpenWebcam) {
            setOpenWebcam(false);
          }
        } else {
          // Add to the array if not already included
          // Also ensure that if the special option is selected, it is removed
          const filteredSelected = selected.filter(
            (item: OptionType) =>
              item.header !== 'I’m not sure, I’ll submit a photo'
          );
          setSelected([...filteredSelected, option]);
          // Ensure the webcam is closed if other options are selected
          setOpenWebcam(false);
        }
      }

      // Handle the multi-select answer submission
      if (option?.answer) {
        submitMultiSelectAnswer(option?.answer);
      }
    },
    [submitMultiSelectAnswer, selected, setOpenWebcam]
  );

  const onConfirm = useCallback(async () => {
    if (!image) {
      setError('Please choose the image');
      return;
    }

    setLoading(true);

    const front = await imageToBlob(image.fileToUpload);
    return await uploadFile(
      front,
      `patient-${patient?.id}/${question?.questionnaire}/${question?.label}`
    )
      .then(async () => {
        setImage(null);
        setLoading(false);
        nextPage();
      })
      .catch(err => {
        setError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [image, nextPage, uploadFile]);

  const handleImage = useCallback((image: FileType | null) => {
    setImage(image);
    setError('');
  }, []);

  const handleContinue = () => {
    if (selected.length === 0) {
      // Optionally show an error or disable the continue button
      return;
    }

    // Handle the case where a photo needs to be uploaded
    if (
      selected.some(
        (option: any) => option.header === 'I’m not sure, I’ll submit a photo'
      )
    ) {
      onConfirm();
      return;
    }

    // Submit all selected answers
    selected.forEach((option: any) => {
      submitAnswer(option.answer); // Ensure this function can handle individual option submissions
    });
    nextPage();
  };

  const isSelected = (option: string) => {
    return selected.some((item: any) => item.header === option);
  };

  const deleteFile = () => {
    setFile(null);
    handleImage(null);
  };

  return (
    <>
      <Stack display="flex" flexDirection="column" alignItems="center" gap={2}>
        {!file ? (
          !openWebcam ? (
            <>
              <Typography>Select all that apply</Typography>
              <Box
                display="flex"
                flexDirection={isMobile ? 'column' : 'row'}
                sx={{ gap: '2rem' }}
              >
                <Box
                  display="flex"
                  flexDirection={isMobile ? 'column' : 'row'}
                  sx={{ gap: '2rem' }}
                >
                  {currentOptions?.slice(0, 4)?.map((option, idx) => (
                    <Box
                      width={200}
                      key={'option' + idx}
                      onClick={() => handleSelect(option)}
                      sx={{
                        boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)',
                        padding: '24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '1rem',
                        backgroundColor: isSelected(option?.header)
                          ? '#B8F5CC!important'
                          : '#FFFFFF',
                        '&:hover': {
                          backgroundColor: isSelected(option?.header)
                            ? '#B8F5CC!important'
                            : '#f5f5f5',
                        },
                      }}
                    >
                      {option.image}
                      <Box>
                        <Typography fontWeight="bold">
                          {option.header}
                        </Typography>
                        <Typography variant="h4">
                          {option.description && option.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box
                  width={200}
                  onClick={() => handleSelect(currentOptions[4])}
                  sx={{
                    boxShadow: '0px 4px 6px 0px rgba(0, 0, 0, 0.10)',
                    padding: '24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '1rem',
                    backgroundColor: isSelected(currentOptions?.[4]?.header)
                      ? '#B8F5CC!important'
                      : '#FFFFFF',
                    '&:hover': {
                      backgroundColor: isSelected(currentOptions?.[4]?.header)
                        ? '#B8F5CC!important'
                        : '#f5f5f5',
                    },
                  }}
                >
                  <Box>{currentOptions?.[4]?.image}</Box>
                  <Typography fontWeight="bold">
                    {currentOptions?.[4]?.header}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <FemaleHairLossImageUploader
              setOpenWebcam={setOpenWebcam}
              file={file}
              setFile={setFile}
              setFilePath={handleImage}
            />
          )
        ) : (
          <FilePreview
            showConfirmationText={true}
            onRemove={deleteFile}
            file={file.fileToUpload}
            title={'hair-loss'}
            fileType={file.type || ''}
          />
        )}
      </Stack>
      <LoadingButton
        loading={loading}
        size="large"
        disabled={!selected}
        onClick={handleContinue}
      >
        Continue
      </LoadingButton>
    </>
  );
};

export default FemaleHairLossSelect;

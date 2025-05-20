import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import React, { useCallback } from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';
import Button from '@mui/material/Button';
import { drugs } from './data';
import { useVisitActions } from '@/components/hooks/useVisit';
import { useAnswerAction } from '@/components/hooks/useAnswer';
import { Medication } from '@/context/AppContext/reducers/types/visit';
import { QuestionWithName } from '@/types/questionnaire';
import { useIsMobile } from '@/components/hooks/useIsMobile';

interface OptionsProps {
  question: QuestionWithName;
  nextPage: (nextPage?: string) => void;
}

const regrowthProcess = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/hair-regrowth1.svg',
    description: 'Increases blood flow',
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/hair-regrowth2.svg',
    description: 'Extended growth period',
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/hair-regrowth3.svg',
    description: 'Hair regrowth start',
  },
];

const options = [
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/female-hl-treatment1.svg',
    name: 'Hair Strengthen Foam',
    description: 'Strengthen and regrow hair by using this daily. ',
    additionalInformation: [
      'Apply once a day',
      'Includes Latanoprost',
      'See results in 3-6 months',
    ],
    backgroundColor: '#BBE7CD;',
    value: drugs[1],
  },
  {
    image:
      'https://api.getzealthy.com/storage/v1/object/public/questions/female-hl-treatment2.svg',
    name: 'Hair Restore Solution',
    description: 'Topical minoxidil is known for helping regrow hair.',
    additionalInformation: [
      'Apply once a day',
      'Includes Minoxidil',
      'See results in 3-6 months',
    ],
    backgroundColor: '#D0EAE0',
    value: drugs[2],
  },
];

const FemaleHairLossTreatmentSelect = ({
  question,
  nextPage,
}: OptionsProps) => {
  const isMobile = useIsMobile();
  const { addMedication } = useVisitActions();
  const { submitSingleSelectAnswer } = useAnswerAction(question);

  const handleSelect = useCallback(
    (value: Medication) => {
      const newValue = {
        name: value.name,
        type: value.type,
        quantity: value.quantity,
        dosage: value.dosage,
        price: value.price,
        discounted_price: value.discounted_price,
        recurring: value.recurring,
        medication_quantity_id: value.medication_quantity_id,
        specific_medicaiton: value.name,
        display_name: value.name,
      };

      addMedication(newValue);
      nextPage();
    },
    [addMedication, question?.answerOptions, submitSingleSelectAnswer]
  );

  return (
    <>
      <Stack gap={4}>
        <Typography variant="h2">
          Better hair <span style={{ color: '#00872B' }}>soon</span>
        </Typography>
        <Typography
          sx={{
            fontSize: '17px!important',
            width: '85%',
            wordSpacing: '3px',
            lineHeight: '25px!important',
          }}
        >
          Based on your responses, a provider may consider this option for you.
        </Typography>
        <Box
          sx={{
            backgroundColor: '#E7C5B8',
            boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.10)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 16px',
            //   height: '259px',
          }}
        >
          <Typography fontWeight="bold" fontFamily="Gelasio">
            Minoxidil
          </Typography>
          <Image
            alt="Minoxidil pill"
            src="https://api.getzealthy.com/storage/v1/object/public/questions/female-hl-pill.svg"
            width={100}
            height={100}
            style={{ alignSelf: 'center' }}
          />
          <Typography>Starting at $39/month</Typography>
        </Box>
        <Typography fontWeight={700} fontSize="17px!important">
          Meet Minoxidil
        </Typography>
        <Typography
          sx={{
            fontSize: '17px!important',
            width: '85%',
            wordSpacing: '3px',
            lineHeight: '25px!important',
          }}
        >
          Minoxidil slows hair loss and helps regrow hair. It increases the
          length of the hair growth cycle to ensure your hair is fuller soon!
        </Typography>
        <Button
          sx={{ width: '70%', alignSelf: 'center' }}
          onClick={() => handleSelect(drugs[0])}
        >
          Select Treatment
        </Button>
        <Typography variant="h3">
          The <span style={{ color: '#00872B' }}>hair regrowth</span> process
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : '',
            position: isMobile ? '' : 'relative',
            right: isMobile ? '0%' : '10%',
            gap: '1rem',
          }}
        >
          {regrowthProcess.map((step, idx) => (
            <Box key={`step ${idx}`}>
              <Image
                src={step.image}
                alt={`step ${idx}`}
                width={180}
                height={170}
              />
              <Typography sx={{ marginLeft: '12px' }}>
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="h3">
          Other <span style={{ color: '#00872B' }}>treatment options</span>
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : '',
            position: isMobile ? '' : 'relative',
            right: isMobile ? '0%' : '15%',
            gap: isMobile ? '2rem' : '8rem',
          }}
        >
          {options.map((option, idx) => (
            <Box key={`option ${idx}`}>
              <Box
                sx={{
                  backgroundColor: option.backgroundColor,
                  borderRadius: '24px 24px 0px 0px',
                  padding: '20px 20px 0px 20px',
                  width: isMobile ? '100%' : '150%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.14)',
                }}
              >
                <Typography>{option.name}</Typography>
                <Image
                  alt={option.name}
                  src={option.image}
                  width={160}
                  height={150}
                />
              </Box>
              <Box
                sx={{
                  backgroundColor: '#FFFFF2',
                  width: isMobile ? '100%' : '150%',
                  height: 'fit-content',
                  padding: '20px',
                  boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.14)',
                  borderRadius: '0px 0px 24px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <Typography>{option.description}</Typography>
                <Box
                  sx={{
                    backgroundColor: '#F6F0E6',
                    borderRadius: '13px',
                    padding: '12px 13px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                  }}
                >
                  <Typography>Details</Typography>
                  <ul>
                    {option.additionalInformation.map((info, idx) => (
                      <li key={`option ${idx}`}>{info}</li>
                    ))}
                  </ul>
                </Box>
                <Button onClick={() => handleSelect(option.value)}>
                  Select Treatment
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Stack>
    </>
  );
};

export default FemaleHairLossTreatmentSelect;

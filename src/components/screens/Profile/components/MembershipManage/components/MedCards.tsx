import React from 'react';
import WhiteBox from '@/components/shared/layout/WhiteBox';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';

interface MedInformationProps {
  name: string;
  description: string;
  img: string;
  percentage: number;
  expected: string;
}

interface MedCardsProps {
  medInformation: MedInformationProps[];
}

const MedCards: React.FC<MedCardsProps> = ({ medInformation }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'center',
        width: '100%',
        marginBottom: '24px',
      }}
    >
      {medInformation.map((med, idx) => (
        <WhiteBox
          key={idx}
          sx={{
            padding: '10px',
            position: 'relative',
            borderRadius: '',
            borderLeft: '2px solid #8ACDA0',
            width: '100%',
            gap: '0.5rem',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: { xs: '5px', sm: '10px' },
              right: { xs: '5px', sm: '10px' },
              width: { xs: '40px', sm: '60px' },
              height: { xs: '40px', sm: '60px' },
            }}
          >
            <Image
              alt={med.name}
              src={med.img}
              layout="fill"
              objectFit="contain"
            />
          </Box>

          <Stack spacing={0.5}>
            <Typography
              variant="h6"
              fontWeight={700}
              fontSize="1.2rem!important"
            >
              {med.name}
            </Typography>
            <Typography
              variant="subtitle2"
              fontStyle="italic"
              fontSize="0.7rem!important"
            >
              {med.description}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="start"
            gap="0.5rem"
            marginBottom={'10px'}
          >
            <Typography fontSize="2rem!important" variant="h2" color="#00872B">
              {`${med.percentage}%`}
            </Typography>
            <Typography fontSize="0.9rem!important">{med.expected}</Typography>
          </Stack>
        </WhiteBox>
      ))}
    </Box>
  );
};

export default MedCards;

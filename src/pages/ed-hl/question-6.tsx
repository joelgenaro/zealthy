import Head from 'next/head';
import { ReactElement, useState } from 'react';
import Router, { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  Container,
  Stack,
  Typography,
  Box,
  Button,
  TextField,
} from '@mui/material';
import NavBarLayout from '@/layouts/NavBarLayout';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import { QuestionWithName } from '@/types/questionnaire';

const question: QuestionWithName = {
  name: 'EDHL_PRESIGNUP_Q6',
  header: 'Let us know your age',
  subheader: 'Enter your date of birth',
  input_placeholder: 'MM/DD/YYYY',
  type: 'text',
  questionnaire: 'ed-hl-presignup',
};

const SexPlusHairQuestion6 = () => {
  // page is removed from flow / keeping for possible future use
  const isMobile = useIsMobile();
  const [dob, setDob] = useState('');
  const { push } = useRouter();

  const formatDateOfBirth = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length > 5) value = value.slice(0, 5) + '/' + value.slice(5);
    return value.slice(0, 10);
  };

  const calculateAge = (dob: string) => {
    const [month, day, year] = dob.split('/').map(Number);
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDOB = formatDateOfBirth(event.target.value);
    setDob(formattedDOB);
  };

  const handleContinue = () => {
    if (!dob.trim() || dob.length !== 10) {
      toast.error(
        'Please enter a valid date of birth in the format MM/DD/YYYY'
      );
      return;
    }

    const age = calculateAge(dob);
    if (age < 18) {
      toast.error('You must be at least 18 years old to continue.');
      return;
    }

    push({
      pathname: Pathnames.EDHL_SIGNUP,
    });
  };

  return (
    <>
      <Head>
        <title>Sex + Hair</title>
      </Head>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'left',
        }}
      >
        <Stack gap={isMobile ? 3 : 3} width="100%">
          <Typography
            variant="h2"
            sx={{ fontWeight: 'bold', textAlign: 'left' }}
          >
            Let us know your age
          </Typography>

          <Box
            sx={{
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '12px',
              padding: '4px 12px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              textAlign: 'left',
              width: 'fit-content',
            }}
          >
            No video or phone call required in New Jersey!
          </Box>

          <Typography variant="body1" sx={{ textAlign: 'left', width: '100%' }}>
            Enter your date of birth
          </Typography>

          <TextField
            placeholder={question.input_placeholder}
            variant="outlined"
            fullWidth
            value={dob}
            onChange={handleInputChange}
            InputProps={{
              sx: {
                backgroundColor: '#F1F1F1',
                borderRadius: '8px',
                height: '50px',
                '&::placeholder': {
                  color: 'rgba(0, 0, 0, 0.6)',
                },
              },
            }}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#00531B',
              color: 'white',
              height: '50px',
              fontWeight: 'bold',
              borderRadius: '8px',
              textTransform: 'none',
              marginTop: 3,
            }}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </Stack>
      </Container>
    </>
  );
};

SexPlusHairQuestion6.getLayout = (page: ReactElement) => {
  return <NavBarLayout>{page}</NavBarLayout>;
};

export default SexPlusHairQuestion6;

import Head from 'next/head';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import { Typography, Container } from '@mui/material';

const WeightLossRODisqualify = () => {
  return (
    <>
      <Head>
        <title>Treat Weight Loss with Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Typography
          variant="h1"
          style={{ marginBottom: 40, textAlign: 'center' }}
        ></Typography>
        <Typography variant="body1" style={{ marginBottom: 20 }}>
          Your BMI does not meet the requirements to be eligible for GLP-1
          medications.
        </Typography>
        <Typography variant="body1">
          If you entered your weight or height inaccurately, you may select back
          to enter them accurately.
        </Typography>
      </Container>
    </>
  );
};

WeightLossRODisqualify.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

export default WeightLossRODisqualify;

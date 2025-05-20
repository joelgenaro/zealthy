import Head from 'next/head';
import { ReactElement } from 'react';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';
import ResetPassword from '@/components/screens/ResetPassword';
import Container from '@mui/material/Container';

export default function PasswordReset() {
  return (
    <>
      <Head>
        <title>Zealthy | Reset Password</title>
      </Head>
      <Container maxWidth="xs">
        <ResetPassword />
      </Container>
    </>
  );
}

PasswordReset.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

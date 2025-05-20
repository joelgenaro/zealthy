import Head from 'next/head';
import { ReactElement } from 'react';
import { Container } from '@mui/material';
import UpdatePassword from '@/components/screens/UpdatePassword';
import DefaultNavLayout from '@/layouts/DefaultNavLayout';

export default function PasswordUpdate() {
  return (
    <>
      <Head>
        <title>Zealthy | Update Password</title>
      </Head>
      <Container maxWidth="xs">
        <UpdatePassword />
      </Container>
    </>
  );
}

PasswordUpdate.getLayout = (page: ReactElement) => {
  return <DefaultNavLayout>{page}</DefaultNavLayout>;
};

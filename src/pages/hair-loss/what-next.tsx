import Head from 'next/head';
import { ReactElement, useCallback } from 'react';
import OnboardingLayout from '@/layouts/OnboardingLayout';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import CheckMark from '@/components/shared/icons/CheckMark';
import Button from '@mui/material/Button';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';

const listItems = [
  {
    title: 'Your medical information will be sent to your Zealthy provider.',
    body: 'Your provider will review this information and determine a treatment plan.',
  },
  {
    title: 'Your provider will follow-up with you.',
    body: 'You will receive a notification via email or text to view their recommended treatment plan.',
  },
  {
    title:
      'If appropriate, your provider will prescribe your requested medication, which we can deliver to your doorstep.',
    body: 'Delivery is free!',
  },
];

const WhatIsNext = () => {
  const isMobile = useIsMobile();

  const handleNext = useCallback(() => {
    Router.push(Pathnames.HAIR_LOSS_DELIVERY_ADDRESS);
  }, []);

  return (
    <>
      <Head>
        <title>What is next? | Hair Loss | Zealthy</title>
      </Head>
      <Container maxWidth="sm">
        <Typography variant="h2">
          {'Next, you’ll enter your payment information.'}
        </Typography>
        <Stack gap="48px">
          <Grid container direction="column" gap="1rem">
            <Typography sx={{ fontWeight: '500' }}>
              {
                "After putting your payment information in, here's what to expect:"
              }
            </Typography>

            {listItems.length ? (
              <List
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {listItems.map((item, index) => (
                  <ListItem
                    key={'item' + index}
                    sx={{
                      padding: '0',
                      gap: '16px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box marginTop={isMobile ? '5px' : '3px'}>
                      <CheckMark />
                    </Box>
                    <Box display="flex" flexDirection="column" gap="8px">
                      {item?.title && (
                        <Typography fontWeight="600">{item?.title}</Typography>
                      )}
                      <Typography>{item.body}</Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : null}
          </Grid>
          <Button onClick={handleNext}>Continue</Button>
        </Stack>
      </Container>
    </>
  );
};

WhatIsNext.getLayout = (page: ReactElement) => (
  <OnboardingLayout>{page}</OnboardingLayout>
);

export default WhatIsNext;

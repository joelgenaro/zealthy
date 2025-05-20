import Head from 'next/head';
import { NextPage } from 'next';
import NextProgress from 'next-progress';
import { Toaster } from 'react-hot-toast';
import { ReactElement, ReactNode, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { QueryClient, QueryClientProvider } from 'react-query';

import lightTheme from '@/themes/light';
import ApiContextProvider from '@/context/ApiContext/ApiContext';
import AppContextProvider from '@/context/AppContext';
import VWOContextProvider from '@/context/VWOContext';

import type BranchProps from 'branch-sdk/index';
import type { AppProps } from 'next/app';
import { supabaseClient } from '@/lib/supabaseClient';
import StripeContextProvider from '@/context/StripeContext/StripeContext';
import { MessageProvider } from '@/components/screens/Messages/components/MessagesContext';
import { VisitTypeProvider } from '@/components/screens/PatientPortal/components/ScheduleVisit/components/CareTeam/VisitTypeContext';
import ILVContextProvider from '@/context/ILVContextProvider';
import '../styles.css';
import { ABTestProvider } from '@/context/ABZealthyTestContext';
import getConfig from '../../config';
import { ErrorBoundary } from '@sentry/nextjs';
import { ErrorFallback } from '@/providers/components/ErrorFallback';
import { useRouter } from 'next/router';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout<P> = AppProps<P> & {
  Component: NextPageWithLayout<P>;
};

const queryClient = new QueryClient();

export default function MyApp({
  Component,
  pageProps,
}: AppPropsWithLayout<{
  initialSession: Session;
}>) {
  const getLayout = Component.getLayout ?? (page => page);

  const router = useRouter();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  let Branch: typeof BranchProps | null = null;

  const initializeBranch = async () => {
    Branch = (await import('branch-sdk')).default;

    Branch.init(
      process.env.NEXT_PUBLIC_BRANCH_KEY ?? '',
      {
        tracking_disabled: false,
      },
      (err, data) => {
        console.log(err, data);
      }
    );

    Branch.first((err, data) => {
      console.log(err, data);
    });
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
      //.then((registration) => console.log("scope is: ", registration.scope));
    }

    initializeBranch();
  }, []);

  useEffect(() => {
    if (Branch) {
      Branch.data((err, data) => {
        console.log(err, data);
      });
    }
  }, [router.asPath, Branch]);

  return (
    <ErrorBoundary fallback={errorData => ErrorFallback(errorData)}>
      <ThemeProvider theme={lightTheme}>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <AppContextProvider>
            <ApiContextProvider>
              <StripeContextProvider>
                <MessageProvider>
                  <QueryClientProvider client={queryClient}>
                    <ABTestProvider>
                      <VWOContextProvider>
                        <ILVContextProvider>
                          <VisitTypeProvider>
                            <CssBaseline />
                            <Head>
                              <title>{siteName}</title>
                            </Head>
                            <Analytics />
                            <Toaster
                              position="bottom-center"
                              reverseOrder={false}
                            />
                            <NextProgress
                              height="4px"
                              color={
                                siteName === 'Zealthy' || siteName === 'FitRx'
                                  ? '#00531B'
                                  : '#F5CDCD'
                              }
                            />
                            {getLayout(<Component {...pageProps} />)}
                            <SpeedInsights />
                          </VisitTypeProvider>
                        </ILVContextProvider>
                      </VWOContextProvider>
                    </ABTestProvider>
                  </QueryClientProvider>
                </MessageProvider>
              </StripeContextProvider>
            </ApiContextProvider>
          </AppContextProvider>
        </SessionContextProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

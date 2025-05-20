import Head from 'next/head';
import {
  Box,
  Card,
  CardContent,
  Step,
  StepLabel,
  Stepper,
  Typography,
  StepConnector,
  stepConnectorClasses,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { format } from 'date-fns';
import React, { ReactElement, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePatientAddress } from '@/components/hooks/data';
import GreenCircleCheck from '@/components/shared/icons/GreenCircleCheck';
import GreyEmptyCircle from '@/components/shared/icons/GreyEmptyCircle';
import { useSearchParams } from 'next/navigation';
import Footer from '@/components/shared/layout/Footer';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import { getAuthProps } from '@/lib/auth';
import Router from 'next/router';
import Spinner from '@/components/shared/Loading/Spinner';

const TrackOrderPage = () => {
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const { data: patientAddress } = usePatientAddress();
  const correctOrderTrackingNumber = Router.query.id;
  const [loading, setLoading] = useState<boolean>(false);

  const getTrackingInformation = async () => {
    try {
      setLoading(true);
      const trackingInformation = await axios.post(
        `/api/service/shipping/tracking-details`,
        { trackingNumber: correctOrderTrackingNumber }
      );
      setTrackingInfo(trackingInformation?.data?.orderTracker?.trackers?.[0]);
      setLoading(false);
    } catch (error) {
      setLoading(true);
      console.log('Error fetching tracking information', error);
    }
  };

  const toTitleCase = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    setTrackingInfo(null);

    if (correctOrderTrackingNumber) {
      getTrackingInformation();
    }
  }, [correctOrderTrackingNumber]);

  const determineActiveStep = (trackingInfo: any) => {
    if (!trackingInfo) return 0;

    const deliveredIndex = trackingInfo.findIndex((info: any) =>
      info.message.toLowerCase().includes('delivered')
    );

    return deliveredIndex !== -1 ? deliveredIndex : trackingInfo.length - 1;
  };

  const ColorlibVerticalConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.vertical}`]: {
      marginLeft: '14.5px',
      padding: 0,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: '#CCC',
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundColor: theme.palette.primary.main,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      width: 5,
      height: '6rem',
      border: 0,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 1,
      marginTop: '-29px',
      marginBottom: '-26px',
    },
  }));

  const ColorlibHorizontalConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 11,
      left: 'calc(-50% + 9px)',
      right: 'calc(50% + 9px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#CCC',
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: '#004225',
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
      borderTopWidth: 3,
      borderRadius: 1,
    },
  }));

  const CustomStepIcon = styled(({ active, completed, ...otherProps }: any) => {
    if (completed) {
      return (
        <Box sx={{ zIndex: 10 }}>
          <GreenCircleCheck {...otherProps} />
        </Box>
      );
    }
    if (active) {
      return <GreyEmptyCircle {...otherProps} />;
    }
    return (
      <Box sx={{ zIndex: 10 }}>
        <GreenCircleCheck {...otherProps} />
      </Box>
    );
  })(({ theme }) => ({
    color: theme.palette.primary.main,
  }));

  const CustomHorizontalStepIcon = styled(
    ({ active, completed, ...otherProps }: any) => {
      if (completed) {
        return (
          <Box sx={{ zIndex: 10 }}>
            <CheckCircleIcon {...otherProps} />
          </Box>
        );
      }
      if (active) {
        return (
          <Box sx={{ zIndex: 10 }}>
            <RadioButtonUncheckedIcon {...otherProps} />
          </Box>
        );
      }
      return (
        <Box sx={{ zIndex: 10 }}>
          <CheckCircleIcon {...otherProps} />
        </Box>
      );
    }
  )(({ theme }) => ({
    color: theme.palette.primary.main,
  }));

  const splitLocationString = (locationString: string, carrier: string) => {
    let city;
    let state;
    let parts;
    if (carrier === 'FedEx') {
      parts = locationString?.split(' ');
      parts?.pop();
      state = parts?.pop();
      city = parts?.join(' ');
    } else if (carrier === 'USPS') {
      parts = locationString?.split(', ');
      const cityState = parts?.[0]?.split(' ');
      state = cityState?.pop();
      city = cityState?.join(' ');
    } else if (carrier === 'UPS') {
      parts = locationString?.split(' ');
      parts?.pop();
      state = parts?.pop();
      city = parts?.join(' ');
    }
    return { city, state };
  };

  const origin = splitLocationString(
    trackingInfo?.carrier_detail?.origin_location,
    trackingInfo?.carrier
  );

  const destination = splitLocationString(
    trackingInfo?.carrier_detail?.destination_location,
    trackingInfo?.carrier
  );

  const getDefaultSenderAddress = (carrier: string) => {
    let defaultSenderAddress: string;
    switch (carrier) {
      case 'UPS':
        return (defaultSenderAddress = 'UPS Shipping Facility');
      case 'USPS':
        return (defaultSenderAddress = 'USPS Shipping Facility');
      case 'FedEx':
        return (defaultSenderAddress = 'FedEx Shipping Facility');
    }
  };

  return (
    <>
      <Head>
        <title>Order Tracker | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="sm" sx={{ marginBottom: '24px' }}>
        {loading ? (
          <Spinner />
        ) : (
          <Card>
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                '& p': {
                  margin: '3px 0',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <Typography variant="h3">TRACK YOUR ORDER</Typography>
                <Box
                  sx={{
                    border: '2px dashed #00531B',
                    borderRadius: '15px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  <Stack>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Link
                        target="_blank"
                        href={
                          'https://www.google.com/search?q=' +
                          correctOrderTrackingNumber
                        }
                      >
                        {correctOrderTrackingNumber}
                      </Link>
                      <Typography sx={{ color: '#00531B' }}>
                        {toTitleCase(trackingInfo?.status)?.replace(/_/g, ' ')}
                      </Typography>
                    </Box>
                    <Typography fontSize="10px" fontWeight={300}>
                      {trackingInfo?.carrier}
                    </Typography>
                  </Stack>
                  <Stepper
                    alternativeLabel
                    activeStep={determineActiveStep(
                      trackingInfo?.tracking_details
                    )}
                    connector={<ColorlibHorizontalConnector />}
                  >
                    {trackingInfo?.tracking_details?.map(
                      (info: any, i: number) => {
                        const isCompleted = info.message
                          .toLowerCase()
                          .includes('delivered');
                        return (
                          <Step key={i} completed={isCompleted}>
                            <StepLabel
                              StepIconComponent={CustomHorizontalStepIcon}
                            ></StepLabel>
                          </Step>
                        );
                      }
                    )}
                  </Stepper>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack>
                      <Typography>
                        {trackingInfo?.created_at
                          ? format(
                              new Date(trackingInfo?.created_at),
                              'MMM. do'
                            )
                          : ''}
                      </Typography>
                      {trackingInfo?.carrier_detail?.origin_location &&
                      trackingInfo?.carrier_detail?.origin_location?.split(
                        ' '
                      )?.[0] !== 'US' ? (
                        <Typography fontWeight={600}>
                          {`${toTitleCase(origin?.city || '')}, ${
                            origin?.state
                          }`}
                        </Typography>
                      ) : (
                        <Typography fontWeight={600}>
                          {getDefaultSenderAddress(trackingInfo?.carrier)}
                        </Typography>
                      )}
                    </Stack>
                    <Box
                      sx={{
                        marginTop: '10px',
                        color: '#00531B',
                      }}
                    >
                      <ArrowCircleRightOutlinedIcon fontSize="medium" />
                    </Box>
                    <Stack>
                      <Typography>
                        Est.{' '}
                        {trackingInfo?.est_delivery_date
                          ? format(
                              new Date(trackingInfo?.est_delivery_date),
                              'MMM. do'
                            )
                          : ''}
                      </Typography>
                      {trackingInfo?.carrier_detail?.destination_location ? (
                        <Typography fontWeight={600}>
                          {`${toTitleCase(destination?.city || '')}, ${
                            destination?.state
                          }`}
                        </Typography>
                      ) : (
                        <Typography fontWeight={600}>
                          {`${toTitleCase(patientAddress?.city || '')}, ${
                            patientAddress?.state
                          } `}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Box>
                <br></br>
                <Typography fontWeight="bold">History</Typography>
                <Stepper
                  activeStep={determineActiveStep(
                    trackingInfo?.tracking_details
                  )}
                  orientation="vertical"
                  connector={<ColorlibVerticalConnector />}
                  sx={{ flexDirection: 'column-reverse' }}
                >
                  {trackingInfo?.tracking_details?.map(
                    (info: any, i: number) => {
                      const isCompleted = info.message
                        ?.toLowerCase()
                        ?.includes('delivered');
                      return (
                        <Step key={i} completed={isCompleted}>
                          <StepLabel StepIconComponent={CustomStepIcon}>
                            {info?.message}
                            <Box>
                              {info?.tracking_location?.city ? (
                                <Typography
                                  fontWeight="bolder"
                                  fontSize="1.5rem"
                                  sx={{
                                    color: '#000000',
                                  }}
                                >
                                  {' '}
                                  {`${toTitleCase(
                                    info.tracking_location.city
                                  )}, ${
                                    info?.tracking_location?.state
                                  }, United States`}
                                </Typography>
                              ) : null}
                              <Typography variant="h4">
                                {format(
                                  new Date(info?.datetime),
                                  'MM/dd/yyyy h:mm a'
                                )}
                              </Typography>
                            </Box>
                          </StepLabel>
                        </Step>
                      );
                    }
                  )}
                </Stepper>
              </Box>
            </CardContent>
          </Card>
        )}
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

TrackOrderPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default TrackOrderPage;

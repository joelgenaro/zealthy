import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import {
  Toolbar,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
  Box,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Typography,
  Badge,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import HomeNavIcon from '../../icons/HomeNavIcon';
import ProgramsIcon from '../../icons/ProgramsIcons';
import TreatMeNowIcon from '@/components/shared/icons/TreatMeNowIcon';
import MessagesIcon from '@/components/shared/icons/MessagesIcon';
import ProfileIcon from '@/components/shared/icons/ProfileIcon';
import RoundButton from '@/components/shared/Button/RoundButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Pathnames } from '@/types/pathnames';
import StickyHeader from '../../StickyHeader';
import { NewReleases } from '@mui/icons-material';
import ActionItemModal from './components/ActionItemModal';
import useIsFullyCancelled from '@/components/hooks/useIsFullyCancelled';
import { useMessageContext } from '@/components/screens/Messages/components/MessagesContext';

import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientUnpaidInvoices,
  usePatientCompletedVisits,
  useHasUnseenMessages,
  usePatientPrescriptionRequest,
  useAllPatientPrescriptionRequest,
  usePatientLabWorks,
  useVWOVariationName,
  usePatientActionItems,
} from '@/components/hooks/data';
import Medications2 from '../../icons/Medications2';
import SignOutIcon from '../../icons/SignOutIcon';
import { useILV } from '@/context/ILVContextProvider';
import ILVBanner from '../../ILVBanner';
import ILVConfirmedModal from '../../ILVConfirmedModal';
import DownloadMobileAppBanner from './components/DownloadMobileAppBanner';
import { useVWO } from '@/context/VWOContext';
import { Banner6867Var1 } from '../../PromoBanner/Banner6867Var1';
import Logo from '@/components/shared/icons/Logo';
import { usePromoBanner } from '@/components/hooks/usePromoBanner';
import { useFlowState } from '@/components/hooks/useFlow';

interface PatientPortalNavProps {
  children: ReactNode;
  showActionModal?: boolean;
}

const PatientPortalNav = ({
  children,
  showActionModal = true,
}: PatientPortalNavProps) => {
  const [ilvModal, setILVModal] = useState(false);
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check if the banner has been explicitly hidden in the current session
      return sessionStorage.getItem('appBannerHidden') !== 'true';
    }
    return true; // Default to showing the banner on SSR
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isFullyCancelled = useIsFullyCancelled();
  const { data: patient, isLoading: isPatientLoading } = usePatient();
  const { data: unpaidInvoices = [] } = usePatientUnpaidInvoices();
  const { data: visibleSubscriptions } = useAllVisiblePatientSubscription();
  const { data: completedAppointments } = usePatientCompletedVisits();
  const { data: unseenMessages } = useHasUnseenMessages();
  const { request } = useILV();
  const { data: labWorks } = usePatientLabWorks();
  const { data: prescriptionRequests = [] } =
    useAllPatientPrescriptionRequest();
  const { data: onlineVisits = [] } = usePatientCompletedVisits();
  const labWorksLength = labWorks?.length || 0;
  const { data: variant8288 } = useVWOVariationName('8288');
  const vwoContext = useVWO();
  const router = useRouter();
  const { key: promoKey, text } = usePromoBanner();
  const { data: actionItems } = usePatientActionItems();
  const { currentFlow } = useFlowState();

  const isEnclomiphenePatient = useMemo(() => {
    return prescriptionRequests.some(p =>
      p.specific_medication?.includes('Enclomiphene')
    );
  }, [prescriptionRequests]);

  const isPrepPatient = useMemo(() => {
    return onlineVisits.some(v => v.specific_care === 'Prep');
  }, [onlineVisits]);

  const [actionItemCount, setActionItemCount] = useState<number>(0);
  const [showActionItemModal, setShowActionItemModal] =
    useState<boolean>(false);

  const anchorRef = useRef<HTMLButtonElement>(null);
  const { selectedMessageId } = useMessageContext();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveWeightLoss = visibleSubscriptions?.some(
    sub =>
      sub?.subscription?.name.includes('Weight Loss') &&
      ['active', 'trialing', 'past_due'].includes(sub?.status)
  );

  const weightLossSubs = visibleSubscriptions?.filter(s =>
    s.subscription.name.includes('Weight Loss')
  );

  function toggleOpen() {
    setIsOpen(o => !o);
  }

  function onSignOut() {
    Router.push(Pathnames.LOG_OUT);
  }

  const showActionItemBanner = actionItemCount > 0 && !isFullyCancelled;
  const showPaymentBanner = unpaidInvoices.length > 0 && !isFullyCancelled;
  const showPrescriptionRenewalBanner = actionItems?.find(
    ai => ai.type === 'PRESCRIPTION_RENEWAL'
  );

  const patientFirstInitial: string | undefined =
    patient?.profiles?.first_name?.slice(0, 1);

  const reasonForVisit = completedAppointments?.map(
    app => app.reason_for_visit
  );
  const isReasonWeightLoss = reasonForVisit?.map(r => {
    return r?.every((app: any) => app.reason === 'Weight loss');
  });

  const { data: requests } = usePatientPrescriptionRequest();

  const nonCompoundGLP1Requests = requests?.filter(
    r => r.medication_quantity_id === 124 && r.status !== 'PRE_INTAKES'
  );

  useEffect(() => {
    if (isPatientLoading || !patient?.id) return;

    if (!patient?.profiles?.first_name || !patient?.profiles?.last_name) {
      Router.replace(Pathnames.COMPLETE_PROFILE);
    }
  }, [
    isPatientLoading,
    patient?.id,
    patient?.profiles?.first_name,
    patient?.profiles?.last_name,
  ]);

  const showDocumentsPage = useMemo(() => {
    if (isEnclomiphenePatient) return true;
    if (isPrepPatient) return true;
    if (
      hasActiveWeightLoss &&
      !weightLossSubs?.find(s => s?.price === 449) &&
      !weightLossSubs?.find(s => s?.price === 297) &&
      !weightLossSubs?.find(s => s?.price === 249) &&
      !weightLossSubs?.find(s => s?.price === 891)
    )
      return true;
    return false;
  }, [
    hasActiveWeightLoss,
    isEnclomiphenePatient,
    isPrepPatient,
    weightLossSubs,
  ]);

  const hasNonCompoundGLP1Request =
    Array.isArray(nonCompoundGLP1Requests) &&
    nonCompoundGLP1Requests.length > 0;

  const cancelAndGoToNext = useCallback(async () => {
    if (!request) return;

    Router.push(
      `${Pathnames.PATIENT_PORTAL}/visit/schedule-visit?appointment=${request.id}`
    );
  }, [request]);

  const hasVerifiedIdentity = useMemo(() => {
    return patient?.has_verified_identity || patient?.vouched_verified;
  }, [patient?.has_verified_identity, patient?.vouched_verified]);

  useEffect(() => {
    if (Router.pathname.includes('visit/room')) {
      return;
    }

    if (request?.clinician_id && request.status === 'Confirmed') {
      setILVModal(true);
    }

    if (request && ['Completed', 'Noshowed'].includes(request.status)) {
      setILVModal(false);
    }
  }, [
    hasVerifiedIdentity,
    request?.id,
    request?.status,
    request?.clinician_id,
  ]);

  const goBack = () => {
    if (
      Router.pathname.includes('/patient-portal/weight-loss-treatment/bundled')
    ) {
      return Router.push(Pathnames.PATIENT_PORTAL);
    } else {
      return Router.back();
    }
  };

  const activateVariant = async () => {
    if (
      vwoContext &&
      patient &&
      ['MN', 'MO', 'OH', 'NC', 'NJ', 'VA'].includes(patient.region!)
    ) {
      await vwoContext.activate('8078', patient);
    }
  };

  useEffect(() => {
    activateVariant();
  }, [patient]);

  const showVerifyIdentityBanner = useMemo(() => {
    return (
      Boolean(!patient?.has_verified_identity) &&
      router.pathname !== Pathnames.PATIENT_PORTAL_IDENTITY_VERIFICATION
    );
  }, [patient, router]);

  function getMobileOS() {
    const userAgent = navigator.userAgent;

    if (/Android/i.test(userAgent)) {
      return 'Android';
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      return 'iOS';
    }

    return 'Other';
  }

  const os = getMobileOS();

  const hasApp = patient?.app_last_logged_in !== null;

  return (
    <>
      <StickyHeader marginBottom={isMobile ? 4 : 6}>
        {isMobile ? (
          <Box
            bgcolor={theme.palette.background.default}
            borderBottom="1px solid #0000003d"
          >
            <DownloadMobileAppBanner
              showBanner={showBanner}
              setShowBanner={setShowBanner}
              hasApp={hasApp}
              os={os}
            />
            <Toolbar>
              <Grid container alignItems="center" flexDirection="column">
                <Grid
                  container
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  margin="5px 0"
                  display={'flex'}
                  sx={{ height: '100%' }}
                >
                  <Box
                    style={{
                      height: '100%',
                      display: 'flex',
                    }}
                  >
                    {Router.pathname !== '/patient-portal' && (
                      <IconButton
                        className="back-btn"
                        onClick={goBack}
                        style={{
                          display: 'flex',
                          marginRight: '15px',
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    <Link
                      href={Pathnames.PATIENT_PORTAL}
                      style={{
                        color: 'inherit',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <Logo />
                    </Link>
                  </Box>

                  <IconButton onClick={toggleOpen} ref={anchorRef}>
                    <ProfileIcon patientFirstInitial={patientFirstInitial} />
                  </IconButton>
                  <Popper
                    open={isOpen}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    placement="bottom-end"
                    transition
                    disablePortal
                  >
                    {({ TransitionProps }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: 'right top',
                        }}
                      >
                        <Paper
                          sx={{
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <ClickAwayListener
                            onClickAway={() => setIsOpen(false)}
                          >
                            <MenuList
                              id="composition-menu"
                              aria-labelledby="composition-button"
                            >
                              <MenuItem
                                onClick={() => {
                                  setIsOpen(false);
                                  Router.push(Pathnames.PATIENT_PORTAL_PROFILE);
                                }}
                              >
                                My Profile
                              </MenuItem>
                              {patient?.status === 'ACTIVE' ? (
                                <MenuItem
                                  onClick={() => {
                                    setIsOpen(false);
                                    Router.push(
                                      Pathnames.PATIENT_PORTAL_MY_HEALTH
                                    );
                                  }}
                                >
                                  My Health
                                </MenuItem>
                              ) : null}
                              {showDocumentsPage &&
                              patient?.status === 'ACTIVE' ? (
                                <MenuItem
                                  onClick={() => {
                                    setIsOpen(false);
                                    Router.push(
                                      Pathnames.PATIENT_PORTAL_DOCUMENTS
                                    );
                                  }}
                                >
                                  My Documents
                                </MenuItem>
                              ) : null}
                              <hr
                                style={{
                                  borderTop: '0.5px solid #bbb',
                                }}
                              />
                              {/* <MenuItem
                                onClick={() => {
                                  setIsOpen(false);
                                  notifyLeadCoordinator();
                                }}
                              >
                                Support
                              </MenuItem> */}
                              <MenuItem
                                onClick={onSignOut}
                                sx={{
                                  gap: '0.5rem',
                                }}
                              >
                                Sign Out <SignOutIcon />
                              </MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </Grid>

                {(selectedMessageId &&
                  window.location.pathname === Pathnames.MESSAGES) ||
                window.location.pathname.includes(
                  'weight-loss-treatment/glp1'
                ) ? null : (
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    paddingTop="5px"
                    sx={{
                      position: 'fixed',
                      left: 0,
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.background.default,
                      padding: '3px',
                    }}
                  >
                    <Box
                      style={{
                        cursor: 'pointer',
                        marginLeft: '15px',
                      }}
                      onClick={() => Router.push(Pathnames.PATIENT_PORTAL)}
                    >
                      <HomeNavIcon
                        active={
                          window.location.pathname === Pathnames.PATIENT_PORTAL
                        }
                      />
                    </Box>
                    <Box
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        Router.push(Pathnames.PATIENT_PORTAL_DISCOVER_CARE);
                      }}
                    >
                      <ProgramsIcon
                        active={
                          window.location.pathname ===
                          Pathnames.PATIENT_PORTAL_DISCOVER_CARE
                        }
                        purchaseText="Explore"
                      />
                    </Box>

                    {isEnabled && (
                      <Box
                        style={{ cursor: 'pointer' }}
                        onClick={() => Router.push(Pathnames.SCHEDULE_VISIT)}
                      >
                        <TreatMeNowIcon
                          active={
                            window.location.pathname ===
                            Pathnames.SCHEDULE_VISIT
                          }
                        />
                      </Box>
                    )}

                    <Box
                      style={{
                        cursor: 'pointer',
                        marginTop: '3px',
                      }}
                      onClick={() => Router.push(Pathnames.MESSAGES)}
                    >
                      <MessagesIcon
                        active={window.location.pathname === Pathnames.MESSAGES}
                        messageCount={unseenMessages?.data?.length || 0}
                      />
                    </Box>

                    <Box
                      style={{
                        cursor: 'pointer',
                        marginRight: '15px',
                        // marginRight: `${showDiscounts ? '' : '15px'}`,
                      }}
                      onClick={() =>
                        Router.push(
                          hasActiveWeightLoss && isReasonWeightLoss
                            ? Pathnames.PRESCRIPTION_ORDERS
                            : Pathnames.MANAGE_PRESCRIPTIONS
                        )
                      }
                    >
                      <Medications2
                        active={
                          window.location.pathname ===
                            '/manage-prescriptions' ||
                          window.location.pathname ===
                            '/manage-prescriptions/order-history'
                        }
                      />
                    </Box>
                    {/* {showDiscounts && patient.status === 'ACTIVE' && (
                      <Box
                        style={{ cursor: 'pointer', marginRight: '15px' }}
                        onClick={() =>
                          Router.push(
                            Pathnames.PATIENT_PORTAL_ACCOUNTABILITY_PARTNER
                          )
                        }
                      >
                        <DiscountsIcon
                          active={
                            window.location.pathname ===
                            '/patient-portal/accountability-partner'
                          }
                        />
                      </Box>
                    )} */}
                  </Grid>
                )}
              </Grid>
            </Toolbar>
          </Box>
        ) : (
          <Grid
            container
            px={isMobile ? 2 : 6.5}
            height={isMobile ? 48 : 108}
            bgcolor={theme.palette.background.default}
            borderBottom="1px solid #C9C6C6"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack spacing={2} direction="row">
              {window.location.pathname !== Pathnames.PATIENT_PORTAL ? (
                <IconButton className="back-btn" onClick={goBack}>
                  {isMobile ? (
                    <ArrowBackIosIcon sx={{ fontSize: 12 }} />
                  ) : (
                    <ArrowBackIcon />
                  )}
                </IconButton>
              ) : null}

              <Link
                href={Pathnames.PATIENT_PORTAL}
                style={{
                  color: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                <Logo />
              </Link>
            </Stack>

            <Stack spacing={0} direction="row" alignItems="center">
              <Link href={Pathnames.PATIENT_PORTAL}>
                <RoundButton variant="text" color="primary" size="small">
                  Home
                </RoundButton>
              </Link>

              {isEnabled && (
                <>
                  <Link href={Pathnames.SCHEDULE_VISIT}>
                    <RoundButton variant="text" size="small">
                      Treat me now
                    </RoundButton>
                  </Link>
                </>
              )}

              <Link href={Pathnames.PATIENT_PORTAL_DISCOVER_CARE}>
                <RoundButton variant="text" size="small">
                  {'Explore'}
                </RoundButton>
              </Link>

              <Link href={Pathnames.MESSAGES}>
                <RoundButton variant="text" size="small">
                  <Badge
                    badgeContent={unseenMessages?.data?.length || 0}
                    color="warning"
                    max={99}
                  >
                    Messages
                  </Badge>
                </RoundButton>
              </Link>

              {/* {showDiscounts && patient.status === 'ACTIVE' && (
                <Link href={Pathnames.PATIENT_PORTAL_ACCOUNTABILITY_PARTNER}>
                  <RoundButton variant="text" size="small">
                    Discounts
                  </RoundButton>
                </Link>
              )} */}
              <IconButton
                sx={{ position: 'relative' }}
                onClick={toggleOpen}
                ref={anchorRef}
              >
                <ProfileIcon patientFirstInitial={patientFirstInitial} />
              </IconButton>
              <Popper
                open={isOpen}
                anchorEl={anchorRef.current}
                role={undefined}
                placement="bottom-end"
                transition
                disablePortal
              >
                {({ TransitionProps }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: 'right top',
                    }}
                  >
                    <Paper sx={{ backgroundColor: '#FFFFFF' }}>
                      <ClickAwayListener onClickAway={() => setIsOpen(false)}>
                        <MenuList
                          id="composition-menu"
                          aria-labelledby="composition-button"
                        >
                          <MenuItem
                            onClick={() => {
                              setIsOpen(false);
                              Router.push(Pathnames.PATIENT_PORTAL_PROFILE);
                            }}
                          >
                            My Profile
                          </MenuItem>
                          {patient?.status === 'ACTIVE' ? (
                            <MenuItem
                              onClick={() => {
                                setIsOpen(false);
                                Router.push(Pathnames.PATIENT_PORTAL_MY_HEALTH);
                              }}
                            >
                              My Health
                            </MenuItem>
                          ) : null}
                          {showDocumentsPage ? (
                            <MenuItem
                              onClick={() => {
                                setIsOpen(false);
                                Router.push(Pathnames.PATIENT_PORTAL_DOCUMENTS);
                              }}
                            >
                              My Documents
                            </MenuItem>
                          ) : null}
                          <hr
                            style={{
                              borderTop: '0.5px solid #bbb',
                            }}
                          />
                          <MenuItem onClick={onSignOut} sx={{ gap: '0.5rem' }}>
                            Sign Out <SignOutIcon />
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Stack>
          </Grid>
        )}
        {showVerifyIdentityBanner && promoKey !== 'ZEALTHY10' && (
          <Box
            display={'flex'}
            bgcolor="#fff"
            height={'3rem'}
            alignItems="center"
            justifyContent="center"
            gap="10px"
            sx={{
              opacity: 1,
              display: 'flex',
              transition: 'all .2s ease-in-out',
              borderBottom: '1px solid #0000003d',
            }}
          >
            <Typography
              variant="h3"
              style={{ fontSize: '16px', fontWeight: '700' }}
            >
              Required to receive Rx:{' '}
              <Link
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
                href={`${Pathnames.PATIENT_PORTAL_IDENTITY_VERIFICATION}`}
              >
                Verify ID
              </Link>
            </Typography>
          </Box>
        )}
        {promoKey !== 'ZEALTHY10' && (
          <Box
            display={'flex'}
            bgcolor="#fff"
            height={showPaymentBanner ? '3rem' : '0px'}
            alignItems="center"
            justifyContent="center"
            gap="10px"
            sx={{
              opacity: showPaymentBanner ? 1 : 0,
              display: showPaymentBanner ? 'flex' : 'none',
              transition: 'all .2s ease-in-out',
              borderBottom: '1px solid #0000003d',
            }}
          >
            <Typography variant="h3" style={{ fontSize: '16px' }}>
              Payment past due:{' '}
              <Link
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
                href={`${Pathnames.PATIENT_PORTAL_PROFILE}?page=payment`}
              >
                Update payment
              </Link>
            </Typography>
          </Box>
        )}
        {promoKey !== 'ZEALTHY10' && (
          <Box
            display={'flex'}
            bgcolor="#fff"
            height={showActionItemBanner ? '30px' : '0px'}
            alignItems="center"
            justifyContent="center"
            gap="10px"
            onClick={() => setShowActionItemModal(true)}
            sx={{
              opacity: showActionItemBanner ? 1 : 0,
              display: showActionItemBanner ? 'flex' : 'none',
              cursor: 'pointer',
              transition: 'all .2s ease-in-out',
              borderBottom: '1px solid #C9C6C6',
            }}
          >
            <NewReleases color="error" />
            <Typography variant="h3" color="error" style={{ fontSize: '16px' }}>
              Complete your{' '}
              <span style={{ textDecoration: 'underline' }}>
                {actionItemCount > 1 ? 'action items' : 'action item'}
              </span>
            </Typography>
          </Box>
        )}
        {showPrescriptionRenewalBanner &&
          !currentFlow?.includes('renewal') &&
          !showVerifyIdentityBanner &&
          !showPaymentBanner &&
          promoKey !== 'ZEALTHY10' && (
            <Box
              display={'flex'}
              bgcolor="#fff"
              height={'3rem'}
              alignItems="center"
              justifyContent="center"
              gap="10px"
              sx={{
                opacity: 1,
                display: 'flex',
                transition: 'all .2s ease-in-out',
                borderBottom: '1px solid #0000003d',
              }}
            >
              <Typography
                variant="h3"
                style={{ fontSize: '16px', fontWeight: '700' }}
              >
                <Link
                  style={{
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                  }}
                  href={showPrescriptionRenewalBanner.path || ''}
                >
                  Request Rx renewal
                </Link>
              </Typography>
            </Box>
          )}
        {request &&
        !['Cancelled', 'Completed', 'Noshowed'].includes(request.status) &&
        !Router.pathname.includes('visit/room') ? (
          <ILVBanner
            onLeave={cancelAndGoToNext}
            buttonText={'Click here to schedule for later'}
          />
        ) : null}
        {promoKey === 'ZEALTHY10' && <Banner6867Var1 text={text} />}
      </StickyHeader>
      {request && ilvModal === true ? (
        <ILVConfirmedModal
          open={ilvModal}
          setOpen={setILVModal}
          request={request}
        />
      ) : null}
      {showActionModal ? (
        <ActionItemModal
          open={showActionItemModal}
          setOpen={setShowActionItemModal}
          actionItemCount={actionItemCount}
          setActionItemCount={setActionItemCount}
          hasNonCompoundGLP1Request={hasNonCompoundGLP1Request}
        />
      ) : null}
      {children}
    </>
  );
};

export default PatientPortalNav;

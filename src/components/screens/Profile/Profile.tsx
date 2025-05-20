import {
  useAllVisiblePatientSubscription,
  usePatient,
  usePatientAddress,
  usePatientPayment,
  usePatientPharmacy,
  usePatientUnpaidInvoices,
} from '@/components/hooks/data';
import {
  useUpdateAddress,
  useUpdatePassword,
  useUpdatePatient,
  useUpdateProfile,
} from '@/components/hooks/mutations';
import Loading from '@/components/shared/Loading/Loading';
import { SpecificCareOption } from '@/context/AppContext/reducers/types/intake';
import { Database } from '@/lib/database.types';
import { Pathnames } from '@/types/pathnames';
import { validatePassword } from '@/utils/validatePassword';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/fp';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Router from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Subscription } from './components/PatientMemberships/types';
import PrescriptionList from './components/PrescriptionList';
import getConfig from '../../../../config';

const PharmacySelection = dynamic(() => import('./components/PharmacySelect'), {
  ssr: false,
});

const ProfileForm = dynamic(() => import('./components/ProfileForm'), {
  ssr: false,
});

const PasswordUpdate = dynamic(() => import('./components/PasswordForm'), {
  ssr: false,
});

const AddressUpdate = dynamic(() => import('./components/AddressUpdate'), {
  ssr: false,
});

const PaymentUpdate = dynamic(() => import('./components/PaymentUpdate'), {
  ssr: false,
});

const PatientMemberships = dynamic(
  () => import('./components/PatientMemberships'),
  {
    ssr: false,
  }
);

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Profile() {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  const supabase = useSupabaseClient<Database>();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  // data
  const { isLoading, data: patientInfo } = usePatient();
  const { data: paymentProfile } = usePatientPayment();
  const { data: patientAddress } = usePatientAddress();
  const { data: patientPharmacy, refetch: refetchPharmacy } =
    usePatientPharmacy();
  const { data: activeSubscriptions = [] } = useAllVisiblePatientSubscription();
  const { data: unpaidInvoices = [] } = usePatientUnpaidInvoices();

  const unpaidInvoice = unpaidInvoices.length > 0;

  // mutations
  const updatePatient = useUpdatePatient();
  const updateProfile = useUpdateProfile();
  const updateAddress = useUpdateAddress();
  const updatePassword = useUpdatePassword();

  const [currMembership, setCurrMembership] = useState<Subscription | null>(
    null
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [hasExpiredSubscription, setHasExpiredSubscription] = useState(false);
  const [error, setError] = useState('');

  const phone = patientInfo?.profiles?.phone_number
    ?.replace('+1', '')
    .replace('+', '');

  async function handleProfileSave(data: any) {
    setLoading(true);
    await updateProfile.mutateAsync(data);
    setLoading(false);
    Router.push(
      {
        pathname: '/patient-portal/profile',
        query: { page: 'home' },
      },
      undefined,
      { shallow: true }
    );
  }

  async function handleUpdateAddress(data: any) {
    setLoading(true);
    if (data.state !== patientInfo?.region) {
      await updatePatient.mutateAsync({
        region: data.state,
      });
    }
    await updateAddress.mutateAsync(data);

    setLoading(false);
    Router.push(
      {
        pathname: '/patient-portal/profile',
        query: { page: 'home' },
      },
      undefined,
      { shallow: true }
    );
  }

  const isBundlePatient = useMemo(() => {
    return activeSubscriptions.some(
      sub =>
        sub.subscription.name === 'Zealthy Weight Loss' &&
        [297, 449].includes(sub.price || 0)
    );
  }, [activeSubscriptions]);

  const handleMembershipSelections = useCallback((sub: Subscription) => {
    setCurrMembership(sub);
    if (
      sub.subscription.name === 'Zealthy Weight Loss' &&
      [297, 449].includes(sub.price || 0)
    ) {
      Router.push(
        `${Pathnames.PATIENT_PORTAL_MANAGE_BUNDLED_MEMBERSHIPS}/${sub.reference_id}`
      );
    } else {
      Router.push(
        `${Pathnames.PATIENT_PORTAL_MANAGE_MEMBERSHIPS}/${sub.reference_id}`
      );
    }
  }, []);

  async function handlePasswordUpdate(passwordData: {
    old_password: string;
    new_password: string;
    confirm_password: string;
  }) {
    if (passwordData?.new_password !== passwordData?.confirm_password)
      return toast.error("Password's must match");
    if (passwordData?.new_password.length < 8) {
      return toast.error('Password should be at least 8 characters');
    }
    if (!validatePassword(passwordData?.new_password)) {
      return setError(
        'Your password must be at least 8 characters long, contain at least one number, a special character, and have a mixture of uppercase and lowercase letters.'
      );
    }

    setLoading(true);
    const { data, error } = await supabase.rpc('change_user_password', {
      current_plain_password: passwordData?.old_password,
      new_plain_password: passwordData?.new_password,
    });
    console.log(error, 'error123');
    setLoading(false);

    if (!error) {
      Router.push(
        {
          pathname: '/patient-portal/profile',
          query: { page: 'home' },
        },
        undefined,
        { shallow: true }
      );
      toast.success('Password updated!');
    } else {
      setError(error.message);
    }
  }

  const birthControlSubscription = useMemo(() => {
    return activeSubscriptions.find(
      sub =>
        sub.subscription.id === 5 &&
        (sub.care === SpecificCareOption.BIRTH_CONTROL ||
          sub.order?.prescription?.medication_quantity?.medication_dosage
            ?.medication?.display_name === 'Birth Control Medication')
    );
  }, [activeSubscriptions]);

  const hairLossSubscription = useMemo(() => {
    return activeSubscriptions.find(
      sub =>
        sub.subscription.id === 5 &&
        (sub.care === SpecificCareOption.HAIR_LOSS ||
          sub.order?.prescription?.medication_quantity?.medication_dosage
            ?.medication?.display_name === 'Hair Loss Medication')
    );
  }, [activeSubscriptions]);

  const edPrescription = useMemo(() => {
    return activeSubscriptions.find(
      sub =>
        sub.subscription.id === 5 &&
        (sub.care === SpecificCareOption.ERECTILE_DYSFUNCTION ||
          sub.order?.prescription?.medication_quantity?.medication_dosage
            ?.medication?.display_name === 'ED Medication')
    );
  }, [activeSubscriptions]);

  const enclomiphineSubscription = useMemo(() => {
    return activeSubscriptions.find(
      sub =>
        sub.subscription.id === 5 &&
        (sub.care === SpecificCareOption.ENCLOMIPHENE ||
          sub.order?.prescription?.medication_quantity?.medication_dosage
            ?.medication?.display_name === 'Enclomiphene Medication')
    );
  }, [activeSubscriptions]);

  const edHlSubscription = useMemo(() => {
    return activeSubscriptions.find(
      sub =>
        sub.subscription.id === 5 &&
        (sub.care === SpecificCareOption.SEX_PLUS_HAIR ||
          sub.order?.prescription?.medication_quantity?.medication_dosage
            ?.medication?.display_name === 'EDHL Medication')
    );
  }, [activeSubscriptions]);

  const birthDateString = patientInfo?.profiles?.birth_date;
  const formattedBirthDate = birthDateString
    ? format(parseISO(birthDateString), 'MMMM dd, yyyy')
    : '';

  return (
    <Container maxWidth="sm">
      {isLoading && <Loading />}
      {!isLoading && (
        <Box sx={{ marginBottom: '25px' }}>
          {(page === 'home' || !page) && (
            <Stack direction="column" gap="48px">
              {/* Title */}
              <Typography textAlign="left" variant="h2">
                {siteName} Profile
              </Typography>

              {/* Conditionally show memberships */}
              {hasExpiredSubscription ? (
                <PatientMemberships
                  onSelect={handleMembershipSelections}
                  onSubscriptionLoad={setHasExpiredSubscription}
                />
              ) : null}

              {/* Account details */}
              <Stack direction="column" gap="16px">
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '18px !important',
                    fontWeight: '600',
                    lineHeight: '26px !important',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  Account details
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Name'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {`${patientInfo?.profiles?.first_name} ${patientInfo?.profiles?.last_name}`}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Email'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {patientInfo?.profiles?.email}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Phone'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {phone?.length == 10
                      ? `(${phone?.substring(0, 3)})
                    ${phone?.substring(3, 6)}-${phone?.substring(6, 10)}`
                      : `+${phone}`}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Birthday'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {formattedBirthDate}
                  </Typography>
                  <Link
                    onClick={() =>
                      Router.push(
                        {
                          pathname: '/patient-portal/profile',
                          query: {
                            page: 'profile-form',
                          },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {'Edit'}
                  </Link>
                </Box>
              </Stack>

              {/* Medical insurance */}
              {/* {isBundlePatient ? null : <MedicalInsurance />} */}

              {/* Payment method */}
              <Stack direction="column" gap="16px">
                <Stack direction="row">
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '18px !important',
                      fontWeight: '600',
                      lineHeight: '26px !important',
                    }}
                  >
                    Payment method
                  </Typography>
                  {unpaidInvoice && (
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: '18px !important',
                        fontWeight: '600',
                        lineHeight: '26px !important',
                        color: theme => theme.palette.primary.main,
                      }}
                    >
                      : Needs attention
                    </Typography>
                  )}
                </Stack>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Default card'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {paymentProfile?.last4
                      ? `**** **** **** ${paymentProfile?.last4}`
                      : 'No default card'}
                  </Typography>
                  <Link
                    onClick={() =>
                      Router.push(
                        {
                          pathname: '/patient-portal/profile',
                          query: { page: 'payment' },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {!paymentProfile?.last4 ? 'Add' : 'Edit'}
                  </Link>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                      marginBottom: '16px',
                    }}
                  >
                    Billing history
                  </Typography>
                  <Link
                    onClick={() =>
                      Router.push(
                        {
                          pathname: '/patient-portal/profile/billing-history',
                          query: { page: 'payment' },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    Review
                  </Link>
                </Box>
              </Stack>

              {/* Delivery address */}
              <Stack direction="column" gap="16px">
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '18px !important',
                    fontWeight: '600',
                    lineHeight: '26px !important',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  Delivery address
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Default delivery address'}
                  </Typography>
                  <Box
                    sx={{
                      textAlign: 'start',
                      marginBottom: '16px',
                    }}
                  >
                    {patientAddress?.address_line_1 ? (
                      <>
                        <Typography>
                          {patientAddress?.address_line_1}
                        </Typography>
                        <Typography>
                          {patientAddress?.address_line_2}
                        </Typography>
                        <Typography>
                          {patientAddress?.city}, {patientAddress?.state}
                        </Typography>
                        <Typography>{patientAddress?.zip_code}</Typography>
                        <Typography
                          sx={{
                            marginBottom: '16px',
                          }}
                        >
                          United States
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography> No default address</Typography>
                      </>
                    )}
                  </Box>
                  <Link
                    onClick={() =>
                      Router.push(
                        {
                          pathname: '/patient-portal/profile',
                          query: { page: 'address' },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {!patientAddress?.address_line_1 ? 'Add' : 'Edit'}
                  </Link>
                </Box>
              </Stack>

              {/* Preferred pharmacy */}
              <Stack direction="column" gap="16px">
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '18px !important',
                    fontWeight: '600',
                    lineHeight: '26px !important',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  Preferred pharmacy
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Default pharmacy'}
                  </Typography>
                  {patientPharmacy?.name && (
                    <Typography variant="subtitle1">
                      {patientPharmacy?.name}
                    </Typography>
                  )}
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {patientPharmacy?.pharmacy
                      ? patientPharmacy?.pharmacy
                      : 'No default pharmacy'}
                  </Typography>
                  <Link
                    onClick={() =>
                      Router.push(
                        {
                          pathname: '/patient-portal/profile',
                          query: { page: 'pharmacy' },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {!patientPharmacy?.pharmacy ? 'Add' : 'Edit'}
                  </Link>
                </Box>
              </Stack>

              {/* Password */}
              <Stack direction="column" gap="16px">
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: '18px !important',
                    fontWeight: '600',
                    lineHeight: '26px !important',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  Password
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '24px',
                    background: '#FFFFFF',
                    border: '1px solid #D8D8D8',
                    borderRadius: '16px',
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '16px !important',
                      fontWeight: '600',
                      lineHeight: '24px !important',
                      color: '#989898',
                    }}
                  >
                    {'Current password'}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ marginBottom: '16px' }}>
                    {'************'}
                  </Typography>
                  <Link
                    onClick={() =>
                      Router.push(
                        {
                          pathname: '/patient-portal/profile',
                          query: { page: 'password' },
                        },
                        undefined,
                        { shallow: true }
                      )
                    }
                    sx={{
                      fontWeight: '600',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {'Edit'}
                  </Link>
                </Box>
              </Stack>

              <PrescriptionList />

              {/* Conditionally show memberships */}
              {hasExpiredSubscription ? null : (
                <PatientMemberships
                  onSelect={handleMembershipSelections}
                  onSubscriptionLoad={setHasExpiredSubscription}
                />
              )}
            </Stack>
          )}
          {page === 'profile-form' && (
            <ProfileForm
              data={{
                first_name: patientInfo?.profiles?.first_name,
                last_name: patientInfo?.profiles?.last_name,
                email: patientInfo?.profiles?.email,
                phone_number: patientInfo?.profiles?.phone_number,
              }}
              loading={loading}
              onCancel={() =>
                Router.push(
                  {
                    pathname: '/patient-portal/profile',
                    query: { page: 'home' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
              onSave={handleProfileSave}
            />
          )}
          {page === 'payment' && (
            <PaymentUpdate
              patient={patientInfo}
              onCancel={() => {
                Router.push(
                  {
                    pathname: '/patient-portal/profile',
                    query: { page: 'home' },
                  },
                  undefined,
                  { shallow: true }
                );
              }}
            />
          )}
          {page === 'address' && (
            <AddressUpdate
              loading={loading}
              onSave={handleUpdateAddress}
              onCancel={() =>
                Router.push(
                  {
                    pathname: '/patient-portal/profile',
                    query: { page: 'home' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
            />
          )}
          {page === 'password' && (
            <PasswordUpdate
              loading={loading}
              onSave={handlePasswordUpdate}
              onCancel={() =>
                Router.push(
                  {
                    pathname: '/patient-portal/profile',
                    query: { page: 'home' },
                  },
                  undefined,
                  { shallow: true }
                )
              }
              error={error}
            />
          )}

          {page === 'pharmacy' && (
            <PharmacySelection
              patient={patientInfo!}
              onCancel={() => {
                refetchPharmacy();
                Router.push(
                  {
                    pathname: '/patient-portal/profile',
                    query: { page: 'home' },
                  },
                  undefined,
                  { shallow: true }
                );
              }}
            />
          )}
        </Box>
      )}
    </Container>
  );
}

import Head from 'next/head';
import { ReactElement, useEffect, useMemo, useState } from 'react';
import { getAuthProps } from '@/lib/auth';
import PatientPortalNav from '@/components/shared/layout/PatientPortalNav';
import Footer from '@/components/shared/layout/Footer';
import CenteredContainer from '@/components/shared/layout/CenteredContainer';
import { Divider, Stack, Typography } from '@mui/material';
import {
  usePatient,
  usePatientAddress,
  usePatientOrders,
} from '@/components/hooks/data';
import { EditDeliveryAddress } from '@/components/shared/UpdatePatientInfo';
import { toast } from 'react-hot-toast';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import Router from 'next/router';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Endpoints } from '@/types/endpoints';
import { useApi } from '@/context/ApiContext';

const SkincareApprovalPage = () => {
  const api = useApi();
  const isMobile = useIsMobile();
  const { data: orders, refetch: refetchOrders } = usePatientOrders();
  const { data: patient } = usePatient();
  const [page, setPage] = useState<string>('confirm');
  const [loading, setLoading] = useState<boolean>(false);
  const { id: correctOrderId } = Router.query;

  const skincareOrder = useMemo(
    () => orders?.find(order => order?.id === Number(correctOrderId)),
    [correctOrderId, orders]
  );

  const treatmentName = useMemo(() => {
    return skincareOrder?.prescription?.medication || '';
  }, [skincareOrder?.prescription?.medication]);

  const handleConfirmOrder = async () => {
    try {
      const endpoint =
        skincareOrder?.prescription?.dosespot_prescription_id ||
        skincareOrder?.prescription?.medication ===
          'ACNE ULTRA (CLINDAMYCIN / NIACINAMIDE / TRETINOIN)'
          ? Endpoints.PAY_FOR_ORDER
          : Endpoints.CREATE_EMPOWER_ORDER;

      setLoading(true);
      await api.post(endpoint, {
        existingOrder: skincareOrder,
        patient,
      });

      toast.success('Your order is now being processed at the pharmacy');
      window?.freshpaint?.track('payment-success-skincare', {
        total_charged: skincareOrder?.total_price,
      });
      Router.push('/patient-portal');
    } catch (e) {
      toast.error('Something went wrong');
      console.error('error confirming empower order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Skincare Approval | Zealthy</title>
      </Head>
      <CenteredContainer maxWidth="xs" sx={{ marginBottom: '24px' }}>
        {page === 'confirm' && (
          <>
            <Stack gap={1}>
              <Typography
                variant="h2"
                letterSpacing="0.002em"
                textAlign="center"
              >
                {`Purchase ${treatmentName} formula`}
              </Typography>
              <Typography textAlign="center">
                {`Get ${treatmentName} formula delivered to your door. $75 for a 3-month supply.`}
              </Typography>
            </Stack>
            <Typography variant="h3" fontStyle="italic">
              Order summary
            </Typography>
            <Stack gap={isMobile ? '24px' : '32px'}>
              <Stack direction="row" justifyContent="space-between">
                <Typography>{`${treatmentName}`}</Typography>
                <Typography>$75</Typography>
              </Stack>
              <Divider />
              <Stack
                direction="row"
                justifyContent="space-between"
                color="#7E7E7E"
              >
                <Typography>{`Free Online Specialist Visit`}</Typography>
                <Typography>$0</Typography>
              </Stack>
              <Divider />
              <Stack
                direction="row"
                justifyContent="space-between"
                color="#7E7E7E"
              >
                <Typography>{`Free Shipping`}</Typography>
                <Typography>$0</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h3">{`Total`}</Typography>
                <Typography variant="h3">$75</Typography>
              </Stack>
            </Stack>
            <LoadingButton
              sx={{ width: '100%' }}
              loading={loading}
              disabled={loading}
              onClick={handleConfirmOrder}
            >
              {`Confirm order - $${skincareOrder?.total_price}`}
            </LoadingButton>
            <Typography
              variant="subtitle2"
              fontSize="0.75rem !important"
              sx={{ fontStyle: 'italic', textAlign: 'center' }}
            >
              This is what Zealthy expects to last 3 months. Once you are
              charged, you will no longer be eligible for refund
            </Typography>
          </>
        )}

        {page === 'delivery-address' && (
          <>
            <EditDeliveryAddress goHome={() => setPage('confirm')} />
          </>
        )}
      </CenteredContainer>
      <Footer />
    </>
  );
};

export const getServerSideProps = getAuthProps;

SkincareApprovalPage.getLayout = (page: ReactElement) => (
  <PatientPortalNav>{page}</PatientPortalNav>
);

export default SkincareApprovalPage;

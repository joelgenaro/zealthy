import { usePatientIncompleteVisits } from '@/components/hooks/data';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useVisitHandler } from '@/components/hooks/useVisitHandler';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import LoadingButton from '@/components/shared/Button/LoadingButton';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { StandardModal } from '@/components/shared/modals';
import { useRouter } from 'next/router';

interface ActionItemDrawer {}

const ActionItemDrawer = ({}: ActionItemDrawer) => {
  const isMobile = useIsMobile();
  const { data: incompleteVisits = [] } = usePatientIncompleteVisits();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(
    () => sessionStorage.getItem('isDrawerOpen') !== 'true'
  );
  const handleVisit = useVisitHandler();

  const visit = useMemo(() => {
    return incompleteVisits[0];
  }, [incompleteVisits]);

  const handleClose = useCallback(() => {
    setOpen(false);
    sessionStorage.setItem('isDrawerOpen', 'true');
  }, []);

  const handleContinue = useCallback(async () => {
    if (!visit) return;

    const formattedVisit = {
      id: visit.id,
      status: visit.status,
      isSync: visit.synchronous,
      careSelected: visit.reason_for_visit,
      intakes: visit.intakes as IntakeType[],
      potential_insurance:
        visit.potential_insurance as PotentialInsuranceOption,
      specific_care: visit.specific_care as SpecificCareOption,
      variant: visit.variant || undefined,
      paid_at: visit.paid_at || '',
    };

    setLoading(true);
    await handleVisit(formattedVisit).catch(() => setLoading(false));
  }, [handleVisit, visit]);

  useEffect(() => {
    if (router.query['from-webflow'] === 'true' && visit) {
      handleContinue();
    }
  }, [router.query['from-webflow'], visit]);

  if (!visit || router.query['from-webflow'] === 'true') {
    return null;
  }

  return (
    <>
      {isMobile ? (
        <StandardModal
          setModalOpen={handleClose}
          modalOpen={open}
          bgColor="#F7F9F8"
        >
          <Stack alignItems="center" padding="10px" gap="24px">
            <Typography variant="h2">Action Item</Typography>
            <Paper sx={{ padding: '20px' }} component={Stack} gap="16px">
              <Typography fontWeight={600} textTransform="uppercase">
                {`Complete your ${visit.reason_for_visit[0].reason} visit`}
              </Typography>
              <Typography>
                {`You recently started a visit for ${visit.reason_for_visit[0].reason} treatment and must
            answer a few remaining questions. Pick up where you left off and
            complete your visit today.`}
              </Typography>
              <LoadingButton
                fullWidth
                loading={loading}
                disabled={loading}
                onClick={handleContinue}
              >
                Complete Visit
              </LoadingButton>
            </Paper>
          </Stack>
        </StandardModal>
      ) : (
        <Drawer
          sx={{
            '.MuiDrawer-paper': {
              width: '50%',
              background: '#F7F9F8',
            },
          }}
          anchor="right"
          open={open}
          onClose={handleClose}
        >
          <IconButton
            size="large"
            sx={{ alignSelf: 'baseline' }}
            onClick={handleClose}
          >
            <HighlightOffIcon fontSize="large" />
          </IconButton>
          <Stack alignItems="center" paddingTop="50px" gap="24px">
            <Typography variant="h2">Action Item</Typography>
            <Paper
              sx={{ padding: '20px' }}
              component={Stack}
              gap="24px"
              width="400px"
            >
              <Typography fontWeight={600} textTransform="uppercase">
                {`Complete your ${visit.reason_for_visit[0].reason} visit`}
              </Typography>
              <Typography>
                {`You recently started a visit for ${visit.reason_for_visit[0].reason} treatment and must
            answer a few remaining questions. Pick up where you left off and
            complete your visit today.`}
              </Typography>
              <LoadingButton
                loading={loading}
                disabled={loading}
                onClick={handleContinue}
              >
                Complete Visit
              </LoadingButton>
            </Paper>
          </Stack>
        </Drawer>
      )}
    </>
  );
};

export default ActionItemDrawer;

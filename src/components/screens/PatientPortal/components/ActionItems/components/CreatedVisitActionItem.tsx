import { OnlineVisit } from '@/components/hooks/data';
import { useUpdateOnlineVisit } from '@/components/hooks/mutations';
import RemovingModal from '@/components/shared/RemovingModal';
import { AccessTime, Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';
import { useCallback, useState } from 'react';
import { Pathnames } from '@/types/pathnames';
import PatientPortalItem from '../../PatientPortalItem';
import { useVisitHandler } from '@/components/hooks/useVisitHandler';
import { IntakeType } from '@/utils/getIntakesForVisit-v2';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';

interface CreatedVisitActionItemProps {
  visit: OnlineVisit;
}

const CreatedVisitActionItem = ({ visit }: CreatedVisitActionItemProps) => {
  const updateVisitStatus = useUpdateOnlineVisit();
  const [open, setOpen] = useState(false);
  const handleVisit = useVisitHandler();

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleRemove = useCallback(() => {
    updateVisitStatus.mutateAsync({
      visitId: visit.id,
      update: {
        status: 'Canceled',
      },
    });
  }, [updateVisitStatus, visit.id]);

  const handleContinue = useCallback(() => {
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
    handleVisit(formattedVisit);
  }, [handleVisit, visit]);

  return (
    <>
      <Stack position="relative">
        <IconButton
          size="small"
          onClick={handleOpen}
          sx={{
            position: 'absolute',
            left: '5px',
            top: '10px',
            zIndex: 10,
            color: 'grey',
          }}
        >
          <Close />
        </IconButton>
        <PatientPortalItem
          data={{
            head: `Complete your visit for ${visit.reason_for_visit
              .map((r: any) => r.reason.toLowerCase())
              .join(', ')} treatment(s)`,
            body: 'In order to get a treatment plan from a Zealthy provider, you need to complete a few more questions.',
            icon: AccessTime,
            path: Pathnames.PATIENT_PORTAL,
          }}
          iconBg="#FDB97A"
          color="#FEFFC2"
          text="text.primary"
          key="incomplete-visit"
          newWindow={false}
          action={handleContinue}
        />
      </Stack>
      {open ? (
        <RemovingModal
          title={`Are you sure you want to remove this action item?`}
          confirmButtonText="Yes, remove my action item"
          cancelButtonText="No, keep my action item"
          onClose={handleClose}
          onRemove={handleRemove}
        />
      ) : null}
    </>
  );
};

export default CreatedVisitActionItem;

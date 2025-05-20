import RemovingModal from '@/components/shared/RemovingModal';
import { Database } from '@/lib/database.types';
import Stack from '@mui/material/Stack';
import { Close, MedicationOutlined } from '@mui/icons-material';
import RxNotesIcon from '@/components/shared/icons/RxNotesIcon';
import { useCallback, useEffect, useState } from 'react';
import PatientPortalItem from '../../PatientPortalItem';
import IconButton from '@mui/material/IconButton';
import { useMutatePatientActionItems } from '@/components/hooks/useMutatePatientActionItems';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import Clock from '@/components/shared/icons/Clock';
import LabTube from '@/components/shared/icons/LabTube';
import Document from '@/components/shared/icons/Document';
import WeightScale from '@/components/shared/icons/WeightScale';
import { useVWOVariationName } from '@/components/hooks/data';
import MedicationBottle from '@/components/shared/icons/MedicationBottle';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface CancelableActionItemProps {
  actionItem: Database['public']['Tables']['patient_action_item']['Row'];
}

//2 unnecessary types were inadvertently added to dev enum types, can't use enums type above temporarily. using this for typing instead until resolved
type PatientActions =
  | 'COMPOUND_MEDICATION_REQUEST'
  | 'MISSING_HEIGHT_WEIGHT'
  | 'CANCELLED_PRESCRIPTION'
  | 'PRESCRIPTION_RENEWAL_REQUEST'
  | 'COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST'
  | 'RATE_COACH'
  | 'ENCLOMIPHENE_CHECK_IN'
  | 'ENCLOMIPHENE_LAB_RESULT'
  | 'INSURANCE_INFO_REQUESTED'
  | 'ADDITIONAL_PA_QUESTIONS'
  | 'REFILL_REQUEST_PS'
  | 'CONTINUE_WEIGHT_LOSS'
  | 'FULL_BODY_PHOTO'
  | 'DOWNLOAD_MOBILE_APP'
  | 'PRESCRIPTION_RENEWAL';

const mapActionTypeToIcon: { [key in PatientActions]: () => JSX.Element } = {
  COMPOUND_MEDICATION_REQUEST: () => <RxNotesIcon size={23} />,
  INSURANCE_INFO_REQUESTED: () => <RxNotesIcon size={23} />,
  MISSING_HEIGHT_WEIGHT: () => <RxNotesIcon size={23} />,
  CANCELLED_PRESCRIPTION: () => <MedicationOutlined />,
  PRESCRIPTION_RENEWAL_REQUEST: () => <RxNotesIcon size={23} />,
  COMPOUND_MEDICATION_DOSAGE_UPDATE_REQUEST: () => <RxNotesIcon size={23} />,
  RATE_COACH: () => <PriorityHighIcon />,
  ENCLOMIPHENE_CHECK_IN: () => <Clock />,
  ENCLOMIPHENE_LAB_RESULT: () => <LabTube />,
  ADDITIONAL_PA_QUESTIONS: () => <Document />,
  REFILL_REQUEST_PS: () => <Document />,
  CONTINUE_WEIGHT_LOSS: () => <PriorityHighIcon />,
  FULL_BODY_PHOTO: () => <WeightScale />,
  DOWNLOAD_MOBILE_APP: () => <MedicationBottle />,
  PRESCRIPTION_RENEWAL: () => <Clock />,
};

const CancelableActionItem = ({ actionItem }: CancelableActionItemProps) => {
  const [open, setOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);
  const { updateActionItem } = useMutatePatientActionItems();
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const supabase = useSupabaseClient<Database>();

  const handleRemove = useCallback(async () => {
    await updateActionItem({
      ...actionItem,
      canceled: true,
      canceled_at: new Date().toISOString(),
    });

    if (actionItem.type === 'DOWNLOAD_MOBILE_APP') {
      const { data: actionItems } = await supabase
        .from('patient_action_item')
        .select('*')
        .eq('patient_id', actionItem.patient_id)
        .eq('type', 'DOWNLOAD_MOBILE_APP');

      if (actionItems) {
        await Promise.all(
          actionItems.map(item =>
            updateActionItem({
              ...item,
              canceled: true,
              canceled_at: new Date().toISOString(),
            })
          )
        );
      }
    }
  }, [actionItem, updateActionItem]);

  const updateEnclomipheneActionItem = useCallback(() => {
    updateActionItem({
      patient_id: actionItem.patient_id,
      completed_at: new Date().toISOString(),
      completed: true,
      type: 'ENCLOMIPHENE_CHECK_IN',
    });
  }, [actionItem, updateActionItem]);

  useEffect(() => {
    if (actionItem.type === 'RATE_COACH' && !hasTriggered) {
      window?.freshpaint?.track('rate-coach-experience-displayed');
    }
    setHasTriggered(true);
  }, [hasTriggered]);

  if (actionItem.type === 'FULL_BODY_PHOTO') {
    return null;
  }

  return (
    <>
      <Stack position="relative">
        {!actionItem.is_required && (
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
        )}
        <PatientPortalItem
          data={{
            head: actionItem.title,
            body: actionItem.body,
            icon: mapActionTypeToIcon[actionItem.type as PatientActions],
            path: actionItem.path ?? undefined,
          }}
          iconBg="#FDB97A"
          color="#FEFFC2"
          text="text.primary"
          newWindow={false}
          updateActionItem={updateEnclomipheneActionItem}
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

export default CancelableActionItem;

import { Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';
import { useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';
import Attention from '@/components/shared/icons/AttentionIcon';
import PatientPortalItem from '../../PatientPortalItem';
import { useIsMobile } from '@/components/hooks/useIsMobile';

const CreatedVisitActionItem = ({
  patientId,
  refetch,
}: {
  patientId: number;
  refetch: () => void;
}) => {
  const supabase = useSupabaseClient<Database>();
  const isMobile = useIsMobile();

  const handleClose = useCallback(async () => {
    await supabase
      .from('patient')
      .update({ insurance_skip: true })
      .eq('id', patientId);

    refetch();
  }, [patientId, refetch, supabase]);

  return (
    <>
      <Stack position="relative">
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            left: isMobile ? '2px' : '10px',
            top: '10px',
            zIndex: 10,
            color: 'grey',
          }}
        >
          <Close />
        </IconButton>
        <PatientPortalItem
          data={{
            head: 'Add your insurance or pharmacy benefits card',
            body: 'If you’d like us to help you attempt to get GLP-1 medication for just your co-pay (often about $25/month), you can add your insurance information.',
            icon: Attention,
            path: `/patient-portal/documents`,
          }}
          iconBg="#FDB97A"
          color="#FEFFC2"
          text="text.primary"
          key="no-insurance-uploaded"
          newWindow={false}
        />
      </Stack>
    </>
  );
};

export default CreatedVisitActionItem;

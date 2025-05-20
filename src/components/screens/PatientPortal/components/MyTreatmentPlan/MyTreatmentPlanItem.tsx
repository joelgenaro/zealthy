import React, { useCallback } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
// import Image from "next/image";
import { ChevronRight, Key } from '@mui/icons-material';
import { Pathnames } from '@/types/pathnames';
import Router from 'next/router';
import { useVWOVariationName } from '@/components/hooks/data';
import { usePatient } from '@/components/hooks/data';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/lib/database.types';

interface Props {
  data: {
    icon?: React.FC;
    path?: string;
    head: string;
    subHead?: string;
    body: string;
    disableInsuranceUpdate?: boolean;
  };
  color?: string;
  iconBg?: string;
  text?: string;
  newWindow: boolean;
  action?: () => void;
}

const MyTreatmentPlanItem = ({
  data,
  action,
  newWindow = false,
  color,
  text,
}: Props) => {
  const supabase = useSupabaseClient<Database>();
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const handleClick = useCallback(async () => {
    if (!data?.disableInsuranceUpdate) {
      await supabase
        .from('patient')
        .update({ insurance_skip: false })
        .eq('id', Number(patient?.id));
    }

    if (action) {
      return action();
    }

    if (newWindow) {
      return window.open(data.path || Pathnames.PATIENT_PORTAL, '_blank');
    }

    return Router.push(data.path || Pathnames.PATIENT_PORTAL);
  }, [data?.path, action]);

  return (
    <List>
      <ListItem
        sx={{
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <ListItemAvatar>
          {data.icon ? (
            <Box>
              <data.icon />
            </Box>
          ) : null}
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography sx={{ marginBottom: '0.5rem' }} fontWeight="600">
              {data?.head}
            </Typography>
          }
          secondary={
            data.subHead ? (
              <Typography>{data?.subHead}</Typography>
            ) : (
              <Typography>{data?.body}</Typography>
            )
          }
        />
        {data.path && (
          <IconButton>
            <ChevronRight fontSize={'large'} />
          </IconButton>
        )}
      </ListItem>
      <hr style={{ borderTop: '1px solid #bbb' }} />
    </List>
  );
};

export default MyTreatmentPlanItem;

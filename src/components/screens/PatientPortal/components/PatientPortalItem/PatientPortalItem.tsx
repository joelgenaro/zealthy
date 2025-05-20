import {
  List,
  Typography,
  IconButton,
  Box,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { Pathnames } from '@/types/pathnames';
import Image, { StaticImageData } from 'next/image';
import React, { useCallback, useEffect } from 'react';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { ChevronRight } from '@mui/icons-material';
import Router from 'next/router';
import { Stack } from '@mui/system';
import { useCreateOnlineVisitAndNavigate } from '@/components/hooks/useCreateOnlineVisitAndNavigate';
import { usePatient, usePatientUnpaidInvoices } from '@/components/hooks/data';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useIntakeActions } from '@/components/hooks/useIntake';
import { useVWO } from '@/context/VWOContext';

interface Props {
  data: {
    icon?: React.FC;
    path?: string;
    head: string;
    subHead?: string;
    body: string;
  };
  color: string;
  iconBg?: string;
  text: string;
  image?: string | null | undefined | StaticImageData;
  newWindow: boolean;
  action?: () => void;
  isReactivate?: boolean;
  openInjectionVideo?: any;
  updateActionItem?: any;
  imageStyle?: 'round' | 'square';
}

const PatientPortalItem = ({
  data,
  color,
  text,
  image,
  iconBg,
  action,
  newWindow = false,
  isReactivate,
  openInjectionVideo = false,
  updateActionItem,
  imageStyle = 'round',
}: Props) => {
  const isMobile = useIsMobile();
  const { data: patient } = usePatient();
  const { addPotentialInsurance, addSpecificCare } = useIntakeActions();
  const createVisitAndNavigateAway = useCreateOnlineVisitAndNavigate(
    patient?.id
  );
  const vwo = useVWO();
  const { data: unpaidInvoices = [] } = usePatientUnpaidInvoices();

  useEffect(() => {
    if (
      data.path ===
      '/questionnaires-v2/weight-loss-free-consult/ONBOARDING_PRECHECKOUT'
    ) {
      addSpecificCare(SpecificCareOption.WEIGHT_LOSS_FREE_CONSULT);
    }
  }, []);

  const activateVariant = async () => {
    if (
      vwo &&
      patient &&
      data?.path === Pathnames.PATIENT_PORTAL_UPDATE_PAYMENT &&
      unpaidInvoices?.length
    ) {
      await vwo.activate('8912', patient!);
    }
  };

  useEffect(() => {
    activateVariant();
  }, [patient, vwo, unpaidInvoices, data]);

  const handleClick = useCallback(() => {
    if (action) {
      return action();
    }

    if (newWindow) {
      return window.open(data.path || Pathnames.PATIENT_PORTAL, '_blank');
    }

    if (data?.icon?.name === 'ENCLOMIPHENE_CHECK_IN') updateActionItem();
    if (data?.icon?.name === 'INSURANCE_INFO_REQUESTED') {
      data.path = Pathnames.PATIENT_PORTAL_DOCUMENTS;
    }
    if (data?.icon?.name === 'ADDITIONAL_PA_QUESTIONS') {
      addPotentialInsurance(PotentialInsuranceOption.ADDITIONAL_PA);
      createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS], {
        careType: PotentialInsuranceOption.ADDITIONAL_PA,
      });
    }
    if (
      data?.head ===
      'Complete the following questions to get your insurance to approve GLP-1 medication'
    ) {
      addPotentialInsurance(PotentialInsuranceOption.WEIGHT_LOSS_CONTINUE);
      createVisitAndNavigateAway([SpecificCareOption.WEIGHT_LOSS], {
        careType: PotentialInsuranceOption.WEIGHT_LOSS_CONTINUE,
      });
    }

    return Router.push(data.path || Pathnames.PATIENT_PORTAL);
  }, [data.path, action, addPotentialInsurance]);

  const handleDisplayVideo = () => {
    openInjectionVideo(true);
  };

  return (
    <List>
      <ListItem
        sx={{
          bgcolor: color,
          border: '1px solid #CCCCCC',
          borderRadius: '16px',
          padding: isMobile ? '14px' : '20px',
          cursor: 'pointer',
        }}
        alignItems="center"
        onClick={openInjectionVideo ? handleDisplayVideo : handleClick}
      >
        <ListItemAvatar
          sx={{
            marginLeft: isMobile ? '10px' : '0',
            marginRight: data.icon || image ? '14px' : '0',
            display: 'flex',
          }}
        >
          {data.icon ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                width: '48px',
                borderRadius: '50%',
                background: iconBg,
                color: '#111111',
              }}
            >
              <data.icon />
            </Box>
          ) : image ? (
            <Image
              sizes="48px"
              width={48}
              height={48}
              alt="Photo of care provider"
              src={image!}
              style={{
                borderRadius: imageStyle === 'round' ? '50%' : '0%',
                margin: '0 auto',
                objectFit: 'cover',
              }}
            />
          ) : null}
        </ListItemAvatar>
        <ListItemText
          sx={{ paddingRight: '24px' }}
          primary={
            <Typography
              sx={{ marginBottom: '0.5rem' }}
              lineHeight="18px"
              fontWeight="600"
              color={text}
            >
              {data.head}
            </Typography>
          }
          secondary={
            <Stack gap={1}>
              {data.subHead ? (
                <Typography component="span" color={text} variant="body2">
                  {data.subHead}
                </Typography>
              ) : null}
              <Typography component="span" color={text} variant="body2">
                {data.body}
              </Typography>
            </Stack>
          }
        />
        {data.path && (
          <IconButton
            sx={{
              color: text == '#FFFFFF' ? 'white' : 'black',
              padding: '0',
            }}
            edge="start"
          >
            <ChevronRight fontSize={'large'} />
          </IconButton>
        )}
        {openInjectionVideo && (
          <IconButton
            sx={{
              color: text == '#FFFFFF' ? 'white' : 'black',
              padding: '0',
            }}
            edge="start"
          >
            <ChevronRight fontSize={'large'} />
          </IconButton>
        )}
      </ListItem>
    </List>
  );
};

export default PatientPortalItem;

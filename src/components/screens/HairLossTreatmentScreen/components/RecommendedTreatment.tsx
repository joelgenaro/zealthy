import { useIsMobile } from '@/components/hooks/useIsMobile';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import StrikethroughText from '@/components/shared/StrikethroughText';
import GelSwitch from './GelSwitch';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import {
  drugs,
  addOnDrugs,
} from '../../Question/components/HairLossTreatments/data';
import { useSelector } from '@/components/hooks/useSelector';
import { useRouter } from 'next/router';
import getConfig from '../../../../../config';

const sxMobile = {
  padding: '48px 24px 24px',
  p: {
    textAlign: 'center',
  },
};

const desktopSx = {
  paddingLeft: '82px',
  p: {
    textAlign: 'left',
  },
};

interface RecommendedTreatmentProps {
  handleTreatment: () => void;
  comboName: string;
}

interface DrugItem {
  name: string;
  description: string;
  price: number;
  discounted_price: number;
  discount: string;
  images: string[];
  height: number;
}

const RecommendedTreatment = ({
  handleTreatment,
  comboName,
}: RecommendedTreatmentProps) => {
  const visitId = useSelector(store => store.visit.id);
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const isMobile = useIsMobile();
  const supabase = useSupabaseClient();

  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;

  useEffect(() => {
    if (!visitId) {
      router.replace(
        `/onboarding/${
          ['Zealthy', 'FitRx'].includes(siteName ?? '')
            ? 'region-screen'
            : 'region-screen-2'
        }?care=Hair+loss&variant=0&ins=`
      );
    } else {
      setIsLoading(false);
    }
  }, [visitId, router]);

  const [useGetHairLossMedications, setUseGetHairLossMedications] =
    React.useState<DrugItem[]>([]);

  React.useEffect(() => {
    supabase
      .from('medication')
      .select('*')
      .eq('display_name', 'Hair Loss Medication')
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        } else {
          setUseGetHairLossMedications(data || []);
        }
      });
  }, [supabase]);

  const combo = useMemo<DrugItem[]>(() => {
    if (!visitId) {
      createOnlineVisit(true);
    }
    return [...drugs, ...addOnDrugs] as unknown as DrugItem[];
  }, [visitId]);

  const sx = useMemo(() => {
    return isMobile ? sxMobile : desktopSx;
  }, [isMobile]);

  if (isLoading) {
    return <></>;
  }
  if (isLoading || !visitId) {
    return null;
  }

  return (
    <Stack
      position="relative"
      direction={isMobile ? 'column-reverse' : 'row'}
      alignItems="center"
      sx={{
        borderRadius: '6px',
        border: '1px solid #808080',
        ...sx,
      }}
    >
      <Stack
        gap="16px"
        flexBasis="50%"
        paddingTop={isMobile ? '24px' : '48px'}
        paddingBottom="16px"
        alignItems={isMobile ? 'center' : 'flex-start'}
      >
        <Typography variant="h3">
          {combo.length > 0 && combo[0] ? combo[0].name : ''}
        </Typography>
        <Typography fontWeight={400}>
          {combo.length > 0 ? combo[0].description : ''}
        </Typography>
        {comboName === 'Oral Finasteride and Minoxidil Foam' ? (
          <GelSwitch />
        ) : null}
        <Stack gap="8px">
          {combo.map((item, index) => (
            <Typography key={index} fontWeight="600">
              {item.discount}
            </Typography>
          ))}
          <Stack
            direction="row"
            gap="8px"
            justifyContent={isMobile ? 'center' : 'flex-start'}
          >
            <StrikethroughText>
              ${combo.length > 0 ? combo[0].price : ''}
            </StrikethroughText>
            <Typography fontWeight="600" color="#E38869">
              {`$${combo.length > 0 ? combo[0].discounted_price : ''}`}
            </Typography>
          </Stack>
        </Stack>
        <Button
          onClick={handleTreatment}
          fullWidth
          sx={{
            borderRadius: '29.5px',
            width: '279px',
          }}
        >
          Get started
        </Button>
        <Typography variant="h4" fontWeight={300}>
          Delivered quarterly, only charged if prescribed.
        </Typography>
      </Stack>
      <Stack flexBasis="50%" direction="row" justifyContent="center" gap="16px">
        {combo.length > 0 &&
          combo[0].images?.map((ImageSrc, idx) => (
            <Image
              key={idx}
              src={ImageSrc}
              alt="bottle"
              style={{
                width: 'fit-content',
                height: combo[idx].height,
                alignSelf: 'flex-end',
              }}
            />
          ))}
      </Stack>
      <Box
        position="absolute"
        sx={{
          top: 0,
          left: '50%',
          transform: 'translate(-50%, -23px)',
          borderRadius: '25px',
          color: 'white',
          background: '#231E20',
          padding: '13px 20px',
          width: '275px',
          textAlign: 'center',
        }}
      >
        <Typography fontWeight={600}>Recommended for you</Typography>
      </Box>
    </Stack>
  );
};

export default RecommendedTreatment;
function createOnlineVisit(arg0: boolean) {
  throw new Error('Function not implemented.');
}

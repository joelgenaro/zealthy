import { useLanguage, usePatient } from '@/components/hooks/data';
import { useIntakeState } from '@/components/hooks/useIntake';
import {
  PotentialInsuranceOption,
  SpecificCareOption,
} from '@/context/AppContext/reducers/types/intake';
import { useVWO } from '@/context/VWOContext';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Banner6867Var1 } from './Banner6867Var1';
import BannerWL from './BannerWL';

interface PromoBannerProps {
  text: string;
  promoKey?: string;
}

const PromoBanner = ({ text, promoKey }: PromoBannerProps) => {
  const theme = useTheme();
  const { specificCare, potentialInsurance } = useIntakeState();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const language = useLanguage();
  const pathname = usePathname();
  let finalText = text;
  const checkoutPage = !!pathname?.includes('checkout');
  const vwoContext = useVWO();
  const router = useRouter();
  const { data: patient } = usePatient();

  const isBundled =
    potentialInsurance === PotentialInsuranceOption.SEMAGLUTIDE_BUNDLED ||
    potentialInsurance === PotentialInsuranceOption.TIRZEPATIDE_BUNDLED ||
    potentialInsurance === PotentialInsuranceOption.ORAL_SEMAGLUTIDE_BUNDLED;

  if (language === 'esp') {
    finalText =
      'Tiempo limitado: $96 de descuento en el primer mes, no se necesita cita';
  }

  const activateVariant = async () => {};

  useEffect(() => {
    if (router.pathname.includes('post-checkout')) {
      activateVariant();
    }
  }, [vwoContext, patient, router.pathname]);

  return (
    <Box>
      {checkoutPage && promoKey === 'ZEALTHY10' && (
        <Banner6867Var1 text={finalText} />
      )}
      {checkoutPage && promoKey !== 'ZEALTHY10' && (
        <>
          <Box
            bgcolor={theme.palette.secondary.main}
            padding={`${isMobile ? '12px' : '24px'} 12px`}
            display="flex"
            gap="16px"
            justifyContent="center"
            alignItems="center"
            top={isMobile ? '48px' : '108px'}
            left={0}
            right={0}
            width="100%"
            zIndex={9998}
          >
            <Typography
              textAlign="center"
              fontSize={`${isMobile ? '14px' : 'inherit'}`}
            >
              {finalText}
            </Typography>
          </Box>
        </>
      )}
      {!checkoutPage && (
        <Box
          bgcolor={theme.palette.secondary.main}
          padding={`${isMobile ? '12px' : '24px'} 12px`}
          display="flex"
          gap="16px"
          justifyContent="center"
          alignItems="center"
        >
          <Typography
            textAlign="center"
            fontSize={`${isMobile ? '14px' : 'inherit'}`}
          >
            {finalText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PromoBanner;

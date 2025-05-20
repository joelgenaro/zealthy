import { useIsMobile } from '@/components/hooks/useIsMobile';
import { Offer } from '@/constants/offers';
import { Pathnames } from '@/types/pathnames';
import { useRouter } from 'next/router';
import { SwooshIcon } from '@/components/shared/icons/SwooshIcon';
import { PotentialInsuranceOption } from '@/context/AppContext/reducers/types/intake';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface OfferProps {
  offer: Offer;
  variant: string | null;
  potentialInsurance: PotentialInsuranceOption | null;
}

const DefaultOffer = ({ offer, variant, potentialInsurance }: OfferProps) => {
  const isMobile = useIsMobile();
  const { push, query } = useRouter();

  const currentOffers = ['Tirzepatide Bundled', 'Semaglutide Bundled'];
  const isCurrentOffer =
    currentOffers.some(offer => {
      return potentialInsurance === offer;
    }) && variant !== '2746';

  return (
    <Stack
      gap={isMobile ? '2rem' : '3rem'}
      alignItems="center"
      maxWidth="470px"
      margin="0 auto"
    >
      <Stack
        gap="1rem"
        marginRight={isMobile ? 1 : 0}
        justifyContent="flex-start"
      >
        <Typography variant="h2">
          {offer.header} {offer.subHeaders[0]}
        </Typography>
        {isCurrentOffer && (
          <>
            <Box position="relative">
              <Typography
                position="absolute"
                left="37%"
                top="30%"
                style={{ textDecoration: 'line-through' }}
                fontSize="13px !important"
              >
                {potentialInsurance === 'Semaglutide Bundled'
                  ? 'only $297 per month'
                  : 'only $449 per month'}
              </Typography>
              <Typography
                fontWeight={800}
                position="absolute"
                left="33%"
                top="50%"
                variant="body1"
              >
                {potentialInsurance === 'Semaglutide Bundled'
                  ? variant === '4758b'
                    ? 'first month only $149'
                    : 'first month only $217'
                  : 'first month only $349'}
              </Typography>

              <SwooshIcon />
            </Box>
          </>
        )}

        <Typography
          component="p"
          variant="body1"
          sx={{
            fontSize: isMobile ? '14px' : '12px',
            lineHeight: '16px',
            letterSpacing: '0.012px',
            fontWeight: '400',
            textAlign: 'center',
          }}
        >
          {offer.body1}
        </Typography>

        {offer.body2 ? (
          <Typography
            color="#777777"
            component="p"
            variant="body2"
            sx={{
              fontSize: '14px',
              lineHeight: '20px',
              letterSpacing: '0.001em',
              fontWeight: '400',
            }}
          >
            {offer.body2}
          </Typography>
        ) : null}
      </Stack>
      <Button
        type="button"
        sx={{
          height: '56px',
          minWidth: '200px',
          width: '90%',
          borderRadius: 'rounded',
          color: '#FFF',
          fontStyle: 'normal',
          lineHeight: '16px', // or '133.333%',
          letterSpacing: '0.048px',
        }}
        onClick={() =>
          push({
            pathname: Pathnames.SIGN_UP,
            query: query,
          })
        }
      >
        {offer.buttonText || 'Continue with my offer'}
      </Button>
    </Stack>
  );
};

export default DefaultOffer;

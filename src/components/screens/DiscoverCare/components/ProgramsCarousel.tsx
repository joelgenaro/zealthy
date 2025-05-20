import { Box } from '@mui/material';
import CarouselCard from './CarouselCard';
import { useIsMobile } from '@/components/hooks/useIsMobile';
import { PatientSubscriptionProps } from '@/lib/auth';

interface CarouselProps {
  content: any;
  hasActiveWeightLoss?: boolean;
  cancelledWeightLossSubscription?: PatientSubscriptionProps;
}

const ProgramsCarousel = ({
  content,
  hasActiveWeightLoss,
  cancelledWeightLossSubscription,
}: CarouselProps) => {
  const isMobile = useIsMobile();

  return (
    <Box
      sx={{
        display: 'flex',

        gap: 2,
        py: 1,
        overflow: 'auto',
        width: `${isMobile ? '350px' : '950px'}`,
        scrollSnapType: 'x mandatory',
        '& > *': {
          scrollSnapAlign: 'center',
        },
        '::-webkit-scrollbar': {
          display: isMobile ? 'none' : '',
          color: 'black',
        },
      }}
    >
      {content.map((item: any, i: number) => (
        <CarouselCard
          key={i}
          program={item}
          newWindow={false}
          hasActiveWeightLoss={hasActiveWeightLoss}
          cancelledWeightLossSubscription={cancelledWeightLossSubscription}
        />
      ))}
    </Box>
  );
};

export default ProgramsCarousel;

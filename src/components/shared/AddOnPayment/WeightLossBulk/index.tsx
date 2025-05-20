import { useIsBundled } from '@/components/hooks/data';
import { Stack } from '@mui/material';
import Spinner from '../../Loading/Spinner';
import { WeightLossBulkAddOn as WeightLossBulkAddOnV1 } from '../WeightLoss/Bundled/WeightLossThreeMonth/WeightLossBulk';
import { WeightLossBulkAddOnV2 } from '../WeightLoss/NonBundled/WeightLossThreeMonth/WeightLossBulkV2';

interface WeightLossBulkProps {
  videoUrl?: string;
  onNext?: () => void;
  currentMonth: number | null;
}

export const WeightLossBulkAddOn = ({
  videoUrl,
  onNext,
  currentMonth,
}: WeightLossBulkProps) => {
  const { data: isBundled = false, isLoading } = useIsBundled();
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center">
        <Spinner />
      </Stack>
    );
  }

  if (isBundled) {
    return <WeightLossBulkAddOnV1 onNext={onNext} />;
  }

  return (
    <WeightLossBulkAddOnV2
      videoUrl={videoUrl}
      onNext={onNext}
      currentMonth={currentMonth}
    />
  );
};

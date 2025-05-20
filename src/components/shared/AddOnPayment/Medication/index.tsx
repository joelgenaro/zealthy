import MedicationV1 from './Medication';
interface MedicationProps {
  videoUrl?: string;
  onNext?: () => void;
  isAdjustment?: boolean;
  isRefill?: boolean;
}

export function MedicationAddOn({
  videoUrl,
  onNext,
  isAdjustment = false,
  isRefill = false,
}: MedicationProps) {
  return (
    <MedicationV1
      videoUrl={videoUrl}
      onNext={onNext}
      isAdjustment={isAdjustment}
      isRefill={isRefill}
    />
  );
}

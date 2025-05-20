import { useMemo } from 'react';
import { useIntakeState } from './useIntake';

export const useCheckoutDescription = () => {
  const { specificCare } = useIntakeState();

  const description = useMemo(() => {
    switch (specificCare) {
      case 'Skincare':
      case 'Acne':
      case 'Rosacea':
      case 'Fine Lines & Wrinkles':
        return 'Your Zealthy visit costs $20, which includes your virtual consultation, the development of your personalized treatment plan, and support from your Zealthy care team.';
      case 'Mental health':
        return "If approved, you'll be charged for your prescription. You can cancel any time.";
      default:
        return '';
    }
  }, [specificCare]);

  return description;
};

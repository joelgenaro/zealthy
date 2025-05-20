import { Prescription } from '@/components/hooks/data';

export const isInjectable = (prescription: Prescription) => {
  if (prescription.is_injectable === null) {
    return ['semaglutide', 'tirzepatide'].some(
      m =>
        prescription.medication?.toLowerCase().includes(m) &&
        !prescription.medication?.toLowerCase().includes('capsule') &&
        !prescription.medication?.toLowerCase().includes('enclomiphene') &&
        !prescription.medication?.toLowerCase().includes('oral') &&
        !prescription.medication?.toLowerCase().includes('naltrexone') &&
        !prescription.medication?.toLowerCase().includes('bupropion')
    );
  }

  return prescription.is_injectable;
};

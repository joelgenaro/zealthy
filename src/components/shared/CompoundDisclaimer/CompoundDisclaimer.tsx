import { useLanguage, useVWOVariationName } from '@/components/hooks/data';
import Typography from '@mui/material/Typography';
import { CSSProperties, useMemo } from 'react';

interface DisclaimerProps {
  medication: string;
  currentMonth: number;
  styles?: CSSProperties;
}

const CompoundDisclaimer = ({
  medication,
  currentMonth,
  styles = {},
}: DisclaimerProps) => {
  const language = useLanguage();
  const text = useMemo(() => {
    if (medication.toLowerCase().includes('semaglutide')) {
      if (currentMonth >= 2) {
        return language === 'esp'
          ? `En promedio, las personas pierden el 5% de su peso cuando toman semaglutida durante 3 meses**`
          : `On average, people lose 5% of their weight when taking semaglutide for 3 months**`;
      } else {
        return language === 'esp'
          ? `En promedio, las personas pierden el 7% de su peso en sus primeros 3 meses con semaglutida*`
          : `On average, people lose 7% of their weight in their first 3 months with semaglutide**`;
      }
    }

    if (medication.toLowerCase().includes('tirzepatide')) {
      if (currentMonth >= 2) {
        return language === 'esp'
          ? 'En promedio, las personas pierden el 7% de su peso cuando toman tirzepatida durante 3 meses**'
          : 'On average, people lose 7% of their weight when taking tirzepatide for 3 months**';
      } else {
        return language === 'esp'
          ? 'En promedio, las personas pierden el 8% de su peso corporal en sus primeros 3 meses de uso de tirzepatida*'
          : 'On average, people lose 8% of their body weight in their first 3 months of using tirzepatide**';
      }
    }

    return '';
  }, [currentMonth, medication, language]);

  return (
    <Typography fontWeight={700} textAlign="center" sx={styles}>
      {text}
    </Typography>
  );
};

export default CompoundDisclaimer;

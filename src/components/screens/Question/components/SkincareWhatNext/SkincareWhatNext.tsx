import { useSelector } from '@/components/hooks/useSelector';
import { useEffect } from 'react';
import TextItem from './components/TextItem';
import Stack from '@mui/material/Stack';
import { items } from './items';

const SkincareWhatNext = () => {
  const skincare = useSelector(
    store => store.intake?.specificCare === 'Skincare'
  );

  useEffect(() => {
    if (skincare) {
      window?.freshpaint?.track('prescription-request-submitted-skincare');
    }
  }, [skincare]);

  return (
    <Stack direction="column" gap="22px">
      {items.map(item => (
        <TextItem key={item.header} item={item} />
      ))}
    </Stack>
  );
};

export default SkincareWhatNext;

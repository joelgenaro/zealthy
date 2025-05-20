import { Container } from '@mui/material';
// import Image from 'next/image';
// import { HorizontalRule } from '@mui/icons-material';
// import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
// import Logo from '@/components/shared/icons/Logo';
// import { useVWOVariationName } from '@/components/hooks/data';
import NowWhatCard from './NowWhatCard';

interface NowWhatProps {
  nextPage?: (nextPage?: string) => void;
}

const NowWhat = ({ nextPage }: NowWhatProps) => {
  return (
    <Container
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NowWhatCard nextPage={nextPage} />
    </Container>
  );
};

export default NowWhat;

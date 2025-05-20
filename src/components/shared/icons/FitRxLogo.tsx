import Image from 'next/image';
import FitRx from '../../../../public/FitRxLogo.png';

const FitRxLogo = () => {
  return <Image src={FitRx} width={110} height={30} alt="FitRx Logo" />;
};

export default FitRxLogo;

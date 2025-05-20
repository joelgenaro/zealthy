import getConfig from '../../../../config';
import Image from 'next/image';

const Logo = () => {
  const config = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL || 'app.getzealthy.com'
  );

  if (typeof config.logo === 'string') {
    // If the logo is a string (image URL), use the Image component
    return (
      <Image src={config.logo} alt={config.name} width={100} height={50} />
    );
  } else {
    // If the logo is a React component, render it directly
    const LogoComponent = config.logo;
    return <LogoComponent />;
  }
};

export default Logo;

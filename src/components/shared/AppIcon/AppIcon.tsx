import Image from 'next/image';

interface AppIconProps {
  width: number;
  height: number;
  link: string;
}

const AppIcon = ({ width, height, link }: AppIconProps) => {
  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '15px',
        border: '1px solid lightgrey',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        src={link}
        width={width}
        height={height}
        alt="Zealthy Icon"
        style={{ objectFit: 'cover' }}
        fill={true}
      />
    </div>
  );
};

export default AppIcon;

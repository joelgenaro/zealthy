import { Avatar, AvatarGroup as MuiAvatarGroup } from '@mui/material';
import _map from 'lodash/map';

interface AvatarGroupProps {
  images: string[];
  height?: number;
  width?: number;
  max?: number;
}

const AvatarGroup = ({ images, height, width, max }: AvatarGroupProps) => {
  return (
    <MuiAvatarGroup
      sx={{
        '& .MuiAvatar-root': {
          marginLeft: -2,
          border: 'none',
          height,
          width,
        },
      }}
      max={max}
    >
      {_map(images, (image, i) => (
        <Avatar key={`avatar-${i}`} src={image} />
      ))}
    </MuiAvatarGroup>
  );
};

export default AvatarGroup;

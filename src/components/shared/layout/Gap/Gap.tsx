import Box from '@mui/material/Box';

interface GapProps {
  height?: string;
}

const Gap = ({ height = '4rem' }: GapProps) => {
  return <Box height={height}></Box>;
};

export default Gap;

import { Button, ButtonProps } from '@mui/material';
import Spinner from '@/components/shared/Loading/Spinner';

type Props = ButtonProps & {
  loading?: boolean;
};

const LoadingButton = ({
  loading,
  children,
  startIcon,
  sx,
  ...props
}: Props) => (
  <Button
    {...props}
    sx={{
      ...sx,
      opacity: loading ? 0.5 : 1,
      pointerEvents: loading ? 'none' : 'initial',
    }}
    startIcon={loading ? <Spinner size="1em" color="inherit" /> : startIcon}
  >
    {children}
  </Button>
);

export default LoadingButton;

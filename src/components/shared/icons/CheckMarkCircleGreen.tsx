import getConfig from '../../../../config';
import { useTheme } from '@mui/system';

const CheckMarkIcon = () => {
  const siteName = getConfig(
    process.env.NEXT_PUBLIC_VERCEL_URL ?? 'app.getzealthy.com'
  ).name;
  const theme = useTheme();

  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="40"
        cy="40"
        r="40"
        fill={
          siteName === 'Zealthy' || siteName === 'FitRx'
            ? '#8ACDA0'
            : theme.palette.primary.main
        }
      />
      <path
        d="M40 19C28.4018 19 19 28.4014 19 40C19 51.5986 28.4014 61 40 61C51.5986 61 61 51.5986 61 40C61 28.4014 51.5986 19 40 19ZM49.056 36.3325L37.4235 47.965C37.2398 48.1487 37.0297 48.2839 36.805 48.3777C36.1261 48.6514 35.3238 48.5166 34.7726 47.965L28.9262 42.1186C28.5751 41.7671 28.3779 41.2904 28.3779 40.7932C28.3779 40.296 28.5751 39.8193 28.9262 39.4677C29.2782 39.1162 29.7549 38.919 30.2517 38.919C30.7489 38.919 31.2256 39.1161 31.5776 39.4677L36.1002 43.9899L46.4089 33.6811C46.7605 33.33 47.2372 33.1329 47.7344 33.1329C48.2316 33.1329 48.7083 33.33 49.0598 33.6811C49.4114 34.0331 49.6085 34.5098 49.6085 35.007C49.6085 35.5038 49.4114 35.9809 49.0598 36.3325H49.056Z"
        fill="black"
      />
    </svg>
  );
};

export default CheckMarkIcon;

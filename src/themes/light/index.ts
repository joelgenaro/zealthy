import getConfig from '../../../config';

const config = getConfig(
  process.env.NEXT_PUBLIC_VERCEL_URL || 'app.getzealthy.com'
);
const Theme = config.theme;

export default Theme;

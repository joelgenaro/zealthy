import { ED_MAPPING_DEV } from './ed-mapping-dev';
import { ED_MAPPING_PROD } from './ed-mapping-prod';
import { dailyOptions } from './ed-other-dev';
import { dailyOptionsProd } from './ed-other-prod';

export const ED_MAPPING =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? ED_MAPPING_PROD
    : ED_MAPPING_DEV;

export const otherOptions =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? dailyOptionsProd
    : dailyOptions;

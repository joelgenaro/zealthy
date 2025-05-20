import { devMapping } from './devMapping';
import { prodMapping } from './prodMapping';

export const envMapping =
  process.env.NEXT_PUBLIC_VERCEL_ENV == 'production' ? prodMapping : devMapping;

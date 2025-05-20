export type LEVEL = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export const LEVEL_DEBUG: LEVEL = 'debug';
export const LEVEL_INFO: LEVEL = 'info';
export const LEVEL_WARN: LEVEL = 'warn';
export const LEVEL_ERROR: LEVEL = 'error';
export const LEVEL_CRITICAL: LEVEL = 'critical';

export const LEVELS = {
  [LEVEL_DEBUG]: 'debug',
  [LEVEL_INFO]: 'info',
  [LEVEL_WARN]: 'warn',
  [LEVEL_ERROR]: 'error',
  [LEVEL_CRITICAL]: 'critical',
} as const;

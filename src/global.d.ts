import type Freshpaint from './freshpaint';

declare global {
  interface Window {
    freshpaint: Freshpaint;
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (
          siteKey: string,
          options: { action: string }
        ) => Promise<string>;
      };
    };

    rudderanalytics: {
      load: (writeKey: string, dataPlaneUrl: string) => void;
      identify: (userId: string, traits?: Record<string, any>) => void;
      track: (event: string, properties?: Record<string, any>) => void;
      page: (
        category?: string,
        name?: string,
        properties?: Record<string, any>
      ) => void;
      alias: (newId: string, oldId?: string) => void;
      group: (groupId: string, traits?: Record<string, any>) => void;
      ready: (callback: () => void) => void;
      reset: () => void;
    };

    VWO: any;
    jumbleberry: any;
    STZ: {
      trackEvent: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    rounded: true;
  }
}

declare module 'branch-sdk';

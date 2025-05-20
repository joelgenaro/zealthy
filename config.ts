import ZealthyLogo from '@/components/shared/icons/ZealthyLogo';
import ZPlanLogo from '@/components/shared/icons/ZPlanLogo';
import FitRxLogo from '@/components/shared/icons/FitRxLogo';
import { ComponentType } from 'react';
import ZealthyTheme from '@/themes/light/zealthy';
import ZPlanTheme from '@/themes/light/zplan';
import getServerConfig, { ConfigServer } from './config-server';

type Config = {
  name: string;
  theme: any;
  logo: ComponentType | string;
} & ConfigServer;

const configs: Record<string, Config> = {
  'app.getzealthy.com': {
    theme: ZealthyTheme,
    logo: ZealthyLogo,
    ...getServerConfig('app.getzealthy.com'),
  },
  'app.getzplan.com': {
    theme: ZPlanTheme,
    logo: ZPlanLogo,
    ...getServerConfig('app.getzplan.com'),
  },
  'app.fitrxapp.com': {
    theme: ZealthyTheme,
    logo: FitRxLogo,
    ...getServerConfig('app.fitrxapp.com'),
  },
};

const getConfig = (domain: string): Config => {
  return configs[domain] || configs['app.getzealthy.com'];
};

export default getConfig;

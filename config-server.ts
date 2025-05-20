export type ConfigServer = {
  name: string;
  paymentSuccessEvent: string;
  purchaseSuccessEvent: string;
  accountCreatedEvent: string;
  domain: string;
};

const configs: Record<string, ConfigServer> = {
  'app.getzealthy.com': {
    name: 'Zealthy',
    paymentSuccessEvent: 'payment-success',
    purchaseSuccessEvent: 'purchase-success',
    accountCreatedEvent: 'account_created',
    domain: 'getzealthy.com',
  },
  'app.getzplan.com': {
    name: 'Z-Plan',
    paymentSuccessEvent: 'payment-success-zp',
    purchaseSuccessEvent: 'purchase-success-zp',
    accountCreatedEvent: 'account_created_zp',
    domain: 'getzplan.com',
  },
  'app.fitrxapp.com': {
    name: 'FitRx',
    paymentSuccessEvent: 'payment-success-frx',
    purchaseSuccessEvent: 'purchase-success-frx',
    accountCreatedEvent: 'account_created_frx',
    domain: 'fitrxapp.com',
  },
};

const getServerConfig = (domain: string): ConfigServer => {
  return configs[domain] || configs['app.getzealthy.com'];
};

export default getServerConfig;

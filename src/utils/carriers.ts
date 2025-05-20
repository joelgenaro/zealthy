export const carriers = [
  {
    name: 'ups',
    url: (tracking_number: string) =>
      `https://www.ups.com/track?tracknum=${tracking_number}`,
    reg: /\b(1Z ?[0-9A-Z]{3} ?[0-9A-Z]{3} ?[0-9A-Z]{2} ?[0-9A-Z]{4} ?[0-9A-Z]{3} ?[0-9A-Z]|[\dT]\d\d\d ?\d\d\d\d ?\d\d\d)\b/,
  },
  {
    name: 'fedex',
    url: (tracking_number: string) =>
      `https://www.fedex.com/fedextrack/?trknbr=${tracking_number}`,
    reg: /(\b96\d{20}\b)|(\b\d{15}\b)|(\b\d{12}\b)/,
  },
  {
    name: 'fedex',
    url: (tracking_number: string) =>
      `https://www.fedex.com/fedextrack/?trknbr=${tracking_number}`,
    reg: /\b((98\d\d\d\d\d?\d\d\d\d|98\d\d) ?\d\d\d\d ?\d\d\d\d( ?\d\d\d)?)\b/,
  },
  {
    name: 'fedex',
    url: (tracking_number: string) =>
      `https://www.fedex.com/fedextrack/?trknbr=${tracking_number}`,
    reg: /^[0-9]{15}$/,
  },
  {
    name: 'usps',
    url: (tracking_number: string) =>
      `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tracking_number}`,
    reg: /(\b\d{30}\b)|(\b91\d+\b)|(\b\d{20}\b)/,
  },
  {
    name: 'usps',
    url: (tracking_number: string) =>
      `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tracking_number}`,
    reg: /^E\D{1}\d{9}\D{2}$|^9\d{15,21}$/,
  },
  {
    name: 'usps',
    url: (tracking_number: string) =>
      `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tracking_number}`,
    reg: /^91[0-9]+$/,
  },
  {
    name: 'usps',
    url: (tracking_number: string) =>
      `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${tracking_number}`,
    reg: /^[A-Za-z]{2}[0-9]+US$/,
  },
];

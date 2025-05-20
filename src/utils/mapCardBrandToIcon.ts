import AmExCardIcon from '@/components/shared/icons/AmExCardIcon';
import DiscoveryCard from '@/components/shared/icons/DiscoveryCard';
import MasterCardIcon from '@/components/shared/icons/MasterCardIcon';
import VisaCardIcon from '@/components/shared/icons/VisaCardIcon';

// Card brand. Can be amex, diners, discover, eftpos_au, jcb, mastercard, unionpay, visa, or unknown.
export const mapCardBrandToIcon: { [key: string]: () => JSX.Element } = {
  visa: VisaCardIcon,
  amex: AmExCardIcon,
  mastercard: MasterCardIcon,
  discover: DiscoveryCard,
};

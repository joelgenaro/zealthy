import { ISubscription, SubscriptionType } from '@/types/subscription';

export const zealthySubscription: ISubscription = {
  id: 1,
  processor: 'Stripe',
  reference_id: 'price_1MrunuAO83GerSecgQslWcex',
  name: 'Zealthy Access Fee',
  type: SubscriptionType.ZEALTHY_ACCESS,
  price: 30,
  discountedPrice: 0,
  monthFrequency: 3,
};

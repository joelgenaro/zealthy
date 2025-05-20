import Cream from './assets/Cream';
import Envelop from './assets/Envelop';
import GirlSmiling from './assets/GirlSmiling';
import Lips from './assets/Lips';
import ZealthyLogo from './assets/Logo';
import Provider from './assets/Provider';

export type Item = {
  header: string;
  description: string;
  hasCompleted: boolean;
  inProgress: boolean;
  image: () => JSX.Element;
  badge?: {
    color: string;
    text: string;
  };
};

export const items: Item[] = [
  {
    header: 'Purchased  skin consultation',
    description: 'Welcome to Zealthy!',
    hasCompleted: true,
    inProgress: false,
    image: ZealthyLogo,
  },
  {
    header: 'Patient Information',
    description:
      'Tell us about your medical history and take some selfies so your provider can recommend the best treatment for you.',
    hasCompleted: false,
    inProgress: true,
    image: GirlSmiling,
    badge: {
      color: '#8DDFA8',
      text: '5 minutes',
    },
  },
  {
    header: 'Provider review',
    description:
      'Your Zealthy provider will review your consultation and recommend a treatment plan in 48 hours.',
    hasCompleted: false,
    inProgress: false,
    image: Provider,
    badge: {
      color: '#FFECA9',
      text: 'Avg. 24 hrs',
    },
  },
  {
    header: 'Confirm your treatment plan',
    description:
      'Once you receive your treatment plan, check out with your prescriptions after confirming your order.',
    hasCompleted: false,
    inProgress: false,
    image: Cream,
  },
  {
    header: 'Treatment ships to you',
    description:
      'Your order will arrive 7-10 business days after your treatment plan is confirmed.',
    hasCompleted: false,
    inProgress: false,
    image: Envelop,
    badge: {
      color: '#FFECA9',
      text: '7-10 business days',
    },
  },
  {
    header: 'Start your journey to clear skin',
    description:
      'Your Zealthy provider will review your consultation and recommend a treatment plan in 48 hours.',
    hasCompleted: false,
    inProgress: false,
    image: Lips,
    badge: {
      color: '#FFECA9',
      text: '6-12 weeks',
    },
  },
];

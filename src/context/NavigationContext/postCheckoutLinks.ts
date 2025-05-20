import { Pathnames } from '@/types/pathnames';
import { alwaysTrue } from './rules';
import type { RulesLogic } from 'json-logic-js';

type PostCheckoutLink = {
  link: Pathnames;
  conditions: RulesLogic<{}>;
};

export const postCheckoutLinks: PostCheckoutLink[] = [
  {
    link: Pathnames.POST_CHECKOUT_INTAKES,
    conditions: alwaysTrue,
  },
  {
    link: Pathnames.POST_CHECKOUT_COMPLETE_VISIT,
    conditions: alwaysTrue,
  },
  {
    link: Pathnames.PATIENT_PORTAL,
    conditions: alwaysTrue,
  },
];

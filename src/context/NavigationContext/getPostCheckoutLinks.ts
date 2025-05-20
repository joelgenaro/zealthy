import jsonLogic from 'json-logic-js';
import { postCheckoutLinks } from './postCheckoutLinks';

const getPostCheckoutLinks = (data: unknown) => {
  return postCheckoutLinks
    .filter(link => jsonLogic.apply(link.conditions, data))
    .map(link => link.link);
};

export default getPostCheckoutLinks;

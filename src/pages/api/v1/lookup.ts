/**
 * It is a public endpoint
 * This endpoint exist only for local development,
 * it should not be used in production
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { LookUpResponse, floridaBlue, anthemNevada, empire } from './samples';

const mapPayerNameToResponse = (
  payerName: string
): Promise<LookUpResponse | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const response = {
        Empire: empire,
        'Anthem of Nevada': anthemNevada,
        'Florida Blue': floridaBlue,
      }[payerName];

      resolve(response);
    }, 2000);
  });
};

type ErrorType = {
  message: string;
  description?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LookUpResponse | ErrorType>
) {
  const {
    query: { search },
  } = req;

  const response = await mapPayerNameToResponse(search as string);

  if (response) {
    res.status(200).json(response);
  } else {
    res.status(400).json({
      message: 'Could not find payer with name ' + search,
    });
  }
}

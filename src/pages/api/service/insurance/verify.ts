import axios, { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import qs from 'qs';

type EnterBodyRequest = {
  payerId: string;
  provider: {
    npi: string;
    organization: string;
  };
  subscriber: {
    dob: string;
    id: string;
    first: string;
    last: string;
  };
};

export interface RTEInput {
  external_payer_id: string;
  member_id: string;
  policyholder_first_name: string;
  policyholder_last_name: string;
  member_dob: string;
  region: string;
}

export interface RTEResponse {
  address: {};
  created: string;
  dependents: [];
  dob: string | null;
  first: string | null;
  groupDescription: string | null;
  groupId: string | null;
  id: string;
  items: [];
  last: string | null;
  middle: string | null;
  otherDescription: string | null;
  otherId: string | null;
  otherQualifierId: string | null;
  planDescription: string | null;
  planEndDate: string | null;
  planId: string | null;
  planStartDate: string | null;
  sex: string | null;
  validations: [];
}

type ErrorType = {
  message: string;
  description?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RTEResponse | ErrorType>
) {
  try {
    const {
      external_payer_id,
      member_id,
      member_dob,
      policyholder_first_name,
      policyholder_last_name,
      region,
    } = req.body;

    const tokenData = {
      grant_type: 'client_credentials',
      client_id:
        region === 'CA'
          ? process.env.ENTER_CA_CLIENT_ID
          : process.env.ENTER_CLIENT_ID,
      client_secret:
        region === 'CA'
          ? process.env.ENTER_CA_CLIENT_SECRET
          : process.env.ENTER_CLIENT_SECRET,
    };

    const tokenOptions = {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(tokenData),
      url: process.env.ENTER_BASE_URL + '/oauth/token/',
    };

    const token_response = await axios(tokenOptions);

    const token = token_response.data.access_token;

    if (!token) {
      return 'No Enter auth access token';
    }

    const { data } = await axios<
      RTEResponse,
      AxiosResponse<RTEResponse>,
      EnterBodyRequest
    >({
      method: 'POST',
      url: process.env.ENTER_BASE_URL + '/provider/eligibility',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        payerId: external_payer_id,
        provider: {
          npi: region === 'CA' ? '1841988706' : '1689375891',
          organization: region === 'CA' ? 'Bruno Health, CA' : 'Bruno Health',
        },
        subscriber: {
          dob: member_dob,
          id: member_id,
          first: policyholder_first_name,
          last: policyholder_last_name,
        },
      },
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: 'Failed' });
  }
}

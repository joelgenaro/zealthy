import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { createTrustpilotToken } from './createTrustpilotToken';

export default async function generateInvitationLink(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { email, patientName, referenceId, fromMobile } = req.body;
    console.log('reqbody: ', req.body);

    // create token
    const { access_token } = await createTrustpilotToken();
    console.log(access_token, 'access_token');
    const getBusinessUnitId = async () => {
      try {
        const response = await axios.get(
          `https://${process.env.TRUSTPILOT_BASE_URL}/v1/business-units/find?apikey=${process.env.TRUSTPILOT_API_KEY}&name=getzealthy.com`
        );
        console.log('response', response?.data?.id);
        return response?.data?.id;
      } catch (err) {
        console.log('Error fetching Business Unit ID:', err);
        return null;
      }
    };

    const businessUnitId = await getBusinessUnitId();
    const invitationLinkParams = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      url: `https://invitations-${process.env.TRUSTPILOT_BASE_URL}/v1/private/business-units/${businessUnitId}/invitation-links`,
      data: {
        email: email,
        name: patientName,
        referenceId: referenceId,
        locale: 'en-US',
        redirectUri: 'http://app.getzealthy.com/patient-portal',
        tags: fromMobile
          ? ['Invitation-Link-API-Mobile']
          : ['Invitation-Link-API-Web'],
      },
    };

    const invitationResponse = await axios(invitationLinkParams);

    return res.status(200).json(invitationResponse?.data);
  } catch (err: any) {
    console.log({
      message: 'Error generating invitation link',
      error: err?.message || 'There was an unexpected error',
    });
    res.status(500).json({
      message: 'Error generating invitation link',
      error: err?.message || 'There was an unexpected error',
    });
  }
}

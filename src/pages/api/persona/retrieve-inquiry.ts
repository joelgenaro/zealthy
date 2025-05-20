import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function retrievePersonaInquiry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { personaId } = req.body;
  // Ensure personaId is provided

  if (!personaId) {
    res.status(400).json({ error: 'Missing personaId' });
    return;
  }

  try {
    // Inquiry request
    const { data: inquiryResponse } = await axios.get(
      `https://withpersona.com/api/v1/inquiries/${personaId}`,
      {
        headers: {
          accept: 'application/json',
          'Persona-Version': '2023-01-05',
          authorization: process.env.PERSONA_PRODUCTION_API_KEY,
        },
      }
    );

    // Document request
    const documentId =
      inquiryResponse.data.attributes?.fields['current-government-id']?.value
        ?.id;
    console.log('Document id:', documentId);
    if (!documentId) {
      throw new Error('Document ID not found');
    }

    const selfieVerificationId =
      inquiryResponse.data.relationships?.verifications?.data[1].id;

    const documentResponse = await axios.get(
      `https://withpersona.com/api/v1/documents/${documentId}`,
      {
        headers: {
          accept: 'application/json',
          'Persona-Version': '2023-01-05',
          authorization: process.env.PERSONA_PRODUCTION_API_KEY,
        },
      }
    );
    const selfieResponse = await axios.get(
      `https://withpersona.com/api/v1/verification/selfies/${selfieVerificationId}`,
      {
        headers: {
          accept: 'application/json',
          'Persona-Version': '2023-01-05',
          authorization: process.env.PERSONA_PRODUCTION_API_KEY,
        },
      }
    );

    // Combine and send response
    res.status(200).json({
      inquiry: inquiryResponse.data,
      document: documentResponse.data,
      selfie: selfieResponse.data,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      error: error.message || 'Error retrieving Persona inquiry',
    });
  }
}

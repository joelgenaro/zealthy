import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function CreatePatientHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const params = req.body;
  const { completeBooking } = req.query;

  if (!params.StartDateTime) res.json('Missing values');

  try {
    const tokenParams = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      url: `${process.env.ONSCHED_TOKEN_URL}/connect/token`,
      data: {
        client_id: process.env.ONSCHED_CLIENT_ID,
        client_secret: process.env.ONSCHED_CLIENT_SECRET,
        scope: 'OnSchedApi',
        grant_type: 'client_credentials',
      },
    };
    const token = await axios(tokenParams).then(res => res.data.access_token);

    const apptParams = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      url: `${process.env.ONSCHED_BASE_URL}/consumer/v1/appointments?completeBooking=${completeBooking}`,
      data: {
        ...params,
        serviceId: process.env.ONSCHED_SERVICE_ID,
        locationId: process.env.ONSCHED_LOCATION_ID,
      },
    };
    const appointment = await axios(apptParams);

    res.status(200).json(appointment.data);
  } catch (error: any) {
    console.log('create-appointment_err', error);
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}

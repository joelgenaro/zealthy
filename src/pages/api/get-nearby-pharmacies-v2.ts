import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getDosespotPharmacies } from './dosespot/_utils/pharmacySearch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return;
  const { zipCode, coordinates } = req.body;

  try {
    if (zipCode) {
      //find pharmacies by zipcode
      const pharmacies = await getDosespotPharmacies({ zip: zipCode });

      return res.status(200).json({ pharmacies, zip: zipCode });
    }

    const { data: addressResponse } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.long}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    console.log(`ADDRESS: ${JSON.stringify(addressResponse)}`);

    const zip =
      addressResponse.results[0].address_components.slice(-1)[0].short_name;

    //find pharmacies by zipcode
    const pharmacies = await getDosespotPharmacies({
      zip,
    });

    return res.status(200).json({ pharmacies, zip });
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}

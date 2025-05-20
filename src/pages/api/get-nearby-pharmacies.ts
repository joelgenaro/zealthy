import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return;
  const { zipCode, coordinates } = req.body;

  try {
    let nearbyPharmacies;
    let requestUrl;
    let apiZipCode;

    if (coordinates) {
      requestUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?location=${coordinates.lat},${coordinates.long}&rankby=distance&type=pharmacy&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    } else if (zipCode) {
      requestUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${zipCode}&type=pharmacy&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    }

    if (!requestUrl) {
      throw new Error('No location provided');
    }

    const response = await fetch(requestUrl);

    if (response.ok) {
      const data = await response.json();
      nearbyPharmacies = data.results.filter(
        (d: any) => d.user_ratings_total > 1
      );
    } else {
      console.error('Error fetching pharmacies');
    }

    if (coordinates) {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.long}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      const data = await geocodeResponse.json();

      if (data.results && data.results.length > 0) {
        apiZipCode = data.results[0].address_components.find((component: any) =>
          component.types.includes('postal_code')
        )?.long_name;
      }
    }

    res.status(200).json({
      locations: nearbyPharmacies,
      zip: apiZipCode || zipCode,
    });
  } catch (error: any) {
    res.status(500).json(error?.message || 'There was an unexpected error');
  }
}

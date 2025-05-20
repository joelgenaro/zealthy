export default function retrieveUtmDataForSupabase(
  utmParams: any,
  profileUtms: any
) {
  const utmKeys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ];

  const dataForSupabase: any = {};

  utmKeys.forEach(utmKey => {
    const value = utmParams[utmKey] || sessionStorage.getItem(utmKey) || ''; // Get current UTM value from local storage or empty string if not present

    // Determine the storage keys for first and last occurrences
    const firstKey = `first_${utmKey}`;
    const lastKey = `last_${utmKey}`;

    // If this is the first time we're seeing this UTM param, store it as both the first and last occurrence
    if (!profileUtms && value) {
      dataForSupabase[firstKey] = value;
    }

    // Always update the last occurrence to the most recent value
    if (value) {
      dataForSupabase[lastKey] = value;
    }
  });

  // Filter out entries where value is an empty string
  return Object.entries(dataForSupabase).reduce((acc: any, [key, value]) => {
    if (value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
}

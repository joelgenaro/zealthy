import vwoSDK from 'vwo-node-sdk';

async function getVWOInstance() {
  const apiKey =
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
      ? 'd42a7fbcda07ddc126100551f3baec59'
      : '4143e257216da1ad125cf67f98503f68';

  try {
    const settingsFile = await vwoSDK.getSettingsFile('770224', apiKey);
    const vwoClientInstance = vwoSDK.launch({ settingsFile });
    return vwoClientInstance;
  } catch (error) {
    console.error('Error fetching VWO settings:', error);
    return null;
  }
}

export default getVWOInstance;

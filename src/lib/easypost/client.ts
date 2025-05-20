import EasyPostClient from '@easypost/api';

const client = new EasyPostClient(process.env.EASYPOST_API_KEY!);

export default client;

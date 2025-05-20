import { carriers } from '@/utils/carriers';

describe('Carrier URLs', () => {
  test.each(carriers)('should generate correct URL for %s', carrier => {
    const trackingNumber = '123456789';
    const expectedUrl = carrier.url(trackingNumber);
    expect(expectedUrl).toContain(trackingNumber);
  });
});

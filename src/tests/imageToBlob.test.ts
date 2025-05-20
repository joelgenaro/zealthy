import { imageToBlob } from '@/utils/imageToBlob';

describe('imageToBlob', () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      blob: () => Promise.resolve('blob'),
      headers: new Headers(),
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: '',
      clone: () => this,
    } as unknown as Response)
  );

  it('should convert a base64 image string to a blob', async () => {
    const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const result = await imageToBlob(base64Image);

    expect(global.fetch).toHaveBeenCalledWith(base64Image);
    expect(result).toBe('blob');
  });
});

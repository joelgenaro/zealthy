import { handleCopy } from '@/utils/copyToClipboard';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast');

describe('handleCopy', () => {
  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('should copy the provided string to clipboard', async () => {
    const data = 'Test string';
    handleCopy(data);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(data);
  });

  it('should handle empty or undefined data by copying an empty string', async () => {
    handleCopy('');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    // @ts-ignore
    handleCopy(undefined);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });

  it('should show a success toast after copying', async () => {
    const data = 'Another test string';
    handleCopy(data);
    expect(toast.success).toHaveBeenCalledWith('Copied to Clipboard');
  });
});

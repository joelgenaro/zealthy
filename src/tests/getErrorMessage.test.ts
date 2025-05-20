import { getErrorMessage } from '@/utils/getErrorMessage';

describe('getErrorMessage', () => {
  test('should return the message from err.response.data', () => {
    const error = { response: { data: { message: 'Response data message' } } };
    expect(getErrorMessage(error)).toBe('Response data message');
  });

  test('should return the message from err.message if response.data.message is not available', () => {
    const error = { message: 'Error message' };
    expect(getErrorMessage(error)).toBe('Error message');
  });

  test('should return the error as string if it is a string', () => {
    const error = 'Plain string error';
    expect(getErrorMessage(error)).toBe('Plain string error');
  });

  test('should return stringified object if error is an instance of Object', () => {
    const error = { key: 'value' };
    expect(getErrorMessage(error)).toBe('{"key":"value"}');
  });
});

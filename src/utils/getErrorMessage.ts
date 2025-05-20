//this will cover Axios errors amongst others. Axios errors take precedence (first two conditions)
export function getErrorMessage(err: any, defaultMessage?: string) {
  const errorMessage = err?.response?.data?.message
    ? err?.response?.data?.message
    : err?.response?.data
    ? err?.response?.data
    : err?.message
    ? err?.message
    : typeof err === 'string'
    ? err
    : err instanceof Object
    ? JSON.stringify(err)
    : defaultMessage
    ? defaultMessage
    : 'Something went wrong';

  return errorMessage;
}

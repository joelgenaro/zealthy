interface ErrorFallbackProps {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError(): void;
}
export function ErrorFallback({ error }: ErrorFallbackProps) {
  console.error(
    error && typeof error === 'object' && 'message' in error
      ? error.message
      : error
      ? JSON.stringify(error)
      : 'An error occurred'
  );

  return (
    <div>
      <h2>Oops! Something went wrong.</h2>
    </div>
  );
}

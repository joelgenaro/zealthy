type RateLimitedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T> | null>;

export function createRateLimiter<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  windowMs: number
): RateLimitedFunction<T> {
  const rateLimit = new Map<string, number[]>();

  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = rateLimit.get(key) || [];
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);

    if (timestamps.length >= limit) {
      console.log('createRateLimiterWarning: Rate limit exceeded');
      return null;
    }

    timestamps.push(now);
    rateLimit.set(key, timestamps);

    return func(...args);
  };
}

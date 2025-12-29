/**
 * Simple Token Bucket Rate Limiter
 * Note: In a serverless environment (like Vercel), this in-memory cache 
 * will only limit requests to the same Lambda instance. 
 * For distributed rate limiting, consider using Redis (Vercel KV/Upstash).
 */

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export const rateLimit = (options?: Options) => {
  const tokenCache = new Map();
  const {
    interval = 60000, // 1 minute
    uniqueTokenPerInterval = 500, // Max users per interval
  } = options || {};

  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        
        // Reset count after interval
        if (currentUsage === 1) {
          setTimeout(() => {
            tokenCount[0] = 0;
            tokenCache.delete(token);
          }, interval);
        }

        // Add headers to response if possible (helper for API routes)
        if (res && typeof res.setHeader === 'function') {
          res.setHeader('X-RateLimit-Limit', limit);
          res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - currentUsage);
        }

        return isRateLimited ? reject() : resolve();
      }),
      
    // Middleware-friendly checking (returns boolean)
    checkMiddleware: (limit: number, token: string): boolean => {
      const now = Date.now();
      const windowStart = now - interval;
      
      const requestLog = tokenCache.get(token) || [];
      
      // Filter requests outside current window
      const requestsInWindow = requestLog.filter((timestamp: number) => timestamp > windowStart);
      
      if (requestsInWindow.length >= limit) {
        return false; // Rate limited
      }
      
      requestsInWindow.push(now);
      tokenCache.set(token, requestsInWindow);
      
      // Cleanup old entries periodically if map gets too big
      if (tokenCache.size > uniqueTokenPerInterval) {
        const firstKey = tokenCache.keys().next().value;
        tokenCache.delete(firstKey);
      }
      
      return true; // Use permitted
    }
  };
};

export default rateLimit;

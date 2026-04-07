/**
 * Retry utility for handling API requests with retries and delays
 * Particularly useful for services with cold start issues (like Render free tier)
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
  onWakingUp?: (isWakingUp: boolean) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 1.5,
};

/**
 * Determines if an error is likely due to cold start / backend not responding
 */
export const isColdStartError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code?.toUpperCase() || '';

  // Network-related errors that suggest cold start
  return (
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('timeout') ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ENOTFOUND' ||
    error?.isNetworkError === true ||
    error?.isConnectionRefused === true ||
    // Render cold start often results in 502/503
    error?.response?.status === 502 ||
    error?.response?.status === 503 ||
    error?.response?.status === 504
  );
};

/**
 * Calculates delay with exponential backoff
 */
const calculateDelay = (
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffMultiplier: number
): number => {
  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(exponentialDelay, maxDelayMs);
};

/**
 * Retry wrapper for async functions (useful for API calls)
 * @param asyncFn - The async function to retry
 * @param options - Retry options
 * @returns Promise with retry logic applied
 */
export const retryAsyncFn = async <T>(
  asyncFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: any = null;
  let isFirstAttempt = true;

  for (let attempt = 1; attempt <= (opts.maxRetries || 3) + 1; attempt++) {
    try {
      // Notify that we're waking up the server (except on first attempt)
      if (!isFirstAttempt && opts.onWakingUp) {
        opts.onWakingUp(true);
      }

      const result = await asyncFn();

      // Success - reset waking up state
      if (opts.onWakingUp) {
        opts.onWakingUp(false);
      }

      if (!isFirstAttempt) {
        console.log(`✅ [Retry Success] Succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      lastError = error;
      isFirstAttempt = false;

      // Check if error is retryable
      const isRetryable = isColdStartError(error);
      const hasMoreRetries = attempt <= (opts.maxRetries || 3);

      if (isRetryable && hasMoreRetries) {
        const delay = calculateDelay(
          attempt,
          opts.initialDelayMs || 1000,
          opts.maxDelayMs || 5000,
          opts.backoffMultiplier || 1.5
        );

        console.warn(
          `⏳ [Retry Attempt ${attempt}/${(opts.maxRetries || 3) + 1}] ` +
          `Cold start detected. Retrying in ${delay}ms...`,
          error?.message
        );

        if (opts.onRetry) {
          opts.onRetry(attempt, error);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // No more retries or error is not retryable
        if (!isRetryable) {
          console.error(`❌ [Non-Retryable Error] Attempt ${attempt}:`, error?.message);
        } else {
          console.error(
            `❌ [Max Retries Exceeded] Failed after ${attempt} attempts:`,
            error?.message
          );
        }

        if (opts.onWakingUp) {
          opts.onWakingUp(false);
        }

        // Re-throw the error
        throw error;
      }
    }
  }

  // Should not reach here, but just in case
  if (opts.onWakingUp) {
    opts.onWakingUp(false);
  }
  throw lastError;
};

/**
 * Axios interceptor factory for adding retry logic to axios instances
 * Returns a response interceptor that adds retry logic
 */
export const createRetryInterceptor = (
  axiosInstance: any,
  options: RetryOptions = {}
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return (_error: any) => {
    // Access the original config from the error
    const config = _error.config;

    // Initialize retry count on config
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    const isRetryable = isColdStartError(_error);
    const hasMoreRetries = config.__retryCount < (opts.maxRetries || 3);

    if (isRetryable && hasMoreRetries) {
      config.__retryCount++;

      const delay = calculateDelay(
        config.__retryCount,
        opts.initialDelayMs || 1000,
        opts.maxDelayMs || 5000,
        opts.backoffMultiplier || 1.5
      );

      console.warn(
        `⏳ [Retry ${config.__retryCount}/${opts.maxRetries}] ` +
        `Cold start detected. Retrying in ${delay}ms...`,
        _error?.message
      );

      if (opts.onRetry) {
        opts.onRetry(config.__retryCount, _error);
      }

      if (opts.onWakingUp) {
        opts.onWakingUp(true);
      }

      // Return a promise that resolves after delay and retries
      return new Promise(resolve => {
        setTimeout(() => {
          opts.onWakingUp?.(false);
          resolve(axiosInstance(config));
        }, delay);
      });
    }

    if (opts.onWakingUp) {
      opts.onWakingUp(false);
    }

    return Promise.reject(_error);
  };
};

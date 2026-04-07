import { useEffect } from 'react';
import { useServerWaking } from '../context/ServerWakingContext';
import { api } from '../services/api';
import { createRetryInterceptor } from '../utils/retryUtils';

/**
 * Hook to initialize API retry interceptor with server waking context
 * Should be called once in a top-level component (e.g., inside App or a layout component)
 */
export const useInitializeApiRetry = () => {
  const { setIsWakingUp } = useServerWaking();

  useEffect(() => {
    // Add retry interceptor with context callback
    api.interceptors.response.use(
      undefined, // Success handler - we only care about errors
      createRetryInterceptor(api, {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 1.5,
        onRetry: (attempt, error) => {
          console.log(`Retrying request (attempt ${attempt})...`);
        },
        onWakingUp: setIsWakingUp,
      })
    );

    return () => {
      // Cleanup if needed
    };
  }, [setIsWakingUp]);
};

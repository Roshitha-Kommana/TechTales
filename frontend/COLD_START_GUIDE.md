# Backend Cold Start Resilience Guide

This guide explains the retry mechanism implemented to handle Render free tier cold starts in your TeachTales application.

## Problem

Render's free tier puts services to sleep after 15 minutes of inactivity. When a request comes in, the service needs time to wake up (cold start), which can take 30-60 seconds. During this time:

- First request fails or times out
- Frontend shows "Backend server is not running" error
- User experience is poor

## Solution

We've implemented a **3-tier retry mechanism** with:

1. **Automatic retries** - Failed requests retry up to 3 times
2. **Exponential backoff** - Delays between retries increase (1s → 1.5s → 2.25s)
3. **User-friendly UI** - Shows "Waking up server..." message while retrying
4. **Smart detection** - Only retries cold-start errors, not other errors

## Architecture

### Components

```
┌─────────────────────────────────────┐
│           App.tsx                   │ Root component
│  - ServerWakingProvider             │ Provides context
│  - AppContent (with hook)           │ Uses hook to init interceptor
└─────────────────────────────────────┘
           │
           ├─ useInitializeApiRetry()
           │  - Adds retry interceptor with context callback
           │  - Updates ServerWakingContext on retry
           │
           ├─ ServerWakingIndicator
           │  - Shows banner when server is waking up
           │
           └─ api.ts
              - axios instance with basic interceptors
              - No retry logic at module level
              - Retry added dynamically via hook
```

### Files

1. **`utils/retryUtils.ts`** - Core retry logic
   - `retryAsyncFn()` - Wrapper for async functions
   - `isColdStartError()` - Detects cold start errors
   - `createRetryInterceptor()` - Creates axios interceptor with retry
   - Exponential backoff calculation

2. **`context/ServerWakingContext.tsx`** - Global state
   - `ServerWakingProvider` - Context provider
   - `useServerWaking()` - Hook to access state

3. **`components/ServerWakingIndicator.tsx`** - UI component
   - Shows loading banner when `isWakingUp` is true
   - Animated spinner and friendly message

4. **`hooks/useInitializeApiRetry.ts`** - Integration hook
   - Initializes retry interceptor in component lifecycle
   - Connects retry logic to context

5. **`services/api.ts`** - Updated to export api instance
   - Named export: `export { api }`
   - Retry interceptor added dynamically (not at module load)

6. **`App.tsx`** - Updated app component
   - Wrapped with `ServerWakingProvider`
   - Contains `AppContent` that uses `useInitializeApiRetry()`

## How It Works

### Retry Flow

```
User makes request
    │
    ↓
Request fails
    │
    ├─ Is it a cold-start error? (network error, 502, 503, 504)
    │  │
    │  ├─ YES → Retry with delay
    │  │  │  1. Set isWakingUp = true (show banner)
    │  │  │  2. Wait 1s (or 1.5s, 2.25s on subsequent retries)
    │  │  │  3. Retry request
    │  │  │
    │  │  ├─ Success? → Return data, set isWakingUp = false
    │  │  │
    │  │  └─ Fail? → Check remaining retries
    │  │     ├─ If max retries reached → Set isWakingUp = false, throw error
    │  │     └─ Else → Retry again
    │  │
    │  └─ NO (e.g., 404, 401, validation error) → Reject immediately
    │
    ↓
Component receives data or error
```

### Retry Configuration

Default settings in `useInitializeApiRetry()`:

```typescript
{
  maxRetries: 3,           // Total attempts: 1 + 3 = 4
  initialDelayMs: 1000,    // First retry: 1 second
  maxDelayMs: 5000,        // Cap delay at 5 seconds
  backoffMultiplier: 1.5,  // Each retry: previous * 1.5
}
```

**Actual delays:**
- Attempt 1: Fails immediately
- Attempt 2: After 1s
- Attempt 3: After 1.5s
- Attempt 4: After 2.25s

**Total max wait time:** ~4.75 seconds (usually server wakes within 1-2s)

## Errors Detected as Cold Start

- `ECONNREFUSED` - Connection refused
- `ENOTFOUND` - Domain not found
- Network Error (general network issues)
- Timeout
- HTTP 502 (Bad Gateway)
- HTTP 503 (Service Unavailable)
- HTTP 504 (Gateway Timeout)

## Errors NOT Retried

- 401 (Unauthorized) - Invalid credentials
- 403 (Forbidden) - Permission denied
- 404 (Not Found) - Resource doesn't exist
- 400 (Bad Request) - Invalid request data
- 5xx (other server errors like 500, 501)

This is intentional - these errors usually indicate real problems, not cold starts.

## Usage Examples

### Basic Usage (Automatic)

Once App.tsx is set up, all API calls automatically get retry logic:

```typescript
import { storiesApi } from '../services/api';

// This automatically retries on cold start
const response = await storiesApi.generate({
  concept: 'The Lost City',
  characterName: 'Alex',
});
```

### Manual Retry (Advanced)

For custom functions, use `retryAsyncFn`:

```typescript
import { retryAsyncFn } from '../utils/retryUtils';

const fetchData = async () => {
  return retryAsyncFn(
    async () => {
      // Your custom logic
      const response = await fetch('/api/custom');
      return response.json();
    },
    {
      maxRetries: 3,
      initialDelayMs: 1000,
      onRetry: (attempt) => {
        console.log(`Retry attempt ${attempt}`);
      },
      onWakingUp: (isWaking) => {
        console.log(`Server waking up: ${isWaking}`);
      },
    }
  );
};
```

## Testing Cold Start Locally

To test the retry mechanism:

1. **Stop your backend** (simulate cold start)
2. **Make a request** from frontend
3. **Observe behavior:**
   - First request fails
   - Retry banner shows "Waking up server..."
   - Automatic retries happen
   - Console shows retry log messages

4. **Start your backend** during retries
   - Request succeeds on next retry
   - Banner disappears
   - Data loads normally

## Console Logs for Debugging

When retries happen, check browser console:

```
⏳ [Retry 1/3] Cold start detected. Retrying in 1000ms...
⏳ [Retry 2/3] Cold start detected. Retrying in 1500ms...
✅ [Retry Success] Succeeded on attempt 3

// OR

❌ [Max Retries Exceeded] Failed after 4 attempts: ECONNREFUSED
```

Backend logs:

```
[API Config] Final processed URL (with /api): https://techtales-backend-43df.onrender.com/api
[API Request] POST https://techtales-backend-43df.onrender.com/api/auth/login
⏳ [Retry 1/3] Cold start detected. Retrying in 1000ms...
```

## Customization

### Change Retry Settings

Edit `useInitializeApiRetry()` in `src/hooks/useInitializeApiRetry.ts`:

```typescript
api.interceptors.response.use(
  undefined,
  createRetryInterceptor(api, {
    maxRetries: 5,           // More retries
    initialDelayMs: 2000,    // Longer initial delay
    maxDelayMs: 10000,       // Higher max delay
    backoffMultiplier: 2,    // Faster exponential growth
  })
);
```

### Change UI Message

Edit `src/components/ServerWakingIndicator.tsx`:

```jsx
<p className="font-semibold text-sm">
  ☁️ Connecting to server...  {/* Change message */}
</p>
```

### Disable Retry for Specific Endpoints

If an endpoint should NEVER retry:

```typescript
// In api.ts, use axios config
const response = await api.post('/critical-endpoint', data, {
  'X-No-Retry': true,  // Custom header to detect
});
```

Then in `retryUtils.ts`:

```typescript
export const isColdStartError = (error: any, config?: any): boolean => {
  if (config?.['X-No-Retry']) return false;  // Skip retry
  // ... rest of logic
};
```

## Monitoring & Logging

### Add More Logging

In `useInitializeApiRetry()`:

```typescript
onRetry: (attempt, error) => {
  console.log(`Retry attempt ${attempt}`, {
    time: new Date().toISOString(),
    error: error.message,
    endpoint: error.config?.url,
  });
  
  // Track in analytics
  analytics.track('api_retry', {
    attempt,
    endpoint: error.config?.url,
  });
},
```

### Monitor Cold Start Frequency

Track how often cold starts occur:

```typescript
let coldStartCount = 0;

onRetry: (attempt) => {
  if (attempt === 1) {
    coldStartCount++;
    console.log(`Cold starts this session: ${coldStartCount}`);
  }
}
```

## Troubleshooting

### Retries not working

1. Check that `ServerWakingProvider` wraps your app
2. Check that `useInitializeApiRetry()` is called in `AppContent`
3. Check browser console for errors
4. Verify `ServerWakingIndicator` component renders

### Banner not showing

1. Ensure `ServerWakingProvider` is in App.tsx
2. Check that `useServerWaking()` hook gets context
3. Verify context value changes in Redux DevTools

### Too many retries

1. The backend might have a real error (not cold start)
2. Check Render logs: https://dashboard.render.com
3. Look for 5xx errors in backend logs
4. Consider reducing `maxRetries` to fail faster

### Still getting "Backend not running" error

1. **Check backend URL** in `src/config/api.ts`
   ```typescript
   export const BASE_URL = 'https://techtales-backend-43df.onrender.com';
   ```

2. **Test backend health endpoint:**
   ```bash
   curl https://techtales-backend-43df.onrender.com/health
   ```

3. **Check Render logs:**
   - Go to Render Dashboard
   - Select your backend service
   - Check Logs tab for errors

4. **Verify network connectivity:**
   - Browser DevTools → Network tab
   - Look at request/response headers
   - Check for CORS errors

## Best Practices

✅ **DO:**
- Keep `maxRetries` between 2-5
- Use appropriate delays (1-2s for Render)
- Log retry attempts for debugging
- Show user-friendly messages
- Test with backend actually stopped

❌ **DON'T:**
- Set `maxRetries` too high (user waits too long)
- Retry non-idempotent operations (POST, PUT, DELETE) blindly
- Hide retry errors completely (still show after all retries fail)
- Change delays randomly (test different values first)
- Retry 5xx errors that aren't cold starts

## Production Deployment

When deploying to Vercel:

1. **Ensure api.ts changes are committed**
2. **Check that ServerWakingProvider is in App.tsx**
3. **Verify hooks are properly imported**
4. **Test in Vercel preview deployment**
5. **Monitor error rates after deploy**

## Performance Impact

- **No impact when backend is running** - Retry logic doesn't activate
- **Initial delay on cold start** - 1-4 extra seconds to wake backend
- **No additional requests** - Only retries failed requests
- **Minimal memory usage** - Simple interceptor and context

## Future Improvements

Possible enhancements:

1. **Preemptive wake-up** - Send health check on page load
2. **Adaptive retry timing** - Learn from previous cold starts
3. **User notification** - Tell user about cold start explicitly
4. **Analytics** - Track cold start frequency and impact
5. **Fallback UI** - Show cached data while retrying
6. **Queue management** - Batch requests during cold start

---

**Questions?** Check the code comments in:
- `utils/retryUtils.ts` - Retry logic
- `hooks/useInitializeApiRetry.ts` - Integration
- `context/ServerWakingContext.tsx` - State management

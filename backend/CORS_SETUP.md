# CORS Configuration Guide

## Problem

Your frontend on Vercel is blocked by CORS policy:
```
Access to XMLHttpRequest has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

**Root Cause:** The `FRONTEND_URL` environment variable on Render is not set to your Vercel URL.

## Solution: Environment Variables on Render

### Step 1: Configure Render Environment Variables

Go to your Render backend dashboard:

1. Click on your service (techtales-backend-43df)
2. Go to **Settings** → **Environment** → **Environment Variables**
3. Add these variables:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://tech-tales-orpin.vercel.app` |
| `NODE_ENV` | `production` |

**Why both variables?**
- `FRONTEND_URL` - Specifies your production frontend
- `NODE_ENV` - Tells Express you're in production mode

4. **Important:** After adding variables, your service will redeploy automatically
5. Wait for deployment to complete (check the "Deploys" tab)

### Step 2: Verify Local Development Setup

Create/update `.env` file in your backend directory:

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/storyWizard
# or for production:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/storyWizard

# Frontend URLs (for CORS)
# Leave empty or use localhost for development
# On Render, set FRONTEND_URL to https://tech-tales-orpin.vercel.app

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

For development, you don't need to set `FRONTEND_URL` - it defaults to allowing localhost.

### Step 3: Understanding the CORS Configuration

The updated `server.ts` now has:

```typescript
const getAllowedOrigins = (): string[] => {
  const producationOrigins: string[] = [];
  
  // Production frontend URLs
  if (process.env.FRONTEND_URL) {
    producationOrigins.push(process.env.FRONTEND_URL);
  }
  if (process.env.VERCEL_URL) {
    producationOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  
  // Development origins (always allowed locally)
  const developmentOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Use appropriate origin list based on environment
  if (NODE_ENV === 'production') {
    return producationOrigins.length > 0 ? producationOrigins : developmentOrigins;
  }
  return [...developmentOrigins, ...producationOrigins];
};

// CORS middleware with production-ready settings
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow requests with no origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    console.warn(`❌ CORS rejected: ${origin}`);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,      // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,         // Cache preflight for 24 hours
}));
```

**Key Features:**
✅ No `'*'` in production (security best practice)
✅ Explicit allowlist for frontend URLs
✅ Separate handling for dev vs production
✅ Credentials/auth headers enabled
✅ Preflight caching for performance
✅ Proper error logging for debugging

## Testing

### Test 1: Check Backend CORS Headers

```bash
# From your terminal
curl -H "Origin: https://tech-tales-orpin.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://techtales-backend-43df.onrender.com/api/stories

# Expected response headers:
# access-control-allow-origin: https://tech-tales-orpin.vercel.app
# access-control-allow-credentials: true
# access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Test 2: Test from Frontend (Browser Console)

```javascript
// Open DevTools on https://tech-tales-orpin.vercel.app
// Go to Console tab and run:

fetch('https://techtales-backend-43df.onrender.com/api/health', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(res => res.json())
.then(data => console.log('✅ CORS works!', data))
.catch(err => console.error('❌ CORS error:', err));

// Expected: Should log: ✅ CORS works! { status: 'ok', ... }
```

### Test 3: Check Backend Logs

After setting environment variables on Render:

1. Go to **Logs** tab in Render dashboard
2. You should see:
   ```
   🔒 CORS Configuration (production): https://tech-tales-orpin.vercel.app
   ```

If you see something different, environment variables haven't been applied yet.

## Troubleshooting

### Issue: Still Getting CORS Error After Changes

**Solution:**
1. ✅ Verify `FRONTEND_URL` is set in Render > Settings > Environment
2. ✅ Wait 2-3 minutes for Render to redeploy with new env variables
3. ✅ Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
4. ✅ Check browser DevTools Network tab - look for response headers

### Issue: Preflight Request Failing (OPTIONS 405)

**Solution:**
- Ensure `app.use(cors())` is placed BEFORE all route definitions in `server.ts`
- Verify `methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']` includes OPTIONS

### Issue: Credentials Not Working

**Solution:**
- Backend must have: `credentials: true` ✅ (already set)
- Frontend fetch must have: `credentials: 'include'` or `credentials: 'same-origin'`
- Example:
  ```javascript
  fetch(url, {
    credentials: 'include',  // Important!
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  ```

### Issue: Origin `https://tech-tales-orpin.vercel.app` Not Recognized

**Solution:**
- Check spelling of Vercel URL exactly
- Ensure no trailing slash: ✅ `https://tech-tales-orpin.vercel.app`
- Not `https://tech-tales-orpin.vercel.app/`
- Check Render logs for `🔒 CORS Configuration` to verify the URL is loaded

## Reference: CORS Headers Explained

When your backend responds to a preflight request, it sends these headers:

| Header | Meaning | Your Setting |
|--------|---------|---------|
| `Access-Control-Allow-Origin` | Which origins can access | https://tech-tales-orpin.vercel.app |
| `Access-Control-Allow-Credentials` | Allow cookies/auth | true |
| `Access-Control-Allow-Methods` | Allowed HTTP methods | GET, POST, PUT, DELETE, PATCH, OPTIONS |
| `Access-Control-Allow-Headers` | Allowed request headers | Content-Type, Authorization |
| `Access-Control-Max-Age` | Cache preflight for (seconds) | 86400 (24 hours) |

## Production Security Best Practices

✅ **What we're doing right:**
1. No `'*'` wildcard (explicit allowlist only)
2. Specific frontend URL only
3. Credentials enabled for auth
4. Environment-based configuration
5. Preflight caching for performance
6. Error logging for monitoring

❌ **What we're NOT doing (incorrect for production):**
- ~~`origin: '*'`~~ - Too permissive
- ~~`origin: true`~~ - Allows any origin
- ~~No credentials~~ - Can't use tokens properly

## Complete Server Setup

Your `src/server.ts` now has:

```typescript
// 1. Import CORS
import cors from 'cors';

// 2. Configure origins based on environment
const getAllowedOrigins = (): string[] => { ... };
const allowedOrigins = getAllowedOrigins();
console.log(`🔒 CORS Configuration (${NODE_ENV}):`, allowedOrigins);

// 3. Add CORS middleware BEFORE routes
app.use(cors({ ... }));

// 4. THEN add routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
// ... etc
```

**Order matters!** CORS middleware must come before routes.

## Summary: What to Do Now

1. **Immediate Action:**
   - Go to Render dashboard
   - Settings → Environment → Add `FRONTEND_URL=https://tech-tales-orpin.vercel.app`
   - Wait for redeploy

2. **Test:**
   - Run the curl command (Test 1) above
   - Refresh Vercel frontend
   - Check if CORS errors are gone

3. **If Still Not Working:**
   - Check Render logs for the CORS configuration line
   - Verify exact URL spelling (no trailing slash)
   - Hard refresh browser cache

## Additional Resources

- [MDN: CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [Render: Environment Variables](https://render.com/docs/environment-variables)
- [Vercel: Environment Variables](https://vercel.com/docs/production-environment-variables)

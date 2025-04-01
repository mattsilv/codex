# Cloudflare Deployment Troubleshooting Guide

This document provides solutions for common issues encountered during the deployment of a Cloudflare Pages and Workers application.

## CNAME Cross-User Banned Error (Error 1014)

### Symptoms

- Error message: "Error 1014 CNAME Cross-User Banned" when accessing your custom domain
- Browser shows Cloudflare error page instead of your application

### Causes

1. The CNAME record points to a Cloudflare domain owned by a different Cloudflare account
2. DNS configuration in Cloudflare doesn't match the account used for Pages/Workers deployment
3. Pages project hasn't been created before attempting to access the custom domain

### Solutions

1. **Verify account consistency**:

   - Ensure the Cloudflare account managing your domain is the same account used for Pages/Workers deployment
   - If using multiple accounts, transfer the domain or application to the same account

2. **Check DNS configuration**:

   - In Cloudflare dashboard → DNS → Records:
     - Verify CNAME record for `codex` points to your actual Pages URL (e.g., `codex-abq.pages.dev`)
     - Verify CNAME record for `api.codex` points to your actual Worker URL (e.g., `codex-api.silv.workers.dev`)

3. **Create Pages project properly**:

   ```bash
   # Create the project first
   npx wrangler pages project create codex --production-branch=main

   # Then deploy your built frontend
   npx wrangler pages deploy dist --project-name=codex
   ```

4. **Configure custom domain in Pages project**:
   - Go to Cloudflare dashboard → Pages → codex project → Custom domains
   - Add your custom domain (e.g., `codex.silv.app`)
   - Follow the verification process

## Pages Project Not Found Error

### Symptoms

- Error message: "Project not found" when trying to deploy to Pages
- Deployment fails with: "The specified project name does not match any of your existing projects"

### Solutions

1. **Create the project before deployment**:

   ```bash
   npx wrangler pages project create codex --production-branch=main
   ```

2. **Check project name spelling**:

   - Ensure the project name in your deployment command matches exactly
   - Project names are case-sensitive

3. **Verify Cloudflare account access**:
   - Make sure you're logged into the correct Cloudflare account with `wrangler login`
   - Check if you have the necessary permissions to create and deploy Pages projects

## API Connection Issues

### Symptoms

- Frontend deploys successfully but can't connect to backend API
- Browser console shows CORS errors or network request failures
- Authentication fails even with correct credentials

### Solutions

1. **Check CORS configuration**:

   - Verify `src/backend/middleware/cors.js` includes your production domains:
     ```javascript
     const productionOrigin = 'https://codex.silv.app';
     const apiProductionOrigin = 'https://api.codex.silv.app';
     const allowedProductionOrigins = [productionOrigin, apiProductionOrigin];
     ```

2. **Verify API URL constants**:

   - Check `src/shared/constants.js` is pointing to the correct API URL:
     ```javascript
     export const API_URL =
       process.env.NODE_ENV === 'production'
         ? 'https://api.codex.silv.app'
         : 'http://localhost:8787/api';
     ```

3. **Test API endpoints**:

   - Use the test script to verify API functionality:
     ```bash
     node scripts/test-api.js
     ```
   - Check network tab in browser dev tools to see actual requests/responses

4. **Add CORS headers in Cloudflare dashboard**:
   - Go to Workers & Pages → codex-api worker → Settings → Headers
   - Add CORS headers if needed:
     ```
     Access-Control-Allow-Origin: https://codex.silv.app
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
     Access-Control-Allow-Headers: Content-Type, Authorization
     ```

## R2 Storage Configuration Issues

### Symptoms

- File uploads fail in production
- Error messages about missing R2 bucket or permissions

### Solutions

1. **Enable R2 in your Cloudflare account**:

   - Go to Cloudflare dashboard → R2
   - Subscribe to R2 if not already enabled

2. **Create the R2 bucket**:

   ```bash
   npx wrangler r2 bucket create codex-content-prod
   ```

3. **Update wrangler.toml configuration**:

   ```toml
   [[env.production.r2_buckets]]
   binding = "CONTENT_STORE"
   bucket_name = "codex-content-prod"
   ```

4. **Redeploy backend with R2 configuration**:

   ```bash
   npx wrangler deploy --env production
   ```

5. **Check worker logs for R2-related errors**:
   - Go to Cloudflare dashboard → Workers & Pages → codex-api → Logs

## DNS Propagation Issues

### Symptoms

- Custom domain setup complete but site not accessible
- Intermittent access to the application

### Solutions

1. **Check DNS propagation**:

   ```bash
   ./scripts/check-dns.sh
   ```

2. **Verify DNS records**:

   - Go to Cloudflare dashboard → DNS → Records
   - Ensure CNAME records are properly configured for both domains
   - Make sure DNS proxying is enabled (orange cloud icon)

3. **Wait for propagation**:
   - DNS changes can take up to 24 hours to propagate globally
   - Cloudflare typically processes changes within minutes, but some ISPs may cache DNS longer

## Browser Caching Issues

### Symptoms

- Old version of the site appears even after deployment
- Development features (test users, passwords) still visible in production
- Changes not reflected after deployment

### Solutions

1. **Update the build configuration**:

   - Use content hashing for cache busting:
     ```javascript
     // vite.config.js
     build: {
       rollupOptions: {
         output: {
           entryFileNames: 'assets/[name]-[hash].js',
           chunkFileNames: 'assets/[name]-[hash].js',
           assetFileNames: 'assets/[name]-[hash].[ext]'
         }
       }
     }
     ```

2. **Add cache control headers**:

   - In index.html add:
     ```html
     <meta
       http-equiv="Cache-Control"
       content="no-cache, no-store, must-revalidate"
     />
     <meta http-equiv="Pragma" content="no-cache" />
     <meta http-equiv="Expires" content="0" />
     ```
   - Create a `_headers` file in the dist directory:
     ```
     /*
       Cache-Control: no-cache, no-store, must-revalidate
       Pragma: no-cache
       Expires: 0
     ```
   - Or configure headers in Cloudflare:
     - Go to Cloudflare dashboard → Pages → codex project → Settings → Headers
     - Add: `Cache-Control: no-cache, no-store, must-revalidate`

3. **Fix environment detection issues**:

   - Update environment detection to explicitly check for production domains:
     ```javascript
     const isProduction =
       window.location.hostname === 'codex.silv.app' ||
       window.location.hostname.includes('codex-abq.pages.dev') ||
       (window.location.hostname !== 'localhost' &&
         !window.location.hostname.includes('127.0.0.1') &&
         !window.location.hostname.includes('.local'));
     ```
   - Make sure Auth.jsx only redirects when user is logged in:
     ```javascript
     useEffect(() => {
       if (user) {
         route('/dashboard');
       }
     }, [user]);
     ```

4. **Force-refresh for users**:

   - Instruct users to hard-refresh with Ctrl+F5
   - Or clear browser cache via browser settings
   - In Chrome: Settings → Privacy and security → Clear browsing data

5. **Use the automated build and deploy script**:
   - Our build script handles cache busting and proper headers:
     ```bash
     ./build-and-deploy.sh
     ```

## Deployment Verification

After resolving issues, run the full verification script to test all components:

```bash
./scripts/verify-deployment.sh
```

This script tests:

- DNS resolution
- Frontend availability
- API endpoint functionality
- Cross-origin communication
- Authentication flow

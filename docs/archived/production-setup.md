# Production Deployment Guide for codex.silv.app

## Domain Structure

The Codex application uses two separate domains:

- `codex.silv.app` - Frontend application (Cloudflare Pages)
- `api.codex.silv.app` - Backend API (Cloudflare Worker)

## DNS Configuration

### Frontend Domain Setup (codex.silv.app)

1. **In Cloudflare DNS Dashboard**:

   - Add a CNAME record:
     - **Name**: `codex`
     - **Target**: `pages.dev` (or as directed by Cloudflare Pages)
     - **Proxy status**: Proxied (orange cloud)
     - **TTL**: Auto

2. **Custom Domain Configuration in Cloudflare Pages**:
   - Log in to Cloudflare dashboard
   - Navigate to Pages > your project
   - Go to Custom Domains
   - Click "Set up a custom domain"
   - Enter: `codex.silv.app`
   - Complete the verification process

### Backend API Domain Setup (api.codex.silv.app)

1. **In Cloudflare DNS Dashboard**:

   - Add a CNAME record:
     - **Name**: `api.codex`
     - **Target**: `workers.dev`
     - **Proxy status**: Proxied (orange cloud)
     - **TTL**: Auto

2. **Custom Domain Configuration in Cloudflare Workers**:
   - Log in to Cloudflare dashboard
   - Navigate to Workers & Pages > codex-api worker (production)
   - Go to Triggers > Custom Domains
   - Click "Add Custom Domain"
   - Enter: `api.codex.silv.app`
   - Complete the verification process

## Production Resources Setup

Before deployment, you need to create the following resources:

1. **D1 Database**:

   ```bash
   npx wrangler d1 create codex_db_prod
   ```

   - Note the database ID returned by this command

2. **R2 Bucket**:

   ```bash
   npx wrangler r2 bucket create codex-content-prod
   ```

3. **Update Production Configuration**:
   - Edit `wrangler.toml`:
     - Replace `placeholder-production-database-id` with the actual database ID
   - Ensure CORS settings in `src/backend/middleware/cors.js` have `productionOrigin` set to `https://codex.silv.app`

## Database Migrations

Apply your database migrations to the production database:

```bash
npx wrangler d1 migrations apply codex_db_prod --env production
```

## Deployment Process

Deploy to production using the following command:

```bash
npx wrangler deploy --env production
```

## Verification Steps

After deployment, verify the following:

1. **API Access**:

   - Test the API endpoint: `https://codex.silv.app/api/health`
   - Verify authentication: `https://codex.silv.app/api/auth/login`

2. **Frontend Access**:
   - Visit `https://codex.silv.app` and ensure it loads correctly
   - Test authentication flow
   - Verify CORS is properly configured by checking network requests

## Troubleshooting

Common issues and their solutions:

1. **DNS Issues**:

   - Wait for DNS propagation (can take up to 24 hours)
   - Verify CNAME record is properly configured
   - Ensure the domain is properly activated in Cloudflare Workers

2. **CORS Problems**:

   - Check browser console for CORS errors
   - Verify the CORS configuration in `src/backend/middleware/cors.js`
   - Ensure `productionOrigin` matches exactly with `https://codex.silv.app`

3. **Database Connection Issues**:

   - Verify database ID in wrangler.toml
   - Check that migrations have been applied to production database
   - Look at Cloudflare Workers logs for database errors

4. **R2 Storage Issues**:
   - Verify bucket permissions
   - Check R2 storage configuration in wrangler.toml

## SSL/TLS Configuration

Your site will automatically use Cloudflare's SSL/TLS protection:

1. Ensure SSL/TLS encryption mode is set to "Full" or "Full (strict)" in the Cloudflare dashboard
2. No additional SSL certificate management is required as Cloudflare handles this

## Monitoring

Monitor your application's performance using Cloudflare analytics:

1. Workers analytics for backend performance
2. Check request logs and error rates
3. Set up notification alerts for errors or traffic spikes

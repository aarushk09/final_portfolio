# Filebrowser Migration Guide

This guide walks you through migrating your portfolio from Supabase to your self-hosted Filebrowser instance on TrueNAS SCALE.

## 📋 Table of Contents
1. [Setup Filebrowser](#1-setup-filebrowser)
2. [Configure Environment Variables](#2-configure-environment-variables)
3. [Choose Authentication Method](#3-choose-authentication-method)
4. [Handle CORS Issues](#4-handle-cors-issues)
5. [Test the Migration](#5-test-the-migration)
6. [Production Deployment](#6-production-deployment)

---

## 1. Setup Filebrowser

### Verify Your Filebrowser Instance
1. Ensure Filebrowser is running on your TrueNAS SCALE
2. Access it via browser: `http://your-nas-ip:8080`
3. Verify the `/my_data/portfolio_pics` directory exists and contains your images

### Upload Your Images
```bash
# Option 1: Use Filebrowser UI to upload images
# Option 2: Copy images directly to TrueNAS
# Option 3: Use rsync/scp to transfer from Supabase
```

---

## 2. Configure Environment Variables

### Create `.env.local` file
Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### Minimum Required Configuration
```env
FILEBROWSER_URL=http://192.168.1.100:8080
FILEBROWSER_PHOTOS_PATH=/my_data/portfolio_pics
```

---

## 3. Choose Authentication Method

You have **three options** for authentication:

### ✅ Option 1: Public Share (RECOMMENDED for Production)

**Best for**: Public portfolios where visitors don't need authentication

**Pros**:
- No authentication overhead for each request
- Better performance
- Simpler for visitors
- More secure (no credentials in requests)

**Setup**:
1. Generate a share hash by calling your API:
   ```bash
   curl -X POST http://localhost:3000/api/photos \
     -H "Content-Type: application/json" \
     -d '{"createShare": true}'
   ```

2. OR manually create a share in Filebrowser UI:
   - Navigate to `/my_data/portfolio_pics`
   - Click "Share" button
   - Copy the hash from the generated URL (e.g., `http://nas/share/ABC123` → hash is `ABC123`)

3. Add to `.env.local`:
   ```env
   FILEBROWSER_PUBLIC_SHARE_ENABLED=true
   FILEBROWSER_SHARE_HASH=ABC123
   ```

**Note**: Public shares can have optional expiration dates. For portfolios, use no expiration.

---

### Option 2: API Token

**Best for**: Authenticated access with better security than username/password

**Setup**:
1. Login to Filebrowser
2. Go to Settings → User Management
3. Create a new API token
4. Add to `.env.local`:
   ```env
   FILEBROWSER_TOKEN=your-generated-token-here
   ```

---

### Option 3: Username/Password

**Best for**: Development/testing only (not recommended for production)

**Setup**:
```env
FILEBROWSER_USERNAME=admin
FILEBROWSER_PASSWORD=your-password
```

⚠️ **Warning**: Tokens are cached for 23 hours, but credentials are less secure than tokens or public shares.

---

## 4. Handle CORS Issues

Since your portfolio domain and NAS domain are different, you'll encounter CORS issues. Here are solutions:

### Solution 1: Configure Filebrowser CORS (Recommended)

Edit your Filebrowser configuration (usually in a config file or via reverse proxy):

**Example nginx reverse proxy config**:
```nginx
location /api/ {
    proxy_pass http://localhost:8080;
    
    # CORS Headers
    add_header 'Access-Control-Allow-Origin' 'https://yourportfolio.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'X-Auth, Content-Type' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

**Example Traefik labels** (if using Traefik):
```yaml
labels:
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolallowmethods=GET,POST,OPTIONS"
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolalloworiginlist=https://yourportfolio.com"
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolallowheaders=X-Auth,Content-Type"
```

### Solution 2: Use Next.js API Route as Proxy (Current Setup)

The API route we created (`/app/api/photos/route.ts`) acts as a server-side proxy, avoiding CORS entirely. This is already configured for you! 🎉

**How it works**:
- Frontend calls: `yourportfolio.com/api/photos` (same domain, no CORS)
- Next.js server calls: `nas-ip:8080/api/...` (server-to-server, no CORS)
- Response is proxied back to frontend

### Solution 3: Public Share with Direct URLs

If using public shares, you can serve images directly without API authentication:

```env
FILEBROWSER_PUBLIC_SHARE_ENABLED=true
```

This reduces CORS issues since public share endpoints are simpler.

---

## 5. Test the Migration

### Start Development Server
```bash
npm run dev
# or
pnpm dev
```

### Test API Endpoint
```bash
# Should return your photos
curl http://localhost:3000/api/photos
```

### Check Frontend
Navigate to your photos page (e.g., `http://localhost:3000/photos`) and verify images load.

### Test Fallback Logic
1. Stop your Filebrowser instance temporarily
2. Refresh your portfolio
3. Should see fallback placeholder images
4. Restart Filebrowser and refresh again

---

## 6. Production Deployment

### Pre-Deployment Checklist
- [ ] Filebrowser is accessible from your production server
- [ ] Environment variables are configured in your hosting platform (Vercel/Netlify/etc.)
- [ ] Public share is created (if using that method)
- [ ] CORS is properly configured
- [ ] Fallback images are in your `/public` folder
- [ ] Test on production domain

### Environment Variables on Hosting Platform

**Vercel**:
```bash
vercel env add FILEBROWSER_URL
vercel env add FILEBROWSER_SHARE_HASH
vercel env add FILEBROWSER_PUBLIC_SHARE_ENABLED
```

**Netlify**:
Add in Site Settings → Environment Variables

### Network Considerations

#### If Filebrowser is on Local Network:
1. **Option A**: Set up a VPN or Tailscale for your deployment server to access NAS
2. **Option B**: Expose Filebrowser via reverse proxy with HTTPS
3. **Option C**: Use Cloudflare Tunnel

#### If Filebrowser is Publicly Accessible:
1. Ensure HTTPS is configured (use Caddy/Nginx with Let's Encrypt)
2. Use strong authentication
3. Consider rate limiting

---

## 🔒 Security Best Practices

1. **Use Public Shares for public portfolios** - Most secure and performant
2. **Use HTTPS** - Always use SSL/TLS in production
3. **Restrict Access** - If using tokens/credentials, limit IP access or use VPN
4. **Rotate Tokens** - Regenerate API tokens periodically
5. **Monitor Access** - Check Filebrowser logs for suspicious activity
6. **Firewall Rules** - Only expose necessary ports

---

## 🐛 Troubleshooting

### Images Not Loading

**Check 1**: Verify Filebrowser is accessible
```bash
curl http://your-nas-ip:8080/health
```

**Check 2**: Check API route
```bash
curl http://localhost:3000/api/photos
```

**Check 3**: Check browser console for CORS errors

### Authentication Failing

**Check 1**: Verify credentials in `.env.local`

**Check 2**: Test authentication directly:
```bash
curl -X POST http://your-nas-ip:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpass","recaptcha":""}'
```

### CORS Errors

**Solution**: Use the Next.js API proxy (already configured) or configure CORS on Filebrowser

### Fallback Images Showing

**Reason**: Filebrowser is unreachable or health check failed

**Fix**: Check network connectivity and Filebrowser logs

---

## 📊 Performance Optimization

### 1. Image Optimization
Consider processing images before uploading:
```bash
# Resize and optimize
mogrify -resize 1920x1920\> -quality 85 *.jpg
```

### 2. Caching
Add caching headers in your Next.js API route:
```typescript
return NextResponse.json(
  { photos },
  {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
    }
  }
)
```

### 3. CDN
Use Cloudflare or similar CDN in front of your Filebrowser for better global performance.

---

## 🚀 Next Steps

1. **Implement Upload Endpoint**: Update `/app/api/upload-photo/route.ts` to use Filebrowser API
2. **Implement Delete Endpoint**: Update `/app/api/delete-photo/route.ts` to use Filebrowser API
3. **Add Image Metadata**: Store descriptions, tags in a database (Filebrowser is just storage)
4. **Implement Thumbnail Generation**: Use Sharp or similar to generate thumbnails
5. **Add Admin Dashboard**: Create protected routes for managing photos

---

## 📚 Additional Resources

- [Filebrowser Documentation](https://filebrowser.org/)
- [Filebrowser API Reference](https://filebrowser.org/api/)
- [TrueNAS SCALE Apps Guide](https://www.truenas.com/docs/scale/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

## ✅ Migration Complete!

Once everything is working:
1. Remove Supabase environment variables
2. Delete old Supabase utility files (`lib/supabase.ts`, `lib/supabase-admin.ts`)
3. Update any remaining Supabase references
4. Celebrate! 🎉

Need help? Check the troubleshooting section or open an issue.


# CORS Configuration for Filebrowser

## Problem
When your portfolio (e.g., `https://yourportfolio.com`) tries to fetch images from your NAS (e.g., `http://192.168.1.100:8080`), browsers block the request due to CORS (Cross-Origin Resource Sharing) policy.

## Solutions

### ✅ Solution 1: Next.js API Proxy (Already Configured!)

The API route at `/app/api/photos/route.ts` acts as a server-side proxy. This is the **easiest and recommended** solution.

**How it works:**
```
Browser → yourportfolio.com/api/photos (same origin ✅)
Next.js Server → nas-ip:8080/api/... (server-to-server, no CORS ✅)
Next.js Server → Browser (response)
```

**No additional configuration needed!** This is already working in your setup.

---

### Solution 2: Configure CORS on Filebrowser

If you want to make direct requests from the browser to Filebrowser (not recommended for security), you need to configure CORS.

#### Option A: Using Nginx Reverse Proxy

Create an nginx config file for Filebrowser:

```nginx
server {
    listen 443 ssl http2;
    server_name nas.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS Headers
        add_header 'Access-Control-Allow-Origin' 'https://yourportfolio.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'X-Auth, Authorization, Content-Type, Accept' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Max-Age' '1728000' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://yourportfolio.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'X-Auth, Authorization, Content-Type, Accept' always;
            add_header 'Access-Control-Max-Age' '1728000' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8' always;
            add_header 'Content-Length' '0' always;
            return 204;
        }
    }
}
```

#### Option B: Using Traefik

If you're using Traefik on TrueNAS SCALE, add these labels to your Filebrowser deployment:

```yaml
labels:
  # Basic routing
  - "traefik.enable=true"
  - "traefik.http.routers.filebrowser.rule=Host(`nas.yourdomain.com`)"
  - "traefik.http.routers.filebrowser.entrypoints=websecure"
  - "traefik.http.routers.filebrowser.tls=true"
  
  # CORS middleware
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolallowmethods=GET,POST,PUT,DELETE,OPTIONS"
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolalloworiginlist=https://yourportfolio.com"
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolallowheaders=X-Auth,Authorization,Content-Type,Accept"
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolallowcredentials=true"
  - "traefik.http.middlewares.filebrowser-cors.headers.accesscontrolmaxage=1728000"
  
  # Apply middleware
  - "traefik.http.routers.filebrowser.middlewares=filebrowser-cors@docker"
```

#### Option C: Using Caddy (Easiest)

Caddy automatically handles HTTPS with Let's Encrypt:

```caddy
nas.yourdomain.com {
    reverse_proxy localhost:8080
    
    @cors_preflight {
        method OPTIONS
    }
    
    handle @cors_preflight {
        header Access-Control-Allow-Origin "https://yourportfolio.com"
        header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        header Access-Control-Allow-Headers "X-Auth, Authorization, Content-Type, Accept"
        header Access-Control-Max-Age "1728000"
        respond 204
    }
    
    header Access-Control-Allow-Origin "https://yourportfolio.com"
    header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    header Access-Control-Allow-Headers "X-Auth, Authorization, Content-Type, Accept"
    header Access-Control-Allow-Credentials "true"
}
```

---

### Solution 3: Cloudflare Tunnel (For Remote Access)

If your NAS is on a local network and you want secure remote access:

1. Install Cloudflare Tunnel on TrueNAS SCALE
2. Configure tunnel to expose Filebrowser
3. Cloudflare automatically handles SSL/TLS and can manage CORS

**Benefits:**
- No port forwarding needed
- Free SSL/TLS certificates
- DDoS protection
- No dynamic DNS needed

**Setup:**
```bash
# On TrueNAS SCALE terminal
cloudflared tunnel create filebrowser
cloudflared tunnel route dns filebrowser nas.yourdomain.com
```

Configure tunnel config:
```yaml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: nas.yourdomain.com
    service: http://localhost:8080
  - service: http_status:404
```

Then add CORS headers in Cloudflare Transform Rules (Cloudflare Dashboard):
- Go to Rules → Transform Rules → Modify Response Header
- Add headers for CORS

---

## Testing CORS Configuration

### Test from Browser Console
```javascript
fetch('https://nas.yourdomain.com/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'pass', recaptcha: '' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error)
```

### Test with curl
```bash
# Preflight request
curl -X OPTIONS https://nas.yourdomain.com/api/login \
  -H "Origin: https://yourportfolio.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Actual request
curl -X POST https://nas.yourdomain.com/api/login \
  -H "Origin: https://yourportfolio.com" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"pass","recaptcha":""}' \
  -v
```

Look for these headers in the response:
```
Access-Control-Allow-Origin: https://yourportfolio.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: X-Auth, Content-Type
```

---

## Recommended Approach by Use Case

### Public Portfolio (Most Common)
**Use:** Next.js API Proxy (Solution 1) + Public Shares
- ✅ No CORS issues
- ✅ No exposed credentials
- ✅ Better security
- ✅ Simpler deployment

### Admin Dashboard / Private Portfolio
**Use:** Next.js API Proxy (Solution 1) + Authentication
- ✅ All API calls go through Next.js
- ✅ Credentials stay server-side
- ✅ Can add rate limiting

### Direct Browser Access (Advanced)
**Use:** Reverse Proxy with CORS (Solution 2)
- Only if you need direct browser-to-NAS communication
- Requires proper security setup
- More complex to maintain

---

## Security Considerations

### ⚠️ Don't Do This
```javascript
// BAD: Exposing credentials in frontend
const token = 'my-secret-token'
fetch(`http://nas-ip:8080/api/resources/...`, {
  headers: { 'X-Auth': token }
})
```

### ✅ Do This Instead
```javascript
// GOOD: Using Next.js API proxy
fetch('/api/photos')
  .then(r => r.json())
  .then(data => console.log(data.photos))
```

The Next.js API route handles authentication server-side, keeping credentials secure.

---

## Next.js CORS Configuration (If Needed)

If you need to allow CORS on your Next.js API routes (e.g., for a separate mobile app), add middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const origin = request.headers.get('origin')
  const allowedOrigins = ['https://yourportfolio.com', 'https://mobile.yourapp.com']
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## Summary

For your portfolio migration from Supabase to Filebrowser:

1. ✅ **Use the Next.js API proxy** (already implemented in `/app/api/photos/route.ts`)
2. ✅ **Use public shares** for best performance
3. ✅ **Keep credentials server-side** in environment variables
4. ✅ **No additional CORS configuration needed** for basic setup

Only configure reverse proxy CORS if you have advanced requirements like:
- Multiple frontends (web + mobile)
- Third-party integrations
- Direct browser-to-NAS access needs

Otherwise, the current setup is optimal! 🎉


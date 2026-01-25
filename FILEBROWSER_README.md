# 📦 Filebrowser Integration for Next.js Portfolio

This repository contains a complete implementation for migrating from Supabase to a self-hosted Filebrowser instance on TrueNAS SCALE.

## ✨ What's Included

### Core Implementation
- **`lib/filebrowser.ts`** - Complete Filebrowser API client with authentication
- **`app/api/photos/route.ts`** - Next.js API route for fetching photos (replaces Supabase)
- **Fallback logic** - Automatic fallback to placeholder images when NAS is offline

### Configuration & Setup
- **`QUICKSTART.md`** - Get started in 5 minutes
- **`FILEBROWSER_MIGRATION_GUIDE.md`** - Complete migration guide with all details
- **`CORS_CONFIGURATION.md`** - CORS setup and troubleshooting
- **`.env.example`** - Environment variables template
- **`scripts/setup-filebrowser.ts`** - Automated setup helper script

### Type Safety
- **`lib/filebrowser-types.ts`** - TypeScript definitions for Filebrowser API

## 🚀 Quick Start

1. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Filebrowser URL and credentials
   ```

2. **Choose authentication method:**
   - **Public Share (Recommended)**: Create a share in Filebrowser UI and add hash to `.env.local`
   - **API Token**: Generate in Filebrowser settings
   - **Automated**: Run `node scripts/setup-filebrowser.ts`

3. **Test it:**
   ```bash
   npm run dev
   curl http://localhost:3000/api/photos
   ```

4. **Done!** Your portfolio now serves images from your NAS 🎉

## 📖 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - 5-minute setup
- **[Full Migration Guide](./FILEBROWSER_MIGRATION_GUIDE.md)** - Comprehensive documentation
- **[CORS Configuration](./CORS_CONFIGURATION.md)** - Handling cross-origin issues

## 🎯 Features

### Authentication Methods
- ✅ API Token (most secure)
- ✅ Username/Password (development)
- ✅ Public Shares (best for public portfolios)

### Smart Fallbacks
- ✅ Automatic fallback to placeholder images when NAS is offline
- ✅ Health check before fetching
- ✅ Graceful error handling

### CORS Handling
- ✅ Next.js API proxy (no CORS issues!)
- ✅ Server-side authentication (credentials stay secure)
- ✅ Optional direct access with reverse proxy

### Performance
- ✅ Token caching (23-hour cache for auth tokens)
- ✅ Sorted by upload date
- ✅ Filters image files automatically

## 🔧 API Endpoints

### `GET /api/photos`
Fetches all photos from your Filebrowser portfolio folder.

**Response:**
```json
{
  "photos": [
    {
      "id": "/my_data/portfolio_pics/photo.jpg",
      "url": "http://nas/api/raw/...",
      "uploadedAt": "2024-01-01T00:00:00Z",
      "name": "photo.jpg",
      "size": 123456
    }
  ]
}
```

### `POST /api/photos` (with `{"createShare": true}`)
Helper endpoint to create a public share for your portfolio folder.

**Response:**
```json
{
  "shareUrl": "http://nas/share/ABC123",
  "shareHash": "ABC123",
  "message": "Add this hash to your .env.local as FILEBROWSER_SHARE_HASH"
}
```

## 🏗️ Architecture

```
Browser
  ↓
Next.js Frontend (/photos page)
  ↓
Next.js API Route (/api/photos) ← No CORS issues!
  ↓
Filebrowser Client (lib/filebrowser.ts)
  ↓
Filebrowser API (on TrueNAS SCALE)
  ↓
File Storage (/my_data/portfolio_pics)
```

## 📝 Environment Variables

```env
# Required
FILEBROWSER_URL=http://your-nas-ip:8080
FILEBROWSER_PHOTOS_PATH=/my_data/portfolio_pics

# Authentication (choose one)
FILEBROWSER_TOKEN=your-token                    # Option 1: API Token
# FILEBROWSER_USERNAME=admin                    # Option 2: Username/Password
# FILEBROWSER_PASSWORD=pass

# Public Share (recommended for production)
FILEBROWSER_PUBLIC_SHARE_ENABLED=true          # Enable public share mode
FILEBROWSER_SHARE_HASH=ABC123                  # Share hash from Filebrowser
```

## 🛠️ Migration from Supabase

This implementation replaces:
- ❌ `@supabase/supabase-js` storage methods
- ❌ Supabase authentication
- ❌ Supabase storage buckets

With:
- ✅ Direct file access from your NAS
- ✅ No vendor lock-in
- ✅ Full control over your data
- ✅ No monthly storage costs

## 🔒 Security Best Practices

1. **Use Public Shares** for public portfolios (no credentials exposed)
2. **Use HTTPS** in production (setup reverse proxy with SSL)
3. **Restrict API Access** via firewall rules or VPN
4. **Rotate Tokens** periodically
5. **Keep credentials server-side** (never in frontend code)

## 🎨 Usage in Components

```tsx
// In your photo gallery component
const PhotoGallery = () => {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    fetch('/api/photos')
      .then(r => r.json())
      .then(data => setPhotos(data.photos))
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(photo => (
        <img key={photo.id} src={photo.url} alt={photo.name} />
      ))}
    </div>
  )
}
```

## 🐛 Troubleshooting

### Images not loading
- ✅ Check Filebrowser is running: `curl http://nas-ip:8080/health`
- ✅ Verify environment variables in `.env.local`
- ✅ Check browser console for errors

### Authentication errors
- ✅ Regenerate API token in Filebrowser
- ✅ Verify credentials are correct
- ✅ Check Filebrowser logs

### CORS errors
- ✅ Use the Next.js API proxy (already configured!)
- ✅ Don't make direct browser-to-NAS requests

See [CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md) for detailed troubleshooting.

## 🚢 Production Deployment

1. Add environment variables to your hosting platform (Vercel/Netlify)
2. Ensure Filebrowser is accessible from your server (VPN/public with HTTPS)
3. Use public shares for best performance
4. Add fallback images to `/public` folder
5. Test thoroughly on production domain

## 📦 Requirements

- Node.js 18+
- Next.js 14+
- Filebrowser running on TrueNAS SCALE (or any server)
- Network access from your Next.js server to Filebrowser

## 🤝 Contributing

This implementation can be adapted for:
- Other file browsers (ownCloud, Nextcloud, etc.)
- Other storage backends
- Other frameworks (with modifications)

## 📄 License

Use freely for your portfolio! No attribution required.

## 🙏 Acknowledgments

- Built for migration from Supabase to self-hosted storage
- Designed for TrueNAS SCALE but works with any Filebrowser instance
- Uses Next.js API routes to solve CORS elegantly

---

**Need Help?** Check the documentation files or open an issue!

**Ready to Deploy?** Follow the [Quick Start Guide](./QUICKSTART.md)!


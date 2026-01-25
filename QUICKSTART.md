/**
 * Quick Start Guide: Filebrowser Migration
 * 
 * Follow these steps to get up and running quickly
 */

# 🚀 Quick Start (5 Minutes)

## Step 1: Setup Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
FILEBROWSER_URL=http://your-nas-ip:8080
FILEBROWSER_PHOTOS_PATH=/my_data/portfolio_pics
```

## Step 2: Choose Your Authentication Method

### Option A: Public Share (Recommended - Easiest)

1. Open Filebrowser in your browser: `http://your-nas-ip:8080`
2. Navigate to `/my_data/portfolio_pics`
3. Click the **Share** button (usually at the top right)
4. Copy the hash from the URL (e.g., if URL is `http://nas/share/ABC123`, copy `ABC123`)
5. Add to `.env.local`:

```env
FILEBROWSER_PUBLIC_SHARE_ENABLED=true
FILEBROWSER_SHARE_HASH=ABC123
```

### Option B: API Token

1. Login to Filebrowser
2. Go to **Settings** → **User Management** → **Create Token**
3. Copy the token
4. Add to `.env.local`:

```env
FILEBROWSER_TOKEN=your-token-here
```

### Option C: Use the Setup Script (Automated)

```bash
# Run the setup script
node --loader ts-node/esm scripts/setup-filebrowser.ts

# Follow the prompts - it will generate everything for you!
```

## Step 3: Test It

```bash
# Start your dev server
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/photos

# Should return JSON with your photos!
```

## Step 4: View in Browser

Open `http://localhost:3000/photos` (or wherever your gallery is) and your images should load!

---

## ⚠️ Troubleshooting

### "Photos not loading"
- ✅ Check Filebrowser is running: `curl http://your-nas-ip:8080/health`
- ✅ Check your `.env.local` has correct values
- ✅ Check browser console for errors

### "CORS error"
- ✅ Use the Next.js API proxy (already configured in `/api/photos`)
- ✅ Don't make direct requests from browser to NAS

### "Authentication failed"
- ✅ Verify your token/credentials in `.env.local`
- ✅ Try generating a new token

### "Fallback images showing"
- This means Filebrowser is unreachable
- ✅ Check network connection
- ✅ Check firewall rules
- ✅ Verify Filebrowser is running

---

## 📚 Full Documentation

For detailed information, see:
- **[FILEBROWSER_MIGRATION_GUIDE.md](./FILEBROWSER_MIGRATION_GUIDE.md)** - Complete migration guide
- **[CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md)** - CORS setup and troubleshooting

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Environment variables added to hosting platform (Vercel/Netlify)
- [ ] Public share created (if using that method)
- [ ] Filebrowser accessible from production server
- [ ] HTTPS configured (use reverse proxy)
- [ ] Fallback images in `/public` folder
- [ ] Test on production domain

---

## 🎉 That's It!

You're now serving images from your own NAS instead of Supabase. Enjoy your independence! 🚀

Questions? Check the full migration guide or CORS documentation.


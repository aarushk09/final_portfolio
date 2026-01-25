# ⚡ INSTALLATION INSTRUCTIONS

## You're almost done! Follow these steps to complete the migration.

### 📦 Step 1: Verify Files Are In Place

All files have been created. You should see:

**New Files:**
- ✅ `lib/filebrowser.ts` - Main API client
- ✅ `lib/filebrowser-types.ts` - TypeScript types
- ✅ `scripts/setup-filebrowser.ts` - Setup wizard
- ✅ `scripts/test-filebrowser.ts` - Test script
- ✅ `components/filebrowser-gallery-examples.tsx` - Example galleries
- ✅ `QUICKSTART.md` - Quick start guide
- ✅ `FILEBROWSER_MIGRATION_GUIDE.md` - Complete guide
- ✅ `CORS_CONFIGURATION.md` - CORS help
- ✅ `FILEBROWSER_README.md` - Full docs
- ✅ `MIGRATION_SUMMARY.md` - Summary
- ✅ `QUICK_REFERENCE.txt` - Quick reference

**Updated Files:**
- ✅ `app/api/photos/route.ts` - Now uses Filebrowser instead of Supabase
- ✅ `package.json` - Added helper scripts

---

### 🔧 Step 2: Install Dependencies (if needed)

The implementation uses built-in `fetch`, so no new dependencies are required!

However, for TypeScript execution in scripts, ensure you have:

```bash
npm install --save-dev ts-node
# or
pnpm add -D ts-node
```

---

### ⚙️ Step 3: Configure Environment Variables

**Option A: Use the Automated Setup (Recommended)**

```bash
npm run setup:filebrowser
```

This will:
- Test connection to your Filebrowser
- Authenticate and get a token
- Create a public share (optional)
- Generate your `.env.local` file content

**Option B: Manual Configuration**

Create `.env.local` in your project root:

```env
# Your Filebrowser URL
FILEBROWSER_URL=http://192.168.1.100:8080

# Directory where photos are stored
FILEBROWSER_PHOTOS_PATH=/my_data/portfolio_pics

# Choose ONE authentication method:

# Option 1: Public Share (Recommended)
FILEBROWSER_PUBLIC_SHARE_ENABLED=true
FILEBROWSER_SHARE_HASH=your-share-hash

# Option 2: API Token
# FILEBROWSER_TOKEN=your-token-here

# Option 3: Username/Password (dev only)
# FILEBROWSER_USERNAME=admin
# FILEBROWSER_PASSWORD=yourpass
```

**How to get a share hash:**
1. Open Filebrowser in browser
2. Navigate to `/my_data/portfolio_pics`
3. Click "Share" button
4. Copy the hash from the URL (e.g., `http://nas/share/ABC123` → use `ABC123`)

---

### ✅ Step 4: Test Your Configuration

Run the test script to verify everything works:

```bash
npm run test:filebrowser
```

This will check:
- ✅ Environment variables
- ✅ Connection to Filebrowser
- ✅ Authentication
- ✅ File access
- ✅ Fallback images

**Expected output:**
```
🧪 Filebrowser Configuration Test

✅ FILEBROWSER_URL
✅ Authentication Config
✅ Filebrowser Health
✅ Public Share Access
   Found 15 images
✅ Fallback Images

🎉 All tests passed!
```

---

### 🚀 Step 5: Start Your Development Server

```bash
npm run dev
```

Visit your app and test:

1. **API Endpoint:** `http://localhost:3000/api/photos`
   - Should return JSON with your photos

2. **Gallery Page:** `http://localhost:3000/photos` (or wherever your gallery is)
   - Should display images from your NAS

---

### 🎨 Step 6: Update Your Components (if needed)

Your existing photo gallery should work as-is since the API endpoint format is the same.

But if you want to use the new example components:

```tsx
import { FilebrowserPhotoGallery } from '@/components/filebrowser-gallery-examples'

export default function PhotosPage() {
  return <FilebrowserPhotoGallery />
}
```

Or keep using your existing component - the API response format is compatible!

---

### 🧪 Step 7: Test Fallback Behavior

1. Stop your Filebrowser instance temporarily
2. Refresh your portfolio website
3. Should see placeholder/fallback images
4. Check browser console - should show friendly error messages
5. Restart Filebrowser and refresh - images should load again

This verifies your portfolio works even when your NAS is offline!

---

### 📱 Step 8: Production Deployment

When ready to deploy to production:

1. **Add environment variables to your hosting platform:**

   **Vercel:**
   ```bash
   vercel env add FILEBROWSER_URL
   vercel env add FILEBROWSER_PUBLIC_SHARE_ENABLED
   vercel env add FILEBROWSER_SHARE_HASH
   ```

   **Netlify:**
   - Go to Site Settings → Environment Variables
   - Add the same variables

2. **Ensure Filebrowser is accessible:**
   - If on local network: Setup VPN or Tailscale
   - If publicly accessible: Setup HTTPS with reverse proxy

3. **Deploy and test:**
   ```bash
   npm run build
   # Deploy to your platform
   ```

4. **Verify on production:**
   - Visit `https://yoursite.com/api/photos`
   - Check gallery page loads images

---

### 🔒 Security Considerations

Before going to production:

- ✅ Use HTTPS for Filebrowser (setup reverse proxy)
- ✅ Use public shares for public galleries
- ✅ Keep tokens/credentials in environment variables only
- ✅ Never commit `.env.local` to git
- ✅ Rotate API tokens periodically
- ✅ Setup firewall rules for Filebrowser
- ✅ Monitor access logs

---

### 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `setup:filebrowser` script fails | Install ts-node: `npm i -D ts-node` |
| "Cannot reach Filebrowser" | Check URL, firewall, and that Filebrowser is running |
| "Authentication failed" | Verify credentials, try generating new token |
| Images show on dev but not prod | Check production server can reach your NAS |
| CORS errors | Already solved! Make sure you're using `/api/photos` |

---

### 📚 Next Steps

1. ✅ **Optional:** Update upload/delete endpoints to use Filebrowser API
2. ✅ **Optional:** Add image optimization (Sharp.js)
3. ✅ **Optional:** Implement thumbnail generation
4. ✅ **Optional:** Add admin dashboard for managing photos
5. ✅ **Optional:** Setup monitoring for NAS uptime

---

### 🎓 Learning Resources

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick start
- **[FILEBROWSER_MIGRATION_GUIDE.md](./FILEBROWSER_MIGRATION_GUIDE.md)** - Comprehensive guide
- **[CORS_CONFIGURATION.md](./CORS_CONFIGURATION.md)** - CORS troubleshooting
- **[QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt)** - Command cheat sheet

---

## 🎉 You're Done!

Your portfolio is now serving images from your self-hosted Filebrowser instance!

**What you've gained:**
- ✅ Full control over your data
- ✅ No vendor lock-in
- ✅ No monthly storage costs
- ✅ Privacy and ownership
- ✅ Automatic fallback when NAS is offline

**Support:**
- Run `npm run test:filebrowser` to diagnose issues
- Check the documentation files
- Review troubleshooting sections

---

## 🚦 Quick Start Checklist

- [ ] Files verified in project
- [ ] Environment variables configured (`.env.local`)
- [ ] Test script runs successfully (`npm run test:filebrowser`)
- [ ] Dev server started (`npm run dev`)
- [ ] API endpoint returns photos (`/api/photos`)
- [ ] Gallery page displays images
- [ ] Fallback behavior tested
- [ ] Production environment variables added
- [ ] Deployed and tested on production

---

**Ready to go? Start with:**

```bash
npm run setup:filebrowser
```

Or read [QUICKSTART.md](./QUICKSTART.md) for the 5-minute guide!

---

**Questions?** Check the documentation or run the test script for diagnostics.

**Enjoy your independent portfolio! 🎉**


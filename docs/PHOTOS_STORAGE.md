# Photo storage options (stay under Vercel limits)

## 1. Compress existing photos (quick fix)

Reduces deployment size by converting images to WebP and resizing. Run locally, then commit the smaller files.

```bash
pnpm install
pnpm run compress-photos
```

- **What it does:** Converts every image in `public/photos` to WebP (quality 90), max 1920px on the longest side. Deletes originals. Your API already serves `.webp`.
- **Typical savings:** 60–80% smaller files with little visible quality loss.
- **One-time:** Run after adding new photos if you want to keep them in the repo.

---

## 2. Move photos off the repo (no size limit from Vercel)

Keep images out of the deployment so the 250 MB limit doesn’t apply.

### Option A: Cloudflare R2 (recommended, free tier)

- **Free:** 10 GB storage, 1M Class A + 10M Class B requests/month, **no egress fees**.
- **Fast:** S3-compatible, global CDN.

**Steps:**

1. Create a Cloudflare account → R2 → Create bucket (e.g. `portfolio-photos`).
2. Create R2 API token with “Object Read & Write”.
3. Add env vars (e.g. in Vercel):
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL` (e.g. `https://pub-xxx.r2.dev` if you enable public access, or a custom domain).
4. Change the app to list/serve photo URLs from R2 instead of `public/photos` (e.g. a small API route that lists R2 objects and returns their public URLs). Upload can be a separate script or admin action that uses the R2 SDK (`@aws-sdk/client-s3` with R2 endpoint).

Your current `/api/photos` would call R2 instead of the filesystem and return the same shape `{ photos: [{ id, url, ... }] }` with `url` pointing to R2.

### Option B: Vercel Blob

- You already have `@vercel/blob`.
- **Free tier:** 1 GB storage, 100 GB bandwidth/month.
- Good if you have few photos and want minimal setup; use `list()` and public URLs from Blob in your API instead of reading from `public/photos`.

---

**Summary:** Use **compress-photos** first to get under the limit quickly. If you need more headroom or many more photos, move to **R2** (or Blob) and serve photo list + URLs from there so no images live in the deployment.

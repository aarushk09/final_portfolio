# Spotify “Now Playing” setup (step-by-step)

Use the **same** Spotify app and credentials everywhere. Follow these steps in order.

---

## 1. Spotify Developer Dashboard

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and log in.
2. Open your app (or create one).
3. Click **Settings**.
4. Under **Redirect URIs** add **both** (then Save):
   - **Local:** `http://127.0.0.1:3000/spotify-setup` (Spotify does not allow `localhost`; use this loopback URI.)
   - **Production:** `https://YOUR-PRODUCTION-DOMAIN/spotify-setup` (e.g. `https://final-portfolio-lemon-gamma.vercel.app/spotify-setup`)
5. Under **User Management**, add the **email of the Spotify account** you use (the one that will show “Now Playing”). Save again.

---

## 2. Get a refresh token (one-time)

1. In the project root, create or edit **`.env.local`** with:

```env
SPOTIFY_CLIENT_ID=c8ae26952d2b4beba277ec8e67354e7e
SPOTIFY_CLIENT_SECRET=3880fe4b46be465ebae5a10b6a62e00f
SPOTIFY_REFRESH_TOKEN=
```

2. Start the app:  
   `pnpm dev`  
   (or `npm run dev`)

3. Open in the browser:  
   **http://127.0.0.1:3000/spotify-setup**  
   (You can also use `http://localhost:3000/spotify-setup`; the page will use `127.0.0.1` for the redirect URI sent to Spotify.)

4. On the setup page, confirm the **Redirect URI** shown is `http://127.0.0.1:3000/spotify-setup` (and that this exact URI is in your Spotify Dashboard).

5. Click **“Authorize Spotify”**. Log in with your Spotify account if asked.

6. After redirect back to `/spotify-setup`, click **“Get Refresh Token”**.

7. Copy the **refresh token** that appears.

8. Put it in `.env.local`:

```env
SPOTIFY_REFRESH_TOKEN=paste_the_long_token_here
```

9. Restart the dev server (Ctrl+C, then `pnpm dev` again).

---

## 3. Local check

1. Open **http://127.0.0.1:3000** (or http://localhost:3000)
2. The Spotify “Now Playing” widget should load without errors.
3. Play something in the Spotify app (same account you authorized). The widget should update.

If you see **“Invalid client”** or **403** in the terminal:

- `.env.local` must use the **same** `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` as the app you used on `/spotify-setup`.
- The **refresh token** must have been generated from that same app (repeat step 2 if you created a new app).

---

## 4. Keep the refresh token permanently (no more daily re-auth)

Spotify sometimes returns a **new** refresh token when we refresh. The app now stores that in **Vercel KV** so you don’t have to re-run the setup.

1. In Vercel: **Storage** → **Create Database** → **KV**.
2. Create a KV store, then **Connect** it to your project (this adds `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.).
3. Redeploy. After the first successful refresh, the app will save the latest refresh token to KV and reuse it. You won’t need to regenerate the token.

If you don’t add KV, the app still works but will only use the token from env; if Spotify rotates it, you may need to get a new token from the setup page again.

---

## 5. Production (e.g. Vercel)

1. In Vercel: Project → **Settings** → **Environment Variables**.
2. Add (for Production, and optionally Preview/Development):

| Name                     | Value                    |
|--------------------------|--------------------------|
| `SPOTIFY_CLIENT_ID`      | `c8ae26952d2b4beba277ec8e67354e7e` |
| `SPOTIFY_CLIENT_SECRET`  | `3880fe4b46be465ebae5a10b6a62e00f` |
| `SPOTIFY_REFRESH_TOKEN` | (the token you copied from the setup page) |

3. **Redeploy** the project so the new env vars are used.

4. In the Spotify Dashboard, ensure the **production** redirect URI (e.g. `https://your-site.vercel.app/spotify-setup`) is in the list. You don’t need to open that URL again unless you need a new refresh token.

---

## Summary

- **One app:** Use the same Client ID and Client Secret in Dashboard, `.env.local`, and Vercel.
- **One refresh token:** Get it once from `/spotify-setup`, put it in `.env.local` and in Vercel. The app will **persist** new refresh tokens in Vercel KV when Spotify returns them, so you don’t have to regenerate it.
- **Vercel KV:** Connect a KV store to your project so the app can save the latest refresh token and avoid “token expired” after a day.
- **User Management:** The Spotify account you authorize must be added in the Dashboard for the widget to work (avoids 403).

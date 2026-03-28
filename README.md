# asBible

A [Next.js](https://nextjs.org/) 14 app for reading the Bible in many translations, browsing a Contentful-powered blog, and chatting with an AI assistant. Bible text is served from static JSON under `public/json` (no Redis or database for scripture).

## Features

- **Bible reader** (`/bible`) — Select translation, book, and chapter. Text is loaded via `GET /api/bible`, which reads `public/json/<version>.json` and caches parsed data in memory per server process.
- **Blog** (`/blog`) — Articles from **Contentful** (GraphQL), with on-demand revalidation.
- **Chat** (`/chat`) — Proxies to OpenAI (`gpt-4o-mini`) through `POST /api/chat-with-gpt` so the API key stays on the server.
- **Verse of the day** — `components/DailyVerse.tsx` loads `public/dailyVerse.json`. Regenerate with `POST /api/dailyVerse` (see below).

## Security model

| Area | Behavior |
|------|----------|
| **HTTP headers** | `next.config.mjs` sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` on all routes. |
| **Bible API** | `version` must match a known translation id (see `lib/bibleBooks.ts`); `book` is validated; `chapter` is bounded. No path traversal. |
| **Chat API** | Validates message shape and size; basic per-IP rate limit; does not leak raw OpenAI error bodies to the client. |
| **Daily verse refresh** | `POST /api/dailyVerse` requires `Authorization: Bearer <CRON_SECRET>`. Without `CRON_SECRET`, regeneration is disabled. |
| **Contentful revalidation** | `POST /api/revalidation` requires header `x-vercel-reval-key` matching `CONTENTFUL_REVALIDATE_SECRET`. |
| **Contentful preview** | `GET /api/draft` uses `CONTENTFUL_PREVIEW_SECRET` (query param `secret`). |

**Contentful delivery tokens** (`NEXT_PUBLIC_CONTENTFUL_*`) are exposed to the browser by design for client-side fetches; use a **Content Delivery API** read-only token, not a management token.

Set **`OPENAI_API_KEY`** only on the server (never `NEXT_PUBLIC_`).

## Environment variables

Create a `.env.local` (or configure your host) with:

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | For chat + optional daily verse generation | OpenAI API |
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` | Blog | Contentful space |
| `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Blog | Contentful Delivery API token |
| `NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN` | Optional | Draft preview |
| `CONTENTFUL_REVALIDATE_SECRET` | Optional | Webhook → `/api/revalidation` |
| `CONTENTFUL_PREVIEW_SECRET` | Optional | `/api/draft` preview links |
| `CRON_SECRET` | For `POST /api/dailyVerse` | Long random string; same value in `Authorization: Bearer …` |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL (e.g. `https://asbible.com`) for metadata / Open Graph |

### Connecting the blog (Contentful)

1. In Contentful, open **Settings → API keys** and copy **Space ID** and the **Content Delivery API — access token** (published content). Optionally copy the **Content Preview API** token for draft preview.
2. Paste them into **`.env.local`** (see `.env.example`). Prefer the **Copy** buttons in the UI; characters are easy to misread from screenshots.
3. **Content model** must match what `lib/contentful.ts` queries: a content type with API ID **`blog`**, with fields **`title`**, **`slug`**, **`excerpt`**, **`content`** (Rich text), **`publishedDate`**, and **`coverImage`** (Media, one asset). If your field IDs differ, update the GraphQL fields in `lib/contentful.ts`.
4. After changing env vars, run **`npm run build`** again (Next.js inlines `NEXT_PUBLIC_*` at build time), then **`pm2 reload asbible`** (or restart PM2).

If the build log shows `Contentful GraphQL: Authentication failed`, the Space ID or Delivery token is wrong or revoked — create a new API key in Contentful and update `.env.local`.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm ci
npm run build
npm start
```

### PM2 + Caddy (e.g. asbible.com)

The app listens on **`127.0.0.1:3000`** only (see `ecosystem.config.js`) so it is not exposed publicly; **Caddy** terminates TLS and reverse-proxies by hostname. Other sites on the same Caddy instance use **different `host` blocks** — they do not interfere.

1. **Env:** copy `.env.local` (from `.env.example`) on the server and set Contentful + `NEXT_PUBLIC_SITE_URL` (see **Connecting the blog** above).

2. **Build and start with PM2** (from the repo directory):

   ```bash
   npm ci
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   ```

   Optional: `pm2 startup` to revive processes after reboot.

3. **Caddy:** merge the blocks in `deploy/caddy-asbible.snippet` into `/etc/caddy/Caddyfile` (keep your existing sites, e.g. `pdfs.onl`, in the same file). Then:

   ```bash
   sudo caddy validate --config /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```

4. **DNS:** point **A/AAAA** records for `asbible.com` and (if used) `www.asbible.com` to this server’s IP. Caddy will obtain certificates automatically.

5. **Health:** `curl -I https://asbible.com` and `pm2 logs asbible`.

## Bible data

Translations live as large JSON files: `public/json/<abbreviation>.json` (e.g. `en_kjv.json`). The list of valid `version` query parameters matches `ALLOWED_BIBLE_VERSION_ABBREVS` in `lib/bibleBooks.ts`.

## Refreshing the daily verse

`POST /api/dailyVerse` generates JSON via OpenAI and writes `public/dailyVerse.json`.

- Requires **`CRON_SECRET`** in the environment and header:  
  `Authorization: Bearer <CRON_SECRET>`
- On **serverless** hosts (e.g. Vercel), the filesystem is often read-only at runtime — use a VPS/PM2 setup, or change the implementation to write to object storage.

Example (cron on a server):

```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/dailyVerse
```

## Contentful webhooks

Point a Contentful webhook to `POST https://<your-domain>/api/revalidation` with header `x-vercel-reval-key: <CONTENTFUL_REVALIDATE_SECRET>` to invalidate cached articles (`revalidateTag('articles')`).

## License

Private project; see repository owner.

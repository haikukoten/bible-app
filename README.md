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

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

`ecosystem.config.js` is included for **PM2** (`npm run start`).

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

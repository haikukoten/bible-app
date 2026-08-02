# asBible System Architecture & Documentation

Welcome to **asBible**, a robust, automated ecosystem that combines a Next.js 14 web application for Bible reading and spiritual growth with a fully autonomous AI-driven publishing engine powered by Contentful.

## 🌟 Overview

The ecosystem is divided into two primary parts:
1. **The Web Application (`/`)**: A fast, SEO-optimized Next.js 14 frontend offering a Bible reader, an AI chat interface, a dynamic Verse of the Day, and a beautiful reading experience for the blog.
2. **The Publishing Engine (`/contentful-blog-publisher`)**: An autonomous Node.js background worker system (managed via PM2) that generates theological articles, AI imagery, and publishes them seamlessly to Contentful on configured schedules.

---

## 1️⃣ Web Application Features (Next.js)

- **Bible Reader (`/bible`)**: Allows users to read and navigate different translations. Scripture data is read directly from large, heavily cached static JSON files in `public/json/` (no database overhead).
- **Blog (`/blog`)**: Displays articles fetched from Contentful via GraphQL. Articles support rich text and are optimized for SEO with dynamic metadata.
- **AI Chat (`/chat`)**: A conversational interface proxying to OpenAI (`gpt-4o-mini`) through a secure `POST /api/chat-with-gpt` endpoint, keeping API keys safe on the server.
- **Verse of the Day**: A dynamically loaded client component (`DailyVerse.tsx`) that reads from `public/dailyVerse.json`. This JSON is regenerated via a secure `POST /api/dailyVerse` endpoint.
- **Newsletter Subscriptions**: Users can sign up via an elegant inline form on the homepage or cards on blog posts. Subscriptions are saved automatically to a local `subscriptions.csv` file via `POST /api/subscribe`.
- **Google Analytics & Event Tracking**: Fully integrated with Google Analytics (`G-250XKLDNC4`). Includes custom event tracking for the floating and sticky **Share Buttons** (Facebook, Twitter, WhatsApp, Copy Link) on articles.

---

## 2️⃣ Autonomous Blog Publishing Engine

The `contentful-blog-publisher/` directory contains an autonomous publishing system that runs in the background 24/7. It generates high-quality articles and images, creates a GitHub Gist for the content brief, and publishes directly to Contentful.

### Dual-Instance Setup
The system runs **two independent PM2 instances**, configured via `ecosystem.config.cjs`:

1. **`blog-publisher` (Main)**
   - **Topics List**: `topics.txt`
   - **State Tracking**: `data/state.json`
   - **Schedule**: Aims for ~1 article every 3 days (72-hour interval + 24-hour random jitter).
   - **Behavior**: Expects explicit `Keyword|Language` pairs (e.g. `Faith|English`).

2. **`blog-publisher-2` (High Frequency)**
   - **Topics List**: `topics2.txt`
   - **State Tracking**: `data/state2.json`
   - **Schedule**: Aims for ~2 articles per day (4-hour interval + 16-hour random jitter).
   - **Behavior**: Smart language fallback. If no `|Language` is provided (e.g. `salmo 91`), it explicitly commands the AI to write the article in the same language as the keyword.

### AI Integrations
- **Text Generation**: Uses OpenAI's `gpt-4o-mini` to write the title, excerpt, and rich-text body matching the exact required JSON structure for Contentful.
- **Image Generation**: Uses **Black Forest Labs (BFL)** API. Recently upgraded to the highly efficient **`flux-2-klein-9b`** model to cut image generation costs by 50% while maintaining exceptional speed and photorealistic quality.

---

## 🔒 Security Model

| Area | Behavior |
|------|----------|
| **HTTP Headers** | Next.js sets strict `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. |
| **Chat API** | Validates message shape/size; applies basic IP rate limiting; sanitizes OpenAI errors. |
| **Daily Verse** | `/api/dailyVerse` requires `Authorization: Bearer <CRON_SECRET>`. |
| **Contentful Cache** | `/api/revalidation` webhook requires `x-vercel-reval-key` matching `CONTENTFUL_REVALIDATE_SECRET`. |
| **API Keys** | `OPENAI_API_KEY`, `BFL_API_KEY`, and Contentful Management tokens are strictly server-side. |

---

## ⚙️ Environment Configuration

Ensure `.env.local` contains the following keys for the system to function:

### Frontend (Next.js Root)
- `OPENAI_API_KEY` - For the chat and daily verse generator.
- `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` - Contentful Space ID.
- `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` - Content Delivery API (CDA) token.
- `CRON_SECRET` - For triggering Verse of the Day updates.
- `CONTENTFUL_REVALIDATE_SECRET` - For Contentful webhooks.

### Publisher Engine (`/contentful-blog-publisher/.env`)
- `OPENAI_API_KEY` - For article writing.
- `BFL_API_KEY` - For Black Forest Labs image generation (`flux-2-klein-9b`).
- `GITHUB_TOKEN` - For creating article briefs as Gists.
- `CONTENTFUL_SPACE_ID` & `CONTENTFUL_MANAGEMENT_TOKEN` - For pushing content directly into Contentful.

---

## 🚀 Deployment & Operations

The entire stack is designed to be hosted on a VPS (like Ubuntu) using PM2 for process management and Caddy as a reverse proxy.

### Next.js Production Build
```bash
npm ci
npm run build
pm2 start ecosystem.config.js # Starts the 'asbible' Next.js server on port 3000
```
*Note: Run `npm run build && pm2 reload asbible` after any frontend UI changes.*

### Starting the Publishing Engines
Navigate to `/contentful-blog-publisher` and run:
```bash
npm ci
pm2 start ecosystem.config.cjs
```
This will launch both `blog-publisher` and `blog-publisher-2`.

### PM2 Monitoring
To check the health of all services:
```bash
pm2 status
```
You should see `asbible`, `blog-publisher`, and `blog-publisher-2` running. To monitor the logs of the automated writers:
```bash
pm2 logs blog-publisher-2
```

### Routing (Caddy)
The Caddy reverse proxy (`/etc/caddy/Caddyfile`) terminates SSL and points `asbible.com` directly to `127.0.0.1:3000`.

---
*Maintained as a private project.*

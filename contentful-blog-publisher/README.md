# Contentful blog publisher (OpenAI + Gist + schedule)

Separate Node service that:

1. Reads your editorial brief from **`config.txt`** (copy from `config.example.txt`).
2. Uses **OpenAI** (chat completions) to plan a post: title, excerpt, and **gist body** (outline + section headings).
3. Optionally creates a **GitHub Gist** with that brief (set `GITHUB_TOKEN`; skipped if unset).
4. Generates a **cover image** with the **BFL FLUX API** from the **article excerpt** (default **`flux-2-pro`**; override with `BFL_IMAGE_MODEL`).
5. Writes the full article with **OpenAI** again (JSON → Contentful Rich Text; long-form, human-style copy per prompts in `src/openai.ts`).
6. Uploads the image and **publishes** a **`blog`** entry via the **Contentful Management API**. The **`excerpt`** field is capped at **255 characters** (Contentful Short text); prompts ask the model to stay within that limit, and the publisher **truncates** with an ellipsis if needed.

## Scheduling (production behavior)

- **Cadence:** after each **successful** batch, the next run is scheduled for **3 days** later plus **random 0–24 hours** (`computeNextRunAfterSuccess` in `src/state.ts`). That keeps a roughly three-day rhythm with a different clock time each cycle.
- **Batch size:** each run publishes **`POSTS_PER_RUN`** articles in sequence (default **2**). Topics are taken from `topics.txt` in order: post 1 uses `topicIndex`, post 2 uses `topicIndex + 1` (wrapping). After the batch, **`topicIndex`** advances by **`POSTS_PER_RUN`** (modulo the number of topics).
- **First run:** default **`FIRST_RUN_DELAY_MS=0`**, so with a **new** `data/state.json` the first batch runs **right after** the process starts. If you resume an old state file whose `nextRunAt` is still in the future, the process sleeps until that time unless you edit `nextRunAt` or delete `data/state.json`.
- **State:** persisted in **`data/state.json`** (`lastRunAt`, `nextRunAt`, `topicIndex`).

## Prerequisites

- **OpenAI API key** with access to the chat models you configure ([platform.openai.com](https://platform.openai.com/)).
- **Black Forest Labs API key** for image generation ([dashboard.bfl.ai](https://dashboard.bfl.ai/)).
- **Contentful Management token** (not the Delivery token). Same **Space ID** as the Next.js site.
- Content type **`blog`** with fields: `title`, `slug`, `excerpt`, `content` (Rich text), `publishedDate`, `coverImage` (Media, one asset) — same as the existing site.
- **GitHub** token with **gist** scope (optional; gists are skipped if missing).

## Topics rotation (`topics.txt`)

Copy **`topics.example.txt`** → **`topics.txt`** (gitignored). One topic per line:

```text
Malakiás próféta|Hungarian
Hope in Christ|English
```

Format: **`keyword|language`** (`language` is the full name passed to the model: article title, body, and excerpt follow that language). Lines starting with `#` are ignored.

With **`POSTS_PER_RUN=2`**, each cycle consumes **two** consecutive lines (wrapping at the end). The index in **`data/state.json`** tracks where the **next** cycle starts. If **`topics.txt`** is missing or empty, each post in the batch uses **`config.txt`** only (no keyword rotation).

## Setup

```bash
cd contentful-blog-publisher
cp .env.example .env
cp config.example.txt config.txt
cp topics.example.txt topics.txt
# Edit .env, config.txt, and topics.txt
npm install
```

Test a full **batch** once (same size as production — uses `POSTS_PER_RUN`, default 2). Still updates `data/state.json`:

```bash
npm run run-once
```

Long-running scheduler (keeps running; first batch soon or immediately depending on `data/state.json` and `FIRST_RUN_DELAY_MS`):

```bash
npm start
```

### PM2 (recommended for servers)

```bash
cd contentful-blog-publisher
pm2 start ecosystem.config.cjs
pm2 save
```

Ensure `.env` is present in **`contentful-blog-publisher/`** (PM2 `cwd` is this folder). Logs: **`data/pm2-out.log`** / **`data/pm2-error.log`**.

## Environment

See **`.env.example`**. Important:

| Variable | Purpose |
|----------|---------|
| `BFL_API_KEY` | BFL Flux API key |
| `OPENAI_TEXT_MODEL` | Default `gpt-4o-mini` (e.g. `gpt-4o`) |
| `BFL_IMAGE_MODEL` | Default `flux-2-pro` |
| `BFL_IMAGE_SIZE` | Default `1024x1024` |
| `CONTENTFUL_MANAGEMENT_TOKEN` | CMA token |
| `CONTENTFUL_SPACE_ID` | Space ID |
| `CONTENTFUL_BLOG_CONTENT_TYPE_ID` | Default `blog` |
| `GITHUB_TOKEN` | Creates gists (optional) |
| `POSTS_PER_RUN` | Articles per scheduled cycle (default **2**) |
| `FIRST_RUN_DELAY_MS` | Only when **creating** initial schedule from empty state (default **0** = immediate first batch) |
| `TOPICS_FILE` | Optional path to topics list (default `./topics.txt`) |
| `STATE_FILE` | Optional path to JSON state (default `./data/state.json`) |

Chat requests use **`max_completion_tokens`** for compatibility with newer OpenAI models.

## Security

- Never commit **`.env`** or **`.env.local`**.
- **Regenerate** any token that was pasted into chat or checked into git by mistake.
- GitHub token: minimum scope (**gist** only). Contentful: **Content management** token, not Delivery.

## Troubleshooting

- **`Authentication failed` (Contentful)** — wrong Management token or Space ID.
- **OpenAI 401/429** — invalid key, billing, or rate limits; check [OpenAI usage](https://platform.openai.com/usage).
- **Image rejected (content policy)** — adjust prompts in `config.txt` or simplify the excerpt-driven image brief; DALL·E may block some religious imagery depending on prompt.
- **Slug / field errors** — field API IDs in Contentful must match (`blog`, `title`, `slug`, etc.).
- **First run not immediate** — check `data/state.json`: set `nextRunAt` to a past ISO time, or remove the file to re-init (respects `FIRST_RUN_DELAY_MS`).

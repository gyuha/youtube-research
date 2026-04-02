# YouTube Research Dashboard

Internal Next.js dashboard for manually collecting the latest video from registered YouTube channels.

## Development

```bash
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

Open `http://localhost:3000` after the dev server starts.

## Testing

Run the verification commands before delivery:

```bash
pnpm test
pnpm lint
pnpm build
```

## Environment

Copy `.env.example` to `.env` and set these values before using channel registration or collection:

- `YOUTUBE_API_KEY`: Google API key with YouTube Data API v3 enabled
- `OPENROUTER_API_KEY`: OpenRouter API key for transcript summarization
- `OPENROUTER_MODEL` (optional): OpenRouter model id (default `openai/gpt-4o-mini`)
- `OPENROUTER_SITE_URL` (optional): Service URL used for OpenRouter ranking headers
- `OPENROUTER_APP_NAME` (optional): Service name used for OpenRouter ranking headers
- `DATABASE_URL`: Prisma database connection string

## Provider Notes

- Channel registration resolves `@handle` and channel-id URLs through the YouTube Data API.
- Manual collection fetches the newest uploaded video from YouTube, then reads YouTube captions only.
- Videos without captions are stored as `No Captions`; this app does not fall back to audio transcription.

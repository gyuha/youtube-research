# YouTube Research Dashboard

Internal Next.js dashboard for manually collecting the latest video from registered YouTube channels.

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm dev
```

## Scripts

- `pnpm dev` starts the development server.
- `pnpm typecheck` runs the TypeScript compiler in no-emit mode.
- `pnpm test` runs Vitest.
- `pnpm build` creates the production build.

## Environment

Copy `.env.example` to `.env` and set these values before using channel registration or collection:

- `YOUTUBE_API_KEY`: Google API key with YouTube Data API v3 enabled
- `OPENAI_API_KEY`: OpenAI API key for transcript summarization
- `DATABASE_URL`: Prisma database connection string

## Provider Notes

- Channel registration resolves `@handle` and channel-id URLs through the YouTube Data API.
- Manual collection fetches the newest uploaded video from YouTube, then reads YouTube captions only.
- Videos without captions are stored as `No Captions`; this app does not fall back to audio transcription.

# YouTube Research Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal internal web dashboard that registers YouTube channels by URL, manually collects the newest video on demand, fetches captions when available, generates a Korean summary plus three insights, and shows only the latest result per channel.

**Architecture:** Use a single Next.js App Router application with server-only integration modules for YouTube lookup, transcript retrieval, and OpenAI analysis. Persist channels, latest video snapshots, and latest analysis results with Prisma, and keep the UI focused on channel registration, manual collection, status rendering, and latest-result display.

**Tech Stack:** Next.js App Router, TypeScript, pnpm, Tailwind CSS, Prisma, SQLite, Vitest, React Testing Library, OpenAI API, YouTube Data API

---

## Planned File Structure

### Root and config

- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

### Database

- Create: `prisma/schema.prisma`
- Create: `prisma/migrations/*`
- Create: `src/server/db/client.ts`
- Create: `src/server/db/repositories/channel-repository.ts`
- Create: `src/server/db/repositories/video-snapshot-repository.ts`
- Create: `src/server/db/repositories/analysis-result-repository.ts`

### Domain and integrations

- Create: `src/server/youtube/types.ts`
- Create: `src/server/youtube/channel-url.ts`
- Create: `src/server/youtube/youtube-api.ts`
- Create: `src/server/transcripts/transcript-service.ts`
- Create: `src/server/analysis/analysis-schema.ts`
- Create: `src/server/analysis/analysis-service.ts`
- Create: `src/server/collection/collection-status.ts`
- Create: `src/server/collection/collect-latest-video.ts`

### App routes and UI

- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/actions/register-channel.ts`
- Create: `src/app/actions/collect-channel.ts`
- Create: `src/components/channel-registration-form.tsx`
- Create: `src/components/channel-list.tsx`
- Create: `src/components/channel-card.tsx`
- Create: `src/components/result-detail-panel.tsx`
- Create: `src/components/status-badge.tsx`

### Tests

- Create: `src/server/youtube/channel-url.test.ts`
- Create: `src/server/collection/collection-status.test.ts`
- Create: `src/server/analysis/analysis-schema.test.ts`
- Create: `src/server/collection/collect-latest-video.test.ts`
- Create: `src/app/actions/register-channel.test.ts`
- Create: `src/app/actions/collect-channel.test.ts`
- Create: `src/app/page.test.tsx`

## Task 1: Bootstrap the App and Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `README.md`
- Test: `src/app/page.test.tsx`

- [ ] **Step 1: Write the failing page smoke test**

```tsx
// src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the dashboard heading', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /youtube research dashboard/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/app/page.test.tsx`

Expected: FAIL with a module resolution error because the app files and Vitest configuration do not exist yet.

- [ ] **Step 3: Create the minimal app and test tooling**

```json
// package.json
{
  "name": "youtube-research",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0",
    "googleapis": "^154.0.0",
    "next": "^16.0.0",
    "openai": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "youtube-transcript": "^1.2.1",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^9.0.0",
    "jsdom": "^26.0.0",
    "postcss": "^8.0.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

```tsx
// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>YouTube Research Dashboard</h1>
    </main>
  );
}
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

```md
// README.md
# YouTube Research Dashboard

Manual YouTube channel collection dashboard for caption-based Korean summaries and key insights.
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/app/page.test.tsx`

Expected: PASS with `1 passed`.

- [ ] **Step 5: Install dependencies and verify the app boots**

Run: `pnpm install`

Run: `pnpm build`

Expected: both commands succeed and `next build` completes without missing file errors.

- [ ] **Step 6: Commit the bootstrap**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts vitest.setup.ts .gitignore .env.example README.md src/app/layout.tsx src/app/page.tsx src/app/globals.css src/app/page.test.tsx
git commit -m "chore: bootstrap Next.js dashboard app"
```

## Task 2: Add the Database Schema and Repository Layer

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/server/db/client.ts`
- Create: `src/server/db/repositories/channel-repository.ts`
- Create: `src/server/db/repositories/video-snapshot-repository.ts`
- Create: `src/server/db/repositories/analysis-result-repository.ts`
- Test: `src/server/collection/collection-status.test.ts`

- [ ] **Step 1: Write the failing status model test**

```ts
// src/server/collection/collection-status.test.ts
import { describe, expect, it } from 'vitest';
import {
  COLLECTION_STATUSES,
  isTerminalCollectionStatus,
} from './collection-status';

describe('collection status helpers', () => {
  it('treats completed as terminal', () => {
    expect(isTerminalCollectionStatus(COLLECTION_STATUSES.completed)).toBe(true);
  });

  it('treats collecting as non-terminal', () => {
    expect(isTerminalCollectionStatus(COLLECTION_STATUSES.collecting)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/server/collection/collection-status.test.ts`

Expected: FAIL because `collection-status.ts` does not exist yet.

- [ ] **Step 3: Define Prisma models and repository skeletons**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Channel {
  id              String         @id @default(cuid())
  channelUrl      String
  youtubeChannelId String        @unique
  title           String
  thumbnailUrl    String?
  lastCheckedAt   DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  videoSnapshot   VideoSnapshot?
  analysisResult  AnalysisResult?
}

model VideoSnapshot {
  id             String   @id @default(cuid())
  channelId      String   @unique
  youtubeVideoId String
  title          String
  videoUrl       String
  publishedAt    DateTime
  thumbnailUrl   String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  channel        Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
}

model AnalysisResult {
  id             String   @id @default(cuid())
  channelId      String   @unique
  videoSnapshotId String?
  status         String
  summary        String?
  insight1       String?
  insight2       String?
  insight3       String?
  errorMessage   String?
  processedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  channel        Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
}
```

```ts
// src/server/db/client.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

```ts
// src/server/db/repositories/channel-repository.ts
import { db } from '../client';

export const channelRepository = {
  list: () => db.channel.findMany({ orderBy: { createdAt: 'asc' } }),
  listForDashboard: () =>
    db.channel.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        videoSnapshot: true,
        analysisResult: true,
      },
    }),
  findByYoutubeChannelId: (youtubeChannelId: string) =>
    db.channel.findUnique({ where: { youtubeChannelId } }),
  create: (input: {
    channelUrl: string;
    youtubeChannelId: string;
    title: string;
    thumbnailUrl?: string | null;
  }) =>
    db.channel.create({
      data: input,
    }),
  touchLastCheckedAt: (channelId: string) =>
    db.channel.update({
      where: { id: channelId },
      data: { lastCheckedAt: new Date() },
    }),
};
```

```ts
// src/server/db/repositories/video-snapshot-repository.ts
import { db } from '../client';

export const videoSnapshotRepository = {
  findByChannelId: (channelId: string) =>
    db.videoSnapshot.findUnique({ where: { channelId } }),
  replaceLatest: (
    channelId: string,
    input: {
      youtubeVideoId: string;
      title: string;
      videoUrl: string;
      publishedAt: Date;
      thumbnailUrl?: string | null;
    },
  ) =>
    db.videoSnapshot.upsert({
      where: { channelId },
      create: { channelId, ...input },
      update: input,
    }),
};
```

```ts
// src/server/db/repositories/analysis-result-repository.ts
import { db } from '../client';

export const analysisResultRepository = {
  findByChannelId: (channelId: string) =>
    db.analysisResult.findUnique({ where: { channelId } }),
  upsertStatus: (
    channelId: string,
    status: string,
    errorMessage?: string,
  ) =>
    db.analysisResult.upsert({
      where: { channelId },
      create: {
        channelId,
        status,
        errorMessage,
        processedAt: new Date(),
      },
      update: {
        status,
        errorMessage,
        processedAt: new Date(),
      },
    }),
  replaceLatest: (
    channelId: string,
    input: {
      videoSnapshotId: string;
      status: string;
      summary: string;
      insight1: string;
      insight2: string;
      insight3: string;
    },
  ) =>
    db.analysisResult.upsert({
      where: { channelId },
      create: {
        channelId,
        ...input,
        processedAt: new Date(),
        errorMessage: null,
      },
      update: {
        ...input,
        processedAt: new Date(),
        errorMessage: null,
      },
    }),
};
```

- [ ] **Step 4: Add the collection status constants**

```ts
// src/server/collection/collection-status.ts
export const COLLECTION_STATUSES = {
  idle: 'Idle',
  collecting: 'Collecting',
  completed: 'Completed',
  noCaptions: 'No Captions',
  noChange: 'No Change',
  failed: 'Failed',
} as const;

export type CollectionStatus =
  (typeof COLLECTION_STATUSES)[keyof typeof COLLECTION_STATUSES];

export function isTerminalCollectionStatus(status: CollectionStatus) {
  return status !== COLLECTION_STATUSES.collecting;
}
```

- [ ] **Step 5: Generate Prisma client and rerun the test**

Run: `pnpm prisma generate`

Run: `pnpm vitest run src/server/collection/collection-status.test.ts`

Expected: PASS with `2 passed`.

- [ ] **Step 6: Create the initial migration**

Run: `pnpm prisma migrate dev --name init`

Expected: Prisma creates the SQLite database, migration files, and generated client successfully.

- [ ] **Step 7: Commit the schema layer**

```bash
git add prisma/schema.prisma prisma/migrations src/server/db/client.ts src/server/db/repositories/channel-repository.ts src/server/db/repositories/video-snapshot-repository.ts src/server/db/repositories/analysis-result-repository.ts src/server/collection/collection-status.ts src/server/collection/collection-status.test.ts
git commit -m "feat: add persistence schema and status model"
```

## Task 3: Implement Channel URL Normalization and Registration

**Files:**
- Create: `src/server/youtube/types.ts`
- Create: `src/server/youtube/channel-url.ts`
- Create: `src/app/actions/register-channel.ts`
- Create: `src/server/youtube/channel-url.test.ts`
- Create: `src/app/actions/register-channel.test.ts`
- Modify: `src/server/db/repositories/channel-repository.ts`

- [ ] **Step 1: Write the failing URL normalization tests**

```ts
// src/server/youtube/channel-url.test.ts
import { describe, expect, it } from 'vitest';
import { normalizeChannelInput } from './channel-url';

describe('normalizeChannelInput', () => {
  it('accepts channel URLs', () => {
    expect(
      normalizeChannelInput('https://www.youtube.com/channel/UC123456789'),
    ).toEqual({ kind: 'channelId', value: 'UC123456789' });
  });

  it('accepts handle URLs', () => {
    expect(
      normalizeChannelInput('https://www.youtube.com/@openai'),
    ).toEqual({ kind: 'handle', value: '@openai' });
  });

  it('rejects non-youtube URLs', () => {
    expect(() => normalizeChannelInput('https://example.com')).toThrow(
      '유효한 유튜브 채널 URL이 아닙니다',
    );
  });
});
```

- [ ] **Step 2: Write the failing registration action test**

```ts
// src/app/actions/register-channel.test.ts
import { describe, expect, it, vi } from 'vitest';
import { registerChannel } from './register-channel';

vi.mock('@/server/youtube/youtube-api', () => ({
  youtubeApi: {
    resolveChannel: vi.fn().mockResolvedValue({
      youtubeChannelId: 'UC123',
      title: 'OpenAI',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      canonicalUrl: 'https://www.youtube.com/channel/UC123',
    }),
  },
}));

describe('registerChannel', () => {
  it('returns an existing record when the canonical channel is already stored', async () => {
    const result = await registerChannel({
      channelUrl: 'https://www.youtube.com/@openai',
    });

    expect(result.ok).toBe(true);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm vitest run src/server/youtube/channel-url.test.ts src/app/actions/register-channel.test.ts`

Expected: FAIL because the normalization logic and action do not exist yet.

- [ ] **Step 4: Implement URL parsing and channel registration**

```ts
// src/server/youtube/types.ts
export type NormalizedChannelInput =
  | { kind: 'channelId'; value: string }
  | { kind: 'handle'; value: string };
```

```ts
// src/server/youtube/channel-url.ts
import type { NormalizedChannelInput } from './types';

export function normalizeChannelInput(input: string): NormalizedChannelInput {
  const url = new URL(input.trim());

  if (!url.hostname.includes('youtube.com')) {
    throw new Error('유효한 유튜브 채널 URL이 아닙니다');
  }

  if (url.pathname.startsWith('/channel/')) {
    return { kind: 'channelId', value: url.pathname.replace('/channel/', '') };
  }

  if (url.pathname.startsWith('/@')) {
    return { kind: 'handle', value: url.pathname.slice(1) };
  }

  throw new Error('지원하지 않는 유튜브 채널 URL 형식입니다');
}
```

```ts
// src/app/actions/register-channel.ts
'use server';

import { revalidatePath } from 'next/cache';
import { channelRepository } from '@/server/db/repositories/channel-repository';
import { normalizeChannelInput } from '@/server/youtube/channel-url';
import { youtubeApi } from '@/server/youtube/youtube-api';

export async function registerChannel(input: { channelUrl: string }) {
  const normalized = normalizeChannelInput(input.channelUrl);
  const resolved = await youtubeApi.resolveChannel(normalized);
  const existing = await channelRepository.findByYoutubeChannelId(
    resolved.youtubeChannelId,
  );

  if (existing) {
    return { ok: true, channel: existing, created: false };
  }

  const created = await channelRepository.create({
    channelUrl: input.channelUrl,
    youtubeChannelId: resolved.youtubeChannelId,
    title: resolved.title,
    thumbnailUrl: resolved.thumbnailUrl,
  });

  revalidatePath('/');

  return { ok: true, channel: created, created: true };
}
```

- [ ] **Step 5: Rerun the tests**

Run: `pnpm vitest run src/server/youtube/channel-url.test.ts src/app/actions/register-channel.test.ts`

Expected: PASS with all tests green.

- [ ] **Step 6: Commit the registration flow**

```bash
git add src/server/youtube/types.ts src/server/youtube/channel-url.ts src/server/youtube/channel-url.test.ts src/app/actions/register-channel.ts src/app/actions/register-channel.test.ts src/server/db/repositories/channel-repository.ts
git commit -m "feat: add channel registration flow"
```

## Task 4: Implement Transcript Analysis Output Validation

**Files:**
- Create: `src/server/analysis/analysis-schema.ts`
- Create: `src/server/analysis/analysis-schema.test.ts`
- Create: `src/server/analysis/analysis-service.ts`

- [ ] **Step 1: Write the failing schema test**

```ts
// src/server/analysis/analysis-schema.test.ts
import { describe, expect, it } from 'vitest';
import { analysisResultSchema } from './analysis-schema';

describe('analysisResultSchema', () => {
  it('accepts the expected summary payload', () => {
    const parsed = analysisResultSchema.parse({
      summary: '이 영상은 모델 평가 자동화를 설명한다.',
      insights: ['평가 기준이 중요하다', '반복 가능성이 핵심이다', '자동화는 추적 가능해야 한다'],
    });

    expect(parsed.insights).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/server/analysis/analysis-schema.test.ts`

Expected: FAIL because the schema file does not exist.

- [ ] **Step 3: Implement schema validation and analysis wrapper**

```ts
// src/server/analysis/analysis-schema.ts
import { z } from 'zod';

export const analysisResultSchema = z.object({
  summary: z.string().min(1),
  insights: z.array(z.string().min(1)).length(3),
});

export type AnalysisResultPayload = z.infer<typeof analysisResultSchema>;
```

```ts
// src/server/analysis/analysis-service.ts
import OpenAI from 'openai';
import { analysisResultSchema } from './analysis-schema';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analysisService = {
  async summarizeTranscript(transcript: string) {
    const response = await client.responses.create({
      model: 'gpt-5.4',
      input: [
        {
          role: 'system',
          content:
            'Summarize the transcript in Korean and return JSON with summary and exactly three insights.',
        },
        { role: 'user', content: transcript },
      ],
    });

    const text = response.output_text;
    return analysisResultSchema.parse(JSON.parse(text));
  },
};
```

- [ ] **Step 4: Rerun the test**

Run: `pnpm vitest run src/server/analysis/analysis-schema.test.ts`

Expected: PASS with `1 passed`.

- [ ] **Step 5: Commit the analysis boundary**

```bash
git add src/server/analysis/analysis-schema.ts src/server/analysis/analysis-schema.test.ts src/server/analysis/analysis-service.ts
git commit -m "feat: add analysis schema and service wrapper"
```

## Task 5: Implement the Manual Collection Orchestrator

**Files:**
- Create: `src/server/youtube/youtube-api.ts`
- Create: `src/server/transcripts/transcript-service.ts`
- Create: `src/server/collection/collect-latest-video.ts`
- Create: `src/server/collection/collect-latest-video.test.ts`
- Modify: `src/server/db/repositories/video-snapshot-repository.ts`
- Modify: `src/server/db/repositories/analysis-result-repository.ts`
- Modify: `src/server/db/repositories/channel-repository.ts`

- [ ] **Step 1: Write the failing collection orchestration test**

```ts
// src/server/collection/collect-latest-video.test.ts
import { describe, expect, it, vi } from 'vitest';
import { collectLatestVideo } from './collect-latest-video';

vi.mock('@/server/youtube/youtube-api', () => ({
  youtubeApi: {
    fetchLatestVideo: vi.fn().mockResolvedValue({
      youtubeVideoId: 'video-2',
      title: 'New Video',
      videoUrl: 'https://youtube.com/watch?v=video-2',
      publishedAt: new Date('2026-04-02T00:00:00.000Z'),
      thumbnailUrl: 'https://example.com/video.jpg',
    }),
  },
}));

vi.mock('@/server/transcripts/transcript-service', () => ({
  transcriptService: {
    getTranscript: vi.fn().mockResolvedValue('transcript text'),
  },
}));

vi.mock('@/server/analysis/analysis-service', () => ({
  analysisService: {
    summarizeTranscript: vi.fn().mockResolvedValue({
      summary: '요약',
      insights: ['인사이트 1', '인사이트 2', '인사이트 3'],
    }),
  },
}));

describe('collectLatestVideo', () => {
  it('completes analysis for a new captioned video', async () => {
    const result = await collectLatestVideo({
      channelId: 'channel-1',
      youtubeChannelId: 'UC123',
    });

    expect(result.status).toBe('Completed');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/server/collection/collect-latest-video.test.ts`

Expected: FAIL because the orchestrator does not exist.

- [ ] **Step 3: Implement the orchestrator with explicit state transitions**

```ts
// src/server/collection/collect-latest-video.ts
import { analysisService } from '@/server/analysis/analysis-service';
import {
  COLLECTION_STATUSES,
  type CollectionStatus,
} from '@/server/collection/collection-status';
import { analysisResultRepository } from '@/server/db/repositories/analysis-result-repository';
import { channelRepository } from '@/server/db/repositories/channel-repository';
import { videoSnapshotRepository } from '@/server/db/repositories/video-snapshot-repository';
import { transcriptService } from '@/server/transcripts/transcript-service';
import { youtubeApi } from '@/server/youtube/youtube-api';

export async function collectLatestVideo(input: {
  channelId: string;
  youtubeChannelId: string;
}): Promise<{ status: CollectionStatus; message?: string }> {
  const current = await analysisResultRepository.findByChannelId(input.channelId);

  if (current?.status === COLLECTION_STATUSES.collecting) {
    return { status: COLLECTION_STATUSES.collecting, message: '이미 수집 중입니다' };
  }

  await analysisResultRepository.upsertStatus(input.channelId, COLLECTION_STATUSES.collecting);

  try {
    const latest = await youtubeApi.fetchLatestVideo(input.youtubeChannelId);
    const previous = await videoSnapshotRepository.findByChannelId(input.channelId);

    if (previous?.youtubeVideoId === latest.youtubeVideoId) {
      await analysisResultRepository.upsertStatus(input.channelId, COLLECTION_STATUSES.noChange);
      await channelRepository.touchLastCheckedAt(input.channelId);
      return { status: COLLECTION_STATUSES.noChange, message: '새 영상이 없습니다' };
    }

    const transcript = await transcriptService.getTranscript(latest.youtubeVideoId);

    if (!transcript) {
      await analysisResultRepository.upsertStatus(
        input.channelId,
        COLLECTION_STATUSES.noCaptions,
        '이 영상은 자막이 없어 분석하지 않았습니다',
      );
      await channelRepository.touchLastCheckedAt(input.channelId);
      return {
        status: COLLECTION_STATUSES.noCaptions,
        message: '이 영상은 자막이 없어 분석하지 않았습니다',
      };
    }

    const analyzed = await analysisService.summarizeTranscript(transcript);

    const snapshot = await videoSnapshotRepository.replaceLatest(input.channelId, latest);

    await analysisResultRepository.replaceLatest(input.channelId, {
      videoSnapshotId: snapshot.id,
      status: COLLECTION_STATUSES.completed,
      summary: analyzed.summary,
      insight1: analyzed.insights[0],
      insight2: analyzed.insights[1],
      insight3: analyzed.insights[2],
    });

    await channelRepository.touchLastCheckedAt(input.channelId);

    return { status: COLLECTION_STATUSES.completed };
  } catch {
    await analysisResultRepository.upsertStatus(
      input.channelId,
      COLLECTION_STATUSES.failed,
      '처리 중 오류가 발생했습니다',
    );
    await channelRepository.touchLastCheckedAt(input.channelId);
    return { status: COLLECTION_STATUSES.failed, message: '처리 중 오류가 발생했습니다' };
  }
}
```

- [ ] **Step 4: Add transcript and YouTube integration interfaces**

```ts
// src/server/youtube/youtube-api.ts
import type { NormalizedChannelInput } from './types';

export const youtubeApi = {
  async resolveChannel(input: NormalizedChannelInput) {
    throw new Error(`YouTube channel adapter is not configured for ${input.kind}`);
  },

  async fetchLatestVideo(youtubeChannelId: string) {
    throw new Error(`YouTube latest-video adapter is not configured for ${youtubeChannelId}`);
  },
};
```

```ts
// src/server/transcripts/transcript-service.ts
export const transcriptService = {
  async getTranscript(youtubeVideoId: string): Promise<string | null> {
    throw new Error(`Transcript adapter is not configured for ${youtubeVideoId}`);
  },
};
```

- [ ] **Step 5: Rerun the orchestrator test**

Run: `pnpm vitest run src/server/collection/collect-latest-video.test.ts`

Expected: PASS with the orchestration path reaching `Completed`.

- [ ] **Step 6: Commit the collection flow**

```bash
git add src/server/youtube/youtube-api.ts src/server/transcripts/transcript-service.ts src/server/collection/collect-latest-video.ts src/server/collection/collect-latest-video.test.ts src/server/db/repositories/channel-repository.ts src/server/db/repositories/video-snapshot-repository.ts src/server/db/repositories/analysis-result-repository.ts
git commit -m "feat: add manual collection orchestrator"
```

## Task 6: Wire Server Actions to the Dashboard UI

**Files:**
- Create: `src/app/actions/collect-channel.ts`
- Create: `src/components/channel-registration-form.tsx`
- Create: `src/components/channel-list.tsx`
- Create: `src/components/channel-card.tsx`
- Create: `src/components/result-detail-panel.tsx`
- Create: `src/components/status-badge.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`
- Test: `src/app/actions/collect-channel.test.ts`

- [ ] **Step 1: Extend the failing UI test to cover the primary sections**

```tsx
// src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renders registration, channel list, and result detail sections', async () => {
    render(await HomePage());

    expect(
      screen.getByRole('heading', { name: /youtube research dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/채널 등록/i)).toBeInTheDocument();
    expect(screen.getByText(/등록된 채널/i)).toBeInTheDocument();
    expect(screen.getByText(/최신 분석 결과/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write the failing collect action test**

```ts
// src/app/actions/collect-channel.test.ts
import { describe, expect, it, vi } from 'vitest';
import { collectChannel } from './collect-channel';

vi.mock('@/server/collection/collect-latest-video', () => ({
  collectLatestVideo: vi.fn().mockResolvedValue({ status: 'Completed' }),
}));

describe('collectChannel', () => {
  it('returns the completed status from the orchestrator', async () => {
    const result = await collectChannel({
      channelId: 'channel-1',
      youtubeChannelId: 'UC123',
    });

    expect(result.status).toBe('Completed');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm vitest run src/app/page.test.tsx src/app/actions/collect-channel.test.ts`

Expected: FAIL because the dashboard sections and collect action do not exist yet.

- [ ] **Step 4: Implement the server action and UI components**

```ts
// src/app/actions/collect-channel.ts
'use server';

import { revalidatePath } from 'next/cache';
import { collectLatestVideo } from '@/server/collection/collect-latest-video';

export async function collectChannel(input: {
  channelId: string;
  youtubeChannelId: string;
}) {
  const result = await collectLatestVideo(input);
  revalidatePath('/');
  return result;
}
```

```tsx
// src/components/channel-card.tsx
import { collectChannel } from '@/app/actions/collect-channel';
import { StatusBadge } from './status-badge';

export function ChannelCard({
  channel,
}: {
  channel: {
    id: string;
    title: string;
    youtubeChannelId: string;
    status: string;
  };
}) {
  return (
    <article>
      <h3>{channel.title}</h3>
      <StatusBadge status={channel.status} />
      <form action={collectChannel.bind(null, {
        channelId: channel.id,
        youtubeChannelId: channel.youtubeChannelId,
      })}>
        <button type="submit">지금 수집</button>
      </form>
    </article>
  );
}
```

```tsx
// src/app/page.tsx
import { channelRepository } from '@/server/db/repositories/channel-repository';
import { ChannelRegistrationForm } from '@/components/channel-registration-form';
import { ChannelList } from '@/components/channel-list';
import { ResultDetailPanel } from '@/components/result-detail-panel';

export default async function HomePage() {
  const channels = await channelRepository.listForDashboard();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">YouTube Research Dashboard</h1>
        <p className="text-sm text-slate-600">
          등록한 유튜브 채널의 최신 영상을 수동으로 수집하고 한국어 요약을 확인합니다.
        </p>
      </header>

      <section>
        <h2>채널 등록</h2>
        <ChannelRegistrationForm />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2>등록된 채널</h2>
          <ChannelList channels={channels} />
        </div>
        <div>
          <h2>최신 분석 결과</h2>
          <ResultDetailPanel channel={channels[0] ?? null} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Rerun the tests**

Run: `pnpm vitest run src/app/page.test.tsx src/app/actions/collect-channel.test.ts`

Expected: PASS with both UI and action tests green.

- [ ] **Step 6: Commit the dashboard UI**

```bash
git add src/app/actions/collect-channel.ts src/components/channel-registration-form.tsx src/components/channel-list.tsx src/components/channel-card.tsx src/components/result-detail-panel.tsx src/components/status-badge.tsx src/app/page.tsx src/app/page.test.tsx src/app/actions/collect-channel.test.ts
git commit -m "feat: add dashboard UI and collect action"
```

## Task 7: Finish Provider Integrations and Environment Wiring

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `src/server/youtube/youtube-api.ts`
- Modify: `src/server/transcripts/transcript-service.ts`
- Modify: `src/server/analysis/analysis-service.ts`
- Test: `src/server/collection/collect-latest-video.test.ts`

- [ ] **Step 1: Write the failing no-captions branch test**

```ts
// src/server/collection/collect-latest-video.test.ts
it('returns No Captions when the latest video has no transcript', async () => {
  transcriptService.getTranscript.mockResolvedValueOnce(null);

  const result = await collectLatestVideo({
    channelId: 'channel-1',
    youtubeChannelId: 'UC123',
  });

  expect(result.status).toBe('No Captions');
  expect(result.message).toContain('자막');
});
```

- [ ] **Step 2: Run the test to verify the branch is missing or incomplete**

Run: `pnpm vitest run src/server/collection/collect-latest-video.test.ts`

Expected: FAIL if the no-caption branch or mocks are not fully wired.

- [ ] **Step 3: Replace provider stubs with real adapters**

```ts
// src/server/youtube/youtube-api.ts
import { google } from 'googleapis';
import type { NormalizedChannelInput } from './types';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export const youtubeApi = {
  async resolveChannel(input: NormalizedChannelInput) {
    if (input.kind === 'channelId') {
      const response = await youtube.channels.list({
        id: [input.value],
        part: ['snippet'],
      });

      const channel = response.data.items?.[0];
      if (!channel?.id || !channel.snippet?.title) {
        throw new Error('채널 정보를 가져오지 못했습니다');
      }

      return {
        youtubeChannelId: channel.id,
        title: channel.snippet.title,
        thumbnailUrl: channel.snippet.thumbnails?.default?.url ?? null,
        canonicalUrl: `https://www.youtube.com/channel/${channel.id}`,
      };
    }

    const response = await youtube.search.list({
      q: input.value,
      type: ['channel'],
      part: ['snippet'],
      maxResults: 1,
    });

    const item = response.data.items?.[0];
    const channelId = item?.snippet?.channelId;

    if (!channelId || !item.snippet?.channelTitle) {
      throw new Error('채널 정보를 가져오지 못했습니다');
    }

    return {
      youtubeChannelId: channelId,
      title: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.default?.url ?? null,
      canonicalUrl: `https://www.youtube.com/channel/${channelId}`,
    };
  },

  async fetchLatestVideo(youtubeChannelId: string) {
    const response = await youtube.search.list({
      channelId: youtubeChannelId,
      order: 'date',
      type: ['video'],
      part: ['snippet'],
      maxResults: 1,
    });

    const item = response.data.items?.[0];
    const videoId = item?.id?.videoId;

    if (!videoId || !item.snippet?.title || !item.snippet.publishedAt) {
      throw new Error('새 영상을 가져오지 못했습니다');
    }

    return {
      youtubeVideoId: videoId,
      title: item.snippet.title,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      publishedAt: new Date(item.snippet.publishedAt),
      thumbnailUrl: item.snippet.thumbnails?.high?.url ?? null,
    };
  },
};
```

```ts
// src/server/transcripts/transcript-service.ts
import { YoutubeTranscript } from 'youtube-transcript';

export const transcriptService = {
  async getTranscript(youtubeVideoId: string) {
    const items = await YoutubeTranscript.fetchTranscript(youtubeVideoId).catch(
      () => null,
    );

    if (!items?.length) {
      return null;
    }

    return items.map((item) => item.text).join(' ');
  },
};
```

- [ ] **Step 4: Document and verify environment requirements**

```env
# .env.example
DATABASE_URL="file:./dev.db"
YOUTUBE_API_KEY=""
OPENAI_API_KEY=""
```

Run: `pnpm vitest run src/server/collection/collect-latest-video.test.ts`

Expected: PASS with both success and `No Captions` branches covered.

- [ ] **Step 5: Commit the provider adapters**

```bash
git add .env.example README.md src/server/youtube/youtube-api.ts src/server/transcripts/transcript-service.ts src/server/analysis/analysis-service.ts src/server/collection/collect-latest-video.test.ts
git commit -m "feat: connect YouTube, transcript, and analysis providers"
```

## Task 8: Final Verification and Delivery Readiness

**Files:**
- Modify: `README.md`
- Test: `src/app/page.test.tsx`
- Test: `src/server/youtube/channel-url.test.ts`
- Test: `src/server/collection/collection-status.test.ts`
- Test: `src/server/analysis/analysis-schema.test.ts`
- Test: `src/server/collection/collect-latest-video.test.ts`
- Test: `src/app/actions/register-channel.test.ts`
- Test: `src/app/actions/collect-channel.test.ts`

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`

Expected: PASS with all unit and integration tests green.

- [ ] **Step 2: Run lint and production build**

Run: `pnpm lint`

Run: `pnpm build`

Expected: both commands succeed without type, lint, or route errors.

- [ ] **Step 3: Manually verify the dashboard**

Run: `pnpm dev`

Expected manual checklist:

- channel URL registration works
- duplicate channel registration does not create a second record
- `지금 수집` updates the status to `Collecting`
- a new video with captions stores summary plus three insights
- a new video without captions shows `No Captions`
- selecting a channel shows only its latest stored result

- [ ] **Step 4: Update the README with run instructions**

```md
## Development

1. Copy `.env.example` to `.env`
2. Run `pnpm install`
3. Run `pnpm prisma migrate dev`
4. Run `pnpm dev`
5. Open `http://localhost:3000`

## Testing

- `pnpm test`
- `pnpm lint`
- `pnpm build`
```

- [ ] **Step 5: Commit the verification pass**

```bash
git add README.md
git commit -m "docs: finalize setup and verification guide"
```

## Self-Review

### Spec coverage

- Channel registration by URL: covered in Task 3 and Task 6
- Manual collection trigger: covered in Task 5 and Task 6
- Latest video comparison: covered in Task 5
- Caption-only transcript policy: covered in Task 5 and Task 7
- Korean summary plus three insights: covered in Task 4 and Task 5
- Latest-result-only retention: covered in Task 2 and Task 5
- Simple dashboard UI: covered in Task 1 and Task 6
- Error and status messaging: covered in Task 2, Task 5, and Task 6
- Testing scope: covered across Tasks 1 through 8

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation markers remain in the plan body.
- Each code-writing task includes concrete file paths, code skeletons, commands, and expected outcomes.

### Type consistency

- Status strings consistently use the `COLLECTION_STATUSES` constants.
- Registration flow uses `youtubeChannelId`, `channelUrl`, and `thumbnailUrl` consistently across repositories, actions, and UI.
- Analysis flow uses `summary` and `insights` in the provider boundary, then maps them to `insight1`, `insight2`, and `insight3` in persistence.

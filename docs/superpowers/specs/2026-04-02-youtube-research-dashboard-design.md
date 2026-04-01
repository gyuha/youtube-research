# YouTube Research Dashboard Design

## Overview

This document defines the MVP design for a personal internal web dashboard that collects the latest video from registered YouTube channels on demand, fetches the video's transcript when captions are available, and produces a Korean summary plus key insights.

The product is intentionally scoped as a simple single-user tool. It does not include background monitoring, multi-user support, audio transcription fallback, or historical result retention.

## Goals

- Let the user register YouTube channels by channel URL
- Let the user manually trigger collection for a registered channel
- Detect whether the latest channel video is new since the last successful collection
- Fetch transcript text only when YouTube captions are available
- Generate Korean summary output and three key insights
- Show only the latest collected result per channel in a dashboard

## Non-Goals

- Automatic polling or webhook-based video monitoring
- User authentication or authorization
- Team collaboration features
- Transcript generation from raw audio
- Long-term history of analyzed videos
- Advanced filtering, search, or tagging

## Approved Product Decisions

- Product type: personal internal tool
- Collection trigger: manual button click from dashboard
- Transcript policy: analyze only when YouTube captions are available
- Output language: Korean, regardless of source language
- Analysis depth: basic output only
- Retention policy: keep only the latest result per channel
- Channel registration: channel URL paste

## Architecture

The system will be implemented as a single Next.js application using the App Router. The application will contain the dashboard UI, server-side API/actions, persistence layer, and collection/analysis orchestration in one codebase.

The internal architecture will be split into clear modules so the MVP stays simple while preserving a path to later worker extraction:

- `channel registry`: stores and manages registered channels
- `youtube collector`: resolves a channel and fetches its latest video
- `transcript fetcher`: checks caption availability and retrieves transcript text
- `analysis service`: generates Korean summary and three key insights
- `result store`: persists latest video snapshot and analysis result

This keeps deployment and development simple while preventing the collection logic from becoming tangled with the UI layer.

## User Experience

The dashboard has three main areas:

### 1. Channel Registration

The user pastes a YouTube channel URL and clicks a register button. Once registered, the dashboard shows the channel in the channel list with basic metadata such as channel name, thumbnail, and last checked time.

If the same YouTube channel is registered again through a different equivalent URL form, the application should resolve it to the same canonical YouTube channel ID and avoid creating duplicate channel records.

### 2. Channel List

Each registered channel appears as a card or row with:

- channel name
- channel thumbnail
- last checked timestamp
- current status
- `Collect Now` button

The status vocabulary is intentionally small:

- `Idle`
- `Collecting`
- `Completed`
- `No Captions`
- `No Change`
- `Failed`

### 3. Result Detail

When a channel is selected, the dashboard shows the latest stored result for that channel:

- video title
- channel name
- publish date
- video URL
- Korean summary in 3 to 5 lines
- three key insights

If there is no successful result yet, the detail panel should show an empty state with the most recent status message.

## Data Model

The MVP uses three core entities.

### Channel

Stores the registered YouTube channel and dashboard-facing metadata.

Suggested fields:

- `id`
- `channelUrl`
- `youtubeChannelId`
- `title`
- `thumbnailUrl`
- `lastCheckedAt`
- `createdAt`
- `updatedAt`

### VideoSnapshot

Stores the latest known video for a channel.

Suggested fields:

- `id`
- `channelId`
- `youtubeVideoId`
- `title`
- `videoUrl`
- `publishedAt`
- `thumbnailUrl`
- `createdAt`
- `updatedAt`

### AnalysisResult

Stores the latest processing outcome for the channel's latest video.

Suggested fields:

- `id`
- `channelId`
- `videoSnapshotId`
- `status`
- `summary`
- `insight1`
- `insight2`
- `insight3`
- `errorMessage`
- `processedAt`
- `createdAt`
- `updatedAt`

## Retention Rules

Retention is intentionally simple:

- each channel keeps only one latest `VideoSnapshot`
- each channel keeps only one latest `AnalysisResult`
- when a newer video is successfully processed, the stored snapshot and result are updated or replaced
- when no newer video exists, the existing result remains visible and the status is updated to `No Change`

This minimizes storage complexity and keeps the dashboard focused on the newest actionable result.

## Processing Flow

When the user clicks `Collect Now`, the server handles the request synchronously for the MVP.

1. Resolve the registered channel and fetch the latest video from YouTube
2. Compare the fetched video ID against the currently stored latest video ID
3. If the video is unchanged, record `No Change` and stop
4. If the video is new, check whether captions are available
5. If captions are unavailable, record `No Captions` and stop
6. If captions exist, fetch the transcript text
7. Send the transcript to the analysis service
8. Generate Korean summary output plus three key insights
9. Store the updated `VideoSnapshot` and `AnalysisResult`
10. Mark the channel as `Completed`

This flow is intentionally button-driven and request-scoped. If future processing time grows, this orchestration can move behind a queue with minimal changes to the current module boundaries.

For the MVP, the application should reject or ignore overlapping collection requests for the same channel while that channel is already in the `Collecting` state. This keeps the status model simple and avoids conflicting writes to the latest result.

## Error Handling

User-facing errors stay simple and explicit:

- Channel lookup failure: `채널 정보를 가져오지 못했습니다`
- No new video: `새 영상이 없습니다`
- No captions: `이 영상은 자막이 없어 분석하지 않았습니다`
- Analysis failure: `요약 생성에 실패했습니다`
- Unexpected failure: `처리 중 오류가 발생했습니다`

The dashboard should surface the current status and the latest error message for each channel without exposing raw stack traces.

## Technical Stack

Recommended MVP stack:

- `Next.js` App Router
- `TypeScript`
- `Prisma`
- `SQLite` for initial local persistence
- `Tailwind CSS`
- `OpenAI API` for summary and insight generation
- `YouTube Data API` for channel and latest video lookup
- a transcript retrieval module or library that reads YouTube caption transcripts when available

The persistence layer should be designed so the database can be upgraded from SQLite to PostgreSQL later without changing the product design.

## API and Module Boundaries

The exact route structure may change during implementation, but the architectural boundaries should remain stable.

Suggested responsibilities:

- UI layer: registration form, channel list, detail panel, status rendering
- server action or API endpoint for channel registration
- server action or API endpoint for manual collection
- repository layer for `Channel`, `VideoSnapshot`, and `AnalysisResult`
- service layer for YouTube lookup, transcript retrieval, and analysis orchestration

The UI should never call provider SDKs directly. External integrations remain on the server side.

## State and Status Behavior

The UI should reflect processing in a way that is legible for a single user:

- set status to `Collecting` immediately when collection starts
- replace status with the terminal state when processing finishes
- keep the previous successful result visible until a newer successful result replaces it
- if a new video is found but captions are unavailable, update status and do not erase the previous successful summary

This preserves continuity and avoids blanking out useful data during failed or partial runs.

## Testing Scope

The MVP test scope has three layers.

### Unit Tests

Validate pure logic such as:

- latest video comparison
- status transitions
- analysis output parsing and normalization

### Integration Tests

Validate the main flow:

- channel registration
- manual collection
- new video detection
- no-caption handling
- successful persistence of latest result

### Minimal UI Verification

Verify:

- channel URL registration flow
- `Collect Now` action
- status rendering
- latest result detail rendering

The MVP does not require exhaustive end-to-end coverage beyond these flows.

## Security and Operational Notes

- Store API keys in environment variables
- Keep all provider calls on the server
- Rate limiting is optional for the first internal-only version
- Log operational failures in a developer-readable format on the server side
- Avoid storing unnecessary transcript history beyond the latest analyzed video

## Future Expansion Path

The approved MVP intentionally leaves room for later additions:

- scheduled automatic collection
- webhook or push-based ingestion
- audio transcription fallback when captions are unavailable
- historical result retention per channel
- filtering, search, and tags
- multi-user accounts and permissions
- queue-based background processing

These are out of scope for the first implementation and should not be partially introduced during MVP delivery.

## Success Criteria

The MVP is successful when:

- a user can register a channel by URL
- the dashboard lists registered channels
- clicking `Collect Now` checks the channel's newest video
- a new video with captions produces Korean summary output and three insights
- a new video without captions is clearly marked and not analyzed
- the dashboard always shows only the latest stored result for each channel

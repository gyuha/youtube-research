import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResultDetailPanel } from './result-detail-panel';

describe('ResultDetailPanel', () => {
  it('prefers the latest error message over a stale summary', () => {
    render(
      <ResultDetailPanel
        channel={{
          analysisResult: {
            errorMessage: '처리 중 오류가 발생했습니다',
            insight1: null,
            insight2: null,
            insight3: null,
            processedAt: new Date('2026-04-02T12:00:00.000Z'),
            status: 'Failed',
            summary: '이전 요약',
          },
          channelUrl: 'https://www.youtube.com/channel/UC123',
          createdAt: new Date('2026-04-01T10:00:00.000Z'),
          id: 'channel-1',
          lastCheckedAt: new Date('2026-04-02T12:00:00.000Z'),
          thumbnailUrl: null,
          title: 'OpenAI',
          videoSnapshot: {
            publishedAt: new Date('2026-04-02T09:00:00.000Z'),
            thumbnailUrl: null,
            title: 'Latest Video',
            videoUrl: 'https://youtube.com/watch?v=video-1',
          },
          youtubeChannelId: 'UC123',
        }}
      />,
    );

    expect(screen.getByText('처리 중 오류가 발생했습니다')).toBeInTheDocument();
    expect(screen.queryByText('이전 요약')).not.toBeInTheDocument();
  });
});

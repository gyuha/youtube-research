import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  collectChannel: vi.fn(),
  listForDashboard: vi.fn(),
  registerChannel: vi.fn(),
}));

vi.mock('@/server/db/repositories/channel-repository', () => ({
  channelRepository: {
    listForDashboard: mocks.listForDashboard,
  },
}));

vi.mock('@/app/actions/collect-channel', () => ({
  collectChannel: mocks.collectChannel,
}));

vi.mock('@/app/actions/register-channel', () => ({
  registerChannel: mocks.registerChannel,
}));

describe('HomePage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard heading', async () => {
    mocks.listForDashboard.mockResolvedValue([]);

    const { default: HomePage } = await import('@/app/page');

    render(await HomePage());

    expect(
      screen.getByRole('heading', { name: /youtube research dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders registration, channel list, and result detail sections', async () => {
    mocks.listForDashboard.mockResolvedValue([
      {
        id: 'channel-1',
        channelUrl: 'https://www.youtube.com/channel/UC123',
        youtubeChannelId: 'UC123',
        title: 'OpenAI',
        thumbnailUrl: 'https://example.com/openai.jpg',
        lastCheckedAt: new Date('2026-04-02T09:00:00.000Z'),
        createdAt: new Date('2026-04-01T10:00:00.000Z'),
        updatedAt: new Date('2026-04-02T10:00:00.000Z'),
        analysisResult: {
          id: 'analysis-1',
          channelId: 'channel-1',
          videoSnapshotId: 'snapshot-1',
          status: 'Completed',
          summary: '한국어 요약입니다.',
          insight1: '인사이트 1',
          insight2: '인사이트 2',
          insight3: '인사이트 3',
          errorMessage: null,
          processedAt: new Date('2026-04-02T09:00:00.000Z'),
          createdAt: new Date('2026-04-02T10:00:00.000Z'),
          updatedAt: new Date('2026-04-02T10:00:00.000Z'),
        },
        videoSnapshot: {
          id: 'snapshot-1',
          channelId: 'channel-1',
          youtubeVideoId: 'video-1',
          title: 'GPT Update',
          videoUrl: 'https://youtube.com/watch?v=video-1',
          publishedAt: new Date('2026-04-01T08:00:00.000Z'),
          thumbnailUrl: 'https://example.com/video.jpg',
          createdAt: new Date('2026-04-02T10:00:00.000Z'),
          updatedAt: new Date('2026-04-02T10:00:00.000Z'),
        },
      },
      {
        id: 'channel-2',
        channelUrl: 'https://www.youtube.com/channel/UC999',
        youtubeChannelId: 'UC999',
        title: 'DeepMind',
        thumbnailUrl: 'https://example.com/deepmind.jpg',
        lastCheckedAt: new Date('2026-04-02T12:00:00.000Z'),
        createdAt: new Date('2026-03-30T10:00:00.000Z'),
        updatedAt: new Date('2026-04-02T12:00:00.000Z'),
        analysisResult: {
          id: 'analysis-2',
          channelId: 'channel-2',
          videoSnapshotId: 'snapshot-2',
          status: 'No Change',
          summary: '더 최신 결과입니다.',
          insight1: '핵심 1',
          insight2: '핵심 2',
          insight3: '핵심 3',
          errorMessage: null,
          processedAt: new Date('2026-04-02T12:00:00.000Z'),
          createdAt: new Date('2026-04-02T12:00:00.000Z'),
          updatedAt: new Date('2026-04-02T12:00:00.000Z'),
        },
        videoSnapshot: {
          id: 'snapshot-2',
          channelId: 'channel-2',
          youtubeVideoId: 'video-2',
          title: 'Gemini Update',
          videoUrl: 'https://youtube.com/watch?v=video-2',
          publishedAt: new Date('2026-04-02T11:00:00.000Z'),
          thumbnailUrl: 'https://example.com/video-2.jpg',
          createdAt: new Date('2026-04-02T12:00:00.000Z'),
          updatedAt: new Date('2026-04-02T12:00:00.000Z'),
        },
      },
    ]);

    const { default: HomePage } = await import('@/app/page');

    render(await HomePage());

    expect(
      screen.getByRole('heading', { name: /register channel/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /registered channels/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /latest result/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('OpenAI')).toHaveLength(1);
    expect(screen.getAllByText('DeepMind')).toHaveLength(2);
    expect(
      screen.getByRole('button', { name: /collect now for openai/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Gemini Update')).toBeInTheDocument();
    expect(screen.getByText('더 최신 결과입니다.')).toBeInTheDocument();
    expect(screen.queryByText('GPT Update')).not.toBeInTheDocument();
  });
});

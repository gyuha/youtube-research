import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  channelsList: vi.fn(),
  searchList: vi.fn(),
  youtube: vi.fn(),
}));

vi.mock('googleapis', () => ({
  google: {
    youtube: mocks.youtube,
  },
}));

describe('youtubeApi', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env.YOUTUBE_API_KEY;

    mocks.youtube.mockReturnValue({
      channels: { list: mocks.channelsList },
      search: { list: mocks.searchList },
    });
  });

  it('throws a normalized config error when YOUTUBE_API_KEY is missing', async () => {
    const { isProviderError } = await import('@/server/providers/provider-error');
    const { youtubeApi } = await import('./youtube-api');

    await expect(
      youtubeApi.resolveChannel({ kind: 'channelId', value: 'UC123' }),
    ).rejects.toSatisfy(
      (error: unknown) =>
        isProviderError(error) &&
        error.code === 'missing_configuration' &&
        error.provider === 'youtube' &&
        error.operation === 'createClient' &&
        error.message === 'YOUTUBE_API_KEY is required',
    );
  });

  it('resolves a channel handle into the normalized app shape', async () => {
    process.env.YOUTUBE_API_KEY = 'test-key';
    mocks.channelsList.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'UC123',
            snippet: {
              thumbnails: {
                default: { url: 'https://example.com/thumb.jpg' },
              },
              title: 'OpenAI',
            },
          },
        ],
      },
    });

    const { youtubeApi } = await import('./youtube-api');
    const result = await youtubeApi.resolveChannel({
      kind: 'handle',
      value: '@openai',
    });

    expect(mocks.youtube).toHaveBeenCalledWith({
      auth: 'test-key',
      version: 'v3',
    });
    expect(mocks.channelsList).toHaveBeenCalledWith({
      forHandle: 'openai',
      part: ['snippet'],
    });
    expect(result).toEqual({
      canonicalUrl: 'https://www.youtube.com/channel/UC123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      title: 'OpenAI',
      youtubeChannelId: 'UC123',
    });
  });

  it('throws a normalized not-found error when latest video data is incomplete', async () => {
    process.env.YOUTUBE_API_KEY = 'test-key';
    mocks.searchList.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: {},
            snippet: {
              publishedAt: '2026-04-02T00:00:00.000Z',
              title: 'Newest upload',
            },
          },
        ],
      },
    });

    const { isProviderError } = await import('@/server/providers/provider-error');
    const { youtubeApi } = await import('./youtube-api');

    await expect(youtubeApi.fetchLatestVideo('UC123')).rejects.toSatisfy(
      (error: unknown) =>
        isProviderError(error) &&
        error.code === 'not_found' &&
        error.provider === 'youtube' &&
        error.operation === 'fetchLatestVideo',
    );
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMissingConfigurationError } from '@/server/providers/provider-error';
import { registerChannel } from './register-channel';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findByYoutubeChannelId: vi.fn(),
  revalidatePath: vi.fn(),
  resolveChannel: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/server/db/repositories/channel-repository', () => ({
  channelRepository: {
    create: mocks.create,
    findByYoutubeChannelId: mocks.findByYoutubeChannelId,
  },
}));

vi.mock('@/server/youtube/youtube-api', () => ({
  youtubeApi: {
    resolveChannel: mocks.resolveChannel,
  },
}));

describe('registerChannel', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the existing record when the channel is already stored', async () => {
    const existingChannel = {
      id: 'channel-1',
      channelUrl: 'https://www.youtube.com/channel/UC123',
      youtubeChannelId: 'UC123',
      title: 'OpenAI',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    };

    mocks.resolveChannel.mockResolvedValue({
      canonicalUrl: 'https://www.youtube.com/channel/UC123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      title: 'OpenAI',
      youtubeChannelId: 'UC123',
    });
    mocks.findByYoutubeChannelId.mockResolvedValue(existingChannel);

    const result = await registerChannel({
      channelUrl: 'https://www.youtube.com/@openai',
    });

    expect(mocks.resolveChannel).toHaveBeenCalledWith({
      kind: 'handle',
      value: '@openai',
    });
    expect(mocks.findByYoutubeChannelId).toHaveBeenCalledWith('UC123');
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(result).toEqual({
      channel: existingChannel,
      created: false,
      ok: true,
    });
  });

  it('creates a new channel and revalidates the home page', async () => {
    const createdChannel = {
      id: 'channel-2',
      channelUrl: 'https://www.youtube.com/channel/UC123',
      youtubeChannelId: 'UC123',
      title: 'OpenAI',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    };

    mocks.resolveChannel.mockResolvedValue({
      canonicalUrl: 'https://www.youtube.com/channel/UC123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      title: 'OpenAI',
      youtubeChannelId: 'UC123',
    });
    mocks.findByYoutubeChannelId.mockResolvedValue(null);
    mocks.create.mockResolvedValue(createdChannel);

    const result = await registerChannel({
      channelUrl: 'https://www.youtube.com/@openai',
    });

    expect(mocks.create).toHaveBeenCalledWith({
      channelUrl: 'https://www.youtube.com/channel/UC123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      title: 'OpenAI',
      youtubeChannelId: 'UC123',
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
    expect(result).toEqual({
      channel: createdChannel,
      created: true,
      ok: true,
    });
  });

  it('returns the existing channel when create loses a unique-constraint race', async () => {
    const existingChannel = {
      id: 'channel-3',
      channelUrl: 'https://www.youtube.com/channel/UC123',
      youtubeChannelId: 'UC123',
      title: 'OpenAI',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    };

    mocks.resolveChannel.mockResolvedValue({
      canonicalUrl: 'https://www.youtube.com/channel/UC123',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      title: 'OpenAI',
      youtubeChannelId: 'UC123',
    });
    mocks.findByYoutubeChannelId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingChannel);
    mocks.create.mockRejectedValue({
      code: 'P2002',
      name: 'PrismaClientKnownRequestError',
    });

    const result = await registerChannel({
      channelUrl: 'https://www.youtube.com/@openai',
    });

    expect(mocks.findByYoutubeChannelId).toHaveBeenNthCalledWith(1, 'UC123');
    expect(mocks.findByYoutubeChannelId).toHaveBeenNthCalledWith(2, 'UC123');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(result).toEqual({
      channel: existingChannel,
      created: false,
      ok: true,
    });
  });

  it('returns a helpful message when youtube api key is missing', async () => {
    mocks.resolveChannel.mockRejectedValue(
      createMissingConfigurationError(
        'youtube',
        'createClient',
        'YOUTUBE_API_KEY is required',
      ),
    );

    const result = await registerChannel({
      channelUrl: 'https://www.youtube.com/@openai',
    });

    expect(result).toEqual({
      message: 'YOUTUBE_API_KEY 설정이 필요합니다. .env 파일을 확인해 주세요.',
      ok: false,
    });
  });
});

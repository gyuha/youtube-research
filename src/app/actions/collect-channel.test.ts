import { afterEach, describe, expect, it, vi } from 'vitest';

import { collectChannel } from './collect-channel';

const mocks = vi.hoisted(() => ({
  collectLatestVideo: vi.fn(),
  findById: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/server/collection/collect-latest-video', () => ({
  collectLatestVideo: mocks.collectLatestVideo,
}));

vi.mock('@/server/db/repositories/channel-repository', () => ({
  channelRepository: {
    findById: mocks.findById,
  },
}));

describe('collectChannel', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('looks up the persisted channel and passes its youtube channel id to the orchestrator', async () => {
    mocks.findById.mockResolvedValue({
      id: 'channel-1',
      youtubeChannelId: 'UC_REAL',
    });
    mocks.collectLatestVideo.mockResolvedValue({ status: 'Completed' });

    const result = await collectChannel({
      channelId: 'channel-1',
    });

    expect(mocks.findById).toHaveBeenCalledWith('channel-1');
    expect(mocks.collectLatestVideo).toHaveBeenCalledWith({
      channelId: 'channel-1',
      youtubeChannelId: 'UC_REAL',
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
    expect(result.status).toBe('Completed');
  });

  it('throws when the requested channel does not exist', async () => {
    mocks.findById.mockResolvedValue(null);

    await expect(
      collectChannel({
        channelId: 'missing-channel',
      }),
    ).rejects.toThrow('Channel not found');

    expect(mocks.collectLatestVideo).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

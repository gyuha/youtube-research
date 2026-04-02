import { afterEach, describe, expect, it, vi } from 'vitest';

import { collectChannel } from './collect-channel';

const mocks = vi.hoisted(() => ({
  collectLatestVideo: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/server/collection/collect-latest-video', () => ({
  collectLatestVideo: mocks.collectLatestVideo,
}));

describe('collectChannel', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the completed status from the orchestrator', async () => {
    mocks.collectLatestVideo.mockResolvedValue({ status: 'Completed' });

    const result = await collectChannel({
      channelId: 'channel-1',
      youtubeChannelId: 'UC123',
    });

    expect(mocks.collectLatestVideo).toHaveBeenCalledWith({
      channelId: 'channel-1',
      youtubeChannelId: 'UC123',
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/');
    expect(result.status).toBe('Completed');
  });
});

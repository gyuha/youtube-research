import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChannelCard } from './channel-card';

const mocks = vi.hoisted(() => ({
  collectChannel: vi.fn(),
}));

vi.mock('@/app/actions/collect-channel', () => ({
  collectChannel: mocks.collectChannel,
}));

describe('ChannelCard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the badge derived from props while showing recoverable feedback inline', async () => {
    mocks.collectChannel.mockResolvedValue({
      message: '새 영상이 없습니다',
      status: 'No Change',
    });

    const user = userEvent.setup();

    render(
      <ChannelCard
        channel={{
          id: 'channel-1',
          channelUrl: 'https://www.youtube.com/channel/UC123',
          youtubeChannelId: 'UC123',
          title: 'OpenAI',
          thumbnailUrl: null,
          lastCheckedAt: null,
          createdAt: new Date('2026-04-01T10:00:00.000Z'),
          analysisResult: null,
          videoSnapshot: null,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /collect now for openai/i }));

    expect(await screen.findByText(/새 영상이 없습니다/i)).toBeInTheDocument();
    expect(screen.getByText('Idle')).toBeInTheDocument();
    expect(screen.queryByText('No Change')).not.toBeInTheDocument();
  });
});

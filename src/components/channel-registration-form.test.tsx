import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ChannelRegistrationForm } from './channel-registration-form';

const mocks = vi.hoisted(() => ({
  registerChannel: vi.fn(),
}));

vi.mock('@/app/actions/register-channel', () => ({
  registerChannel: mocks.registerChannel,
}));

describe('ChannelRegistrationForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows feedback when a channel is newly registered', async () => {
    mocks.registerChannel.mockResolvedValue({
      created: true,
      ok: true,
    });

    const user = userEvent.setup();

    render(<ChannelRegistrationForm />);

    await user.type(
      screen.getByLabelText(/youtube channel url/i),
      'https://www.youtube.com/@openai',
    );
    await user.click(screen.getByRole('button', { name: /register channel/i }));

    expect(
      await screen.findByText(/channel registered successfully/i),
    ).toBeInTheDocument();
  });

  it('shows feedback when the channel already exists', async () => {
    mocks.registerChannel.mockResolvedValue({
      created: false,
      ok: true,
    });

    const user = userEvent.setup();

    render(<ChannelRegistrationForm />);

    await user.type(
      screen.getByLabelText(/youtube channel url/i),
      'https://www.youtube.com/@openai',
    );
    await user.click(screen.getByRole('button', { name: /register channel/i }));

    expect(
      await screen.findByText(/channel is already registered/i),
    ).toBeInTheDocument();
  });
});

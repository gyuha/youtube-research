import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  fetchTranscript: vi.fn(),
}));

vi.mock('youtube-transcript', () => {
  class MockYoutubeTranscriptDisabledError extends Error {}
  class MockYoutubeTranscriptNotAvailableError extends Error {}

  return {
    YoutubeTranscript: {
      fetchTranscript: mocks.fetchTranscript,
    },
    YoutubeTranscriptDisabledError: MockYoutubeTranscriptDisabledError,
    YoutubeTranscriptNotAvailableError: MockYoutubeTranscriptNotAvailableError,
  };
});

describe('transcriptService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns null when captions are disabled or unavailable', async () => {
    const { transcriptService } = await import('./transcript-service');
    const transcriptModule = await import('youtube-transcript');

    mocks.fetchTranscript.mockRejectedValueOnce(
      new transcriptModule.YoutubeTranscriptDisabledError('video-1'),
    );
    await expect(transcriptService.getTranscript('video-1')).resolves.toBeNull();

    mocks.fetchTranscript.mockRejectedValueOnce(
      new transcriptModule.YoutubeTranscriptNotAvailableError('video-2'),
    );
    await expect(transcriptService.getTranscript('video-2')).resolves.toBeNull();
  });

  it('throws a normalized provider error for unexpected transcript failures', async () => {
    mocks.fetchTranscript.mockRejectedValueOnce(new Error('provider down'));

    const { isProviderError } = await import('@/server/providers/provider-error');
    const { transcriptService } = await import('./transcript-service');

    await expect(transcriptService.getTranscript('video-3')).rejects.toSatisfy(
      (error: unknown) =>
        isProviderError(error) &&
        error.code === 'provider_failure' &&
        error.provider === 'youtube-transcript' &&
        error.operation === 'getTranscript',
    );
  });
});

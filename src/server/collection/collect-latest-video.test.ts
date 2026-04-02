import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  beginCollection: vi.fn(),
  commitLatestForVideo: vi.fn(),
  findAnalysisResultByChannelId: vi.fn(),
  upsertAnalysisStatus: vi.fn(),
  replaceLatestAnalysisResult: vi.fn(),
  touchLastCheckedAt: vi.fn(),
  findVideoSnapshotByChannelId: vi.fn(),
  replaceLatestVideoSnapshot: vi.fn(),
  summarizeTranscript: vi.fn(),
  fetchLatestVideo: vi.fn(),
  fetchTranscript: vi.fn(),
}));

vi.mock('@/server/db/repositories/analysis-result-repository', () => ({
  analysisResultRepository: {
    beginCollection: mocks.beginCollection,
    commitLatestForVideo: mocks.commitLatestForVideo,
    findByChannelId: mocks.findAnalysisResultByChannelId,
    replaceLatest: mocks.replaceLatestAnalysisResult,
    upsertStatus: mocks.upsertAnalysisStatus,
  },
}));

vi.mock('@/server/db/repositories/channel-repository', () => ({
  channelRepository: {
    touchLastCheckedAt: mocks.touchLastCheckedAt,
  },
}));

vi.mock('@/server/db/repositories/video-snapshot-repository', () => ({
  videoSnapshotRepository: {
    findByChannelId: mocks.findVideoSnapshotByChannelId,
    replaceLatest: mocks.replaceLatestVideoSnapshot,
  },
}));

vi.mock('@/server/analysis/analysis-service', () => ({
  analysisService: {
    summarizeTranscript: mocks.summarizeTranscript,
  },
}));

vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: mocks.fetchTranscript,
  },
}));

vi.mock('@/server/youtube/youtube-api', () => ({
  youtubeApi: {
    fetchLatestVideo: mocks.fetchLatestVideo,
  },
}));

describe('collectLatestVideo', () => {
  const channelId = 'channel-1';
  const youtubeChannelId = 'UC123';
  const latestVideo = {
    publishedAt: new Date('2026-04-02T00:00:00.000Z'),
    thumbnailUrl: 'https://example.com/video.jpg',
    title: 'New Video',
    videoUrl: 'https://youtube.com/watch?v=video-2',
    youtubeVideoId: 'video-2',
  };

  beforeEach(() => {
    mocks.beginCollection.mockResolvedValue(true);
    mocks.commitLatestForVideo.mockResolvedValue({ id: 'snapshot-2' });
    mocks.findAnalysisResultByChannelId.mockResolvedValue(null);
    mocks.upsertAnalysisStatus.mockResolvedValue(undefined);
    mocks.replaceLatestAnalysisResult.mockResolvedValue(undefined);
    mocks.touchLastCheckedAt.mockResolvedValue(undefined);
    mocks.findVideoSnapshotByChannelId.mockResolvedValue(null);
    mocks.replaceLatestVideoSnapshot.mockResolvedValue({ id: 'snapshot-2' });
    mocks.summarizeTranscript.mockResolvedValue({
      insights: ['인사이트 1', '인사이트 2', '인사이트 3'],
      summary: '요약',
    });
    mocks.fetchTranscript.mockResolvedValue([{ text: 'transcript text' }]);
    mocks.fetchLatestVideo.mockResolvedValue(latestVideo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns collecting when a collection is already in progress', async () => {
    mocks.beginCollection.mockResolvedValue(false);

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(result).toEqual({
      message: '이미 수집 중입니다',
      status: 'Collecting',
    });
    expect(mocks.beginCollection).toHaveBeenCalledWith(channelId);
    expect(mocks.fetchLatestVideo).not.toHaveBeenCalled();
    expect(mocks.touchLastCheckedAt).not.toHaveBeenCalled();
  });

  it('marks the channel as no change when the latest video matches the snapshot', async () => {
    mocks.findVideoSnapshotByChannelId.mockResolvedValue({
      youtubeVideoId: 'video-2',
    });

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.beginCollection).toHaveBeenCalledWith(channelId);
    expect(mocks.upsertAnalysisStatus).toHaveBeenCalledWith(
      channelId,
      'No Change',
    );
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(mocks.fetchTranscript).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: '새 영상이 없습니다',
      status: 'No Change',
    });
  });

  it('returns No Captions when the latest video has no transcript', async () => {
    mocks.findAnalysisResultByChannelId.mockResolvedValue({
      insight1: 'old insight 1',
      insight2: 'old insight 2',
      insight3: 'old insight 3',
      status: 'Completed',
      summary: 'old summary',
      videoSnapshotId: 'snapshot-1',
    });
    mocks.fetchTranscript.mockResolvedValue([]);

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.commitLatestForVideo).toHaveBeenCalledWith(channelId, {
      analysisResult: {
        errorMessage: '이 영상은 자막이 없어 분석하지 않았습니다',
        insight1: null,
        insight2: null,
        insight3: null,
        status: 'No Captions',
        summary: null,
      },
      videoSnapshot: latestVideo,
    });
    expect(mocks.summarizeTranscript).not.toHaveBeenCalled();
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(result.status).toBe('No Captions');
    expect(result.message).toContain('자막');
  });

  it('treats a repeated no-captions upload as no change after the snapshot advances', async () => {
    mocks.fetchTranscript.mockResolvedValue([]);
    mocks.findVideoSnapshotByChannelId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ youtubeVideoId: 'video-2' });

    const { collectLatestVideo } = await import('./collect-latest-video');

    const firstResult = await collectLatestVideo({ channelId, youtubeChannelId });
    const secondResult = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(firstResult).toEqual({
      message: '이 영상은 자막이 없어 분석하지 않았습니다',
      status: 'No Captions',
    });
    expect(secondResult).toEqual({
      message: '새 영상이 없습니다',
      status: 'No Change',
    });
    expect(mocks.fetchTranscript).toHaveBeenCalledTimes(1);
    expect(mocks.upsertAnalysisStatus).toHaveBeenLastCalledWith(
      channelId,
      'No Change',
    );
  });

  it('completes analysis for a new captioned video', async () => {
    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.fetchLatestVideo).toHaveBeenCalledWith(youtubeChannelId);
    expect(mocks.fetchTranscript).toHaveBeenCalledWith('video-2');
    expect(mocks.summarizeTranscript).toHaveBeenCalledWith('transcript text');
    expect(mocks.commitLatestForVideo).toHaveBeenCalledWith(channelId, {
      analysisResult: {
        insight1: '인사이트 1',
        insight2: '인사이트 2',
        insight3: '인사이트 3',
        status: 'Completed',
        summary: '요약',
      },
      videoSnapshot: latestVideo,
    });
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(result).toEqual({ status: 'Completed' });
  });

  it('retries provider work after an atomic latest-state commit fails', async () => {
    let persistedSnapshot: { youtubeVideoId: string } | null = null;

    mocks.fetchTranscript.mockResolvedValue([]);
    mocks.findVideoSnapshotByChannelId.mockImplementation(
      async () => persistedSnapshot,
    );
    mocks.commitLatestForVideo
      .mockRejectedValueOnce(new Error('transaction failed'))
      .mockImplementationOnce(async (_, input) => {
        persistedSnapshot = { youtubeVideoId: input.videoSnapshot.youtubeVideoId };

        return { id: 'snapshot-2' };
      });

    const { collectLatestVideo } = await import('./collect-latest-video');

    const firstResult = await collectLatestVideo({ channelId, youtubeChannelId });
    const secondResult = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(firstResult).toEqual({
      message: '처리 중 오류가 발생했습니다',
      status: 'Failed',
    });
    expect(secondResult).toEqual({
      message: '이 영상은 자막이 없어 분석하지 않았습니다',
      status: 'No Captions',
    });
    expect(mocks.fetchLatestVideo).toHaveBeenCalledTimes(2);
    expect(mocks.fetchTranscript).toHaveBeenCalledTimes(2);
    expect(mocks.upsertAnalysisStatus).toHaveBeenCalledWith(
      channelId,
      'Failed',
      '처리 중 오류가 발생했습니다',
    );
  });

  it('short-circuits the losing caller when collection lock acquisition fails', async () => {
    let releaseFirstFetch: (() => void) | undefined;

    mocks.beginCollection.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mocks.fetchLatestVideo.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseFirstFetch = () => resolve(latestVideo);
        }),
    );

    const { collectLatestVideo } = await import('./collect-latest-video');

    const firstRun = collectLatestVideo({ channelId, youtubeChannelId });
    const secondResult = await collectLatestVideo({ channelId, youtubeChannelId });

    releaseFirstFetch?.();
    await firstRun;

    expect(secondResult).toEqual({
      message: '이미 수집 중입니다',
      status: 'Collecting',
    });
    expect(mocks.fetchLatestVideo).toHaveBeenCalledTimes(1);
  });

  it('keeps the completed result when lastCheckedAt update fails after commit', async () => {
    mocks.touchLastCheckedAt.mockRejectedValue(new Error('touch failed'));

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(result).toEqual({ status: 'Completed' });
    expect(mocks.commitLatestForVideo).toHaveBeenCalledTimes(1);
    expect(mocks.upsertAnalysisStatus).not.toHaveBeenCalledWith(
      channelId,
      'Failed',
      '처리 중 오류가 발생했습니다',
    );
  });

  it('marks the channel as failed when collection raises an error', async () => {
    mocks.fetchLatestVideo.mockRejectedValue(new Error('boom'));

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.beginCollection).toHaveBeenCalledWith(channelId);
    expect(mocks.upsertAnalysisStatus).toHaveBeenCalledWith(
      channelId,
      'Failed',
      '처리 중 오류가 발생했습니다',
    );
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(result).toEqual({
      message: '처리 중 오류가 발생했습니다',
      status: 'Failed',
    });
  });
});

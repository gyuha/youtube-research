import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findAnalysisResultByChannelId: vi.fn(),
  upsertAnalysisStatus: vi.fn(),
  replaceLatestAnalysisResult: vi.fn(),
  touchLastCheckedAt: vi.fn(),
  findVideoSnapshotByChannelId: vi.fn(),
  replaceLatestVideoSnapshot: vi.fn(),
  summarizeTranscript: vi.fn(),
  getTranscript: vi.fn(),
  fetchLatestVideo: vi.fn(),
}));

vi.mock('@/server/db/repositories/analysis-result-repository', () => ({
  analysisResultRepository: {
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

vi.mock('@/server/transcripts/transcript-service', () => ({
  transcriptService: {
    getTranscript: mocks.getTranscript,
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
    mocks.getTranscript.mockResolvedValue('transcript text');
    mocks.fetchLatestVideo.mockResolvedValue(latestVideo);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns collecting when a collection is already in progress', async () => {
    mocks.findAnalysisResultByChannelId.mockResolvedValue({
      status: 'Collecting',
    });

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(result).toEqual({
      message: '이미 수집 중입니다',
      status: 'Collecting',
    });
    expect(mocks.upsertAnalysisStatus).not.toHaveBeenCalled();
    expect(mocks.fetchLatestVideo).not.toHaveBeenCalled();
    expect(mocks.touchLastCheckedAt).not.toHaveBeenCalled();
  });

  it('marks the channel as no change when the latest video matches the snapshot', async () => {
    mocks.findVideoSnapshotByChannelId.mockResolvedValue({
      youtubeVideoId: 'video-2',
    });

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.upsertAnalysisStatus).toHaveBeenNthCalledWith(
      1,
      channelId,
      'Collecting',
    );
    expect(mocks.upsertAnalysisStatus).toHaveBeenNthCalledWith(
      2,
      channelId,
      'No Change',
    );
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(mocks.getTranscript).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: '새 영상이 없습니다',
      status: 'No Change',
    });
  });

  it('marks the channel as no captions when transcript data is unavailable', async () => {
    mocks.findAnalysisResultByChannelId.mockResolvedValue({
      insight1: 'old insight 1',
      insight2: 'old insight 2',
      insight3: 'old insight 3',
      status: 'Completed',
      summary: 'old summary',
      videoSnapshotId: 'snapshot-1',
    });
    mocks.getTranscript.mockResolvedValue(null);

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.upsertAnalysisStatus).toHaveBeenNthCalledWith(
      1,
      channelId,
      'Collecting',
    );
    expect(mocks.replaceLatestVideoSnapshot).toHaveBeenCalledWith(
      channelId,
      latestVideo,
    );
    expect(mocks.replaceLatestAnalysisResult).toHaveBeenCalledWith(channelId, {
      errorMessage: '이 영상은 자막이 없어 분석하지 않았습니다',
      insight1: null,
      insight2: null,
      insight3: null,
      status: 'No Captions',
      summary: null,
      videoSnapshotId: 'snapshot-2',
    });
    expect(mocks.summarizeTranscript).not.toHaveBeenCalled();
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(result).toEqual({
      message: '이 영상은 자막이 없어 분석하지 않았습니다',
      status: 'No Captions',
    });
  });

  it('treats a repeated no-captions upload as no change after the snapshot advances', async () => {
    mocks.getTranscript.mockResolvedValue(null);
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
    expect(mocks.replaceLatestVideoSnapshot).toHaveBeenCalledTimes(1);
    expect(mocks.getTranscript).toHaveBeenCalledTimes(1);
    expect(mocks.upsertAnalysisStatus).toHaveBeenLastCalledWith(
      channelId,
      'No Change',
    );
  });

  it('completes analysis for a new captioned video', async () => {
    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.fetchLatestVideo).toHaveBeenCalledWith(youtubeChannelId);
    expect(mocks.getTranscript).toHaveBeenCalledWith('video-2');
    expect(mocks.summarizeTranscript).toHaveBeenCalledWith('transcript text');
    expect(mocks.replaceLatestVideoSnapshot).toHaveBeenCalledWith(
      channelId,
      latestVideo,
    );
    expect(mocks.replaceLatestAnalysisResult).toHaveBeenCalledWith(channelId, {
      insight1: '인사이트 1',
      insight2: '인사이트 2',
      insight3: '인사이트 3',
      status: 'Completed',
      summary: '요약',
      videoSnapshotId: 'snapshot-2',
    });
    expect(mocks.touchLastCheckedAt).toHaveBeenCalledWith(channelId);
    expect(result).toEqual({ status: 'Completed' });
  });

  it('marks the channel as failed when collection raises an error', async () => {
    mocks.fetchLatestVideo.mockRejectedValue(new Error('boom'));

    const { collectLatestVideo } = await import('./collect-latest-video');
    const result = await collectLatestVideo({ channelId, youtubeChannelId });

    expect(mocks.upsertAnalysisStatus).toHaveBeenNthCalledWith(
      1,
      channelId,
      'Collecting',
    );
    expect(mocks.upsertAnalysisStatus).toHaveBeenNthCalledWith(
      2,
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

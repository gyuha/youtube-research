import { analysisService } from '@/server/analysis/analysis-service';
import {
  COLLECTION_STATUSES,
  type CollectionStatus,
} from '@/server/collection/collection-status';
import { analysisResultRepository } from '@/server/db/repositories/analysis-result-repository';
import { channelRepository } from '@/server/db/repositories/channel-repository';
import { videoSnapshotRepository } from '@/server/db/repositories/video-snapshot-repository';
import { transcriptService } from '@/server/transcripts/transcript-service';
import { youtubeApi } from '@/server/youtube/youtube-api';

const NO_CHANGE_MESSAGE = '새 영상이 없습니다';
const NO_CAPTIONS_MESSAGE = '이 영상은 자막이 없어 분석하지 않았습니다';
const FAILED_MESSAGE = '처리 중 오류가 발생했습니다';
const ALREADY_COLLECTING_MESSAGE = '이미 수집 중입니다';

interface CollectLatestVideoInput {
  channelId: string;
  youtubeChannelId: string;
}

interface CollectLatestVideoResult {
  message?: string;
  status: CollectionStatus;
}

export async function collectLatestVideo(
  input: CollectLatestVideoInput,
): Promise<CollectLatestVideoResult> {
  const current = await analysisResultRepository.findByChannelId(input.channelId);

  if (current?.status === COLLECTION_STATUSES.collecting) {
    return {
      message: ALREADY_COLLECTING_MESSAGE,
      status: COLLECTION_STATUSES.collecting,
    };
  }

  await analysisResultRepository.upsertStatus(
    input.channelId,
    COLLECTION_STATUSES.collecting,
  );

  try {
    const latestVideo = await youtubeApi.fetchLatestVideo(input.youtubeChannelId);
    const previousSnapshot = await videoSnapshotRepository.findByChannelId(
      input.channelId,
    );

    if (previousSnapshot?.youtubeVideoId === latestVideo.youtubeVideoId) {
      await analysisResultRepository.upsertStatus(
        input.channelId,
        COLLECTION_STATUSES.noChange,
      );
      await channelRepository.touchLastCheckedAt(input.channelId);

      return {
        message: NO_CHANGE_MESSAGE,
        status: COLLECTION_STATUSES.noChange,
      };
    }

    const transcript = await transcriptService.getTranscript(
      latestVideo.youtubeVideoId,
    );

    if (!transcript) {
      await videoSnapshotRepository.replaceLatest(input.channelId, latestVideo);
      await analysisResultRepository.upsertStatus(
        input.channelId,
        COLLECTION_STATUSES.noCaptions,
        NO_CAPTIONS_MESSAGE,
      );
      await channelRepository.touchLastCheckedAt(input.channelId);

      return {
        message: NO_CAPTIONS_MESSAGE,
        status: COLLECTION_STATUSES.noCaptions,
      };
    }

    const analysis = await analysisService.summarizeTranscript(transcript);
    const snapshot = await videoSnapshotRepository.replaceLatest(
      input.channelId,
      latestVideo,
    );

    await analysisResultRepository.replaceLatest(input.channelId, {
      insight1: analysis.insights[0],
      insight2: analysis.insights[1],
      insight3: analysis.insights[2],
      status: COLLECTION_STATUSES.completed,
      summary: analysis.summary,
      videoSnapshotId: snapshot.id,
    });
    await channelRepository.touchLastCheckedAt(input.channelId);

    return { status: COLLECTION_STATUSES.completed };
  } catch {
    await analysisResultRepository.upsertStatus(
      input.channelId,
      COLLECTION_STATUSES.failed,
      FAILED_MESSAGE,
    );
    await channelRepository.touchLastCheckedAt(input.channelId);

    return {
      message: FAILED_MESSAGE,
      status: COLLECTION_STATUSES.failed,
    };
  }
}

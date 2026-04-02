import { analysisService } from '@/server/analysis/analysis-service';
import {
  COLLECTION_STATUSES,
  type CollectionStatus,
} from '@/server/collection/collection-status';
import { analysisResultRepository } from '@/server/db/repositories/analysis-result-repository';
import { channelRepository } from '@/server/db/repositories/channel-repository';
import { videoSnapshotRepository } from '@/server/db/repositories/video-snapshot-repository';
import { isProviderError } from '@/server/providers/provider-error';
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

async function touchLastCheckedAtSafely(channelId: string) {
  try {
    await channelRepository.touchLastCheckedAt(channelId);
  } catch (error) {
    console.error(`Failed to update lastCheckedAt for ${channelId}`, error);
  }
}

export async function collectLatestVideo(
  input: CollectLatestVideoInput,
): Promise<CollectLatestVideoResult> {
  try {
    const didBeginCollection = await analysisResultRepository.beginCollection(
      input.channelId,
    );

    if (!didBeginCollection) {
      return {
        message: ALREADY_COLLECTING_MESSAGE,
        status: COLLECTION_STATUSES.collecting,
      };
    }

    const latestVideo = await youtubeApi.fetchLatestVideo(input.youtubeChannelId);
    const previousSnapshot = await videoSnapshotRepository.findByChannelId(
      input.channelId,
    );

    if (previousSnapshot?.youtubeVideoId === latestVideo.youtubeVideoId) {
      await analysisResultRepository.upsertStatus(
        input.channelId,
        COLLECTION_STATUSES.noChange,
      );
      await touchLastCheckedAtSafely(input.channelId);

      return {
        message: NO_CHANGE_MESSAGE,
        status: COLLECTION_STATUSES.noChange,
      };
    }

    const transcript = await transcriptService.getTranscript(
      latestVideo.youtubeVideoId,
    );

    if (!transcript) {
      await analysisResultRepository.commitLatestForVideo(input.channelId, {
        analysisResult: {
          errorMessage: NO_CAPTIONS_MESSAGE,
          insight1: null,
          insight2: null,
          insight3: null,
          status: COLLECTION_STATUSES.noCaptions,
          summary: null,
        },
        videoSnapshot: latestVideo,
      });
      await touchLastCheckedAtSafely(input.channelId);

      return {
        message: NO_CAPTIONS_MESSAGE,
        status: COLLECTION_STATUSES.noCaptions,
      };
    }

    const analysis = await analysisService.summarizeTranscript(transcript);
    await analysisResultRepository.commitLatestForVideo(input.channelId, {
      analysisResult: {
        insight1: analysis.insights[0],
        insight2: analysis.insights[1],
        insight3: analysis.insights[2],
        status: COLLECTION_STATUSES.completed,
        summary: analysis.summary,
      },
      videoSnapshot: latestVideo,
    });
    await touchLastCheckedAtSafely(input.channelId);

    return { status: COLLECTION_STATUSES.completed };
  } catch (error) {
    if (isProviderError(error)) {
      console.error(
        `Collection provider error for ${input.channelId}: ${error.provider}.${error.operation} (${error.code})`,
        error,
      );
    }

    await analysisResultRepository.upsertStatus(
      input.channelId,
      COLLECTION_STATUSES.failed,
      FAILED_MESSAGE,
      {
        clearAnalysis: true,
      },
    );
    await touchLastCheckedAtSafely(input.channelId);

    return {
      message: FAILED_MESSAGE,
      status: COLLECTION_STATUSES.failed,
    };
  }
}

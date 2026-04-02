import {
  COLLECTION_STATUSES,
  type CollectionStatus,
} from '../../collection/collection-status';
import type { ReplaceLatestVideoSnapshotInput } from './video-snapshot-repository';

import { db } from '../client';

interface ReplaceLatestAnalysisResultInput {
  errorMessage?: string | null;
  insight1: string | null;
  insight2: string | null;
  insight3: string | null;
  status: CollectionStatus;
  summary: string | null;
  videoSnapshotId: string | null;
}

interface CommitLatestForVideoInput {
  analysisResult: Omit<ReplaceLatestAnalysisResultInput, 'videoSnapshotId'>;
  videoSnapshot: ReplaceLatestVideoSnapshotInput;
}

function isPrismaUniqueConstraintError(
  error: unknown,
): error is { code: string; name?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

export const analysisResultRepository = {
  async beginCollection(channelId: string) {
    const processedAt = new Date();
    const updated = await db.analysisResult.updateMany({
      data: {
        errorMessage: null,
        processedAt,
        status: COLLECTION_STATUSES.collecting,
      },
      where: {
        channelId,
        NOT: {
          status: COLLECTION_STATUSES.collecting,
        },
      },
    });

    if (updated.count > 0) {
      return true;
    }

    try {
      await db.analysisResult.create({
        data: {
          channelId,
          errorMessage: null,
          processedAt,
          status: COLLECTION_STATUSES.collecting,
        },
      });

      return true;
    } catch (error) {
      if (!isPrismaUniqueConstraintError(error)) {
        throw error;
      }

      return false;
    }
  },
  async commitLatestForVideo(channelId: string, input: CommitLatestForVideoInput) {
    const processedAt = new Date();

    return db.$transaction(async (tx) => {
      const snapshot = await tx.videoSnapshot.upsert({
        create: { channelId, ...input.videoSnapshot },
        update: input.videoSnapshot,
        where: { channelId },
      });

      return tx.analysisResult.upsert({
        create: {
          channelId,
          ...input.analysisResult,
          errorMessage: input.analysisResult.errorMessage ?? null,
          processedAt,
          videoSnapshotId: snapshot.id,
        },
        update: {
          ...input.analysisResult,
          errorMessage: input.analysisResult.errorMessage ?? null,
          processedAt,
          videoSnapshotId: snapshot.id,
        },
        where: { channelId },
      });
    });
  },
  findByChannelId: (channelId: string) =>
    db.analysisResult.findUnique({ where: { channelId } }),
  replaceLatest: (channelId: string, input: ReplaceLatestAnalysisResultInput) =>
    db.analysisResult.upsert({
      create: { channelId, ...input, errorMessage: input.errorMessage ?? null, processedAt: new Date() },
      update: { ...input, errorMessage: input.errorMessage ?? null, processedAt: new Date() },
      where: { channelId },
    }),
  upsertStatus: (
    channelId: string,
    status: CollectionStatus,
    errorMessage?: string | null,
  ) =>
    db.analysisResult.upsert({
      create: {
        channelId,
        errorMessage: errorMessage ?? null,
        processedAt: new Date(),
        status,
      },
      update: {
        errorMessage: errorMessage ?? null,
        processedAt: new Date(),
        status,
      },
      where: { channelId },
    }),
};

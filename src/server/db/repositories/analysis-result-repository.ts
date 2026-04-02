import type { CollectionStatus } from '../../collection/collection-status';

import { db } from '../client';

interface ReplaceLatestAnalysisResultInput {
  insight1: string;
  insight2: string;
  insight3: string;
  status: CollectionStatus;
  summary: string;
  videoSnapshotId: string;
}

export const analysisResultRepository = {
  findByChannelId: (channelId: string) =>
    db.analysisResult.findUnique({ where: { channelId } }),
  replaceLatest: (channelId: string, input: ReplaceLatestAnalysisResultInput) =>
    db.analysisResult.upsert({
      create: { channelId, ...input, errorMessage: null, processedAt: new Date() },
      update: { ...input, errorMessage: null, processedAt: new Date() },
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

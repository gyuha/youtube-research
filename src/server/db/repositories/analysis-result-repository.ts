import type { CollectionStatus } from '../../collection/collection-status';

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

export const analysisResultRepository = {
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

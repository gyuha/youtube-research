import {
  COLLECTION_STATUSES,
  type CollectionStatus,
} from '@/server/collection/collection-status';

interface DashboardAnalysisResult {
  errorMessage: string | null;
  insight1: string | null;
  insight2: string | null;
  insight3: string | null;
  processedAt: Date | null;
  status: CollectionStatus;
  summary: string | null;
}

interface DashboardVideoSnapshot {
  publishedAt: Date;
  thumbnailUrl: string | null;
  title: string;
  videoUrl: string;
}

export interface DashboardChannel {
  channelUrl: string;
  createdAt: Date;
  id: string;
  lastCheckedAt: Date | null;
  thumbnailUrl: string | null;
  title: string;
  youtubeChannelId: string;
  analysisResult: DashboardAnalysisResult | null;
  videoSnapshot: DashboardVideoSnapshot | null;
}

function isCollectionStatus(value: string): value is CollectionStatus {
  return Object.values(COLLECTION_STATUSES).includes(value as CollectionStatus);
}

export function getDashboardStatus(status: string | null | undefined) {
  if (!status) {
    return COLLECTION_STATUSES.idle;
  }

  return isCollectionStatus(status) ? status : COLLECTION_STATUSES.idle;
}

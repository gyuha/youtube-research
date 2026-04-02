interface DashboardAnalysisResult {
  errorMessage: string | null;
  insight1: string | null;
  insight2: string | null;
  insight3: string | null;
  processedAt: Date | null;
  status: string;
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
  id: string;
  lastCheckedAt: Date | null;
  thumbnailUrl: string | null;
  title: string;
  youtubeChannelId: string;
  analysisResult: DashboardAnalysisResult | null;
  videoSnapshot: DashboardVideoSnapshot | null;
}

import { db } from '../client';

export interface ReplaceLatestVideoSnapshotInput {
  publishedAt: Date;
  thumbnailUrl?: string | null;
  title: string;
  videoUrl: string;
  youtubeVideoId: string;
}

export const videoSnapshotRepository = {
  findByChannelId: (channelId: string) =>
    db.videoSnapshot.findUnique({ where: { channelId } }),
  replaceLatest: (channelId: string, input: ReplaceLatestVideoSnapshotInput) =>
    db.videoSnapshot.upsert({
      create: { channelId, ...input },
      update: input,
      where: { channelId },
    }),
};

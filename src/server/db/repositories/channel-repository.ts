import { db } from '../client';

interface CreateChannelInput {
  channelUrl: string;
  thumbnailUrl?: string | null;
  title: string;
  youtubeChannelId: string;
}

export const channelRepository = {
  list: () => db.channel.findMany({ orderBy: { createdAt: 'asc' } }),
  listForDashboard: () =>
    db.channel.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        analysisResult: true,
        videoSnapshot: true,
      },
    }),
  findById: (channelId: string) => db.channel.findUnique({ where: { id: channelId } }),
  findByYoutubeChannelId: (youtubeChannelId: string) =>
    db.channel.findUnique({ where: { youtubeChannelId } }),
  create: (input: CreateChannelInput) =>
    db.channel.create({
      data: input,
    }),
  touchLastCheckedAt: (channelId: string) =>
    db.channel.update({
      data: { lastCheckedAt: new Date() },
      where: { id: channelId },
    }),
};

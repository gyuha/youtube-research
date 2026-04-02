import { google } from 'googleapis';

import type {
  LatestYoutubeVideo,
  NormalizedChannelInput,
  ResolvedChannel,
} from './types';
import type { youtube_v3 } from 'googleapis';

function getYoutubeApiKey() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is required');
  }

  return apiKey;
}

function getYoutubeClient() {
  return google.youtube({
    auth: getYoutubeApiKey(),
    version: 'v3',
  });
}

function toResolvedChannel(channel: youtube_v3.Schema$Channel | undefined) {
  if (!channel?.id || !channel.snippet?.title) {
    throw new Error('채널 정보를 가져오지 못했습니다');
  }

  return {
    canonicalUrl: `https://www.youtube.com/channel/${channel.id}`,
    thumbnailUrl: channel.snippet.thumbnails?.default?.url ?? null,
    title: channel.snippet.title,
    youtubeChannelId: channel.id,
  } satisfies ResolvedChannel;
}

export const youtubeApi = {
  async resolveChannel(input: NormalizedChannelInput): Promise<ResolvedChannel> {
    const youtube = getYoutubeClient();

    if (input.kind === 'channelId') {
      const response = await youtube.channels.list({
        id: [input.value],
        part: ['snippet'],
      });

      return toResolvedChannel(response.data.items?.[0]);
    }

    const response = await youtube.channels.list({
      forHandle: input.value.replace(/^@/, ''),
      part: ['snippet'],
    });

    return toResolvedChannel(response.data.items?.[0]);
  },

  async fetchLatestVideo(
    youtubeChannelId: string,
  ): Promise<LatestYoutubeVideo> {
    const youtube = getYoutubeClient();
    const response = await youtube.search.list({
      channelId: youtubeChannelId,
      maxResults: 1,
      order: 'date',
      part: ['snippet'],
      type: ['video'],
    });
    const item = response.data.items?.[0];
    const publishedAt = item?.snippet?.publishedAt;
    const title = item?.snippet?.title;
    const youtubeVideoId = item?.id?.videoId;

    if (!youtubeVideoId || !publishedAt || !title) {
      throw new Error('새 영상을 가져오지 못했습니다');
    }

    return {
      publishedAt: new Date(publishedAt),
      thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? null,
      title,
      videoUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
      youtubeVideoId,
    };
  },
};

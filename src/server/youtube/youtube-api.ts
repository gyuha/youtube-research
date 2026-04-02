import type {
  LatestYoutubeVideo,
  NormalizedChannelInput,
  ResolvedChannel,
} from './types';

export const youtubeApi = {
  async resolveChannel(input: NormalizedChannelInput): Promise<ResolvedChannel> {
    throw new Error(`YouTube channel adapter is not configured for ${input.kind}`);
  },

  async fetchLatestVideo(
    youtubeChannelId: string,
  ): Promise<LatestYoutubeVideo> {
    throw new Error(
      `YouTube latest-video adapter is not configured for ${youtubeChannelId}`,
    );
  },
};

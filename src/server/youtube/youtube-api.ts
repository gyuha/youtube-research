import type { NormalizedChannelInput, ResolvedChannel } from './types';

export const youtubeApi = {
  async resolveChannel(input: NormalizedChannelInput): Promise<ResolvedChannel> {
    throw new Error(`YouTube channel adapter is not configured for ${input.kind}`);
  },
};

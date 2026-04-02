export type NormalizedChannelInput =
  | {
      kind: 'channelId';
      value: string;
    }
  | {
      kind: 'handle';
      value: string;
    };

export interface ResolvedChannel {
  canonicalUrl: string;
  thumbnailUrl: string | null;
  title: string;
  youtubeChannelId: string;
}

'use server';

import { revalidatePath } from 'next/cache';

import { channelRepository } from '@/server/db/repositories/channel-repository';
import { normalizeChannelInput } from '@/server/youtube/channel-url';
import { youtubeApi } from '@/server/youtube/youtube-api';

export async function registerChannel(input: { channelUrl: string }) {
  const normalized = normalizeChannelInput(input.channelUrl);
  const resolved = await youtubeApi.resolveChannel(normalized);
  const existing = await channelRepository.findByYoutubeChannelId(
    resolved.youtubeChannelId,
  );

  if (existing) {
    return {
      channel: existing,
      created: false,
      ok: true as const,
    };
  }

  const channel = await channelRepository.create({
    channelUrl: input.channelUrl,
    thumbnailUrl: resolved.thumbnailUrl,
    title: resolved.title,
    youtubeChannelId: resolved.youtubeChannelId,
  });

  revalidatePath('/');

  return {
    channel,
    created: true,
    ok: true as const,
  };
}

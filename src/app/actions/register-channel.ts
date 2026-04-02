'use server';

import { revalidatePath } from 'next/cache';

import { channelRepository } from '@/server/db/repositories/channel-repository';
import { normalizeChannelInput } from '@/server/youtube/channel-url';
import { youtubeApi } from '@/server/youtube/youtube-api';

function isPrismaUniqueConstraintError(
  error: unknown,
): error is { code: string; name?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

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

  let channel;

  try {
    channel = await channelRepository.create({
      channelUrl: resolved.canonicalUrl,
      thumbnailUrl: resolved.thumbnailUrl,
      title: resolved.title,
      youtubeChannelId: resolved.youtubeChannelId,
    });
  } catch (error) {
    if (!isPrismaUniqueConstraintError(error)) {
      throw error;
    }

    const racedChannel = await channelRepository.findByYoutubeChannelId(
      resolved.youtubeChannelId,
    );

    if (!racedChannel) {
      throw error;
    }

    return {
      channel: racedChannel,
      created: false,
      ok: true as const,
    };
  }

  revalidatePath('/');

  return {
    channel,
    created: true,
    ok: true as const,
  };
}

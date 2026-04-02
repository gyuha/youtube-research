'use server';

import { revalidatePath } from 'next/cache';

import { channelRepository } from '@/server/db/repositories/channel-repository';
import { isProviderError } from '@/server/providers/provider-error';
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
  try {
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
  } catch (error) {
    if (isProviderError(error)) {
      if (error.code === 'missing_configuration') {
        return {
          message: 'YOUTUBE_API_KEY 설정이 필요합니다. .env 파일을 확인해 주세요.',
          ok: false as const,
        };
      }

      if (error.code === 'not_found') {
        return {
          message: '채널 정보를 찾지 못했습니다. URL을 확인해 주세요.',
          ok: false as const,
        };
      }

      return {
        message: '채널 정보를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.',
        ok: false as const,
      };
    }

    if (error instanceof Error && error.message) {
      return {
        message: error.message,
        ok: false as const,
      };
    }

    return {
      message: 'Unable to register the channel right now.',
      ok: false as const,
    };
  }
}

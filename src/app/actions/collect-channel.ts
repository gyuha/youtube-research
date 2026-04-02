'use server';

import { revalidatePath } from 'next/cache';

import { collectLatestVideo } from '@/server/collection/collect-latest-video';
import { channelRepository } from '@/server/db/repositories/channel-repository';

export async function collectChannel(input: {
  channelId: string;
}) {
  const channel = await channelRepository.findById(input.channelId);

  if (!channel) {
    throw new Error('Channel not found');
  }

  const result = await collectLatestVideo({
    channelId: channel.id,
    youtubeChannelId: channel.youtubeChannelId,
  });

  revalidatePath('/');

  return result;
}

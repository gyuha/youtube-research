'use server';

import { revalidatePath } from 'next/cache';

import { collectLatestVideo } from '@/server/collection/collect-latest-video';

export async function collectChannel(input: {
  channelId: string;
  youtubeChannelId: string;
}) {
  const result = await collectLatestVideo(input);

  revalidatePath('/');

  return result;
}

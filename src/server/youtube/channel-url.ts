import type { NormalizedChannelInput } from './types';

const YOUTUBE_HOSTNAME_PATTERN = /(^|\.)youtube\.com$/i;

function getParsedUrl(input: string) {
  try {
    return new URL(input.trim());
  } catch {
    throw new Error('유효한 유튜브 채널 URL이 아닙니다');
  }
}

export function normalizeChannelInput(input: string): NormalizedChannelInput {
  const url = getParsedUrl(input);

  if (!YOUTUBE_HOSTNAME_PATTERN.test(url.hostname)) {
    throw new Error('유효한 유튜브 채널 URL이 아닙니다');
  }

  const pathname = url.pathname.replace(/\/+$/, '');

  if (pathname.startsWith('/channel/')) {
    const value = pathname.slice('/channel/'.length).split('/')[0];

    if (!value) {
      throw new Error('지원하지 않는 유튜브 채널 URL 형식입니다');
    }

    return {
      kind: 'channelId',
      value,
    };
  }

  if (pathname.startsWith('/@')) {
    const value = pathname.slice(1).split('/')[0];

    if (value.length <= 1) {
      throw new Error('지원하지 않는 유튜브 채널 URL 형식입니다');
    }

    return {
      kind: 'handle',
      value,
    };
  }

  throw new Error('지원하지 않는 유튜브 채널 URL 형식입니다');
}

import { describe, expect, it } from 'vitest';

import { normalizeChannelInput } from './channel-url';

describe('normalizeChannelInput', () => {
  it('accepts channel URLs', () => {
    expect(
      normalizeChannelInput('https://www.youtube.com/channel/UC123456789'),
    ).toEqual({ kind: 'channelId', value: 'UC123456789' });
  });

  it('accepts handle URLs', () => {
    expect(normalizeChannelInput('https://www.youtube.com/@openai')).toEqual({
      kind: 'handle',
      value: '@openai',
    });
  });

  it('rejects malformed handle URLs', () => {
    expect(() => normalizeChannelInput('https://www.youtube.com/@')).toThrow(
      '지원하지 않는 유튜브 채널 URL 형식입니다',
    );
  });

  it('rejects non-youtube URLs', () => {
    expect(() => normalizeChannelInput('https://example.com')).toThrow(
      '유효한 유튜브 채널 URL이 아닙니다',
    );
  });
});

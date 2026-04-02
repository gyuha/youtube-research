import { describe, expect, it } from 'vitest';

import { analysisResultSchema } from './analysis-schema';

describe('analysisResultSchema', () => {
  it('accepts the expected summary payload', () => {
    const parsed = analysisResultSchema.parse({
      insights: [
        '평가 기준이 중요하다',
        '반복 가능성이 핵심이다',
        '자동화는 추적 가능해야 한다',
      ],
      summary: '이 영상은 모델 평가 자동화를 설명한다.',
    });

    expect(parsed.insights).toHaveLength(3);
  });

  it('rejects an analysis payload with the wrong insight count', () => {
    expect(() =>
      analysisResultSchema.parse({
        insights: ['평가 기준이 중요하다', '반복 가능성이 핵심이다'],
        summary: '이 영상은 모델 평가 자동화를 설명한다.',
      }),
    ).toThrow();
  });

  it('rejects whitespace-only summary and insights', () => {
    expect(() =>
      analysisResultSchema.parse({
        insights: [
          '평가 기준이 중요하다',
          '   ',
          '자동화는 추적 가능해야 한다',
        ],
        summary: '   ',
      }),
    ).toThrow();
  });
});

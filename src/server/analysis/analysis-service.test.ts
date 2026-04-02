import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  parse: vi.fn(),
}));

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        parse: mocks.parse,
      },
    };

    constructor() {
      mocks.constructor();
    }
  },
}));

describe('analysisService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('does not create an OpenAI client during import', async () => {
    await import('./analysis-service');

    expect(mocks.constructor).not.toHaveBeenCalled();
  });

  it('parses transcript analysis through the schema boundary', async () => {
    const parsedResult = {
      insights: ['첫 번째 통찰', '두 번째 통찰', '세 번째 통찰'],
      summary: '요약 결과',
    };
    mocks.parse.mockResolvedValue({
      choices: [{ message: { parsed: parsedResult } }],
    });

    const { analysisService } = await import('./analysis-service');
    const result = await analysisService.summarizeTranscript('원본 트랜스크립트');

    expect(mocks.constructor).toHaveBeenCalledTimes(1);
    expect(mocks.parse).toHaveBeenCalledWith({
      messages: [
        {
          content:
            '트랜스크립트를 한국어로 요약하고 summary와 정확히 3개의 insights를 포함한 JSON을 반환하세요.',
          role: 'system',
        },
        { content: '원본 트랜스크립트', role: 'user' },
      ],
      model: 'gpt-5.4',
      response_format: expect.any(Object),
    });
    expect(result).toEqual(parsedResult);
  });
});

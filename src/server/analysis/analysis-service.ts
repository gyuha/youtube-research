import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import type { AnalysisResultPayload } from './analysis-schema';
import { analysisResultSchema } from './analysis-schema';

const client = new OpenAI();
const analysisResponseFormat = zodResponseFormat(
  analysisResultSchema,
  'analysis_result',
);

export const analysisService = {
  async summarizeTranscript(transcript: string): Promise<AnalysisResultPayload> {
    const response = await client.chat.completions.parse({
      messages: [
        {
          content:
            '트랜스크립트를 한국어로 요약하고 summary와 정확히 3개의 insights를 포함한 JSON을 반환하세요.',
          role: 'system',
        },
        { content: transcript, role: 'user' },
      ],
      model: 'gpt-5.4',
      response_format: analysisResponseFormat,
    });

    const parsed = response.choices[0]?.message.parsed;

    if (!parsed) {
      throw new Error('분석 결과를 파싱할 수 없습니다');
    }

    return parsed;
  },
};

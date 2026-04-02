import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import type { AnalysisResultPayload } from './analysis-schema';
import { analysisResultSchema } from './analysis-schema';

const ANALYSIS_MODEL_ID = 'gpt-5.4';
const ANALYSIS_SYSTEM_PROMPT =
  '트랜스크립트를 한국어로 요약하고 summary와 정확히 3개의 insights를 포함한 JSON을 반환하세요.';

const analysisResponseFormat = zodResponseFormat(
  analysisResultSchema,
  'analysis_result',
);

let openAiClient: OpenAI | undefined;

function getOpenAiClient() {
  openAiClient ??= new OpenAI();

  return openAiClient;
}

function getParsedAnalysisResult(parsed: AnalysisResultPayload | null) {
  if (!parsed) {
    throw new Error(
      `OpenAI analysis returned no parsed result for model ${ANALYSIS_MODEL_ID}`,
    );
  }

  return parsed;
}

export const analysisService = {
  async summarizeTranscript(transcript: string): Promise<AnalysisResultPayload> {
    const response = await getOpenAiClient().chat.completions.parse({
      messages: [
        {
          content: ANALYSIS_SYSTEM_PROMPT,
          role: 'system',
        },
        { content: transcript, role: 'user' },
      ],
      model: ANALYSIS_MODEL_ID,
      response_format: analysisResponseFormat,
    });

    return getParsedAnalysisResult(response.choices[0]?.message.parsed ?? null);
  },
};

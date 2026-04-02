import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

import type { AnalysisResultPayload } from './analysis-schema';
import { analysisResultSchema } from './analysis-schema';

const ANALYSIS_MODEL_ID = process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini';
const ANALYSIS_SYSTEM_PROMPT =
  '트랜스크립트를 한국어로 요약하고 summary와 정확히 3개의 insights를 포함한 JSON을 반환하세요.';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const analysisResponseFormat = zodResponseFormat(
  analysisResultSchema,
  'analysis_result',
);

let openAiClient: OpenAI | undefined;

function getOpenRouterApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is required');
  }

  return apiKey;
}

function getOpenAiClient() {
  openAiClient ??= new OpenAI({
    apiKey: getOpenRouterApiKey(),
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      'HTTP-Referer':
        process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
      'X-Title':
        process.env.OPENROUTER_APP_NAME ??
        process.env.NEXT_PUBLIC_APP_NAME ??
        'YouTube Research Dashboard',
    },
  });

  return openAiClient;
}

function getParsedAnalysisResult(parsed: AnalysisResultPayload | null) {
  if (!parsed) {
    throw new Error(
      `OpenRouter analysis returned no parsed result for model ${ANALYSIS_MODEL_ID}`,
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

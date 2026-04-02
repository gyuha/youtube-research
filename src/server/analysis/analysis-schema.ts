import { z } from 'zod';

export const analysisResultSchema = z.object({
  insights: z.array(z.string().trim().min(1)).length(3),
  summary: z.string().trim().min(1),
});

export type AnalysisResultPayload = z.infer<typeof analysisResultSchema>;

import { z } from 'zod';

export const analysisResultSchema = z.object({
  insights: z.array(z.string().min(1)).length(3),
  summary: z.string().min(1),
});

export type AnalysisResultPayload = z.infer<typeof analysisResultSchema>;

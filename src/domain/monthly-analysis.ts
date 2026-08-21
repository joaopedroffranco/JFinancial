import { z } from 'zod';

export const analysisPeriodSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Período inválido.');

export const monthlyAnalysisSchema = z.object({
  id: z.string().min(1),
  period: analysisPeriodSchema,
  status: z.literal('draft'),
  createdAt: z.string().datetime(),
});

export type MonthlyAnalysis = z.infer<typeof monthlyAnalysisSchema>;

export function createAnalysisPeriod(year: number, month: number) {
  return analysisPeriodSchema.parse(`${year}-${String(month).padStart(2, '0')}`);
}


import { z } from 'zod';

export const transactionSchema = z.object({
  id: z.string().min(1),
  analysisId: z.string().min(1),
  importId: z.string().min(1),
  occurredOn: z.iso.date(),
  description: z.string().trim().min(1),
  amountInCents: z.number().int().positive(),
  direction: z.enum(['credit', 'debit']),
  classificationStatus: z.literal('pending'),
});

export type Transaction = z.infer<typeof transactionSchema>;

export type TransactionInput = Pick<
  Transaction,
  'occurredOn' | 'description' | 'amountInCents' | 'direction'
>;

export const importKindSchema = z.enum(['bank-statement', 'credit-card-invoice']);
export type ImportKind = z.infer<typeof importKindSchema>;

export const importRecordSchema = z.object({
  id: z.string().min(1),
  analysisId: z.string().min(1),
  fileName: z.string().min(1),
  fileHash: z.string().min(1),
  kind: importKindSchema,
  importedAt: z.string().datetime(),
  transactionCount: z.number().int().nonnegative(),
});

export type ImportRecord = z.infer<typeof importRecordSchema>;

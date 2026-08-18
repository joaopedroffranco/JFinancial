import { z } from 'zod';

export const fixedAccountCategories = [
  'Moradia',
  'Saúde',
  'Assinaturas',
  'Impostos',
  'Outros',
] as const;

export const fixedAccountCategorySchema = z.enum(fixedAccountCategories);

export const fixedAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Informe o nome da conta.'),
  category: fixedAccountCategorySchema,
  expectedAmountInCents: z.number().int().nonnegative(),
});

export type FixedAccount = z.infer<typeof fixedAccountSchema>;

export type FixedAccountInput = Omit<FixedAccount, 'id'>;

export function calculateExpectedMonthlyTotal(accounts: FixedAccount[]) {
  return accounts.reduce(
    (total, account) => total + account.expectedAmountInCents,
    0,
  );
}

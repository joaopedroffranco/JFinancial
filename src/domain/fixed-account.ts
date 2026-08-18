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

export interface ExpectedTotalByCategory {
  category: FixedAccount['category'];
  expectedAmountInCents: number;
}

export function calculateExpectedMonthlyTotal(accounts: FixedAccount[]) {
  return accounts.reduce(
    (total, account) => total + account.expectedAmountInCents,
    0,
  );
}

export function calculateExpectedTotalsByCategory(
  accounts: FixedAccount[],
): ExpectedTotalByCategory[] {
  const totals = new Map<FixedAccount['category'], number>();

  accounts.forEach((account) => {
    totals.set(
      account.category,
      (totals.get(account.category) ?? 0) + account.expectedAmountInCents,
    );
  });

  return Array.from(totals, ([category, expectedAmountInCents]) => ({
    category,
    expectedAmountInCents,
  })).sort(
    (left, right) =>
      right.expectedAmountInCents - left.expectedAmountInCents,
  );
}

import {
  fixedAccountSchema,
  type FixedAccount,
  type FixedAccountInput,
} from '../domain/fixed-account';
import { database } from './database';

const initialAccounts: FixedAccount[] = [
  { id: 'vivo', name: 'Vivo', category: 'Moradia', expectedAmountInCents: 11100 },
  { id: 'claro-flex', name: 'Claro Flex', category: 'Assinaturas', expectedAmountInCents: 3499 },
  { id: 'iptu', name: 'IPTU', category: 'Moradia', expectedAmountInCents: 7775 },
  { id: 'aluguel', name: 'Aluguel', category: 'Moradia', expectedAmountInCents: 150000 },
  { id: 'condominio', name: 'Condomínio', category: 'Moradia', expectedAmountInCents: 48224 },
  { id: 'terapia', name: 'Terapia', category: 'Saúde', expectedAmountInCents: 66000 },
  { id: 'ia-chatgpt', name: 'IA - ChatGPT', category: 'Assinaturas', expectedAmountInCents: 10000 },
].map((account) => fixedAccountSchema.parse(account));

export async function listFixedAccounts() {
  if ((await database.fixedAccounts.count()) === 0) {
    await database.fixedAccounts.bulkAdd(initialAccounts);
  }

  return database.fixedAccounts.orderBy('name').toArray();
}

export async function saveFixedAccount(input: FixedAccountInput, id?: string) {
  const account = fixedAccountSchema.parse({
    ...input,
    id: id ?? crypto.randomUUID(),
  });

  await database.fixedAccounts.put(account);
  return account;
}

export function deleteFixedAccount(id: string) {
  return database.fixedAccounts.delete(id);
}
